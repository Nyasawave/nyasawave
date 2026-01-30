import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import fs from 'fs';
import path from 'path';

const DB = path.join(process.cwd(), 'data', 'messages.json');

function readMessages() {
    try {
        if (fs.existsSync(DB)) {
            return JSON.parse(fs.readFileSync(DB, 'utf-8')) || [];
        }
        return [];
    } catch (e) {
        console.error('[MESSAGES] Error reading messages:', e);
        return [];
    }
}

function writeMessages(messages: any[]) {
    try {
        fs.writeFileSync(DB, JSON.stringify(messages, null, 2));
        return true;
    } catch (e) {
        console.error('[MESSAGES] Error writing messages:', e);
        return false;
    }
}

/**
 * GET /api/marketplace/messages
 * Get conversation threads or messages in a thread
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const threadId = searchParams.get('threadId');
        const messages = readMessages();

        if (threadId) {
            // Get messages in specific thread
            const thread = messages.find((m: any) => m.id === threadId);
            if (!thread) {
                return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
            }

            // Check if user is participant
            if (thread.buyerId !== session.user?.id && thread.sellerId !== session.user?.id) {
                return NextResponse.json({ error: 'Access denied' }, { status: 403 });
            }

            return NextResponse.json(thread.messages || []);
        } else {
            // Get all conversation threads for user
            const userThreads = messages.filter(
                (m: any) => m.buyerId === session.user?.id || m.sellerId === session.user?.id
            );
            return NextResponse.json(userThreads);
        }
    } catch (error) {
        console.error('[MESSAGES] Get error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/marketplace/messages
 * Send a message or create thread
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { threadId, content, buyerId, sellerId, productId } = await request.json();

        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
        }

        const messages = readMessages();
        let thread;

        if (threadId) {
            // Find existing thread
            thread = messages.find((m: any) => m.id === threadId);
            if (!thread) {
                return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
            }
        } else {
            // Create new thread
            if (!buyerId || !sellerId || !productId) {
                return NextResponse.json(
                    { error: 'BuyerId, sellerId, and productId required' },
                    { status: 400 }
                );
            }

            thread = {
                id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                buyerId,
                sellerId,
                productId,
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            messages.push(thread);
        }

        // Add message to thread
        const message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            senderId: session.user?.id,
            content,
            timestamp: new Date().toISOString(),
            read: false,
        };

        if (!thread.messages) {
            thread.messages = [];
        }
        thread.messages.push(message);
        thread.updatedAt = new Date().toISOString();

        if (!writeMessages(messages)) {
            return NextResponse.json(
                { error: 'Failed to save message' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { threadId: thread.id, message, success: true },
            { status: 201 }
        );
    } catch (error) {
        console.error('[MESSAGES] Post error:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
