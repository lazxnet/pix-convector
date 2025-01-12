import React from 'react';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold">PixConvector</h1>
          <p className="mt-2 text-blue-200">Convierte y comprime tus imágenes fácilmente</p>
        </motion.div>
      </div>
    </header>
  );
}

