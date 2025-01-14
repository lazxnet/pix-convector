import { useState, useEffect } from 'react';
import Header from './components/Header';
import Uploader from './components/Uploader';
import ProcessingList from './components/ProcessingList';
import ResultsList from './components/ResultsList';
import MarketingSection from './components/MarketingSection';

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState([]);
  const [results, setResults] = useState([]);
  const [hasProcessedImages, setHasProcessedImages] = useState(false);

  useEffect(() => {
    const processedImages = results.filter(result => result.status === 'completed');
    setHasProcessedImages(processedImages.length > 1);
  }, [results]);

  const processImages = async (files) => {
    const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
    const processedResults = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const compressedFile = await imageCompression(files[i], options);
        const webpBlob = await convertToWebP(compressedFile);
        const url = URL.createObjectURL(webpBlob);

        processedResults.push({
          name: files[i].name.replace(/\.[^/.]+$/, '') + '.webp',
          originalSize: (files[i].size / 1024 / 1024).toFixed(2),
          compressedSize: (webpBlob.size / 1024 / 1024).toFixed(2),
          url,
          blob: webpBlob,
          status: 'completed'
        });
      } catch (error) {
        processedResults.push({ name: files[i].name, status: 'error', error: error.message });
      }
    }
    setResults(prev => [...prev, ...processedResults]);
  };

  const convertToWebP = async (blob) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((webpBlob) => resolve(webpBlob), 'image/webp');
      };
      img.src = URL.createObjectURL(blob);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Uploader
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          processImages={processImages}
        />
        <ProcessingList processing={processing} />
        <ResultsList results={results} hasProcessedImages={hasProcessedImages} />
        <MarketingSection />
      </main>
    </div>
  );
}

export default App;
