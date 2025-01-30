import { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";
import FileSaver from "file-saver";
const { saveAs } = FileSaver;

// SVG icons as components
const CloudIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
  </svg>
);

const Loader2 = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="animate-spin"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
  </svg>
);

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const XCircle = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const ArchiveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const CheckCircle = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState([]);
  const [results, setResults] = useState([]);
  const [hasProcessedImages, setHasProcessedImages] = useState(false);

  useEffect(() => {
    const processedImages = results.filter(
      (result) => result.status === "completed"
    );
    setHasProcessedImages(processedImages.length > 0);
  }, [results]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).slice(0, 20);
    const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024);
    if (validFiles.length !== files.length)
      alert("Algunos archivos superan 10MB");
    if (validFiles.length > 0) await processImages(validFiles);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files).slice(0, 20);
    if (files.length > 0) {
      await processImages(files);
    }
  };

  const convertToWebP = async (blob) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((webpBlob) => {
          resolve(webpBlob);
        }, "image/webp");
      };

      img.src = URL.createObjectURL(blob);
    });
  };

  const processImages = async (files) => {
    //Genera nombres unicos
    const uniqueNames = new Set();

    // Inicializar estado de procesamiento
    setProcessing(
      files.map((file) => ({
        name: file.name,
        status: "pending",
      }))
    );

    // Crear array de promesas
    const processingPromises = files.map((file, index) =>
      (async () => {
        try {
          // Actualizar estado a processing
          setProcessing((prev) =>
            prev.map((item, i) =>
              i === index ? { ...item, status: "processing" } : item
            )
          );

          //Genera un nombre base seguro
          const originalName = file.name.replace(/\.[^/.]+$/, "");
          const sanitizedName = originalName
            .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s_-]/g, "")
            .trim()
            .replace(/\s+/g, "_");

          //Crea nombres unicos
          const createUniqueName = (base, count = 0) => {
            const suffix = count > 0 ? `_${count}` : "";
            const candidate = `${sanitizedName}${suffix}.webp`;

            if (!uniqueNames.has(candidate)) {
              uniqueNames.add(candidate);
              return candidate;
            }
            return createUniqueName(base, count + 1);
          };

          //Compresion de imagen
          const compressedFile = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: 0.7,
          });

          const webpBlob = await convertToWebP(compressedFile);
          const uniqueName = createUniqueName(sanitizedName);
          const url = URL.createObjectURL(webpBlob);

          return {
            name: uniqueName,
            originalName: file.name,
            originalSize: (file.size / 1024 / 1024).toFixed(2),
            compressedSize: (webpBlob.size / 1024 / 1024).toFixed(2),
            url,
            blob: webpBlob,
            status: "completed",
            index,
          };
        } catch (error) {
          // Manejar errores
          console.error("Error procesando imagen:", error);
          setProcessing((prev) =>
            prev.map((item, i) =>
              i === index
                ? {
                    ...item,
                    status: "error",
                    error: error.message,
                  }
                : item
            )
          );
          return {
            name: file.name,
            status: "error",
            error: error.message,
            index,
          };
        }
      })()
    );

    // Esperar todas las promesas
    const settledResults = await Promise.allSettled(processingPromises);

    // Procesar resultados
    const successfulResults = settledResults
      .filter(
        (result) =>
          result.status === "fulfilled" && result.value.status === "completed"
      )
      .map((result) => result.value);

    // Actualizar resultados finales
    setResults((prev) => [
      ...prev,
      ...successfulResults
        .sort((a, b) => a.index - b.index)
        .map(({ index, ...rest }) => rest),
    ]);

    // Limpiar procesamiento después de 1 segundo
    setTimeout(() => setProcessing([]), 1000);
  };

  const removeResult = (index) => {
    setResults((prev) => {
      // Liberar la URL de la imagen que se eliminará
      const resultToRemove = prev[index];
      if (resultToRemove?.url) {
        URL.revokeObjectURL(resultToRemove.url);
      }

      // Filtrar los resultados manteniendo el orden
      return prev.filter((_, i) => i !== index);
    });
  };

  const downloadAllAsZip = async () => {
    const zip = new JSZip();

    results.forEach((result) => {
      if (result.status === "completed") {
        zip.file(result.name, result.blob);
      }
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "imágenes_comprimidas.zip");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold">
          Pix<span className="text-purple-600">Convector</span>
        </h1>
        <nav className="flex gap-6">
          <a
            href="https://github.com/lazxnet/pix-convector"
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
            ${
              isDragging ? "border-purple-500 bg-purple-50" : "border-gray-300"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center text-center">
            <CloudIcon />
            <h2 className="text-xl font-semibold mb-2">Suelta imágenes aquí</h2>
            <p className="text-gray-500 mb-4">o</p>
            <label className="cursor-pointer">
              <span className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                SUBIR ARCHIVOS
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
              Máximo de 20 imágenes a la vez de hasta 10 mb cada una
            </p>
          </div>
        </div>

        {/* Processing Status */}
        {processing.length > 0 && (
          <div className="mt-8 space-y-4">
            {processing.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm"
              >
                {item.status === "processing" && (
                  <Loader2 className="text-blue-500" />
                )}
                {item.status === "completed" && (
                  <CheckCircle className="text-green-500" />
                )}
                {item.status === "error" && (
                  <XCircle className="text-red-500" />
                )}
                {item.status === "pending" && (
                  <ClockIcon className="text-yellow-500" />
                )}
                <span className="text-gray-600">
                  {item.status === "processing" &&
                    `Procesando: ${item.name}...`}
                  {item.status === "completed" && `Completado: ${item.name}`}
                  {item.status === "error" &&
                    `Error: ${item.name} - ${item.error}`}
                  {item.status === "pending" && `Pendiente: ${item.name}`}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Imágenes procesadas</h3>
              {hasProcessedImages && (
                <button
                  onClick={downloadAllAsZip}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <ArchiveIcon />
                  Descargar todo como ZIP
                </button>
              )}
            </div>
            <div className="grid gap-6">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="p-6 bg-white rounded-lg shadow-sm relative"
                >
                  <button
                    onClick={() => removeResult(index)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle />
                  </button>

                  {result.status === "completed" ? (
                    <>
                      <div className="flex flex-wrap gap-4 mb-4">
                        <p className="text-sm text-gray-600">
                          Archivo: {result.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Original: {result.originalSize} MB
                        </p>
                        <p className="text-sm text-gray-600">
                          Comprimido: {result.compressedSize} MB
                        </p>
                      </div>
                      <img
                        src={result.url || "/placeholder.svg"}
                        alt={result.name}
                        className="max-h-64 rounded-lg mx-auto mb-4"
                      />
                      <a
                        href={result.url}
                        download={result.name}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                      >
                        <DownloadIcon />
                        Descargar WebP
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
            Convierte y comprime tus imágenes
          </h2>
          <p className="text-xl text-gray-600">
            Optimice y convierta fácilmente sus imágenes al formato WebP para
            mejorar el rendimiento.
            <span className="font-semibold"> Totalmente gratis!</span>
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
