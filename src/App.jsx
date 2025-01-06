import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';

const conversionOptions = [
  { format: 'jpeg', label: 'JPEG' },
  { format: 'png', label: 'PNG' },
  { format: 'webp', label: 'WebP' },
  { format: 'avif', label: 'AVIF' },
  { format: 'gif', label: 'GIF' },
];

const defaultCompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  quality: 0.8,
};

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [convertedImage, setConvertedImage] = useState(null);
  const [compressionOptions, setCompressionOptions] = useState(defaultCompressionOptions);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setConvertedImage(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const convertImage = async (format) => {
    if (!selectedFile) {
      alert('Por favor, selecciona una imagen primero.');
      return;
    }

    setIsConverting(true);

    try {
      const compressedFile = await imageCompression(selectedFile, {
        ...compressionOptions,
        fileType: `image/${format}`,
      });
      const blobUrl = URL.createObjectURL(compressedFile);

      setConvertedImage({ url: blobUrl, format });
    } catch (error) {
      console.error('Error al convertir la imagen:', error);
      alert('Hubo un error al convertir la imagen. Por favor, intenta de nuevo.');
    } finally {
      setIsConverting(false);
    }
  };

  const downloadImage = () => {
    if (!convertedImage) return;

    const link = document.createElement('a');
    link.href = convertedImage.url;
    link.download = `imagen_convertida.${convertedImage.format}`;
    link.click();
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        <div className="text-center p-6 bg-gradient-to-r">
          <h1 className="text-4xl font-bold">PixConvector</h1>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <label htmlFor="image-upload" className="block mb-2 font-semibold">Selecciona una imagen</label>
            <div className="flex items-center space-x-2">
              <input
                id="image-upload"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
              />
              <div className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100">
                {selectedFile ? selectedFile.name : 'Ningún archivo seleccionado'}
              </div>
              <button 
                onClick={handleUploadClick}
                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Selecciona un archivo de imagen para convertir y comprimir
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Opciones de Compresión</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="max-size" className="block mb-1 font-medium">Tamaño Máximo (MB)</label>
                <input
                  id="max-size"
                  type="number"
                  value={compressionOptions.maxSizeMB}
                  onChange={(e) => setCompressionOptions(prev => ({ ...prev, maxSizeMB: Number(e.target.value) }))}
                  min={0.1}
                  step={0.1}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="max-dimension" className="block mb-1 font-medium">Dimensión Máxima (px)</label>
                <input
                  id="max-dimension"
                  type="number"
                  value={compressionOptions.maxWidthOrHeight}
                  onChange={(e) => setCompressionOptions(prev => ({ ...prev, maxWidthOrHeight: Number(e.target.value) }))}
                  min={100}
                  step={100}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="quality" className="block mb-1 font-medium">Calidad</label>
              <div className="flex items-center space-x-2">
                <input
                  id="quality"
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={compressionOptions.quality * 100}
                  onChange={(e) => setCompressionOptions(prev => ({ ...prev, quality: Number(e.target.value) / 100 }))}
                  className="flex-grow"
                />
                <span className="text-sm text-gray-600 w-12 text-right">{Math.round(compressionOptions.quality * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-6">
            {conversionOptions.map(({ format, label }) => (
              <button
                key={format}
                onClick={() => convertImage(format)}
                disabled={!selectedFile || isConverting}
                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isConverting ? 'Convirtiendo...' : `A ${label}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {convertedImage && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="mb-4 rounded-lg overflow-hidden shadow-md">
              <img src={convertedImage.url} alt="Convertida" className="w-full h-auto" />
            </div>
            <button 
              onClick={downloadImage} 
              className="w-full p-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Descargar imagen convertida
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

