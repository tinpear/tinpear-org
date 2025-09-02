// app/not-found.tsx

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-green-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-green-600 mb-4">
          This Page is Brewing 🍵
        </h1>
        <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
          We’re currently working on this feature to make it amazing for you.
          Stay tuned, updates are on the way!
        </p>
        <div className="text-sm text-gray-500">— Tinpear Team 🍐</div>

        <a
          href="/"
          className="inline-block mt-8 px-6 py-3 bg-green-600 text-white font-medium rounded-xl shadow-md hover:bg-green-700 transition"
        >
          ← Back to homepage
        </a>
      </div>
    </main>
  );
}
