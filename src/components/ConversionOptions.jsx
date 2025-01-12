import React from 'react';
import { motion } from 'framer-motion';

export function ConversionOptions({ conversionOptions, convertImage, selectedFile, isConverting }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-6">
      {conversionOptions.map(({ format, label }) => (
        <motion.button
          key={format}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => convertImage(format)}
          disabled={!selectedFile || isConverting}
          className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-300 ease-in-out"
        >
          {isConverting ? 'Convirtiendo...' : `A ${label}`}
        </motion.button>
      ))}
    </div>
  );
}

