const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

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
        .setMaxValue(5)),

  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      const style = interaction.options.getString('style');
      const subject = interaction.options.getString('subject');
      const count = interaction.options.getInteger('count') || 3;

      console.log(`🔄 Generating ${count} batch variations: ${style} style, subject: ${subject}`);

      // Call batch API with error handling
      const batchResponse = await axios.post('http://localhost:3000/api/prompts/batch', {
        style: style,
        subject: subject,
        count: count
      }, {
        timeout: 20000,
        headers: { 'Content-Type': 'application/json' }
      });

      // Defensive data processing
      const responseData = batchResponse.data?.data || {};
      const results = responseData.results || [];
      
      if (results.length === 0) {
        await interaction.editReply({
          content: '❌ No variations were generated. Please try again.',
          ephemeral: true
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`🔄 Generated ${results.length} Variations`)
        .setDescription(`**Style:** ${style}\n**Subject:** ${subject}`)
        .setColor(0xff4081)
        .setFooter({ text: 'Perchance AI Discord Bot v2.0' })
        .setTimestamp();

      // Add variations with defensive checks
      results.slice(0, 3).forEach((variation, index) => {
        const text = variation.text || `Variation ${index + 1} text unavailable`;
        const varNumber = variation.variationNumber || index + 1;
        const wordCount = variation.metadata?.wordCount ?? Math.max(1, text.split(' ').length);
        
        embed.addFields({
          name: `✨ Variation ${varNumber} (${wordCount} words)`,
          value: '``````',
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
      const errorMessage = error.code === 'ECONNREFUSED' 
        ? 'Cannot connect to Perchance API. Make sure the server is running on localhost:3000'
        : error.response?.data?.error || error.message || 'Batch generation failed';

      await interaction.editReply({
        content: `❌ **Error**: ${errorMessage}`,
        ephemeral: true
      });
    }
  },
};
