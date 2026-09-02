/**
 * Autonomous perchance generator — the agent picks topics, builds
 * .perchance generators, validates and previews them, then outputs
 * ready-to-paste code. (100% local — no external API keys required.)
 */
import { validateTool } from '../src/mcp/tools/validate-tool.js';
import { previewTool } from '../src/mcp/tools/preview-tool.js';

type Gen = { topic: string; category: string; style: string; code: string };

const generators: Gen[] = [
  {
    topic: 'dark fantasy NPC name',
    category: 'characters',
    style: 'weighted',
    code: `// dark fantasy NPC name
output
  [title] [firstName] of [house]
  [firstName] "[epithet]" [lastName]

title
  Sir^2
  Dame
  Lord^2
  Lady
  Brother
  Mother

firstName
  Kael^3
  Veyra^2
  Thorne^3
  Isolde^2
  Brann
  Mirela^2
  Dread^2

lastName
  Ashford^2
  Blackwater^3
  Thornwood^2
  Ravenscroft
  Holloway^2

house
  the Ashen Vale^2
  the Pale Court
  the Iron Marches^2
  the Whispering Reach

epithet
  the Unbroken^2
  the Forsaken
  the Silent Blade^2
  the Bone-Crowned
  the Ever-Watchful^2
`,
  },
  {
    topic: 'sci-fi weapon',
    category: 'items',
    style: 'nested',
    code: `// sci-fi weapon
output
  [prefix]-[core] [class] Mk.[num]
  [core] [class] "[codename]"

prefix
  XR^2
  VK
  NZ^2
  OS
  TR^2

core
  Plasma^3
  Rail^2
  Gauss^3
  Pulse^2
  Cryo

class
  Rifle^2
  Cannon^3
  Launcher^2
  Pistol^2
  Lance

codename
  Widowmaker^2
  Horizon
  Nightfall^2
  Ember^2
  Sentinel

num
  1^3
  2^2
  3^2
  4
  7
`,
  },
  {
    topic: 'tavern rumour / quest hook',
    category: 'quests',
    style: 'complex',
    code: `// tavern rumour / quest hook
output
  They say [who] has [action] [where].
  A [stranger] warns that [event].
  [who] offers [reward] if you [action] [where].

who
  the blacksmith^2
  a one-eyed merchant^2
  the baron's spy
  a wandering monk^2
  the village elder^2

action
  hidden^2
  stolen^3
  awakened^2
  cursed^3
  unearthed

where
  beneath the old mill^2
  in the frozen crypt^2
  across the sunken bridge
  within the witchwood^2
  atop the bone spire

stranger
  cloaked rider^2
  wounded scout^2
  hooded child
  drunk sellsword^2

event
  the well runs red at midnight^2
  the dead walk the eastern road^2
  the comet returns early
  the seal has cracked^2

reward
  a pouch of dwarven gold^2
  a map with no country^2
  a ring that hums
  safe passage^2
`,
  },
];

async function main() {
  for (const g of generators) {
    const v = JSON.parse((await validateTool.handler({ code: g.code })).content[0].text);
    const p = JSON.parse((await previewTool.handler({ code: g.code, count: 5 })).content[0].text);
    console.log(`\n════════════════════════════════════════════════════════`);
    console.log(`🎲 ${g.topic}  [${g.category} / ${g.style}]`);
    console.log(`   validate: ${v.valid ? 'VALID' : 'INVALID'} — ${v.errorCount} err, ${v.warningCount} warn`);
    console.log(`   preview : ${p.results.join('  |  ')}`);
    console.log(`────────────────────────────────────────────────────────`);
    console.log(g.code);
    console.log(`Paste: https://perchance.org/minimal#edit\n`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
