import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import MarketplaceChat from '@/app/components/MarketplaceChat';

export default async function MarketplaceChatPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/signin');
    }

    return (
        <div className="w-full">
            <MarketplaceChat />
        </div>
    );
}
