import { useSession } from "next-auth/react";
import { useCallback } from "react";
import { checkAccess, AccessCheckParams, AccessResult } from "@/app/utils/accessControl";

/**
 * useAccessControl Hook
 * 
 * Check permissions in client components
 * 
 * Usage:
 * const { canDownload, canJoinTournament } = useAccessControl();
 * 
 * if (!canDownload(songId)) {
 *   return <PremiumGate />;
 * }
 */

export function useAccessControl() {
    const { data: session } = useSession();
    const user = session?.user;

    const check = useCallback(
        (params: Omit<AccessCheckParams, "user">): AccessResult => {
            return checkAccess({ user, ...params });
        },
        [user]
    );

    const canListen = useCallback(
        (isTournament?: boolean): boolean => {
            const result = check({
                action: "listen",
                isTournament,
            });
            return result.allowed;
        },
        [check]
    );

    const canLike = useCallback(
        (isTournament?: boolean): boolean => {
            const result = check({
                action: "like",
                isTournament,
            });
            return result.allowed;
        },
        [check]
    );

    const canShare = useCallback(
        (isTournament?: boolean): boolean => {
            const result = check({
                action: "share",
                isTournament,
            });
            return result.allowed;
        },
        [check]
    );

    const canComment = useCallback(
        (): boolean => {
            const result = check({
                action: "comment",
            });
            return result.allowed;
        },
        [check]
    );

    const canDownload = useCallback(
        (isTournament?: boolean, resourceOwnerId?: string): AccessResult => {
            return check({
                action: "download",
                resourceType: "song",
                isTournament,
                resourceOwnerId,
            });
        },
        [check]
    );

    const canJoinTournament = useCallback(
        (): AccessResult => {
            return check({
                action: "join_tournament",
                resourceType: "tournament",
            });
        },
        [check]
    );

    const canListMarketplace = useCallback(
        (): AccessResult => {
            return check({
                action: "list_marketplace",
                resourceType: "marketplace_item",
            });
        },
        [check]
    );

    const canCreateCampaign = useCallback(
        (): AccessResult => {
            return check({
                action: "create_campaign",
                resourceType: "campaign",
            });
        },
        [check]
    );

    return {
        user,
        check,
        canListen,
        canLike,
        canShare,
        canComment,
        canDownload,
        canJoinTournament,
        canListMarketplace,
        canCreateCampaign,
    };
}
