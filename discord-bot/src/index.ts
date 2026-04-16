// discord-bot/src/index.ts — v4.0.0
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { config } from 'dotenv';

config();

// ─── Tipuri ──────────────────────────────────────────────────
interface PromptResult {
  prompt: string;
  category: string;
  style: string;
  tags: string[];
  quality: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// ─── Rate Limiter ────────────────────────────────────────────
class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 10, windowMs = 60_000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const entry = this.limits.get(userId);

    if (!entry || now > entry.resetAt) {
      this.limits.set(userId, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.maxRequests - 1, resetIn: this.windowMs };
    }

    if (entry.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
    }

    entry.count++;
    return { allowed: true, remaining: this.maxRequests - entry.count, resetIn: entry.resetAt - now };
  }
}

// ─── Generare Prompt ─────────────────────────────────────────
async function generatePrompt(category: string, keywords: string, style: string): Promise<PromptResult> {
  const basePrompts: Record<string, string[]> = {
    anime: ['cinematic anime portrait', 'dynamic manga panel', 'vibrant cel-shaded illustration'],
    realistic: ['photorealistic 8K render', 'hyperdetailed portrait', 'cinematic lighting shot'],
    fantasy: ['epic fantasy landscape', 'magical ethereal scene', 'dramatic concept art'],
    scifi: ['futuristic cyberpunk city', 'sci-fi spaceship interior', 'neon-lit dystopia'],
  };

  const base = basePrompts[category]?.[Math.floor(Math.random() * 3)] ?? 'digital artwork';
  const prompt = `${base}, ${keywords}, ${style} style, masterpiece, best quality, highly detailed`;

  return {
    prompt,
    category,
    style,
    tags: keywords.split(',').map((k) => k.trim()),
    quality: Math.round(85 + Math.random() * 15),
  };
}

// ─── Comenzi Slash ───────────────────────────────────────────
const commands = [
  new SlashCommandBuilder()
    .setName('generate')
    .setDescription('Generează un prompt AI optimizat')
    .addStringOption((opt) =>
      opt
        .setName('category')
        .setDescription('Categoria promptului')
        .setRequired(true)
        .addChoices(
          { name: 'Anime', value: 'anime' },
          { name: 'Realistic', value: 'realistic' },
          { name: 'Fantasy', value: 'fantasy' },
          { name: 'Sci-Fi', value: 'scifi' }
        )
    )
    .addStringOption((opt) =>
      opt.setName('keywords').setDescription('Cuvinte cheie (ex: sunset, warrior, glowing)').setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName('style')
        .setDescription('Stilul artistic')
        .setRequired(false)
        .addChoices(
          { name: 'Cinematic', value: 'cinematic' },
          { name: 'Painterly', value: 'painterly' },
          { name: 'Minimalist', value: 'minimalist' },
          { name: 'Cyberpunk', value: 'cyberpunk' }
        )
    ),

  new SlashCommandBuilder()
    .setName('batch')
    .setDescription('Generează mai multe prompturi simultan')
    .addStringOption((opt) =>
      opt.setName('category').setDescription('Categoria').setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt.setName('count').setDescription('Număr prompturi (1-10)').setRequired(true).setMinValue(1).setMaxValue(10)
    ),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Afișează comenzile disponibile'),
];

// ─── Client Setup ─────────────────────────────────────────────
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rateLimiter = new RateLimiter(10, 60_000);

// ─── Handlers ────────────────────────────────────────────────
async function handleGenerate(interaction: ChatInputCommandInteraction): Promise<void> {
  const { allowed, remaining, resetIn } = rateLimiter.check(interaction.user.id);
  if (!allowed) {
    await interaction.reply({ content: `⏳ Rate limit atins! Încearcă din nou în **${Math.ceil(resetIn / 1000)}s**.`, ephemeral: true });
    return;
  }
  await interaction.deferReply();
  const category = interaction.options.getString('category', true);
  const keywords = interaction.options.getString('keywords', true);
  const style = interaction.options.getString('style') ?? 'cinematic';
  const result = await generatePrompt(category, keywords, style);
  const embed = new EmbedBuilder()
    .setColor(0x7c3aed)
    .setTitle('✨ Prompt Generat — v4.0.0')
    .setDescription(`\`\`\`\n${result.prompt}\n\`\`\``)
    .addFields(
      { name: '🏷️ Categorie', value: result.category, inline: true },
      { name: '🎨 Stil', value: result.style, inline: true },
      { name: '⭐ Scor calitate', value: `${result.quality}/100`, inline: true },
      { name: '🔖 Tags', value: result.tags.join(', ') || 'N/A', inline: false }
    )
    .setFooter({ text: `Requests rămase: ${remaining}/10 • Perchance AI v4.0.0` })
    .setTimestamp();
  await interaction.editReply({ embeds: [embed] });
}

async function handleBatch(interaction: ChatInputCommandInteraction): Promise<void> {
  const { allowed } = rateLimiter.check(interaction.user.id);
  if (!allowed) { await interaction.reply({ content: '⏳ Rate limit atins!', ephemeral: true }); return; }
  await interaction.deferReply();
  const category = interaction.options.getString('category', true);
  const count = interaction.options.getInteger('count', true);
  const results: PromptResult[] = [];
  for (let i = 0; i < count; i++) results.push(await generatePrompt(category, 'generated', 'cinematic'));
  const embed = new EmbedBuilder()
    .setColor(0x059669)
    .setTitle(`📦 Batch — ${count} prompturi generate`)
    .setDescription(results.map((r, i) => `**${i + 1}.** \`${r.prompt.slice(0, 80)}...\` ⭐${r.quality}`).join('\n'))
    .setFooter({ text: 'Perchance AI Prompt Library v4.0.0' })
    .setTimestamp();
  await interaction.editReply({ embeds: [embed] });
}

async function handleHelp(interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(0x2563eb)
    .setTitle('📖 Perchance AI Bot — Comenzi')
    .addFields(
      { name: '/generate', value: 'Generează un prompt optimizat cu categorie + keywords', inline: false },
      { name: '/batch', value: 'Generează până la 10 prompturi simultan', inline: false },
      { name: '/help', value: 'Afișează acest meniu', inline: false }
    )
    .setFooter({ text: 'v4.0.0 • Rate limit: 10 req/min per user' });
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// ─── Events ───────────────────────────────────────────────────
client.once('ready', (c) => console.log(`✅ Bot online: ${c.user.tag}`));

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  try {
    switch (interaction.commandName) {
      case 'generate': await handleGenerate(interaction); break;
      case 'batch':    await handleBatch(interaction);    break;
      case 'help':     await handleHelp(interaction);     break;
    }
  } catch (err) {
    console.error('Bot error:', err);
    const msg = { content: '❌ Eroare internă. Încearcă din nou.', ephemeral: true };
    if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
    else await interaction.reply(msg);
  }
});

// ─── Bootstrap ───────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!token || !clientId) throw new Error('DISCORD_BOT_TOKEN și DISCORD_CLIENT_ID sunt necesare în .env');
  const rest = new REST({ version: '10' }).setToken(token);
  console.log('🔄 Înregistrare slash commands...');
  const route = guildId ? Routes.applicationGuildCommands(clientId, guildId) : Routes.applicationCommands(clientId);
  await rest.put(route, { body: commands.map((c) => c.toJSON()) });
  console.log('✅ Comenzi înregistrate!');
  await client.login(token);
}

bootstrap().catch(console.error);
