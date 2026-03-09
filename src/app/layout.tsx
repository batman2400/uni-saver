import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "UNI Savers - Student Discounts Sri Lanka",
  description: "Sri Lanka's #1 student discount platform. Exclusive deals on food, fashion, tech, entertainment and more for verified students.",
  keywords: "student discounts, Sri Lanka, university deals, school offers, UNI Savers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
