'use strict';

const templateLibrary = [
  {
    id: 'rpg-character',
    name: 'RPG Character Generator',
    category: 'Characters',
    complexity: 'medium',
    description: 'Generate complete RPG characters with name, race, class, traits and backstory',
    tags: ['rpg', 'fantasy', 'character', 'dnd'],
    author: 'perchance-ai',
    code: `output
  ## [name]\n**Race:** [race] | **Class:** [class]\n**Trait:** [trait]\n**Backstory:** [backstory]

name
  Aldric Voss
  Sera Nightwhisper
  Brom Ironfoot
  Lyra Dawnblade
  Cael Ashveil
  Mira Thornwood
  Draven Coldhart
  Elia Sunweave
  Gorrak Stonefist
  Zeph Windsong
  Talia Mistborne
  Kael Shadowstep

race
  Human
  High Elf
  Wood Elf
  Mountain Dwarf
  Hill Dwarf
  Halfling
  Tiefling
  Dragonborn
  Gnome
  Half-Orc

class
  Fighter
  Wizard
  Rogue
  Ranger
  Cleric
  Paladin
  Barbarian
  Bard
  Druid
  Warlock
  Monk
  Sorcerer

trait
  speaks in riddles when nervous
  collects small shiny objects
  never breaks a sworn oath
  distrusts magic but relies on it
  hums old battle songs in silence
  has a compass that points to danger
  laughs loudly at inappropriate times
  keeps a journal of every person met

backstory
  escaped a burning village at age seven
  trained in a forgotten mountain monastery
  sold their soul for one night of power
  survived the fall of a great city
  was cursed by a dying witch
  grew up in the court of a fallen king
  found a glowing artifact in a swamp
  served ten years before deserting`
  },
  {
    id: 'fantasy-location',
    name: 'Fantasy Location Generator',
    category: 'Locations',
    complexity: 'medium',
    description: 'Generate detailed fantasy locations — towns, dungeons, ruins, forests and more',
    tags: ['fantasy', 'location', 'worldbuilding', 'rpg'],
    author: 'perchance-ai',
    code: `output
  **[locationType]: [locationName]**\n[atmosphere]. [detail].\n*Notable: [feature]*

locationType
  Ancient Ruins
  Hidden Village
  Dark Dungeon
  Enchanted Forest
  Crumbling Tower
  Seaside Town
  Mountain Pass
  Desert Oasis
  Haunted Manor
  Underground City

locationName
  Ashenveil
  The Hollow Crown
  Mirestone
  Duskwater
  Ironpeak
  The Weeping Gate
  Silvermarsh
  Thornwall
  Coldharrow
  Embervast

atmosphere
  A thick fog rolls through the streets at all hours
  The air smells faintly of sulfur and old magic
  Strangely cheerful despite obvious decay
  An eerie silence keeps travelers on edge
  The sound of distant music never quite stops

detail
  The locals refuse to speak of what happened here
  Every building faces the same direction
  No map shows this place accurately
  The shadows move slightly wrong

feature
  A well with no bottom
  A statue that changes position each night
  A locked door that hums when touched
  Walls covered in unreadable script
  A garden where flowers bloom only in darkness`
  },
  {
    id: 'magic-item',
    name: 'Magic Item Generator',
    category: 'Items',
    complexity: 'medium',
    description: 'Generate unique magic items with properties, curses, and lore',
    tags: ['magic', 'items', 'loot', 'rpg', 'dnd'],
    author: 'perchance-ai',
    code: `output
  **[itemType] of [power]**\n*[rarity]*\n[description]\n**Ability:** [ability]\n**Curse:** [curse]

itemType
  Sword
  Staff
  Ring
  Amulet
  Cloak
  Gauntlet
  Tome
  Mirror
  Horn
  Mask
  Lantern
  Crown

power
  Endless Night
  Stolen Voices
  The Bleeding Star
  Ash and Ember
  Forgotten Kings
  Serpent's Tongue
  The Deep Below
  Shattered Light

rarity
  Uncommon  3
  Rare  2
  Very Rare
  Legendary

description
  Forged in the last days of a dead empire
  Found in the stomach of a sea creature
  Gifted by a god who no longer answers prayers
  Stolen from a lich's personal vault

ability
  Once per day, speak one truth that cannot be denied
  The wielder casts no shadow
  Animals will not attack the bearer
  Can see through walls within 10 feet

curse
  The bearer cannot lie — even in jest
  Slowly turns the wielder's hair white
  Causes vivid nightmares every long rest
  Other magic items nearby lose their power`
  },
  {
    id: 'story-hook',
    name: 'Story Hook Generator',
    category: 'Stories',
    complexity: 'medium',
    description: 'Generate compelling story hooks, quest starters and plot twists',
    tags: ['story', 'plot', 'quest', 'hook', 'writing'],
    author: 'perchance-ai',
    code: `output
  **Hook:** [setup]. [complication].\n**Twist:** [twist]\n**Stakes:** [stakes]

setup
  A merchant arrives with no memory of the last month
  Three children vanish on the same night from different villages
  A famous hero is found dead — killed by their own weapon
  An old enemy arrives to ask for help
  A map appears on someone's skin overnight
  The town well begins producing something other than water

complication
  Everyone who investigates starts forgetting things
  The only witness refuses to speak
  The authorities are actively covering it up
  The trail leads deeper than expected

twist
  The victim faked their own death
  The enemy is telling the truth
  The heroes are responsible — they just don't remember
  There is no villain — only consequences

stakes
  One life hangs in the balance
  An entire village will be destroyed
  A secret that could topple the kingdom
  The soul of a god is at risk`
  },
  {
    id: 'npc-dialogue',
    name: 'NPC Dialogue Generator',
    category: 'Dialogue',
    complexity: 'simple',
    description: 'Generate realistic NPC dialogue for taverns, shops, and encounters',
    tags: ['dialogue', 'npc', 'rpg', 'tavern'],
    author: 'perchance-ai',
    code: `output
  **[npcType]:** "[greeting] [rumor]"

npcType
  Innkeeper
  Old Farmer
  Suspicious Guard
  Traveling Merchant
  Drunk Adventurer
  Village Priest
  Wandering Bard
  Retired Soldier

greeting
  Aye, welcome traveler.
  You look like you've seen better days.
  Not many come through here anymore.
  Watch yourself — this town has eyes.
  Sit, sit. I'll fetch you something warm.

rumor
  They say the old mill is haunted again.
  Three soldiers rode east last night and never came back.
  The mayor hasn't been seen in a week.
  Someone's been buying up all the silver in town.
  The river upstream has gone black.`
  },
  {
    id: 'sci-fi-planet',
    name: 'Sci-Fi Planet Generator',
    category: 'Sci-Fi',
    complexity: 'medium',
    description: 'Generate alien planets with atmosphere, life, factions and secrets',
    tags: ['sci-fi', 'space', 'planet', 'worldbuilding'],
    author: 'perchance-ai',
    code: `output
  **Planet [planetName]**\n*[climate]*\n[description]\n**Life:** [life]\n**Secret:** [secret]

planetName
  Verath-7
  Solenne Prime
  The Ashen Reach
  Korraxis
  Pale Meridian
  Dustfall
  New Eridan

climate
  Temperate ocean world
  Arid desert plains
  Frozen methane tundra
  Dense toxic jungle
  Volcanic archipelago
  Permanent storm layer

description
  Colonized for rare minerals, now mostly abandoned
  Originally terraformed — the process went wrong centuries ago
  A living world — the planet itself may be conscious
  Ships that land here often fail to leave

life
  Silicon-based crystalline entities
  Hive-mind fungal networks
  Hyper-intelligent ocean creatures
  Synthetic beings left by a vanished civilization

secret
  The planet is a weapon, waiting to be activated
  Something buried deep predates the universe
  The colonists didn't die — they transformed
  There is a second planet in the same orbit, invisible`
  },
  {
    id: 'dungeon-room',
    name: 'Dungeon Room Generator',
    category: 'Locations',
    complexity: 'medium',
    description: 'Generate detailed dungeon rooms with contents, traps, monsters and secrets',
    tags: ['dungeon', 'rpg', 'room', 'trap', 'dnd'],
    author: 'perchance-ai',
    code: `output
  **[roomType]** — [size]\n[atmosphere]\n**Contents:** [contents]\n**Hazard:** [hazard]\n**Hidden:** [hidden]

roomType
  Guard Room
  Treasure Vault
  Ritual Chamber
  Prison Cell Block
  Flooded Gallery
  Throne Room
  Crypt
  Observatory

size
  small (20x20 ft)
  medium (40x40 ft)
  large (60x80 ft)
  vast (100+ ft)

atmosphere
  Torches still burn here, somehow
  A thin layer of ash covers everything
  Absolute silence — even footsteps are muffled
  Faint chanting echoes from no visible source

contents
  Skeletons mid-task, frozen in time
  Overturned furniture and signs of a struggle
  A single throne with something sitting in it
  Rows of empty cages, doors left open

hazard
  Pressure plate triggers ceiling collapse
  Poison gas fills the room when the door closes
  The floor is an illusion over a 40-ft drop
  A sleeping creature in the shadows

hidden
  A loose stone hiding a small cache
  A message scratched into the floor under dust
  A secret door behind the tapestry
  A key with no visible lock`
  },
  {
    id: 'writing-prompt',
    name: 'Creative Writing Prompt',
    category: 'Writing',
    complexity: 'simple',
    description: 'Generate creative writing prompts for short stories, novels and flash fiction',
    tags: ['writing', 'prompt', 'creative', 'fiction'],
    author: 'perchance-ai',
    code: `output
  **Genre:** [genre]\n**Prompt:** [character] [situation]. [complication]. [constraint].

genre
  Dark Fantasy  2
  Science Fiction  2
  Horror
  Mystery
  Magical Realism  2
  Thriller

character
  A cartographer who maps places that don't exist yet
  An amnesiac detective investigating their own disappearance
  A lighthouse keeper who hasn't left in forty years
  A chef whose food gives diners visions
  A clockmaker who builds clocks that run backwards

situation
  receives a letter from their future self
  discovers a room in their home they've never seen
  wakes up with someone else's memories
  realizes everyone around them is the same person

complication
  The solution requires betraying the one person they trust
  There is only one day to act
  Someone else already knows

constraint
  Write it as found documents.
  The narrator is not reliable.
  The ending must be ambiguous.
  Write it in second person.`
  },
  {
    id: 'random-encounter',
    name: 'Random Encounter Generator',
    category: 'Encounters',
    complexity: 'medium',
    description: 'Generate interesting random encounters for wilderness, urban and dungeon settings',
    tags: ['encounter', 'rpg', 'random', 'wilderness'],
    author: 'perchance-ai',
    code: `output
  **[encounterType]** — [setting]\n[description]\n**Complication:** [complication]

encounterType
  Ambush  2
  Traveler
  Distress Call
  Strange Discovery
  Territorial Beast
  Old Acquaintance
  Mysterious Stranger
  Omen

setting
  dense forest trail
  crossroads at dusk
  fog-covered riverbank
  abandoned campsite
  mountain pass at night
  flooded road

description
  Armed figures block the path ahead
  A lone figure sits beside an unlit fire, unmoving
  Something large has been dragged through here recently
  A wagon is overturned; its owner nowhere in sight
  An animal circles but does not attack

complication
  Things are not what they appear
  Intervention will draw a worse threat
  Someone in the party is recognized
  The moral choice is unclear`
  },
  {
    id: 'master-rpg-world',
    name: 'Master RPG World Builder',
    category: 'Master',
    complexity: 'master',
    description: 'Master generator combining characters, locations, items, encounters and hooks for full session prep',
    tags: ['master', 'rpg', 'worldbuilding', 'dnd', 'session'],
    author: 'perchance-ai',
    code: `output
  # Session Seed\n\n## The Hook\n[^story-hook.output]\n\n## Key NPC\n[^rpg-character.output]\n\n## Starting Location\n[^fantasy-location.output]\n\n## First Encounter\n[^random-encounter.output]\n\n## Notable Item\n[^magic-item.output]

// Master generator — imports from other published Perchance generators.
// Publish each sub-generator first, then use their names in [^name.output].`
  }
];

module.exports = { templateLibrary };
