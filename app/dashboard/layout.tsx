import { ReactNode } from "react";
import { EspacioProvider } from "@/contexts/EspacioContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <EspacioProvider>
      <div className="min-h-screen bg-[#0d0714]">
        {/* Aquí iría la navegación superior/sidebar */}
        <main>{children}</main>
      </div>
    </EspacioProvider>
  );
}