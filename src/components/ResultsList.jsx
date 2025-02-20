import { DownloadIcon, XCircle, ArchiveIcon } from "../util/Icons"

const logAction = async (action) => {
  try {
    const response = await fetch("/api/log-action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error logging action:", error)
  }
}

export function ResultsList({ results, hasProcessedImages, downloadAllAsZip, removeResult }) {
  const handleDownload = (name) => {
    logAction(`download_single_${name}`)
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Imágenes procesadas</h3>
        {hasProcessedImages && (
          <button
            onClick={downloadAllAsZip}
            className="inline-flex items-center translate-x-1 gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
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
                    onClick={() => handleDownload(result.name)}
                    className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors mt-8"                  >
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
  )
}