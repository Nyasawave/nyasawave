import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock notifications API
 * In production, this would fetch from a database
 */

// Mock data - in production, fetch from database based on user
const mockNotifications = [
    {
        id: '1',
        userId: 'user_test_listener',
        title: 'New Music Available',
        message: 'Your favorite artist just released new tracks',
        type: 'MUSIC',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '2',
        userId: 'user_test_listener',
        title: 'Payment Confirmed',
        message: 'Your subscription payment has been processed successfully',
        type: 'PAYMENT',
        read: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '3',
        userId: 'user_test_listener',
        title: 'New Follower',
        message: 'Someone started following your profile',
        type: 'SOCIAL',
        read: true,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '4',
        userId: 'user_test_listener',
        title: 'Tournament Started',
        message: 'A new music tournament has started. You can participate now!',
        type: 'TOURNAMENT',
        read: true,
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    },
];

export async function GET(req: NextRequest) {
    try {
        // In production, extract userId from session and filter notifications
        // For now, return mock data
        return NextResponse.json({
            notifications: mockNotifications,
            total: mockNotifications.length,
            unread: mockNotifications.filter(n => !n.read).length,
        });
    } catch (error) {
        console.error('[NOTIFICATIONS] GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { notificationId } = await req.json();

        // Mock update - in production, update in database
        const notification = mockNotifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
        }

        return NextResponse.json({
            success: true,
            notification,
        });
    } catch (error) {
        console.error('[NOTIFICATIONS] PATCH error:', error);
        return NextResponse.json(
            { error: 'Failed to update notification' },
            { status: 500 }
        );
    }
}
