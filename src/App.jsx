import { useState, useEffect } from "react"
import { CloudIcon, Loader2, DownloadIcon, XCircle, ArchiveIcon, CheckCircle, ClockIcon } from "./components/Icons"
import { processImages, downloadAllAsZip } from "./util/imageProcessing"

export default function App() {
  const [isDragging, setIsDragging] = useState(false)
  const [processing, setProcessing] = useState([])
  const [results, setResults] = useState([])
  const [hasProcessedImages, setHasProcessedImages] = useState(false)

  useEffect(() => {
    const processedImages = results.filter((result) => result.status === "completed")
    setHasProcessedImages(processedImages.length > 0)
  }, [results])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).slice(0, 20)
    const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024)
    if (validFiles.length !== files.length) alert("Algunos archivos superan 10MB")
    if (validFiles.length > 0) await processImages(validFiles, setProcessing, setResults)
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files).slice(0, 20)
    if (files.length > 0) {
      await processImages(files, setProcessing, setResults)
    }
  }

  const removeResult = (index) => {
    setResults((prev) => {
      const resultToRemove = prev[index]
      if (resultToRemove?.url) {
        URL.revokeObjectURL(resultToRemove.url)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold">
          Pix<span className="text-purple-600">Convector</span>
        </h1>
        <nav className="flex gap-6">
          <a
            href="https://github.com/lazxnet/pix-convector"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900"
          >
            GitHub
          </a>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div
          className={`p-12 bg-white rounded-lg shadow-sm border-2 border-dashed transition-colors
            ${isDragging ? "border-purple-500 bg-purple-50" : "border-gray-300"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center text-center">
            <CloudIcon />
            <h2 className="text-xl font-semibold mb-2">Suelta imágenes aquí</h2>
            <p className="text-gray-500 mb-4">o</p>
            <label className="cursor-pointer">
              <span className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                SUBIR ARCHIVOS
              </span>
              <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
            </label>
            <p className="text-sm text-gray-500 mt-4">Máximo de 20 imágenes a la vez de hasta 10 mb cada una</p>
          </div>
        </div>

        {processing.length > 0 && (
          <div className="mt-8 space-y-4">
            {processing.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                {item.status === "processing" && <Loader2 className="text-blue-500" />}
                {item.status === "completed" && <CheckCircle className="text-green-500" />}
                {item.status === "error" && <XCircle className="text-red-500" />}
                {item.status === "pending" && <ClockIcon className="text-yellow-500" />}
                <span className="text-gray-600">
                  {item.status === "processing" && `Procesando: ${item.name}...`}
                  {item.status === "completed" && `Completado: ${item.name}`}
                  {item.status === "error" && `Error: ${item.name} - ${item.error}`}
                  {item.status === "pending" && `Pendiente: ${item.name}`}
                </span>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Imágenes procesadas</h3>
              {hasProcessedImages && (
                <button
                  onClick={() => downloadAllAsZip(results)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <ArchiveIcon />
                  Descargar todo como ZIP
                </button>
              )}
            </div>
            <div className="grid gap-6">
              {results.map((result, index) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow-sm relative">
                  <button
                    onClick={() => removeResult(index)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle />
                  </button>

                  {result.status === "completed" ? (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex-grow">
                          <p className="text-sm text-gray-600">Archivo: {result.name}</p>
                          <p className="text-sm text-gray-600">Original: {result.originalSize} MB</p>
                          <p className="text-sm text-gray-600">Comprimido: {result.compressedSize} MB</p>
                        </div>
                        <a
                          href={result.url}
                          download={result.name}
                          className="inline-flex items-center translate-y-20 gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        >
                          <DownloadIcon />
                          Descargar WebP
                        </a>
                      </div>
                      <div className="flex justify-normal">
                        <img
                          src={result.url || "/placeholder.svg"}
                          alt={result.name}
                          className="max-h-32 max-w-full rounded-lg object-contain"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-red-500">
                      Error processing {result.name}: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-20">
          <h2 className="text-4xl font-bold mb-4">Convierte y comprime tus imágenes</h2>
          <p className="text-xl text-gray-600">
            Optimice y convierta fácilmente sus imágenes al formato WebP para mejorar el rendimiento.
            <span className="font-semibold"> Totalmente gratis!</span>
          </p>
        </div>
      </main>
    </div>
  )
}

