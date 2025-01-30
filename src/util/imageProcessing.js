import imageCompression from "browser-image-compression";
import JSZip from "jszip";
import FileSaver from "file-saver";

const { saveAs } = FileSaver;

export const convertToWebP = async (blob) => {
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

export const processImages = async (files, setProcessing, setResults) => {
  //Genera nombres unicos
  const uniqueNames = new Set();

  //Inicializar estado de procesamiento
  setProcessing(
    files.map((file) => ({
      name: file.name,
      status: "pending",
    }))
  );

  //Crear array de promesas
  const processingPromises = files.map((file, index) =>
    (async () => {
      try {
        //Actualizar estado a processing
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

        //Compresion de imagenes
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
        //Manejo de errores
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

  //Esperar todas las promesas
  const settledResults = await Promise.allSettled(processingPromises);

  //Procesar resultados
  const successfulResults = settledResults
    .filter(
      (result) =>
        result.status === "fulfilled" && result.value.status === "completed"
    )
    .map((result) => result.value);

  //Actualizar resultados finales
  setResults((prev) => [
    ...prev,
    ...successfulResults
      .sort((a, b) => a.index - b.index)
      .map(({ index, ...rest }) => rest),
  ]);

  //Limpiar procesamineto despues de 1 segundo
  setTimeout(() => setProcessing([]), 1000);
};

export const downloadAllAsZip = async (results) => {
  const zip = new JSZip();

  results.forEach((result) => {
    if (result.status === "completed") {
      zip.file(result.name, result.blob);
    }
  });

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "imágenes_comprimidas.zip");
};
