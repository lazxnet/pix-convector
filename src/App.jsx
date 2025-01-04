import React, { useState } from 'react';
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

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setConvertedImage(null);
    }
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
      //alert(`Imagen convertida a ${format.toUpperCase()}.`);
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
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">PixConvector</h1>
      
      <div className="mb-6">
        <label htmlFor="image-upload" className="block mb-2">Selecciona una imagen</label>
        <input 
          id="image-upload" 
          type="file" 
          onChange={handleFileChange} 
          accept="image/*" 
          className="w-full p-2 border rounded"
        />
        <p className="text-sm text-gray-500 mt-1">
          Selecciona un archivo de imagen para convertir y comprimir
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Opciones de Compresión</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="max-size" className="block mb-1">Tamaño Máximo (MB)</label>
            <input
              id="max-size"
              type="number"
              value={compressionOptions.maxSizeMB}
              onChange={(e) => setCompressionOptions(prev => ({ ...prev, maxSizeMB: Number(e.target.value) }))}
              min={0.1}
              step={0.1}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="max-dimension" className="block mb-1">Dimensión Máxima (px)</label>
            <input
              id="max-dimension"
              type="number"
              value={compressionOptions.maxWidthOrHeight}
              onChange={(e) => setCompressionOptions(prev => ({ ...prev, maxWidthOrHeight: Number(e.target.value) }))}
              min={100}
              step={100}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="quality" className="block mb-1">Calidad</label>
          <input
            id="quality"
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={compressionOptions.quality}
            onChange={(e) => setCompressionOptions(prev => ({ ...prev, quality: Number(e.target.value) }))}
            className="w-full"
          />
          <span className="text-sm text-gray-500">{compressionOptions.quality * 100}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
        {conversionOptions.map(({ format, label }) => (
          <button
            key={format}
            onClick={() => convertImage(format)}
            disabled={!selectedFile || isConverting}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            {isConverting ? 'Convirtiendo...' : `Convertir a ${label}`}
          </button>
        ))}
      </div>

      {convertedImage && (
        <div className="mt-6">
          <img src={convertedImage.url} alt="Convertida" className="max-w-full h-auto rounded-lg shadow-lg mb-4" />
          <button onClick={downloadImage} className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600">
            Descargar imagen convertida
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

