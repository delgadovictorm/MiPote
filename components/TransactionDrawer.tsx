// components/TransactionDrawer.tsx
"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import { TrendingUp, TrendingDown, Briefcase, Rocket, DollarSign, ShoppingCart } from "lucide-react";

export function TransactionDrawer({ children }) {
  const [type, setType] = useState("egreso"); // Por defecto en egreso
  const [category, setCategory] = useState("");

  // Categorías basadas en tu solicitud
  const categories = {
    ingreso: [
      { id: "sueldo", label: "Sueldo", icon: <DollarSign size={18} /> },
      { id: "freelance", label: "Freelance", icon: <Briefcase size={18} /> },
      { id: "inversiones", label: "Inversiones", icon: <TrendingUp size={18} /> },
      { id: "ventas", label: "Ventas", icon: <ShoppingCart size={18} /> },
      { id: "tigritos", label: "Tigritos", icon: <Rocket size={18} /> },
    ],
    egreso: [
      { id: "comida", label: "Comida", icon: <ShoppingCart size={18} /> },
      { id: "cashea", label: "Cashea", icon: <DollarSign size={18} /> },
      // Aquí agregaremos más luego
    ]
  };

  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        {/* El botón flotante o botón principal que abre el menú */}
        {children}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[24px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t border-[#333]">
          <div className="p-4 bg-[#121212] rounded-t-[24px] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
            
            {/* SELECTOR DE TIPO (INGRESO / EGRESO) */}
            <div className="flex bg-[#262626] p-1 rounded-xl mb-6">
              <button
                onClick={() => setType("ingreso")}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  type === "ingreso" ? "bg-green-500 text-black" : "text-gray-400"
                }`}
              >
                <TrendingUp size={18} />
                INGRESO
              </button>
              <button
                onClick={() => setType("egreso")}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  type === "egreso" ? "bg-red-500 text-black" : "text-gray-400"
                }`}
              >
                <TrendingDown size={18} />
                EGRESO
              </button>
            </div>

            {/* LISTA DE CATEGORÍAS */}
            <h3 className="text-gray-400 text-sm mb-3 font-semibold px-2">Selecciona una categoría</h3>
            <div className="grid grid-cols-2 gap-3">
              {categories[type].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all border ${
                    category === cat.id 
                      ? type === "ingreso" ? "border-green-500 bg-green-500/10 text-green-400" : "border-red-500 bg-red-500/10 text-red-400"
                      : "border-[#333] bg-[#1a1a1a] text-gray-300 hover:bg-[#262626]"
                  }`}
                >
                  {cat.icon}
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Aquí abajo irá el input del monto y la lógica de Cashea en el siguiente paso */}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}