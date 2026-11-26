export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="pt-10 pb-4 text-center">
        <h1 className="font-serif text-3xl font-bold text-terracotta tracking-tight">
          WaniKarya
        </h1>
        <p className="text-xs text-ink/60 mt-1">Desa Wisata Gabugan, Sleman</p>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-4 pb-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-5 text-center text-xs text-ink/40 border-t border-sand/30">
        © 2024 WaniKarya Sleman. Menghubungkan Tradisi dan Masa Depan.
      </footer>
    </div>
  );
}
