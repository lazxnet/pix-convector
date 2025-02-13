import express from "express"
import cors from "cors"
import { networkInterfaces } from "os"
import multer from "multer"
import { fileTypeFromBuffer } from "file-type"

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

// Configuración de multer para manejar la carga de archivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Límite de 10MB
  },
})

// Lista de tipos MIME permitidos
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/tiff",
  "image/heic",
  "image/heif",
]

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
  res.json({ message: "Action logged", success: true })
})

// Nueva ruta para validar archivos
app.post("/api/validate-file", upload.single("file"), async (req, res) => {
  console.log("Archivo recibido:", req.file?.originalname, "Tamaño:", req.file?.size)

  if (!req.file) {
    console.log("No se proporcionó ningún archivo")
    return res.status(400).json({ error: "No se ha proporcionado ningún archivo", valid: false })
  }

  try {
    const fileType = await fileTypeFromBuffer(req.file.buffer)
    console.log("Tipo de archivo detectado:", fileType)

    if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
      console.log("Tipo de archivo no permitido:", fileType ? fileType.mime : "desconocido")
      return res.status(400).json({ error: "Tipo de archivo no permitido", valid: false })
    }

    console.log("Archivo válido:", fileType.mime)
    res.json({ message: "Archivo válido", mimeType: fileType.mime, valid: true })
  } catch (error) {
    console.error("Error al validar el archivo:", error)
    res.status(500).json({ error: "Error al procesar el archivo", valid: false })
  }
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
  console.log(`Server's local IP: ${getLocalIpAddress()}`)
})

