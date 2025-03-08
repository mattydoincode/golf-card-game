import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Six Card Golf Game",
  description: "A card game simulation using Next.js and cardsJS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/cardsJS/dist/cards.min.css"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <nav className="main-nav">
          <div className="nav-container">
            <div className="nav-logo">
              <Link href="/">Six Card Golf</Link>
            </div>
            <ul className="nav-links">
              <li>
                <Link href="/">Game</Link>
              </li>
              <li>
                <Link href="/simulation">Simulation</Link>
              </li>
            </ul>
          </div>
        </nav>
        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}
