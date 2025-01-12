import React from 'react';
import { motion } from 'framer-motion';

export function ImagePreview({ convertedImage, downloadImage }) {
  const compressionPercentage = ((convertedImage.originalSize - convertedImage.size) / convertedImage.originalSize * 100).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-lg rounded-lg overflow-hidden"
    >
      <div className="p-6">
        <div className="mb-4 rounded-lg overflow-hidden shadow-md">
          <img src={convertedImage.url} alt="Convertida" className="w-full h-auto" />
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600">Tamaño original: {(convertedImage.originalSize / (1024 * 1024)).toFixed(2)} MB</p>
          <p className="text-sm text-gray-600">Tamaño comprimido: {(convertedImage.size / (1024 * 1024)).toFixed(2)} MB</p>
          <p className="text-sm font-semibold text-green-600">Reducción: {compressionPercentage}%</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadImage} 
          className="w-full p-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center transition duration-300 ease-in-out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Descargar imagen convertida
        </motion.button>
      </div>
    </motion.div>
  );
}

