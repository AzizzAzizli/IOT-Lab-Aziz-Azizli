const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
// Tüm originlere izin ver (CORS hatasını önlemek için)
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// 1. WebSocket Sunucusunu oluştur
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// 2. GET: Sunucu durumunu kontrol et ve dinamik URL'leri göster
app.get("/", (req, res) => {
  // Render veya Local ortamına göre protokolü belirle
  const protocol = req.protocol === "https" ? "https" : "http";
  const wsProtocol = req.protocol === "https" ? "wss" : "ws";
  const host = req.get("host");

  res.json({
    message: "IoT Gateway Active",
    status: "ok",
    // Telefon uygulamasına girilecek URL
    copy_to_app: `${protocol}://${host}/data`,
    // React tarafında bağlanılacak WS URL
    ws_endpoint: `${wsProtocol}://${host}`,
    active_sensors: [
      "microphone",
      "light",
      "battery",
      "magnetometer",
      "gyroscope"
    ]
  });
});

// 3. POST: Telefondan (Sensor Logger) gelen veriyi işle
app.post("/data", (req, res) => {
  const { payload } = req.body;

  if (payload && Array.isArray(payload)) {
    const iotData = {
      deviceId: "AZIZ-NODE-01",
      timestamp: Date.now(),
      sensors: {},
    };

    // En güncel veriyi almak için tersten tara
    for (let i = payload.length - 1; i >= 0; i--) {
      const item = payload[i];
      const targetSensors = [
        "microphone",
        "light",
        "battery",
        "magnetometer",
        "battery temp",
        "gyroscope",
      ];

      if (targetSensors.includes(item.name) && !iotData.sensors[item.name]) {
        iotData.sensors[item.name] = item.values;
      }
    }

    const message = JSON.stringify(iotData);

    // WebSocket üzerinden tüm bağlı istemcilere (React) yay
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  res.sendStatus(200);
});

// 4. Sunucuyu Başlat (0.0.0.0 dış erişim için kritik)
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 IoT Server listening on port ${PORT}`);
});