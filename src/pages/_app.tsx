// STYLES
import "../styles/globals.css";
import "../styles/mobile.css";
import "react-loading-skeleton/dist/skeleton.css";

// NEXTJS
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { useEffect } from "react";

// FONT
import { JetBrains_Mono } from "next/font/google";


const jb = JetBrains_Mono({
  fallback: ["monospace"],
  weight: ["500", "700"],
  display: "swap",
  style: ["normal"],
  subsets: ["latin"],
  variable: "--jb-font",
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    window.addEventListener("keydown", (event) => {
      Array.from(
        document.getElementsByClassName(
          event.ctrlKey
            ? "ctrl"
            : event.altKey
            ? "alt"
            : event.shiftKey
            ? "shift"
            : event.key
        )
      ).forEach((a) => {
        (a as HTMLElement).style.transform = "scale(0.9)";
        (a as HTMLElement).style.opacity = "0.7";
      });
    });

    window.addEventListener("keyup", (event) => {
      Array.from(document.querySelectorAll(".key span")).forEach((a) => {
        (a as HTMLElement).style.transform = "scale(1)";
        (a as HTMLElement).style.opacity = "1";
      });
    });
  }, []);

  return (
    <>
      <style jsx global>
        {`

          html {
            --jb-font: ${jb.style.fontFamily};
          }

        `}

      </style>

      <Analytics />
      <Component {...pageProps} />
    </>
  );
}
