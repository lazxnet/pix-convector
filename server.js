import express from "express"
import cors from "cors"
import { networkInterfaces } from "os"

const app = express()
const port = 3001

app.use(cors())

function getLocalIpAddress() {
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Omitir direcciones internas y que no sean IPv4 (es decir, 127.0.0.1)
      if (net.family === "IPv4" && !net.internal) {
        return net.address
      }
    }
  }
  return "127.0.0.1" // Recurrir a localhost si no se encuentra otra IP
}


app.get("/api/log-ip", (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress
  const localIp = getLocalIpAddress()
  console.log(`Client IP: ${clientIp}`)
  console.log(`Server Local IP: ${localIp}`)
  res.json({ clientIp, localIp })
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
  console.log(`Server's local IP: ${getLocalIpAddress()}`)
})

