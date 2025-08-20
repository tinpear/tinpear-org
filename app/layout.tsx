import "./css/style.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tinpear",
  description: "Tinpear Org",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Keep browser chrome light (inputs/scrollbars) */}
        <meta name="color-scheme" content="light" />
        {/* 🔒 Hard lock: remove any 'dark' class & persisted dark theme BEFORE hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var docEl = document.documentElement;
    // Strip 'dark' class if present
    if (docEl && docEl.classList) docEl.classList.remove('dark');

    // Neutralize common persisted theme keys
    try {
      var keys = ['theme','color-theme','ui-theme'];
      for (var i=0; i<keys.length; i++) {
        if (localStorage.getItem(keys[i]) === 'dark') {
          localStorage.setItem(keys[i], 'light');
        }
      }
    } catch(e){}

    // Hint CSS light color-scheme
    docEl.style.colorScheme = 'light';
  } catch (e) {}
})();`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} bg-gray-50 font-inter tracking-tight text-gray-900 antialiased`}
      >
        <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
          {children}
        </div>
      </body>
    </html>
  );
}
