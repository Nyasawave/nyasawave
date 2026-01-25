import NewsletterSignup from "./NewsletterSignup";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800 bg-black/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <NewsletterSignup />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
          <div>
            © {new Date().getFullYear()} NyasaWave. All rights reserved.
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a href="/discover" className="text-zinc-300 hover:text-white transition">Discover</a>
            <a href="/artists" className="text-zinc-300 hover:text-white transition">Artists</a>
            <a href="/business" className="text-zinc-300 hover:text-white transition">For Business</a>
            <a href="/upload" className="text-zinc-300 hover:text-white transition">Upload</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
