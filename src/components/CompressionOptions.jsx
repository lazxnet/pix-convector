import React from 'react';

export function CompressionOptions({ compressionOptions, setCompressionOptions }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-4 text-blue-700">Opciones de Compresión</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="max-size" className="block mb-1 font-medium text-gray-700">Tamaño Máximo (MB)</label>
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
          <label htmlFor="max-dimension" className="block mb-1 font-medium text-gray-700">Dimensión Máxima (px)</label>
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
    </div>
  );
}

