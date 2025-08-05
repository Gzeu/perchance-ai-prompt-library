// Creează fișierul E:\per\discord-bot\deploy-commands.js

const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

// Load all commands
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('⏳ Starting to register slash commands...');
    console.log(`📝 Found ${commands.length} commands to register`);
    
    // Register commands globally (takes 1-60 minutes to propagate)
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands },
    );
    
    console.log('✅ Commands registered globally!');
    console.log('⏰ Commands may take 1-60 minutes to appear in all servers');
    console.log('🔄 Restart Discord app and try typing "/" in your server');
    
  } catch (error) {
    console.error('❌ Registration error:', error);
  }
})();
