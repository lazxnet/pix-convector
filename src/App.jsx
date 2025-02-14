"use client"

import { useState, useEffect } from "react"
import { processImages, downloadAllAsZip } from "./util/imageProcessing"
import { Header } from "./components/Header"
import { FileUpload } from "./components/FileUpload"
import { ProcessingList } from "./components/ProcessingList"
import { ResultsList } from "./components/ResultsList"

const logAction = async (action) => {
  try {
    await fetch("/api/log-action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    })
  } catch (error) {
    console.error("Error logging action:", error)
  }
}

export default function App() {
  const [isDragging, setIsDragging] = useState(false)
  const [processing, setProcessing] = useState([])
  const [results, setResults] = useState([])
  const [hasProcessedImages, setHasProcessedImages] = useState(false)

  useEffect(() => {
    const processedImages = results.filter((result) => result.status === "completed")
    setHasProcessedImages(processedImages.length > 0)
  }, [results])

  useEffect(() => {
    logAction("page_load")
  }, [])

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
    const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024)
    if (validFiles.length !== files.length) alert("Algunos archivos superan 10MB")
    if (validFiles.length > 0) {
      await processImages(validFiles, setProcessing, setResults)
      logAction(`drop_files_${validFiles.length}`)
    }
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files).slice(0, 20)
    if (files.length > 0) {
      await processImages(files, setProcessing, setResults)
      logAction(`select_files_${files.length}`)
    }
  }

  const removeResult = (index) => {
    setResults((prev) => {
      const resultToRemove = prev[index]
      if (resultToRemove?.url) {
        URL.revokeObjectURL(resultToRemove.url)
      }
      logAction("remove_result")
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleDownloadAllZip = async () => {
    await downloadAllAsZip(results)
    logAction("download_all_zip")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <FileUpload
          isDragging={isDragging}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleFileSelect={handleFileSelect}
        />

        {processing.length > 0 && <ProcessingList processing={processing} />}

        {results.length > 0 && (
          <ResultsList
            results={results}
            hasProcessedImages={hasProcessedImages}
            downloadAllAsZip={handleDownloadAllZip}
            removeResult={removeResult}
          />
        )}

        <div className="text-center mt-20">
          <h2 className="text-4xl font-bold mb-4">Convierte y comprime tus imágenes</h2>
          <p className="text-xl text-gray-600">
            Optimice y convierta fácilmente sus imágenes al formato WebP para mejorar el rendimiento.
            <span className="font-semibold"> Totalmente gratis!</span>
          </p>
        </div>
      </main>
    </div>
  )
}

