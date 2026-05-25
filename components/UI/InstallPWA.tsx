"use client";
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react'; // Opcional, si tienes instalado lucide-react

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 1. Detectar si es iOS (iPhone/iPad)
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // 2. Escuchar si el navegador nos deja instalar (Solo Android/Chrome/Edge)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true); // Solo mostramos si el navegador permite la instalación
    });

    // 3. Mostrar en iOS siempre (ya que el usuario debe hacerlo manual)
    if (isIOSDevice) {
      // Opcional: mostrar solo si no está ya instalado
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (!isStandalone) setShow(true);
    }
  }, []);

  const install = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
    }
  };

  if (window.matchMedia('(display-mode: standalone)').matches) return null;
  
  // Si no está instalado, lo mostramos SIEMPRE en la landing (aunque no haya evento de install)
  return (
    <div className="bg-[#1C1C1E] border border-white/10 p-6 rounded-[2rem] flex items-center justify-between shadow-2xl max-w-sm mx-auto">
        {/* ... el resto del diseño del banner ... */}
    </div>
  );

  return (
    <div className="fixed bottom-24 md:bottom-10 left-4 right-4 z-[999] bg-[#1C1C1E] border border-white/10 p-5 rounded-[2rem] flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-10">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <img src="/pote.png" className="w-8 h-8 object-contain" alt="Pote" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Instalar Pote</p>
          <p className="text-[10px] text-white/50 leading-tight">
            {isIOS ? "Toca 'Compartir' > 'Añadir a inicio'" : "Lleva tus finanzas al escritorio"}
          </p>
        </div>
      </div>
      
      {!isIOS && deferredPrompt && (
        <button onClick={install} className="bg-emerald-500 text-black font-black text-[10px] px-5 py-3 rounded-full active:scale-95 transition-transform">
          INSTALAR
        </button>
      )}
    </div>
  );
}