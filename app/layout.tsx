import { SubscriptionProvider } from "./context/SubscriptionContext";
import { FollowProvider } from "./context/FollowContext";
import { ArtistProvider } from "./context/ArtistContext";
import { SongProvider } from "./context/SongContext";
import { PlaylistProvider } from "./context/PlaylistContext";
import "./globals.css";
import RoleAwareHeader from "./components/RoleAwareHeader";
import Player from "./components/Player";
import Footer from "./components/Footer";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PlayerProvider } from "./context/PlayerContext";
import PremiumToggle from "./components/PremiumToggle";
import UpgradeBanner from "./components/UpgradeBanner";
import { AudioPlayerProvider } from "./context/AudioPlayerContext";
import AudioPlayerBar from "./components/AudioPlayerBar";
import { NextAuthProvider } from "./providers";
import { RoleProvider } from "./context/RoleContext";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-900 text-white pb-24">
        <NextAuthProvider>
          <ThemeProvider>
            <RoleProvider>
              <ErrorBoundary>
                <AudioPlayerProvider>
                  <ArtistProvider>
                    <SongProvider>
                      <PlaylistProvider>
                        <PlayerProvider>
                          <FollowProvider>
                            <SubscriptionProvider>
                              <PremiumToggle />
                              <UpgradeBanner />
                              <RoleAwareHeader />
                              {children}
                              <Footer />
                              <Player />
                              <AudioPlayerBar />
                            </SubscriptionProvider>
                          </FollowProvider>
                        </PlayerProvider>
                      </PlaylistProvider>
                    </SongProvider>
                  </ArtistProvider>
                </AudioPlayerProvider>
              </ErrorBoundary>
            </RoleProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}