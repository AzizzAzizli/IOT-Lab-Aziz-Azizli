const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const os = require("os");
const { log } = require("console");

const app = express();
app.use(cors());
const server = http.createServer(app);

// 1. WebSocket Sunucusunu Express ile aynı porta bağla
const wss = new WebSocket.Server({ server });

app.use(express.json());

// IP Adresini otomatik bulma fonksiyonu
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (let name in interfaces) {
    for (let iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
};

const PORT = 3000;
const IP_ADDR = getLocalIP();

// 2. GET: Telefon uygulamasına kopyalaman için URL'i gösterir
app.get("/", (req, res) => {
  res.json({
    message: "Active",
    url: `http://${IP_ADDR}:${PORT}/data`,
    ws_endpoint: `ws://${IP_ADDR}:${PORT}`,
    status: "ok",
  });
});

// 3. POST: Telefondan gelen veriyi filtrele ve WebSocket'e bas
app.post("/data", (req, res) => {
  const { payload } = req.body;
  // console.log(payload);

  if (payload && Array.isArray(payload)) {
    const iotData = {
      deviceId: "AZIZ-NODE-01",
      timestamp: Date.now(),
      sensors: {},
    };
    // console.log(payload);

    for (let i = payload.length - 1; i >= 0; i--) {
      const item = payload[i];
      if (
        [
          "microphone",
          "light",
          "battery",
          "magnetometer",
          "battery temp",
          "gyroscope",
        ].includes(item.name) &&
        !iotData.sensors[item.name]
      ) {
        iotData.sensors[item.name] = item.values;
      }
    }

    const message = JSON.stringify(iotData);
    // log(message)

    // WebSocket üzerinden bağlı olan React vb. istemcilere gönder
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  res.sendStatus(200);
});

// 4. Sunucuyu Başlat
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running.`);
});
