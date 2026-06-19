import type { Metadata } from "next";
import {
  Playfair_Display,
  Inter,
  Inria_Serif,
  Inknut_Antiqua,
} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const inria = Inria_Serif({
  variable: "--font-inria",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const inknut = Inknut_Antiqua({
  variable: "--font-inknut",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Frames of Mind",
  description: "A sanctuary of words by Arnab Jena.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${inria.variable} ${inknut.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
