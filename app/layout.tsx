import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google"; // Fontları içe aktarıyoruz
import "./globals.css";

// Metinler için modern sans font
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

// Başlıklar için akademik serif font
const lora = Lora({ 
  subsets: ["latin"], 
  variable: "--font-lora" 
});

export const metadata: Metadata = {
  title: "TaskFlow | Academic Project Management",
  description: "A minimalist Kanban board designed with precision.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="antialiased font-sans selection:bg-black selection:text-white">
        {children}
      </body>
    </html>
  );
}
