/**
 * Agent autonomy demo — exercises the real MCP tool handlers
 * (validate_syntax, preview_rolls) used by the perchance-mcp server.
 *
 * Run:  npx tsx scripts/agent-demo.ts
 */
import { validateTool } from '../src/mcp/tools/validate-tool.js';
import { previewTool } from '../src/mcp/tools/preview-tool.js';

// 1) The agent decides a topic and builds a .perchance generator (offline,
//    template-based — no external API keys required).
const topic = 'fantasy tavern name';
const code = `// ${topic}
// Paste at https://perchance.org/minimal#edit
output
  The [adjective] [animal] Inn
  The [animal] and [object]^2
  [object] of the [adjective] [place]

adjective
  crooked^3
  rusty^2
  forgotten^2
  golden
  whispering

animal
  raven^3
  wolf^2
  boar
  fox^2
  stag

object
  tankard^2
  lantern^3
  shield
  banner^2
  cauldron

place
  [adjective] mountains
  shadow realm^2
  misty vale
`;

async function main() {
  console.log(`\n🎲 Agent task: build a generator for "${topic}"\n`);

  // 2) Always validate before showing code.
  const v = await validateTool.handler({ code });
  const vData = JSON.parse(v.content[0].text);
  console.log('✅ validate_syntax ->', vData.valid ? 'VALID' : 'INVALID',
    `(${vData.errorCount} errors, ${vData.warningCount} warnings)`);
  if (vData.errors?.length) console.log('   errors:', vData.errors);

  // 3) Preview sample rolls.
  const p = await previewTool.handler({ code, count: 6 });
  const pData = JSON.parse(p.content[0].text);
  console.log('\n🔮 preview_rolls:');
  pData.results.forEach((r: string, i: number) => console.log(`   ${i + 1}. ${r}`));

  console.log('\n📋 Final .perchance code:\n');
  console.log(code);
  console.log('Paste URL: https://perchance.org/minimal#edit');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
