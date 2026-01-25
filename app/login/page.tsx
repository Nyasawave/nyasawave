import Link from "next/link";

export default function LoginRedirect() {
  return (
    <main className="min-h-screen p-6 pt-32 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-3">Login</h1>
        <p className="text-zinc-400 mb-4">You can sign in using our secure form.</p>
        <Link href="/signin" className="bg-emerald-400 text-black px-4 py-2 rounded">Go to Sign In</Link>
      </div>
    </main>
  );
}
