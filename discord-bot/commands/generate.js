const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { generateImage } = require('../services/imageGenerator');
const { EnhancedPromptGenerator } = require('../../src/generators/EnhancedPromptGenerator');

const promptGenerator = new EnhancedPromptGenerator();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('generate')
    .setDescription('Generate AI art prompt using enhanced templates')
    .addStringOption(option =>
      option.setName('style')
        .setDescription('Art style')
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
        .setDescription('Main subject')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('image')
        .setDescription('Generate image from prompt?')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('mood')
        .setDescription('Mood for the prompt')
        .setRequired(false)
        .addChoices(
          { name: '🔥 Dramatic', value: 'dramatic' },
          { name: '⭐ Epic', value: 'epic' },
          { name: '🌸 Peaceful', value: 'peaceful' },
          { name: '🌈 Vibrant', value: 'vibrant' },
          { name: '🌙 Mysterious', value: 'mysterious' }
        )),

  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      const style = interaction.options.getString('style');
      const subject = interaction.options.getString('subject');
      const generateImg = interaction.options.getBoolean('image') ?? false;
      const mood = interaction.options.getString('mood') || 'dramatic';

      console.log(`🎯 Generating enhanced prompt: ${style} style, subject: "${subject}", mood: ${mood}, image: ${generateImg}`);

      // Generate enhanced prompt using the new system
      const enhancedResult = promptGenerator.generateEnhanced(style, subject, { mood });
      
      const promptData = {
        text: enhancedResult.text,
        style: enhancedResult.style,
        metadata: enhancedResult.metadata,
        negatives: enhancedResult.negatives,
        source: 'enhanced-local',
        originalSubject: subject,
        expandedSubject: enhancedResult.metadata.originalSubject || subject
      };

      // Create professional embed
      const embed = new EmbedBuilder()
        .setTitle('✨ Enhanced Prompt Generated')
        .setColor(0x00bcd4)
        .addFields(
          { name: '🎨 Style', value: style.replace('_', ' '), inline: true },
          { name: '🎯 Subject', value: subject, inline: true },
          { name: '🎭 Mood', value: mood, inline: true },
          { name: '📊 Stats', value: `${promptData.metadata.wordCount} words • ${promptData.metadata.characterCount} chars`, inline: true },
          { name: '🧠 Quality', value: promptData.metadata.enhanced ? '✅ Enhanced' : 'Basic', inline: true },
          { name: '🔗 Source', value: promptData.source, inline: true },
          { name: '📝 Enhanced Prompt', value: '``````' }
        )
        .setFooter({ text: 'Perchance AI Discord Bot v2.1 • Enhanced Prompts' })
        .setTimestamp();

      // Add negative prompts info
      if (promptData.negatives) {
        embed.addFields({
          name: '🚫 Negative Prompts',
          value: '``````',
          inline: false
        });
      }

      // Generate image if requested
      if (generateImg) {
        embed.setDescription('🎨 Generating high-quality image with enhanced prompt...');
        await interaction.editReply({ embeds: [embed] });

        try {
          console.log('🖼️ Starting image generation with enhanced prompt...');
          const imageBuffer = await generateImage(promptData.text);
          const attachment = new AttachmentBuilder(imageBuffer, { name: 'perchance-enhanced.png' });
          
          embed.setDescription('🖼️ High-quality image generated successfully!')
            .setImage('attachment://perchance-enhanced.png');
          
          await interaction.editReply({ 
            embeds: [embed],
            files: [attachment]
          });
          
          console.log('✅ Enhanced image generation completed successfully');
          
        } catch (imageError) {
          console.error('❌ Image generation failed:', imageError.message);
          embed.setDescription('✅ Enhanced prompt generated! ❌ Image generation temporarily unavailable.')
            .setColor(0xff9800);
          await interaction.editReply({ embeds: [embed] });
        }
      } else {
        await interaction.editReply({ embeds: [embed] });
      }

      console.log('✅ Enhanced generate command completed successfully');

    } catch (error) {
      console.error('❌ Enhanced generate command error:', error);
      const errorMessage = error.message || 'Enhanced command execution failed';
      
      await interaction.editReply({
        content: `❌ **Error**: ${errorMessage}\n\nPlease try again or contact support if the problem persists.`,
        ephemeral: true
      });
    }
  },
};
