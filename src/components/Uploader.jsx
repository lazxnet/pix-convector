function Uploader({ isDragging, setIsDragging, processImages }) {
    const handleDragOver = (e) => {
      e.preventDefault();
      setIsDragging(true);
    };
  
    const handleDragLeave = (e) => {
      e.preventDefault();
      setIsDragging(false);
    };
  
    const handleDrop = async (e) => {
      e.preventDefault();
      setIsDragging(false);
  
      const files = Array.from(e.dataTransfer.files).slice(0, 20);
      if (files.length > 0) {
        await processImages(files);
      }
    };
  
    return (
      <div
        className={`p-12 bg-white rounded-lg shadow-sm border-2 border-dashed transition-colors ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold mb-2">Suelta imágenes aquí</h2>
          <p className="text-gray-500 mb-4">o</p>
          <label className="cursor-pointer">
            <span className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              SUBIR ARCHIVOS
            </span>
            <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => processImages(Array.from(e.target.files).slice(0, 20))} />
          </label>
          <p className="text-sm text-gray-500 mt-4">Máximo de 20 imágenes a la vez de hasta 10 mb cada una</p>
        </div>
      </div>
    );
  }
  export default Uploader;