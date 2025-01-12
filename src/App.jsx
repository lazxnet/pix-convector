import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { motion } from 'framer-motion';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ImageUpload } from './components/ImageUpload';
import { CompressionOptions } from './components/CompressionOptions';
import { ConversionOptions } from './components/ConversionOptions';
import { ImagePreview } from './components/ImagePreview';

const conversionOptions = [
  { format: 'jpeg', label: 'JPEG' },
  
  { format: 'png', label: 'PNG' },
  { format: 'webp', label: 'WebP' },
  { format: 'avif', label: 'AVIF' },
];

const initialCompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [convertedImage, setConvertedImage] = useState(null);
  const [compressionOptions, setCompressionOptions] = useState(initialCompressionOptions);
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

  const compressImage = async (file, options) => {
    let quality = 1;
    let compressedFile = file;
    let fileSize = file.size / (1024 * 1024); // Convert to MB

    while (fileSize > options.maxSizeMB && quality > 0.1) {
      try {
        compressedFile = await imageCompression(file, {
          ...options,
          quality,
        });
        fileSize = compressedFile.size / (1024 * 1024);
        quality -= 0.1;
      } catch (error) {
        console.error('Error compressing image:', error);
        break;
      }
    }

    return compressedFile;
  };

  const convertImage = async (format) => {
    if (!selectedFile) {
      alert('Por favor, selecciona una imagen primero.');
      return;
    }

    setIsConverting(true);

    try {
      const compressedFile = await compressImage(selectedFile, {
        ...compressionOptions,
        fileType: `image/${format}`,
      });
      const blobUrl = URL.createObjectURL(compressedFile);

      setConvertedImage({ 
        url: blobUrl, 
        format,
        size: compressedFile.size,
        originalSize: selectedFile.size
      });
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
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200">
      <Header />
      <main className="container mx-auto p-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-lg rounded-lg overflow-hidden mb-8"
        >
          <div className="p-6">
            <ImageUpload
              handleFileChange={handleFileChange}
              handleUploadClick={handleUploadClick}
              fileInputRef={fileInputRef}
              selectedFile={selectedFile}
            />

            <CompressionOptions
              compressionOptions={compressionOptions}
              setCompressionOptions={setCompressionOptions}
            />

            <ConversionOptions
              conversionOptions={conversionOptions}
              convertImage={convertImage}
              selectedFile={selectedFile}
              isConverting={isConverting}
            />
          </div>
        </motion.div>

        {convertedImage && (
          <ImagePreview
            convertedImage={convertedImage}
            downloadImage={downloadImage}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;

