const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Load local data files
const loadData = (filename) => {
  try {
    const dataPath = path.join(__dirname, '../data', filename);
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
};

// Available moods with their modifiers
const MOODS = {
  peaceful: { modifier: 0.8, description: 'Calm and serene atmosphere' },
  dramatic: { modifier: 1.2, description: 'High contrast and intense lighting' },
  epic: { modifier: 1.3, description: 'Grandiose and awe-inspiring' },
  mysterious: { modifier: 1.1, description: 'Mysterious and intriguing' },
  vibrant: { modifier: 1.15, description: 'Colorful and energetic' },
  dark: { modifier: 0.9, description: 'Dark and moody atmosphere' },
  dreamy: { modifier: 1.1, description: 'Soft and ethereal' },
  cyberpunk: { modifier: 1.25, description: 'Neon-lit futuristic' },
  retro: { modifier: 1.0, description: 'Vintage and nostalgic' },
  fantasy: { modifier: 1.2, description: 'Magical and otherworldly' }
};

// Generate variations based on local data with mood modifiers
const generateBatchVariations = (style, subject, count, mood = 'peaceful') => {
  const styles = loadData('styles.json');
  const artists = loadData('artists.json');
  const themes = loadData('themes.json');
  const recipes = loadData('recipes.json');
  const selectedStyle = styles.find(s => s.id === style) || {};
  const selectedMood = MOODS[mood] || MOODS.peaceful;
  
  // Get random artist and theme for variation
  const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
  
  // Generate variations
  const variations = [];
  for (let i = 0; i < count; i++) {
    const randomArtist = getRandomItem(artists);
    const randomTheme = getRandomItem(themes);
    const randomRecipe = getRandomItem(recipes);
    
    // Apply mood modifier to quality
    const baseQuality = Math.floor(Math.random() * 5) + 6; // 6-10
    const quality = Math.min(10, Math.max(1, Math.round(baseQuality * selectedMood.modifier)));
    
    // Build the prompt with more variety
    const promptParts = [
      selectedStyle.prefix || '',
      subject,
      selectedStyle.suffix || '',
      randomArtist ? `in the style of ${randomArtist.name}` : '',
      randomTheme ? `with ${randomTheme.name} theme` : '',
      randomRecipe ? `using ${randomRecipe.name} technique` : '',
      `(${selectedMood.description})`
    ].filter(Boolean);
    
    const variation = {
      prompt: promptParts.join(', ').replace(/\s+/g, ' ').trim(),
      style: selectedStyle.name || style,
      mood: mood,
      quality: quality,
      artist: randomArtist?.name,
      theme: randomTheme?.name
    };
    
    variations.push(variation);
  }
  
  return variations;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('batch')
    .setDescription('Generate multiple prompt variations')
    .addStringOption(option =>
      option.setName('style')
        .setDescription('Art style for the prompts')
        .setRequired(true)
        .addChoices(
          { name: '🎌 Anime', value: 'anime' },
          { name: '🎬 Cinematic', value: 'cinematic' },
          { name: '📸 Photorealistic', value: 'photorealistic' },
          { name: '🎨 Digital Art', value: 'digital_art' },
          { name: '💥 Comic', value: 'comic' },
          { name: '🕹️ Pixel Art', value: 'pixel_art' }
        ))
    .addStringOption(option =>
      option.setName('subject')
        .setDescription('Main subject for variations')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('count')
        .setDescription('Number of variations (1-5)')
        .setMinValue(1)
        .setMaxValue(5))
    .addStringOption(option =>
      option.setName('mood')
        .setDescription('Mood/atmosphere of the generated prompts')
        .addChoices(
          { name: '😌 Peaceful', value: 'peaceful' },
          { name: '🎭 Dramatic', value: 'dramatic' },
          { name: '✨ Epic', value: 'epic' },
          { name: '🔮 Mysterious', value: 'mysterious' },
          { name: '🌈 Vibrant', value: 'vibrant' },
          { name: '🌙 Dark', value: 'dark' },
          { name: '💭 Dreamy', value: 'dreamy' },
          { name: '🤖 Cyberpunk', value: 'cyberpunk' },
          { name: '📻 Retro', value: 'retro' },
          { name: '🧚 Fantasy', value: 'fantasy' }
        )),

  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      const style = interaction.options.getString('style');
      const subject = interaction.options.getString('subject');
      const count = interaction.options.getInteger('count') || 3;
      const mood = interaction.options.getString('mood') || 'peaceful';

      console.log(`🔄 Generating ${count} batch variations: ${style} style, subject: ${subject}`);

      // Generate variations locally with mood
      const variations = generateBatchVariations(style, subject, count, mood);
      
      if (!variations || variations.length === 0) {
        throw new Error('Failed to generate variations. Please try again.');
      }
      const results = variations;

      if (results.length === 0) {
        await interaction.editReply({
          content: '❌ No variations were generated. Please try again.',
          ephemeral: true
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`🔄 Generated ${results.length} Variations`)
        .setDescription(
          `**Style:** ${style}\n` +
          `**Subject:** ${subject}\n` +
          `**Mood:** ${mood.charAt(0).toUpperCase() + mood.slice(1)} (${MOODS[mood]?.description || 'Neutral'})`
        )
        .setColor(0xff4081)
        .setFooter({ text: 'Perchance AI Discord Bot v2.0' })
        .setTimestamp();

      // Add variations with defensive checks
      results.slice(0, 3).forEach((variation, index) => {
        const text = variation.text || `Variation ${index + 1} text unavailable`;
        const varNumber = variation.variationNumber || index + 1;
        const wordCount = variation.metadata?.wordCount ?? Math.max(1, text.split(' ').length);
        
        const variationDetails = [
          `**Prompt:** ${variation.prompt}`,
          `**Quality:** ${'⭐'.repeat(variation.quality)}`,
          variation.artist ? `**Artist:** ${variation.artist}` : '',
          variation.theme ? `**Theme:** ${variation.theme}` : ''
        ].filter(Boolean).join('\n');

        embed.addFields({
          name: `✨ Variation ${varNumber} (${wordCount} words)`,
          value: variationDetails,
          inline: false
        });
      });

      if (results.length > 3) {
        embed.addFields({
          name: '📋 Additional Variations',
          value: `${results.length - 3} more variations generated. Use individual /generate for full text.`,
          inline: false
        });
      }

      await interaction.editReply({ embeds: [embed] });
      console.log(`✅ Batch generation completed: ${results.length} variations`);

    } catch (error) {
      console.error('❌ Batch command error:', error);
      const errorMessage = error.message || 'Batch generation failed';

      await interaction.editReply({
        content: `❌ **Error**: ${errorMessage}`,
        ephemeral: true
      });
    }
  },
};
