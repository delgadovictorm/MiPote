import type { Metadata } from "next";

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
