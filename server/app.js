const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const os = require("os");

const app = express();
app.use(cors());
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

app.use(express.json());

// Render'da veya localde çalıştığını anlamak için basit kontrol
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  // Senin kullandığın isimlere sadık kalarak, URL'leri dinamik oluşturuyoruz
  const host = req.get("host"); 
  const protocol = req.protocol === "https" ? "https" : "http";
  const ws_protocol = req.protocol === "https" ? "wss" : "ws";

  res.json({
    message: "Active",
    url: `${protocol}://${host}/data`,
    ws_endpoint: `${ws_protocol}://${host}`,
    status: "ok",
  });
});

app.post("/data", (req, res) => {
  const { payload } = req.body;

  if (payload && Array.isArray(payload)) {
    const iotData = {
      deviceId: "AZIZ-NODE-01",
      timestamp: Date.now(),
      sensors: {},
    };

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

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  res.sendStatus(200);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running.`);
});