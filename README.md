# Empires & Oaths

A small, medieval-inspired card battler. Choose one of six empires, gather supplies, command creatures, cast spells, and defeat a rival commander.

## Play

Open `index.html` in a browser, or serve the project directory locally:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Online one-on-one play

Online duels use the Cloudflare Workers Free plan and Durable Objects. GitHub Pages remains the frontend host; the Worker provides matchmaking and authoritative game state over WebSockets. Each room is isolated, opponents only receive public battlefield information, and the server checks turns, resources, cards, attacks, and surrender. A disconnected player has 90 seconds to reconnect. Matchmaking searches for up to two minutes.

The free plan has usage limits and no uptime guarantee. Limits and plan terms can change. This setup does not require a paid plan or add billing to your Cloudflare account; stay on the Free plan and do not enable paid upgrades if you need a strict $0 cap. Matches are temporary and are removed 24 hours after they end.

### Deploy the multiplayer Worker

1. Create a free Cloudflare account and install Node.js.
2. In this project, update `ALLOWED_ORIGIN` in `wrangler.toml` to your GitHub Pages origin. For this repository the default is `https://dew-drop18.github.io`; include the origin only, without a repository path. You can include multiple comma-separated origins for local testing.
3. From the project directory, run:

   ```sh
   npx wrangler login
   npx wrangler deploy
   ```

   Wrangler creates the Durable Object namespaces on the first deployment. The command prints the Worker URL, usually `https://empires-oaths-multiplayer.<your-subdomain>.workers.dev`.
4. Set `window.MULTIPLAYER_ENDPOINT` in `multiplayer-config.js` to that HTTPS Worker URL (no `/match` or `/room` suffix), then commit and push the config change so GitHub Pages publishes it.
5. Open the published game, select **FIND AN ONLINE DUEL**, then choose an empire. Share the page with a friend; the first two commanders in the queue are paired automatically.

The Worker URL in `multiplayer-config.js` is public configuration, not a secret. Do not put Cloudflare API tokens or account credentials in the site. Keep the `ALLOWED_ORIGIN` restriction enabled for the published Pages origin. The `/health` endpoint can be used to check that the Worker is responding.

When running locally, `multiplayer-config.js` must point to the deployed Worker, and `http://localhost:8000` must be in `ALLOWED_ORIGIN`. If you change the allowlist, redeploy the Worker. A page refresh restores an active match for up to 90 seconds; matchmaking searches themselves do not survive a refresh.

## Rules

- Each commander starts with 30 health. Bring the rival to 0 to win.
- Once per turn, gather 2 food, wood, or stone. Resources carry over between turns.
- Cards cost combinations of food, wood, and stone. Play as many affordable cards as you can.
- Each 100-card deck has 20 food, 20 wood, 20 stone, 30 creature, and 10 spell cards. A supply card grants 2 resources when drawn.
- Start with 5 cards. At the start of each turn, draw until your hand has 5 cards; supply cards grant resources immediately and do not count toward hand size.
- Creatures join your company but need to wait a turn before attacking. Click a ready creature, then an enemy creature or commander to attack.
- After choosing an empire, select Easy Living, Farm Work, Painful Adventure, or True Battlegrounds. Difficulty changes rival health, supplies, and combat behavior.
- Win a dynasty to advance through the remaining five empires. Each consecutive win adds 6 rival health, 1 of each starting supply, and more aggressive targeting to the next dynasty. Losing resets the streak and retries the current dynasty at your selected starting difficulty.
- Defense reduces incoming damage; a strike always deals at least 1 damage.
- Each empire's shuffled deck holds 100 distinct cards. If a deck runs out, drawing causes increasing fatigue damage.
- Online matches use the same card rules as the campaign, but the opponent is another player and all moves are validated by the Worker.

Choose from the British, Mongol, Russian, Qing, Spanish, and French colonial empires, each with a distinct banner color and card collection.
