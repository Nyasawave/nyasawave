"use client";

import { useFollow } from "@/app/context/FollowContext";
import Button from "./Button";

export default function FollowButton({ artistId, artistName }: { artistId: string; artistName: string }) {
  const { isFollowing, toggleFollow } = useFollow();
  const following = isFollowing(artistId);

  return (
    <Button
      onClick={() => toggleFollow(artistId)}
      variant={following ? "ghost" : "primary"}
    >
      {following ? `Unfollow` : `Follow ${artistName}`}
    </Button>
  );
}
