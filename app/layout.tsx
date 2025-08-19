import React from "react";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "BizChat - Business Communication Platform",
  description:
    "Transform your business communication with BizChat. Seamless team collaboration, customer support, and messaging platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <link rel="icon" href="/BC-Logo copy.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Prata&display=swap"
          rel="stylesheet"
        />
        <script
          src="https://bizsupport-b452e.web.app/widget.js"
          data-client="dHJkSox40VlrRxxNMsd7"
          data-theme="light"
        ></script>
      </head>
      <body className="font-poppins antialiased">{children}</body>
    </html>
  );
}
