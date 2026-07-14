"use client";
import { useEffect, useState } from 'react';
import { Share, SquarePlus, CheckCircle2, MoreVertical, X } from 'lucide-react';

type Plataforma = 'ios' | 'android' | 'desktop';

const DISMISS_KEY = 'mipote_install_banner_dismissed';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [plataforma, setPlataforma] = useState<Plataforma>('desktop');
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    setPlataforma(isIOS ? 'ios' : isAndroid ? 'android' : 'desktop');

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    const yaDescartado = localStorage.getItem(DISMISS_KEY) === 'true';

    if (!isStandalone && !yaDescartado) setShow(true);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstalar = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    // iOS (y Android/desktop sin evento nativo disponible) no tienen prompt automático: mostramos los pasos manuales.
    setShowModal(true);
  };

  const handleDescartar = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, 'true');
  };

  if (!show) return null;

  const pasos = plataforma === 'ios'
    ? [
        { icon: <Share className="w-4 h-4" />, texto: <>1. Toca el ícono de <b className="text-emerald-400">Compartir</b> en la barra inferior de Safari.</> },
        { icon: <SquarePlus className="w-4 h-4" />, texto: <>2. Desliza hacia abajo y selecciona <b className="text-emerald-400">&quot;Agregar a inicio&quot;</b>.</> },
        { icon: <CheckCircle2 className="w-4 h-4" />, texto: <>3. Confirma tocando <b className="text-emerald-400">Agregar</b> en la esquina superior.</> },
      ]
    : [
        { icon: <MoreVertical className="w-4 h-4" />, texto: <>1. Toca el menú <b className="text-emerald-400">⋮</b> arriba a la derecha de Chrome.</> },
        { icon: <SquarePlus className="w-4 h-4" />, texto: <>2. Selecciona <b className="text-emerald-400">&quot;Instalar aplicación&quot;</b> (o &quot;Añadir a pantalla de inicio&quot;).</> },
        { icon: <CheckCircle2 className="w-4 h-4" />, texto: <>3. Confirma tocando <b className="text-emerald-400">Instalar</b>.</> },
      ];

  return (
    <>
      {/* BANNER FLOTANTE MUY VISUAL */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[380px] z-[900] bg-[#151518] border border-white/10 rounded-2xl shadow-2xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom-6 fade-in duration-500">
        <div className="w-11 h-11 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0 overflow-hidden">
          <img src="/pote.png" className="w-7 h-7 object-contain" alt="Mi Pote" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white font-black text-sm leading-tight">Instala Mi Pote</p>
          <p className="text-white/50 text-[11px] leading-snug mt-0.5">Acceso directo y rápido, sin ocupar espacio.</p>
        </div>
        <button
          onClick={handleInstalar}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-4 py-2.5 rounded-xl shrink-0 transition-colors active:scale-95"
        >
          Instalar
        </button>
        <button onClick={handleDescartar} className="text-white/30 hover:text-white shrink-0 p-1" title="Cerrar">
          <X size={16} />
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#151518] border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-black text-white">
                Instalar en {plataforma === 'ios' ? 'iOS' : 'Android'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white bg-white/5 rounded-full p-1.5 shrink-0">
                <X size={18} />
              </button>
            </div>
            <p className="text-white/50 text-sm mb-6">
              Sigue estos rápidos pasos para instalar la aplicación en tu {plataforma === 'ios' ? 'iPhone o iPad' : 'celular'}:
            </p>

            <div className="space-y-4 mb-6">
              {pasos.map((paso, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                    {paso.icon}
                  </div>
                  <p className="text-white/80 text-sm leading-snug pt-1.5">{paso.texto}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
