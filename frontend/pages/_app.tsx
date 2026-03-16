import type { AppProps } from "next/app";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../styles/globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${plusJakarta.variable} font-sans antialiased min-h-screen text-stone-800 bg-gradient-to-b from-stone-50 to-stone-100/50`}>
      <Component {...pageProps} />
    </div>
  );
}
