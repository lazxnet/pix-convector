import express from "express"
import cors from "cors"
import { networkInterfaces } from "os"

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

function getLocalIpAddress() {
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address
      }
    }
  }
  return "127.0.0.1"
}

app.post("/api/log-action", (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress
  const { action } = req.body
  console.log(`Client IP: ${clientIp}, Action: ${action}`)
  res.json({ message: "Action logged" })
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
  console.log(`Server's local IP: ${getLocalIpAddress()}`)
})

