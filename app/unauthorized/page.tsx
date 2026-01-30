import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="text-center space-y-6">
                <div>
                    <h1 className="text-6xl font-bold text-white mb-2">403</h1>
                    <h2 className="text-3xl font-bold text-white">Access Denied</h2>
                </div>

                <p className="text-zinc-400 text-lg max-w-md">
                    You don't have permission to access this resource.
                    This might be due to insufficient permissions or an invalid role assignment.
                </p>

                <div className="flex gap-4 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/discover"
                        className="px-6 py-3 bg-zinc-800 text-white rounded-lg font-semibold hover:bg-zinc-700 transition"
                    >
                        Discover Music
                    </Link>
                </div>

                <div className="mt-12 pt-6 border-t border-zinc-800">
                    <p className="text-zinc-500 text-sm">
                        Contact support if you believe this is an error.
                    </p>
                </div>
            </div>
        </div>
    );
}
