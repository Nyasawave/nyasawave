// AI-Powered Recommendation Engine (Phase 6.1)
// Behavior-based recommendations using user activity

export interface UserActivity {
  userId: string;
  plays: number;
  likes: number;
  follows: number;
  skips: number;
  genreAffinity: Record<string, number>;
}

export interface RecommendationScore {
  trackId: string;
  score: number;
  reason: string;
}

class RecommendationEngine {
  /**
   * Generate "For You" recommendations based on user behavior
   */
  async generateForYou(userId: string, limit: number = 20): Promise<RecommendationScore[]> {
    // Fetch user activity
    const userActivity = await this.getUserActivity(userId);

    // Get trending tracks
    const trendingTracks = await this.getTrendingTracks();

    // Get new releases matching user genres
    const newReleases = await this.getNewReleases(userActivity.genreAffinity);

    // Score all candidates
    const scores = [...trendingTracks, ...newReleases].map(track => ({
      trackId: track.id,
      score: this.calculateScore(track, userActivity),
      reason: this.getRecommendationReason(track, userActivity),
    }));

    return scores.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * "Because you listened to..." recommendations
   */
  async getRelatedTracks(trackId: string, limit: number = 10): Promise<RecommendationScore[]> {
    const track = await this.getTrack(trackId);
    if (!track) return [];

    // Find similar tracks by genre, artist, and tempo
    const similar = await this.findSimilarTracks(track);

    return similar
      .map(t => ({
        trackId: t.id,
        score: this.calculateSimilarity(track, t),
        reason: `Because you listened to "${track.title}"`,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Trending in Malawi recommendations
   */
  async getTrendingMalawi(limit: number = 20): Promise<RecommendationScore[]> {
    const period = '7d'; // Last 7 days
    const plays = await this.getStreamsInPeriod(period, 'MW');

    const scores = plays.map(p => ({
      trackId: p.trackId,
      score: p.playCount,
      reason: 'Trending in Malawi',
    }));

    return scores.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * "Upcoming artists you may like"
   */
  async getUpcomingArtists(userId: string, limit: number = 10): Promise<RecommendationScore[]> {
    const userActivity = await this.getUserActivity(userId);
    const upcomingArtists = await this.getUpcomingArtistsList();

    const scores = upcomingArtists.map(artist => ({
      trackId: artist.topTrackId,
      score: this.calculateArtistRelevance(artist, userActivity),
      reason: `Upcoming artist in ${artist.genre}`,
    }));

    return scores.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  // Private helper methods
  private calculateScore(track: any, activity: UserActivity): number {
    let score = 0;

    // Genre match (40% weight)
    const genreScore = activity.genreAffinity[track.genre] || 0;
    score += genreScore * 0.4;

    // Trending factor (30% weight)
    const trendingScore = Math.min(track.streams / 1000, 1);
    score += trendingScore * 0.3;

    // Artist popularity (20% weight)
    const artistScore = Math.min(track.artistFollowers / 10000, 1);
    score += artistScore * 0.2;

    // Newness bonus (10% weight)
    const daysOld = (Date.now() - new Date(track.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const newBonus = Math.max(0, 1 - (daysOld / 30)); // 30-day decay
    score += newBonus * 0.1;

    return score;
  }

  private calculateSimilarity(track1: any, track2: any): number {
    let similarity = 0;

    // Same genre
    if (track1.genre === track2.genre) similarity += 0.4;

    // Same artist followers range
    const followerRatio = Math.min(
      track1.artistFollowers,
      track2.artistFollowers
    ) / Math.max(track1.artistFollowers, track2.artistFollowers);
    similarity += followerRatio * 0.3;

    // Popularity match
    const popularityRatio = Math.min(track1.streams, track2.streams) /
      Math.max(track1.streams, track2.streams);
    similarity += popularityRatio * 0.3;

    return Math.min(similarity, 1);
  }

  private calculateArtistRelevance(artist: any, activity: UserActivity): number {
    const genreAffinity = activity.genreAffinity[artist.genre] || 0;
    const momentumScore = artist.weeklyGrowth * 0.5; // Growth rate
    return Math.min(genreAffinity * 0.5 + momentumScore * 0.5, 1);
  }

  private getRecommendationReason(track: any, activity: UserActivity): string {
    const topGenre = Object.entries(activity.genreAffinity).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];

    if (topGenre === track.genre) {
      return `More ${track.genre}`;
    }
    if (track.streams > 10000) {
      return 'Trending';
    }
    return 'Recommended for you';
  }

  // Placeholder methods (would call actual database/API)
  private async getUserActivity(userId: string): Promise<UserActivity> {
    return {
      userId,
      plays: 0,
      likes: 0,
      follows: 0,
      skips: 0,
      genreAffinity: {},
    };
  }

  private async getTrendingTracks(): Promise<any[]> {
    return [];
  }

  private async getNewReleases(genreAffinity: Record<string, number>): Promise<any[]> {
    return [];
  }

  private async getTrack(trackId: string): Promise<any> {
    return null;
  }

  private async findSimilarTracks(track: any): Promise<any[]> {
    return [];
  }

  private async getStreamsInPeriod(period: string, country: string): Promise<any[]> {
    return [];
  }

  private async getUpcomingArtistsList(): Promise<any[]> {
    return [];
  }
}

export const recommendationEngine = new RecommendationEngine();
