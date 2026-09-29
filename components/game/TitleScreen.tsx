'use client';

/**
 * The front door: what the game is, Start, the leaderboard, and the rules in plain words.
 */

import { motion } from 'motion/react';
import { Play, ShoppingCart, Trophy } from 'lucide-react';
import { Button, Card, Icon, PageShell } from '@/components/kl';
import { fadeUp } from '@/lib/kl/motion';
import { site } from '@/lib/site';
import { AISLE_COLORS, ITEM_ICONS, POWER_UP_ICONS, money } from './visuals';
import { AisleList, HOW_TO_PLAY, PowerUpList, ScoringRules } from './Hud';

/** A still life of the game for the hero: three things falling toward a cart. */
function HeroArt() {
  const falling = [
    { id: 'coffee', aisle: 'snack' as const, cost: 500, x: 14, y: 12, delay: 0 },
    { id: 'headphones', aisle: 'tech' as const, cost: 950, x: 58, y: 30, delay: 0.25 },
    { id: 'glasses', aisle: 'style' as const, cost: 650, x: 30, y: 52, delay: 0.5 },
  ];
  const Boost = POWER_UP_ICONS.budget_boost;
  return (
    <div className="field-dots relative aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-xl ring-1 ring-line" aria-hidden>
      {falling.map((f) => {
        const ItemIcon = ITEM_ICONS[f.id];
        return (
          <motion.div
            key={f.id}
            className="absolute flex size-[72px] flex-col items-center justify-between rounded-[18px] pb-1 pt-2.5 shadow-[0_2px_0_rgb(18_24_41/0.12)]"
            style={{ left: `${f.x}%`, top: `${f.y}%`, background: AISLE_COLORS[f.aisle].tile }}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: [0, 10, 0], opacity: 1 }}
            transition={{ y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: f.delay }, opacity: { duration: 0.4, delay: f.delay } }}
          >
            <span className="flex" style={{ color: AISLE_COLORS[f.aisle].icon }}>
              <Icon icon={ItemIcon} size={30} />
            </span>
            <span className="tabular rounded-full bg-surface px-1.5 font-display text-[16px] leading-[20px] text-ink">{money(f.cost)}</span>
          </motion.div>
        );
      })}
      <div className="absolute right-[12%] top-[8%] flex size-14 items-center justify-center rounded-full bg-success-soft text-success-text ring-[3px] ring-success">
        <Icon icon={Boost} size={26} />
      </div>
      <div className="absolute bottom-[6%] left-1/2 flex h-[72px] w-[104px] -translate-x-1/2 items-center justify-center rounded-[20px] bg-accent-strong shadow-[0_5px_0_var(--accent-deep)]">
        <Icon icon={ShoppingCart} size={40} strokeWidth={2.5} className="text-on-accent" />
      </div>
    </div>
  );
}

export function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <PageShell
      appName={site.name}
      appSlug={site.slug}
      width="wide"
      // eslint-disable-next-line @next/next/no-img-element -- the 32 px tab icon, already an SVG
      icon={<img src="/icon.svg" alt="" width={32} height={32} />}
    >
      <section className="grid items-center gap-8 py-6 md:grid-cols-[1.1fr_1fr] md:py-10">
        <motion.div {...fadeUp(0)} className="flex flex-col items-start">
          <p className="rounded-full bg-accent-soft px-3 py-1 text-[13px] font-bold uppercase tracking-wide text-accent-text">
            Arcade budget game
          </p>
          <h1 className="mt-3 text-[3.5rem] leading-none text-ink sm:text-[4.5rem]">Thrifty</h1>
          <p className="mt-4 max-w-md text-title3 font-normal text-ink-2">
            Things fall from the shelves. Catch five before the clock runs out, and don&apos;t spend more than you have.
          </p>
          <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
            <Button size="lg" icon={Play} onClick={onStart} className="sm:flex-1" autoFocus>
              Start game
            </Button>
            <Button size="lg" variant="secondary" icon={Trophy} href="/leaderboard" className="sm:flex-1">
              Leaderboard
            </Button>
          </div>
          <p className="mt-3 text-[15px] text-ink-2">Three rounds, about two minutes. Works with arrow keys or touch.</p>
        </motion.div>
        <motion.div {...fadeUp(1)} className="flex justify-center md:justify-end">
          <HeroArt />
        </motion.div>
      </section>

      <section aria-labelledby="how-to-play" className="py-6">
        <h2 id="how-to-play" className="text-title text-ink">
          How to play
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {HOW_TO_PLAY.map((step, i) => (
            <motion.li key={step.title} {...fadeUp(i + 2)}>
              <Card className="h-full">
                <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                  <Icon icon={step.icon} size={20} />
                </span>
                <h3 className="mt-3 text-title3 text-ink">
                  {i + 1}. {step.title}
                </h3>
                <p className="mt-1 text-[15px] text-ink-2">{step.text}</p>
              </Card>
            </motion.li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="scoring" className="grid gap-3 py-6 md:grid-cols-2">
        <Card padding="lg">
          <h2 id="scoring" className="text-title2 text-ink">
            Scoring
          </h2>
          <div className="mt-3">
            <ScoringRules />
          </div>
          <h3 className="mt-5 text-title3 text-ink">The four aisles</h3>
          <p className="mb-2 text-[15px] text-ink-2">Every item belongs to one. Bonuses count them.</p>
          <AisleList />
        </Card>
        <Card padding="lg">
          <h2 className="text-title2 text-ink">Power-ups</h2>
          <p className="mt-1 text-[15px] text-ink-2">Round bubbles help. Tilted squares hurt. Catch them like anything else.</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-title3 text-success-text">Good</h3>
              <PowerUpList which="good" />
            </div>
            <div>
              <h3 className="mb-2 text-title3 text-danger-text">Bad</h3>
              <PowerUpList which="bad" />
            </div>
          </div>
        </Card>
      </section>
    </PageShell>
  );
}
