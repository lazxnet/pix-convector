import imageCompression from "browser-image-compression"
import JSZip from "jszip"
import FileSaver from "file-saver"
import heic2any from "heic2any"
import TIFF from "tiff.js"

const { saveAs } = FileSaver

export const convertToWebP = async (blob) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((webpBlob) => {
        resolve(webpBlob)
      }, "image/webp")
    }

    img.src = URL.createObjectURL(blob)
  })
}

export const processImages = async (files, setProcessing, setResults) => {
  
  const uniqueNames = new Set()

  setProcessing(
    files.map((file) => ({
      name: file.name,
      status: "pending",
    })),
  )

  const processingPromises = files.map((file, index) =>
    (async () => {
      try {
        setProcessing((prev) => prev.map((item, i) => (i === index ? { ...item, status: "processing" } : item)))

        let processedBlob = file
        const fileExtension = file.name.split(".").pop().toLowerCase()

        // Convertir HEIC a JPEG
        if (fileExtension === "heic" || fileExtension === "heif") {
          processedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.8,
          })
        }

        // Convertir TIFF a JPEG
        if (fileExtension === "tiff" || fileExtension === "tif") {
          const tiffData = await file.arrayBuffer()
          const tiff = new TIFF({ buffer: tiffData })
          const canvas = tiff.toCanvas()
          processedBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8))
        }

        const compressedFile = await imageCompression(processedBlob, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.7,
        })

        const webpBlob = await convertToWebP(compressedFile)

        const originalName = file.name.replace(/\.[^/.]+$/, "")
        const sanitizedName = originalName
          .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s_-]/g, "")
          .trim()
          .replace(/\s+/g, "_")

        const createUniqueName = (base, count = 0) => {
          const suffix = count > 0 ? `_${count}` : ""
          const candidate = `${sanitizedName}${suffix}.webp`

          if (!uniqueNames.has(candidate)) {
            uniqueNames.add(candidate)
            return candidate
          }
          return createUniqueName(base, count + 1)
        }

        const uniqueName = createUniqueName(sanitizedName)
        const url = URL.createObjectURL(webpBlob)

        return {
          name: uniqueName,
          originalName: file.name,
          originalSize: (file.size / 1024 / 1024).toFixed(2),
          compressedSize: (webpBlob.size / 1024 / 1024).toFixed(2),
          url,
          blob: webpBlob,
          status: "completed",
          index,
        }
      } catch (error) {
        console.error("Error procesando imagen:", error)
        setProcessing((prev) =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  status: "error",
                  error: error.message,
                }
              : item,
          ),
        )
        return {
          name: file.name,
          status: "error",
          error: error.message,
          index,
        }
      }
    })(),
  )

  const settledResults = await Promise.allSettled(processingPromises)

  const successfulResults = settledResults
    .filter((result) => result.status === "fulfilled" && result.value.status === "completed")
    .map((result) => result.value)

  setResults((prev) => [
    ...prev,
    ...successfulResults.sort((a, b) => a.index - b.index).map(({ index, ...rest }) => rest),
  ])

  setTimeout(() => setProcessing([]), 1000)
}

export const downloadAllAsZip = async (results) => {
  const zip = new JSZip()

  results.forEach((result) => {
    if (result.status === "completed") {
      zip.file(result.name, result.blob)
    }
  })

  const content = await zip.generateAsync({ type: "blob" })
  saveAs(content, "imágenes_comprimidas.zip")
}

