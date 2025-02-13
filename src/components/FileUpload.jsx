import { useState } from "react"
import { CloudIcon } from "../util/Icons"

export function FileUpload({
  isDragging,
  setIsDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileSelect,
}) {
  const [validationError, setValidationError] = useState(null)

  const validateFile = async (file) => {
    const formData = new FormData()
    formData.append("file", file)

    console.log("Validando archivo:", file.name, "Tipo:", file.type, "Tamaño:", file.size)

    try {
      const response = await fetch("/api/validate-file", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      console.log("Respuesta del servidor:", data)

      if (!response.ok) {
        throw new Error(data.error || "Error desconocido al validar el archivo")
      }

      return data.valid
    } catch (error) {
      console.error("Error de validación:", error)
      setValidationError(error.message)
      return false
    }
  }

  const handleFileSelectWithValidation = async (e) => {
    const files = Array.from(e.target.files).slice(0, 20)
    const validFiles = []

    for (const file of files) {
      if (await validateFile(file)) {
        validFiles.push(file)
      }
    }

    if (validFiles.length > 0) {
      handleFileSelect({ target: { files: validFiles } })
    } else if (files.length > 0) {
      setValidationError("Ninguno de los archivos seleccionados es válido.")
    }
  }

  const handleDropWithValidation = async (e) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).slice(0, 20)
    const validFiles = []

    for (const file of files) {
      if (await validateFile(file)) {
        validFiles.push(file)
      }
    }

    if (validFiles.length > 0) {
      handleDrop({ dataTransfer: { files: validFiles } })
    } else if (files.length > 0) {
      setValidationError("Ninguno de los archivos soltados es válido.")
    }
  }

  return (
    <div
      className={`p-12 bg-white rounded-lg shadow-sm border-2 border-dashed transition-colors
        ${isDragging ? "border-purple-500 bg-purple-50" : "border-gray-300"}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropWithValidation}
    >
      <div className="flex flex-col items-center text-center">
        <CloudIcon />
        <h2 className="text-xl font-semibold mb-2">Suelta imágenes aquí</h2>
        <p className="text-gray-500 mb-4">o</p>
        <label className="cursor-pointer">
          <span className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
            SUBIR ARCHIVOS
          </span>
          <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileSelectWithValidation} />
        </label>
        <p className="text-sm text-gray-500 mt-4">Máximo de 20 imágenes a la vez de hasta 10 mb cada una</p>
        {validationError && <p className="text-red-500 mt-2">{validationError}</p>}
      </div>
    </div>
  )
}
