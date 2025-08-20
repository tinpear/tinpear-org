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
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Keep browser chrome light (inputs/scrollbars) */}
        <meta name="color-scheme" content="light" />
        {/* 🔒 Hard lock: remove any 'dark' class and persisted dark theme BEFORE hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var docEl = document.documentElement;
    var body = document.body;
    // Strip 'dark' class if present
    docEl.classList && docEl.classList.remove('dark');
    body && body.classList && body.classList.remove('dark');
    // Neutralize common persisted theme keys (next-themes, custom)
    try {
      var keys = ['theme','color-theme','ui-theme'];
      for (var i=0;i<keys.length;i++){
        var k = keys[i];
        var v = localStorage.getItem(k);
        if (v === 'dark') localStorage.setItem(k, 'light');
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
