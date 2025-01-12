import React from 'react';
import { motion } from 'framer-motion';

export function ImageUpload({ handleFileChange, handleUploadClick, fileInputRef, selectedFile }) {
  return (
    <div className="mb-6">
      <label htmlFor="image-upload" className="block mb-2 font-semibold text-blue-700">Selecciona una imagen</label>
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
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUploadClick}
          className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </motion.button>
      </div>
      <p className="text-sm text-gray-600 mt-1">
        Selecciona un archivo de imagen para convertir y comprimir
      </p>
    </div>
  );
}

