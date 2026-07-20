# Perchance.ai Syntax Reference

Complete guide to `.perchance` generator syntax for AI-assisted generation.

---

## Basic Structure

```
output
  [adjective] [noun]

adjective
  ancient
  forgotten
  cursed

noun
  sword
  tome
  artifact
```

- **List name**: starts at column 0, no indent
- **List items**: indented with 2 spaces (or 1 tab)
- **First list named `output`**: what users see when they click Generate
- **`[listName]`**: reference another list — replaced with a random item

---

## Weighted Items

Use `^N` to make an item appear more or less often:

```
rarity
  common^10
  uncommon^5
  rare^2
  legendary^1
```

Higher number = more common. Weights are relative.

---

## Nested References

```
output
  [prefix] [name] the [title]

prefix
  Lord
  Lady
  Grand

name
  Aldric
  Seraphina
  Zorn

title
  [adjective] [noun]

adjective
  Unyielding
  Ancient

noun
  Dragon
  Storm
```

References can be nested — `[title]` itself references `[adjective]` and `[noun]`.

---

## Comments

```
// This is a comment
output
  [adjective] [creature]  // inline comment
```

---

## Imports

```
import https://perchance.ai/some-other-generator

output
  [importedList] [myList]
```

Import lists from any public perchance.ai generator.

---

## Complete Example — RPG Loot Table

```
// RPG Loot Table Generator
// Paste at: https://perchance.ai/tools/generate

output
  [rarity] [type]: [prefix] [item]

rarity
  Common^8
  Uncommon^4
  Rare^2
  Epic
  Legendary^0.5

type
  Weapon
  Armor
  Accessory
  Consumable^6

prefix
  Enchanted
  Cursed
  Ancient
  Masterwork^2
  Rusty^4

item
  Sword
  Axe
  Staff
  Dagger
  Bow
  Shield
  Ring
  Amulet
  Potion^6
  Scroll^4
```

---

## Style Guide for AI Generation

| Style | When to use | Example |
|-------|-------------|--------|
| `simple` | Quick lists, few references | `output\n  item1\n  item2` |
| `weighted` | Items with different rarities | Use `^N` notation |
| `nested` | Rich varied output | Multiple `[references]` per item |
| `complex` | Full worldbuilding | Deep nesting, imports |

---

## Paste URL

Always paste your generated code at:
**https://perchance.ai/tools/generate**
