import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrdersProvider from "@/components/OrdersProvider";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import CheckoutModal from "@/components/CheckoutModal";
import GlobalToast from "@/components/GlobalToast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "WaniKarya | Platform Digital Pemberdayaan Womanpreneur Desa Wisata",
  description:
    "Temukan karya lokal, pengalaman wisata, dan kisah perempuan pelaku usaha Desa Wisata Gabugan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen antialiased bg-paper text-ink">
        <OrdersProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
            <CheckoutModal />
            <GlobalToast />
          </CartProvider>
        </OrdersProvider>
      </body>
    </html>
  );
}
