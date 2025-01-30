import { Loader2, CheckCircle, XCircle, ClockIcon } from "../util/Icons"

export function ProcessingList({ processing }) {
  return (
    <div className="mt-8 space-y-4">
      {processing.map((item, index) => (
        <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
          {item.status === "processing" && <Loader2 className="text-blue-500" />}
          {item.status === "completed" && <CheckCircle className="text-green-500" />}
          {item.status === "error" && <XCircle className="text-red-500" />}
          {item.status === "pending" && <ClockIcon className="text-yellow-500" />}
          <span className="text-gray-600">
            {item.status === "processing" && `Procesando: ${item.name}...`}
            {item.status === "completed" && `Completado: ${item.name}`}
            {item.status === "error" && `Error: ${item.name} - ${item.error}`}
            {item.status === "pending" && `Pendiente: ${item.name}`}
          </span>
        </div>
      ))}
    </div>
  )
}

