# Thrifty Privacy Policy

_Last updated: 29 September 2026_

Thrifty is made by Kitchen Labs. It's a quick arcade game played in your web browser. This page
says, in plain English, what happens to your information.

## The short version

- Playing the game sends nothing anywhere. The game runs entirely in your browser.
- Only if you choose to save a score to the public leaderboard do we store anything: the name you
  type, your score, and a few numbers about the game.
- There are no accounts, no ads and no tracking.

## What we handle, and why

**Playing.** The game runs on your device. Your moves, the things you catch and your score are not
sent anywhere while you play.

**The leaderboard (only if you save a score).** When you tap **Save my score**, your browser sends
Kitchen Labs' database (hosted by Supabase) the following, over an encrypted connection:

- the name you typed (1 to 15 letters or numbers),
- your final score,
- how many rounds you cleared, and
- how long you played, in milliseconds.

The database adds the date and time the score was saved. It uses the rounds and play time only to
turn away scores the game couldn't produce.

**Everyone can see your name, score and the date** on the leaderboard. Please don't use your real
full name or anything personal as your leaderboard name. Names with offensive words are refused.

**An anonymous session.** To save a score, the game signs you in invisibly with a random ID the
first time you save. It isn't linked to your name, email or device identifiers, and it is never
shown on the leaderboard. We use it to tie your saved scores together so we can limit how often
one player saves (one score every 10 seconds, 30 a day, 200 in total) and so we could delete them
together. Your browser keeps this session in its local storage so the next save reuses it. The
game doesn't create a session when you only visit, play or look at the leaderboard.

Our web host (Vercel) and database host (Supabase) keep standard server logs, such as IP addresses
and request times, for security and reliability.

## What we don't do

No advertising, no analytics tools, no tracking across apps or websites, no selling or sharing of
data. We don't ask for your email, location, contacts or photos.

## Removing a score

Scores can't be edited or removed from the game itself. To have your scores removed, send us the
name you used and roughly when you saved them through [our contact page](https://kitchenlabs-one.vercel.app/contact), and we'll
delete them. Clearing your browser's site
data forgets the anonymous session; your saved scores stay on the board until we remove them.

## Children

Thrifty is not directed at children under 13 and does not knowingly collect personal information
from them. The only thing it stores is what a player types into the leaderboard name.

## Changes and contact

If this policy changes, we'll update the date above. Questions? Send
them through [our contact page](https://kitchenlabs-one.vercel.app/contact).
