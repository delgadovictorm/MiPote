import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. AQUÍ SE AÑADE EL MANIFEST Y SE CAMBIA EL TÍTULO DE LA APP
export const metadata: Metadata = {
  title: "Mi Pote | Finanzas",
  description: "Control de finanzas compartidas y personales",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mi Pote",
    // Asegúrate de tener este archivo en tu carpeta /public
    startupImage: "/pote.png", 
  },
  icons: {
    apple: "/pote.png",
  },
};

// app/layout.tsx o app/layout.jsx
export const viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Evita que la pantalla se haga zoom por error
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es" // 2. Cambiado de "en" a "es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}