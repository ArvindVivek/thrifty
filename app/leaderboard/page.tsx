import type { Metadata } from 'next';
import { PageShell } from '@/components/kl';
import { LeaderboardBoard } from '@/components/game/Leaderboard';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'The best Thrifty scores from every player.',
};

export default function LeaderboardPage() {
  return (
    <PageShell
      appName={site.name}
      appSlug={site.slug}
      // eslint-disable-next-line @next/next/no-img-element -- the 32 px tab icon, already an SVG
      icon={<img src="/icon.svg" alt="" width={32} height={32} />}
    >
      <h1 className="sr-only">Thrifty leaderboard</h1>
      <div className="py-4">
        <LeaderboardBoard playHref="/" />
      </div>
    </PageShell>
  );
}
