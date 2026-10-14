# Empires & Oaths

A small, medieval-inspired card battler. Choose one of six empires, gather supplies, command creatures, cast spells, and defeat a rival commander.

## Play

Open `index.html` in a browser, or serve the project directory locally:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Rules

- Each commander starts with 30 health. Bring the rival to 0 to win.
- Once per turn, gather 2 food, wood, or stone. Resources carry over between turns.
- Cards cost combinations of food, wood, and stone. Play as many affordable cards as you can.
- Each 100-card deck has 20 food, 20 wood, 20 stone, 30 creature, and 10 spell cards. A supply card grants 2 resources when drawn.
- Start with 5 cards. At the start of each turn, draw until your hand has 5 cards; supply cards grant resources immediately and do not count toward hand size.
- Creatures join your company but need to wait a turn before attacking. Click a ready creature, then an enemy creature or commander to attack.
- Defense reduces incoming damage; a strike always deals at least 1 damage.
- Each empire's shuffled deck holds 100 distinct cards. If a deck runs out, drawing causes increasing fatigue damage.

Choose from the British, Mongol, Russian, Qing, Spanish, and French colonial empires, each with a distinct banner color and card collection.
