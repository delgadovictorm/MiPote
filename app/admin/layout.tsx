import type { Metadata } from "next";

// El panel de admin depende de sesión/datos en vivo de Supabase: nunca debe
// pre-renderizarse como página estática en el build (eso rompía el build en Vercel).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mi Pote Admin",
  description: "Panel de control de suscripciones y usuarios de Mi Pote",
  manifest: "/admin-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pote Admin",
    startupImage: "/pote.png",
  },
  icons: {
    apple: "/pote.png",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
