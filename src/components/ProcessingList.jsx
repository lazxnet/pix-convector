function ProcessingList({ processing }) {
    if (processing.length === 0) return null;
  
    return (
      <div className="mt-8 space-y-4">
        {processing.map((item, index) => (
          <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
            <span className="animate-spin">🔄</span>
            <span className="text-gray-600">Procesando: {item.name}...</span>
          </div>
        ))}
      </div>
    );
  }
  export default ProcessingList;