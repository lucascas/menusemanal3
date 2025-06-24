"use client"

import { useState, useEffect } from "react"

export default function MenuesAnteriores() {
  const [menues, setMenues] = useState([])

  useEffect(() => {
    // Aquí iría la lógica para cargar los menús anteriores
    // Por ahora, usaremos datos de ejemplo
    setMenues([
      { id: 1, fecha: "2023-07-01", descripcion: "Menú de la primera semana de julio" },
      { id: 2, fecha: "2023-07-08", descripcion: "Menú de la segunda semana de julio" },
    ])
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Menús Anteriores</h1>
      <ul className="space-y-2">
        {menues.map((menu) => (
          <li key={menu.id} className="border p-4 rounded">
            <h3 className="font-bold">{menu.fecha}</h3>
            <p>{menu.descripcion}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
