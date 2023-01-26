const WebSocket = require('ws');
const sysinfo = require('systeminformation');

const wss = new WebSocket.Server({ port: 8080 });
const connections = new Set();
wss.on('connection', (ws) => {
  connections.add(ws);
  console.log(`New connection`);

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    
  });

  ws.on('close', () => {
    console.log(`Connection closed`);
    connections.delete(ws);
  });

  setInterval(() => {
    sysinfo.currentLoad().then((data) => {
      sysinfo.cpu().then((cpudata) => {
        sysinfo.mem().then((memdata) => {
          sysinfo.battery().then((baterydata) => {
              connections.forEach(connection => {
                let jsonResponse = {
                  Load: 0,
                  Brand: "",
                  Manufacturer: "",
                  Family: "",
                  Speed: "",
                  PhysicalCores: "",
                  FreeMem: "",
                  UsedMem: "",
                  BateryPercent: "",
                }
                jsonResponse.Load = ((data.currentLoad * 100) / 100).toFixed(0);
                jsonResponse.Brand = cpudata.brand;
                jsonResponse.Manufacturer = cpudata.manufacturer;
                jsonResponse.Family = cpudata.family;
                jsonResponse.Speed = cpudata.speed;
                jsonResponse.PhysicalCores = cpudata.physicalCores;
                jsonResponse.FreeMem = memdata.free;
                jsonResponse.UsedMem = memdata.used;
                jsonResponse.BateryPercent = baterydata.percent;
                connection.send(JSON.stringify(jsonResponse));
              });
          });
        });
      });
    });
  }, 1000);
});