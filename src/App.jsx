import { useState, useEffect } from 'react'
import imageCompression from 'browser-image-compression'
import { CloudIcon, Loader2, Download, XCircle, Archive } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

function App() {
  const [isDragging, setIsDragging] = useState(false)
  const [processing, setProcessing] = useState([])
  const [results, setResults] = useState([])
  const [hasProcessedImages, setHasProcessedImages] = useState(false)

  useEffect(() => {
    const processedImages = results.filter(result => result.status === 'completed')
    setHasProcessedImages(processedImages.length > 1)
  }, [results])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files).slice(0, 20)
    if (files.length > 0) {
      await processImages(files)
    }
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files).slice(0, 20)
    if (files.length > 0) {
      await processImages(files)
    }
  }

  const convertToWebP = async (blob) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((webpBlob) => {
          resolve(webpBlob)
        }, 'image/webp')
      }
      
      img.src = URL.createObjectURL(blob)
    })
  }

  const processImages = async (files) => {
    const newProcessing = files.map(file => ({
      name: file.name,
      status: 'processing'
    }))
    
    setProcessing(newProcessing)
    
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    }

    const processedResults = []

    for (let i = 0; i < files.length; i++) {
      try {
        // Compress image
        const compressedFile = await imageCompression(files[i], options)
        
        // Convert to WebP
        const webpBlob = await convertToWebP(compressedFile)
        
        // Create object URL for preview
        const url = URL.createObjectURL(webpBlob)
        
        processedResults.push({
          name: files[i].name.replace(/\.[^/.]+$/, '') + '.webp',
          originalSize: (files[i].size / 1024 / 1024).toFixed(2),
          compressedSize: (webpBlob.size / 1024 / 1024).toFixed(2),
          url,
          blob: webpBlob,
          status: 'completed'
        })

        // Update processing status
        setProcessing(prev => 
          prev.map((item, index) => 
            index === i ? { ...item, status: 'completed' } : item
          )
        )
      } catch (error) {
        console.error('Error processing image:', error)
        processedResults.push({
          name: files[i].name,
          status: 'error',
          error: error.message
        })

        setProcessing(prev => 
          prev.map((item, index) => 
            index === i ? { ...item, status: 'error' } : item
          )
        )
      }
    }

    setResults(prev => [...prev, ...processedResults])
    setProcessing([])
  }

  const removeResult = (index) => {
    setResults(prev => {
      const newResults = prev.filter((_, i) => i !== index)
      return newResults
    })
  }

  const downloadAllAsZip = async () => {
    const zip = new JSZip()
    
    results.forEach(result => {
      if (result.status === 'completed') {
        zip.file(result.name, result.blob)
      }
    })
    
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'compressed_images.zip')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold">
          Pix<span className="text-purple-600">Convector</span>
        </h1>
        <nav className="flex gap-6">
          <a href="#" className="text-gray-600 hover:text-gray-900">How to Use</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Developer API</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Pricing</a>
          <a 
            href="https://github.com/vitejs/vite" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-600 hover:text-gray-900"
          >
            GitHub
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div 
          className={`p-12 bg-white rounded-lg shadow-sm border-2 border-dashed transition-colors
            ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center text-center">
            <CloudIcon className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Drop Images Here</h2>
            <p className="text-gray-500 mb-4">or</p>
            <label className="cursor-pointer">
              <span className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                UPLOAD FILES
              </span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                multiple
                onChange={handleFileSelect}
              />
            </label>
            <p className="text-sm text-gray-500 mt-4">
              Maximum of 20 images at a time up to 10 mb each
            </p>
          </div>
        </div>

        {/* Processing Status */}
        {processing.length > 0 && (
          <div className="mt-8 space-y-4">
            {processing.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <span className="text-gray-600">Processing {item.name}...</span>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Processed Images</h3>
              {hasProcessedImages && (
                <button
                  onClick={downloadAllAsZip}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <Archive className="w-4 h-4" />
                  Download All as ZIP
                </button>
              )}
            </div>
            <div className="grid gap-6">
              {results.map((result, index) => (
                <div key={index} className="p-6 bg-white rounded-lg shadow-sm relative">
                  <button
                    onClick={() => removeResult(index)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                  
                  {result.status === 'completed' ? (
                    <>
                      <div className="flex flex-wrap gap-4 mb-4">
                        <p className="text-sm text-gray-600">File: {result.name}</p>
                        <p className="text-sm text-gray-600">Original: {result.originalSize} MB</p>
                        <p className="text-sm text-gray-600">Compressed: {result.compressedSize} MB</p>
                      </div>
                      <img 
                        src={result.url} 
                        alt={result.name}
                        className="max-h-64 rounded-lg mx-auto mb-4"
                      />
                      <a 
                        href={result.url} 
                        download={result.name}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download WebP
                      </a>
                    </>
                  ) : (
                    <div className="text-red-500">
                      Error processing {result.name}: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Marketing Section */}
        <div className="text-center mt-20">
          <h2 className="text-4xl font-bold mb-4">
            Convert and Compress Your Images
          </h2>
          <p className="text-xl text-gray-600">
            Easily optimize and convert your images to WebP format to improve performance. 
            <span className="font-semibold"> All free!</span>
          </p>
        </div>
      </main>
    </div>
  )
}

export default App

