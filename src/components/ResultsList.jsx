import { DownloadIcon, XCircle, ArchiveIcon } from "../util/Icons"

export function ResultsList({ results, hasProcessedImages, downloadAllAsZip, removeResult }) {
  return (
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
  )
}

