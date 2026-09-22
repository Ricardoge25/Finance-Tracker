import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Moneta - Finance Tracker",
  description: "Gestión financiera personal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-fondo text-slate-100 min-h-screen">
        <AuthProvider>
          {/* Mantenemos el AuthProvider para todo el estado global, 
              pero removemos Navbar y el contenedor centrado (container mx-auto p-4) */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}