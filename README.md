# Empires & Oaths

A small, medieval-inspired card battler. Choose one of six empires, gather supplies, command creatures, cast spells, and defeat a rival commander.

## Play

[Play the game on GitHub Pages](https://dew-drop18.github.io/a-card-game/)

Open `index.html` in a browser, or serve the project directory locally:

```sh
python3 -m http.server 8000
```

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
5. Open the published game, select **FIND AN ONLINE DUEL**, then choose an empire. A wait room stays open while matchmaking searches; cancel the search there if needed. When another commander joins, a sound plays and both players enter the duel automatically.

The Worker URL in `multiplayer-config.js` is public configuration, not a secret. Do not put Cloudflare API tokens or account credentials in the site. Keep the `ALLOWED_ORIGIN` restriction enabled for the published Pages origin. The `/health` endpoint can be used to check that the Worker is responding.

When running locally, `multiplayer-config.js` must point to the deployed Worker, and `http://localhost:8000` must be in `ALLOWED_ORIGIN`. If you change the allowlist, redeploy the Worker. A page refresh restores an active match for up to 90 seconds; matchmaking searches themselves do not survive a refresh.

## How to play

### Start a battle

1. Choose one of the six empires on the title screen.
2. For a campaign battle, choose a difficulty:
   - **Easy Living:** rival starts with 22 health and 1 of each supply.
   - **Farm Work:** rival starts with 30 health and 2 of each supply.
   - **Painful Adventure:** rival starts with 36 health and 3 of each supply.
   - **True Battlegrounds:** rival starts with 42 health and 4 of each supply.
3. Each commander starts with 30 health. Reduce the rival to 0 health to win.
4. In the campaign, victory advances the conquest to the next dynasty. Defeat resets the streak and retries the current dynasty at the selected starting difficulty.

### Turns and cards

- Your opening hand has 5 cards. At the start of each turn, cards are drawn until your hand contains 5 cards.
- Each commander may have no more than 5 creatures and structures combined on the battlefield.
- Each commander starts with 5 food, 5 wood, and 5 stone. Drawing a supply card grants its printed resources without a separate payment.
- You may hold up to 10 cards. A card drawn when your hand is full is lost.
- Supply cards are played automatically when drawn. They add supplies and do not count toward hand size.
- Once per turn, choose **FOOD**, **WOOD**, or **STONE** under **GATHER +2** to gain 2 of that supply. Supplies carry between turns.
- Cards require food, wood, or stone. Creatures primarily use food, spells use stone, and structures use wood.
- Click an affordable card to play it. If the game is running in a desktop browser, creatures and structures can also be dragged onto the battlefield.
- Each battlefield can hold up to 5 creatures and/or structures.
- You can play as many affordable cards as desired, gather supplies once, then select **END TURN**.
- The rival takes a turn after you end yours. This includes gathering, playing cards, attacking if possible, and ending the turn.

### Creature cards

- Creatures join your company on the battlefield.
- The card displays attack, health, and defense.
- A creature cannot attack on the turn it is played; it becomes ready at the start of your next turn.
- Select one of your ready creatures, then select a rival creature or the rival commander to attack.
- Creatures can attack only once per turn.
- Defense reduces incoming damage. Every strike deals at least 1 damage even when defense is higher.
- When a creature attacks a rival creature, that rival retaliates if it is still alive. Structures deal no retaliation damage.

### Spells and structures

Spells may produce one of the following effects:

- gain supplies;
- damage a rival creature, or the commander if there is no rival creature;
- restore the caster's commander health;
- increase a creature's attack for the current turn;
- increase a creature's health and defense; or
- deal damage to every rival creature.

Rally and ward spells require at least one friendly creature. Healing cannot raise a commander above 30 health.

The common structures have these persistent effects:

- **Trade Post:** at the start of a turn, each friendly creature grants 1 food, 1 wood, and 1 stone.
- **Field Hospital:** at the start of a turn, heal every friendly creature by 1.
- **War College:** while it remains on the battlefield, friendly creatures receive +1 attack and +1 health.

Structures occupy battlefield slots, have health, cannot attack, and may be targeted by rival creatures. Multiple resource structures or hospitals add together.

### Decks and fatigue

Every empire has a shuffled 100-card deck. Each deck contains 15 dynasty-special cards: 5 creatures, 5 spells, and 5 structures. These special cards are included in the total battle-card counts below.

| Dynasty | Total | Regular creatures + special creatures | Regular spells + special spells | Regular structures + special structures | Supply cards |
|---|---:|---:|---:|---:|---:|
| British Empire | 100 | 29 + 5 | 7 + 5 | 23 + 5 | 26 |
| Mongol Empire | 100 | 34 + 5 | 7 + 5 | 16 + 5 | 28 |
| Russian Empire | 100 | 26 + 5 | 7 + 5 | 24 + 5 | 28 |
| Qing Dynasty | 100 | 25 + 5 | 12 + 5 | 20 + 5 | 28 |
| Spanish Empire | 100 | 28 + 5 | 10 + 5 | 19 + 5 | 28 |
| French Colonial | 100 | 31 + 5 | 10 + 5 | 16 + 5 | 28 |

Removing 12 supply cards from each deck adds 12 battle cards. Britain gains 4 creatures, 2 spells, and 6 structures; Mongolia gains 7 creatures, 2 spells, and 3 structures; Russia gains 3 creatures, 3 spells, and 6 structures; Qing gains 3 creatures, 5 spells, and 4 structures; Spain gains 4 creatures, 4 spells, and 4 structures; France gains 5 creatures, 4 spells, and 3 structures.

Supply cards are divided by dynasty as follows:

| Dynasty | Food | Wood | Stone | Total supplies |
|---|---:|---:|---:|---:|
| British Empire | 8 | 11 | 7 | 26 |
| Mongol Empire | 12 | 9 | 7 | 28 |
| Russian Empire | 10 | 10 | 8 | 28 |
| Qing Dynasty | 11 | 9 | 8 | 28 |
| Spanish Empire | 10 | 8 | 10 | 28 |
| French Colonial | 12 | 8 | 8 | 28 |

Open the **▦ Dynasty Guide** tutorial menu in the game header to review each composition and strategy.

When a deck runs out, drawing instead deals fatigue damage. Fatigue starts at 1 damage, then increases by 1 each time the commander must draw from an empty deck.

## Weather on the battlefield

Weather changes automatically at the beginning of each commander turn. Average weather is the most common and leaves the field unchanged. Other weather lasts for four commander turn transitions: two turns for each player.

- **Drought:** every creature temporarily loses 1 health while drought lasts, including creatures played during the drought.
- **Thunder Storm:** structures have a random chance to be struck and destroyed.
- **Black Plague:** starts with one infected creature, damages infected creatures each turn, and spreads to a neighboring healthy creature while the event lasts.
- **Peace:** grants every creature on the field +1 to a randomly selected attack, health, or defense stat until peace ends.
- **Winter Storm:** creatures and structures each have a random chance to take 1 damage at the beginning of each affected turn.
- **Sudden Wealth:** every creature and structure below its maximum health heals 1 at the beginning of each affected turn.

The battlefield changes visually for drought, storms, plague, peace, winter, and sudden wealth. The weather banner shows the active effect and how many player cycles remain.

## Factions

Every faction has its own banner, passive dynasty trait, 10 themed regular creatures, and 15 empire-specific cards.

### British Empire - The Isles

Passive: **Redoubtable Guard — each placed structure gives every creature +1 to a random attack, health, or defense stat.**

Regular creatures: Crown Squire, Longbow Scout, Tower Guard, Whitecliff Knight, Border Rider, Royal Archer, Stonekeep Warden, Royal Lion, Red Stag Guardian, and Crown Champion.

Empire-special creatures: Agincourt Longbow Company, New Model Army Veteran, Wellington's Peninsular Rifleman, East India Company Sepoy, and Royal Marine at Trafalgar.

Empire-special spells: East India Company Charter, Trafalgar Cannonade, Scutari Field Hospital, Wellington's Square, and Royal Navy Convoy.

Empire-special structures: Portsmouth Royal Dockyard, Fort William Barracks, Scutari Military Hospital, East India Company Warehouse, and Royal Naval Hospital.

### Mongol Empire - The Steppe

Passive: **Riders of the Steppe — a creature that defeats another creature gains +2 attack until it dies.**

Regular creatures: Steppe Foal, Wind Scout, Keshig Guard, Wolf-Rider, Falcon Archer, Khanate Lancer, Golden Horde, Ordu Champion, Steppe Wolf, and Golden Eagle.

Empire-special creatures: Keshig Imperial Guard, Yam Relay Rider, Siege Engineer of Zhongdu, Golden Horde Horse Archer, and Yuan Cavalry of Kublai.

Empire-special spells: Yam Relay Network, Siege of Baghdad, Mongol Field Surgeon, Karakorum Muster, and Pax Mongolica.

Empire-special structures: Yam Relay Station, Keshig Camp, Karakorum Infirmary, Golden Horde Supply Post, and Karakorum Healers' Yurt.

### Russian Empire - The North

Passive: **Keepers of the North — heal every friendly creature by 1 at the start of your turn.**

Regular creatures: Snowland Squire, Pinewood Scout, Ironwall Guard, Winter Knight, Cossack Rider, Frost Archer, Bearskin Warden, White Tsar, Brown Bear Guardian, and White Wolf.

Empire-special creatures: Moscow Streltsy Musketeer, Don Cossack Host, Siberian Frontier Pioneer, Borodino Grenadier, and Baltic Fleet Marine.

Empire-special spells: Siberian Fur Tribute, Smolensk Scorched Earth, Borodino Field Hospital, Cossack Host Muster, and Winter March.

Empire-special structures: Siberian Ostrog, Cossack Host Encampment, Borodino Field Hospital, Peter the Great Foundry, and Winter Quarters Infirmary.

### Qing Dynasty - The East

Passive: **Jade Court — supply cards grant 1 additional supply.**

Regular creatures: Jade Page, Cloud Scout, Jade Dragon, Bannerman Knight, Swift Lancer, Silk Archer, Jadewall Sentinel, Azure General, Qing Lion, and Dragon Emperor.

Empire-special creatures: Eight Banner Guard, Green Standard Infantry, Kangxi Bannerman, Jinchuan Campaign Veteran, and Zuo Zongtang's Army Veteran.

Empire-special spells: Grand Canal Granaries, Three Feudatories Campaign, Imperial Medical Bureau, Eight Banner Review, and Great Wall Garrison.

Empire-special structures: Grand Canal Granary, Eight Banner Garrison, Imperial Medical Bureau, Canton Thirteen Factories, and Jinchuan Field Hospital.

### Spanish Empire - The West

Passive: **Gilded Armada — defeating a creature grants 1 random resource; defeating a structure grants 2 random resources.**

Regular creatures: Castilian Page, Sierra Scout, Sunlit Guard, Toledo Knight, Conquistador, Crossbow Archer, Citadel Warden, Golden Hidalgo, Iberian Lynx, and Sun King Champion.

Empire-special creatures: Flanders Tercio Pikeman, Pizarro Expedition Veteran, Armada Boarding Crew, Manila Galleon Guard, and Cartagena Dragoon.

Empire-special spells: Manila Galleon Convoy, Lepanto Broadside, Camino Real Hospital, Tercio Pike Square, and Armada Refit.

Empire-special structures: Casa de Contratacion, Cartagena Fortress, Hospital de la Sangre, Royal Mint of Potosi, and Manila Naval Hospital.

### French Colonial - The New World

Passive: **Frontier Company — playing a creature, spell, and structure in one turn grants all creatures +1 attack for that turn.**

Regular creatures: Frontier Page, River Scout, Fleur Guard, Loyalist Knight, Voyageur Rider, Forest Archer, Stonefort Warden, Marquis Champion, Frontier Bison, and Great Horned Owl.

Empire-special creatures: Carignan-Salières Soldier, Coureur des bois, Quebec Colonial Militia, Louisbourg Marine, and New France Voyageur.

Empire-special spells: Fur Trade Convoy, Siege of Quebec, Hôtel-Dieu de Québec, Carignan-Salières Muster, and Louisbourg Refit.

Empire-special structures: Quebec Royal Storehouse, Fort Frontenac, Hôtel-Dieu de Québec, Port-Royal Trading Post, and Louisbourg Hospital.

## Campaign progress

Campaign victories add 6 rival health, 1 supply of each resource, and 5 percentage points to the rival's chance of targeting a battlefield creature for each previous dynasty win. The game advances through the remaining five empires as the dynasty changes. A loss resets the win streak and lets you retry the current empire.

And may the cards be forever in your favor!

All ownership goes to Kazz Shepherd