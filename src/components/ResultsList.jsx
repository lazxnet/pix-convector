function ResultsList({ results, hasProcessedImages }) {
    if (results.length === 0) return null;
  
    return (
      <div className="mt-8 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Imágenes procesadas</h3>
          {hasProcessedImages && (
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Descargar todo como ZIP
            </button>
          )}
        </div>
        <div className="grid gap-6">
          {results.map((result, index) => (
            <div key={index} className="p-6 bg-white rounded-lg shadow-sm relative">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">❌</button>
              <div className="flex flex-wrap gap-4 mb-4">
                <p className="text-sm text-gray-600">Archivo: {result.name}</p>
                <p className="text-sm text-gray-600">Original: {result.originalSize} MB</p>
                <p className="text-sm text-gray-600">Comprimido: {result.compressedSize} MB</p>
              </div>
              <img src={result.url} alt={result.name} className="max-h-64 rounded-lg mx-auto mb-4" />
              <a href={result.url} download={result.name} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                Descargar WebP
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  }
  export default ResultsList;