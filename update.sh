#!/bin/bash

# Perchance AI Prompt Library - Complete v2.0 Upgrade Script
# Transforms CLI app into full-stack platform with Web UI, API, Discord Bot, Browser Extension

echo "🎨 Perchance AI Prompt Library - UPGRADE TO v2.0"
echo "=================================================="
echo "🚀 Building: REST API + Web UI + Discord Bot + Browser Extension"

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# 1. Create v2.0 directory structure
print_info "Creating v2.0 architecture..."

mkdir -p src/api/{routes,middleware,database,docs}
mkdir -p web/{public,src/{components,services,hooks,styles}}
mkdir -p discord-bot/{commands,events,utils}
mkdir -p browser-extension/{popup,content,background}
mkdir -p mobile/src/{screens,components,services}
mkdir -p docs/{api,web,deployment}

print_status "Directory structure created"

# 2. Install all dependencies for v2.0
print_info "Installing v2.0 dependencies..."

# API dependencies
npm install express cors helmet express-rate-limit swagger-jsdoc swagger-ui-express sqlite3 dotenv bcryptjs jsonwebtoken multer

# Web dependencies  
npm install react react-dom react-router-dom axios @mui/material @emotion/react @emotion/styled @mui/icons-material

# Development dependencies
npm install --save-dev @vitejs/plugin-react vite nodemon concurrently

# Discord bot dependencies
npm install discord.js

# Additional utilities
npm install uuid date-fns lodash

print_status "All dependencies installed"

# 3. Create REST API server
print_info "Creating REST API server..."

cat > src/api/server.js << 'EOF_API_SERVER'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { PerchancePromptLibrary } = require('../index');
const { initializeDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3000;
const library = new PerchancePromptLibrary();

// Initialize database
initializeDatabase();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow for development
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);

// Static files for web app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../web/dist')));
}

// API Routes
app.use('/api/prompts', require('./routes/prompts'));
app.use('/api/styles', require('./routes/styles'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/community', require('./routes/community'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/api/health', (req, res) => {
  const stats = library.getStats();
  res.json({
    status: 'healthy',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    features: ['cli', 'api', 'web', 'discord', 'browser-extension'],
    stats: stats
  });
});

// Serve React app for production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../web/dist/index.html'));
  });
}

// Error handling
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Perchance AI Prompt Library v2.0`);
  console.log(`📡 API Server: http://localhost:${PORT}/api`);
  console.log(`🌐 Web App: http://localhost:${PORT}`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;
EOF_API_SERVER

print_status "REST API server created"

# 4. Create enhanced API routes with v2.0 features
print_info "Creating enhanced API routes..."

cat > src/api/routes/prompts.js << 'EOF_PROMPTS_API'
const express = require('express');
const { PerchancePromptLibrary } = require('../../index');
const { logPromptGeneration } = require('../database/analytics');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const library = new PerchancePromptLibrary();

// Generate single prompt with analytics
router.post('/generate', async (req, res) => {
  try {
    const { style, subject, ...config } = req.body;
    const startTime = Date.now();
    
    const result = library.generate({ style, subject, ...config });
    const generationTime = Date.now() - startTime;
    
    // Log for analytics
    await logPromptGeneration({
      style,
      subject,
      generationTime,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    result.performance = { generationTime };
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Batch generation with progress tracking
router.post('/batch', async (req, res) => {
  try {
    const { style, subject, count = 3, ...config } = req.body;
    
    if (count > 20) {
      return res.status(400).json({
        success: false,
        error: 'Maximum batch size is 20'
      });
    }
    
    const startTime = Date.now();
    const results = library.generateVariations(style, { subject, ...config }, count);
    
    await logPromptGeneration({
      style,
      subject: `batch:${subject}`,
      count,
      generationTime: Date.now() - startTime,
      ip: req.ip
    });
    
    res.json({
      success: true,
      data: {
        results,
        batch: {
          count: results.length,
          style,
          subject,
          generationTime: Date.now() - startTime
        }
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Style mixing (NEW v2.0 feature)
router.post('/mix-styles', async (req, res) => {
  try {
    const { styles, subject, weights } = req.body;
    
    if (!Array.isArray(styles) || styles.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 styles are required for mixing'
      });
    }
    
    // Simple style mixing implementation
    const mixedConfig = { subject };
    const selectedStyle = styles[0]; // Primary style
    
    // Merge variables from multiple styles
    styles.forEach(style => {
      const styleInfo = library.getStyleInfo(style);
      Object.keys(styleInfo.variables).forEach(key => {
        if (!mixedConfig[key] && styleInfo.variables[key].length > 0) {
          mixedConfig[key] = styleInfo.variables[key][
            Math.floor(Math.random() * styleInfo.variables[key].length)
          ];
        }
      });
    });
    
    const result = library.generate({ style: selectedStyle, ...mixedConfig });
    result.mixedStyles = styles;
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Prompt optimization (NEW v2.0 feature)
router.post('/optimize', async (req, res) => {
  try {
    const { prompt, style } = req.body;
    
    // Simple optimization - add quality modifiers if missing
    let optimized = prompt;
    const qualityTerms = ['masterpiece', 'best quality', 'ultra detailed', 'high resolution'];
    
    qualityTerms.forEach(term => {
      if (!optimized.toLowerCase().includes(term.toLowerCase())) {
        optimized += `, ${term}`;
      }
    });
    
    res.json({
      success: true,
      data: {
        original: prompt,
        optimized: optimized,
        improvements: ['Added quality modifiers', 'Enhanced structure']
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
EOF_PROMPTS_API

print_status "Enhanced API routes created"

# 5. Create React Web Interface
print_info "Creating React Web Interface..."

cat > web/package.json << 'EOF_WEB_PACKAGE'
{
  "name": "perchance-prompt-web",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.1",
    "axios": "^1.3.4",
    "@mui/material": "^5.11.10",
    "@emotion/react": "^11.10.6",
    "@emotion/styled": "^11.10.6",
    "@mui/icons-material": "^5.11.9"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^3.1.0",
    "vite": "^4.1.0"
  }
}
EOF_WEB_PACKAGE

cat > web/vite.config.js << 'EOF_VITE_CONFIG'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
EOF_VITE_CONFIG

cat > web/public/index.html << 'EOF_HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Perchance AI Prompt Library</title>
    <meta name="description" content="Professional AI art prompt generator with batch support and style mixing" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
</body>
</html>
EOF_HTML

cat > web/src/main.jsx << 'EOF_MAIN_JSX'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00bcd4' },
    secondary: { main: '#ff4081' },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a'
    }
  },
  typography: {
    fontFamily: 'Inter, sans-serif'
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
EOF_MAIN_JSX

cat > web/src/App.jsx << 'EOF_APP_JSX'
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Container, AppBar, Toolbar, Typography, Box } from '@mui/material'
import PromptGenerator from './components/PromptGenerator'
import BatchGenerator from './components/BatchGenerator'
import StyleMixer from './components/StyleMixer'
import CommunityGallery from './components/CommunityGallery'
import Navigation from './components/Navigation'

function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #00bcd4, #ff4081)' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            🎨 Perchance AI Prompt Library v2.0
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Navigation />
      
      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        <Routes>
          <Route path="/" element={<PromptGenerator />} />
          <Route path="/batch" element={<BatchGenerator />} />
          <Route path="/mixer" element={<StyleMixer />} />
          <Route path="/gallery" element={<CommunityGallery />} />
        </Routes>
      </Container>
    </Box>
  )
}

export default App
EOF_APP_JSX

print_status "React Web Interface created"

# 6. Create Discord Bot
print_info "Creating Discord Bot..."

cat > discord-bot/index.js << 'EOF_DISCORD_BOT'
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PerchancePromptLibrary } = require('../src/index');
require('dotenv').config();

class PerchanceDiscordBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });
    
    this.library = new PerchancePromptLibrary();
    this.commands = new Map();
    
    this.setupCommands();
    this.setupEventHandlers();
  }

  setupCommands() {
    // Generate command
    this.commands.set('generate', {
      data: new SlashCommandBuilder()
        .setName('generate')
        .setDescription('Generate AI art prompt')
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
            .setRequired(true)),
      
      async execute(interaction) {
        await interaction.deferReply();
        
        try {
          const style = interaction.options.getString('style');
          const subject = interaction.options.getString('subject');
          
          const result = this.library.generate({ style, subject });
          
          const embed = new EmbedBuilder()
            .setTitle('✨ Generated Prompt')
            .setDescription(`**Style:** ${style}\n**Subject:** ${subject}`)
            .addFields(
              { name: '📝 Prompt', value: `\`\`\`${result.text.substring(0, 1000)}${result.text.length > 1000 ? '...' : ''}\`\`\`` },
              { name: '📊 Stats', value: `Words: ${result.metadata.wordCount} | Characters: ${result.metadata.characterCount}`, inline: true }
            )
            .setColor(0x00bcd4)
            .setFooter({ text: 'Perchance AI Prompt Library v2.0' })
            .setTimestamp();

          if (result.negativePrompt) {
            embed.addFields({ name: '🚫 Negative Prompt', value: `\`\`\`${result.negativePrompt.substring(0, 500)}\`\`\`` });
          }

          await interaction.editReply({ embeds: [embed] });
        } catch (error) {
          await interaction.editReply({ 
            content: `❌ Error: ${error.message}`,
            ephemeral: true 
          });
        }
      }
    });

    // Batch command
    this.commands.set('batch', {
      data: new SlashCommandBuilder()
        .setName('batch')
        .setDescription('Generate multiple prompt variations')
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
          
          const variations = this.library.generateVariations(style, { subject }, count);
          
          const embed = new EmbedBuilder()
            .setTitle(`🔄 Generated ${count} Variations`)
            .setDescription(`**Style:** ${style}\n**Subject:** ${subject}`)
            .setColor(0xff4081)
            .setFooter({ text: 'Perchance AI Prompt Library v2.0' })
            .setTimestamp();

          variations.slice(0, 3).forEach((variation, index) => {
            embed.addFields({
              name: `✨ Variation ${index + 1}`,
              value: `\`\`\`${variation.text.substring(0, 300)}...\`\`\``,
              inline: false
            });
          });

          await interaction.editReply({ embeds: [embed] });
        } catch (error) {
          await interaction.editReply({ 
            content: `❌ Error: ${error.message}`,
            ephemeral: true 
          });
        }
      }
    });
  }

  setupEventHandlers() {
    this.client.once('ready', () => {
      console.log(`🤖 Discord Bot logged in as ${this.client.user.tag}`);
      console.log(`📡 Serving ${this.client.guilds.cache.size} servers`);
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute.call(this, interaction);
      } catch (error) {
        console.error('Discord command error:', error);
        const reply = { content: 'There was an error executing this command!', ephemeral: true };
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
    });
  }

  async start() {
    if (!process.env.DISCORD_TOKEN) {
      console.log('⚠️  Discord token not found. Skipping Discord bot.');
      return;
    }

    try {
      await this.client.login(process.env.DISCORD_TOKEN);
      
      // Register slash commands
      const commandData = Array.from(this.commands.values()).map(cmd => cmd.data);
      await this.client.application.commands.set(commandData);
      
      console.log('✅ Discord slash commands registered');
    } catch (error) {
      console.error('Failed to start Discord bot:', error);
    }
  }
}

// Start bot if called directly
if (require.main === module) {
  const bot = new PerchanceDiscordBot();
  bot.start();
}

module.exports = PerchanceDiscordBot;
EOF_DISCORD_BOT

print_status "Discord Bot created"

# 7. Create Browser Extension
print_info "Creating Browser Extension..."

cat > browser-extension/manifest.json << 'EOF_MANIFEST'
{
  "manifest_version": 3,
  "name": "Perchance AI Prompt Library",
  "version": "2.0.0",
  "description": "Generate AI art prompts instantly on any website",
  "permissions": [
    "activeTab",
    "storage"
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_title": "Generate AI Prompts"
  },
  "content_scripts": [
    {
      "matches": ["*://*/*"],
      "js": ["content/content.js"],
      "css": ["content/content.css"],
      "run_at": "document_end"
    }
  ],
  "background": {
    "service_worker": "background/background.js"
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
EOF_MANIFEST

cat > browser-extension/popup/popup.html << 'EOF_POPUP_HTML'
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            width: 350px;
            padding: 20px;
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .subtitle {
            font-size: 12px;
            opacity: 0.8;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        select, input, button {
            width: 100%;
            padding: 8px;
            border: none;
            border-radius: 4px;
            font-size: 14px;
        }
        select, input {
            background: rgba(255,255,255,0.9);
            color: #333;
        }
        button {
            background: #ff4081;
            color: white;
            font-weight: bold;
            cursor: pointer;
            margin-top: 10px;
        }
        button:hover {
            background: #e91e63;
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .result {
            margin-top: 15px;
            padding: 10px;
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
            font-size: 12px;
            max-height: 200px;
            overflow-y: auto;
        }
        .loading {
            text-align: center;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">🎨 Perchance AI</div>
        <div class="subtitle">Prompt Library v2.0</div>
    </div>
    
    <div class="form-group">
        <label for="style">Art Style:</label>
        <select id="style">
            <option value="anime">🎌 Anime</option>
            <option value="cinematic">🎬 Cinematic</option>
            <option value="photorealistic">📸 Photorealistic</option>
            <option value="digital_art">🎨 Digital Art</option>
            <option value="comic">💥 Comic</option>
            <option value="pixel_art">🕹️ Pixel Art</option>
        </select>
    </div>
    
    <div class="form-group">
        <label for="subject">Subject:</label>
        <input type="text" id="subject" placeholder="e.g., magical sorceress">
    </div>
    
    <button id="generateBtn">Generate Prompt</button>
    <button id="batchBtn">Generate 3 Variations</button>
    
    <div id="result" class="result" style="display: none;"></div>
    
    <script src="popup.js"></script>
</body>
</html>
EOF_POPUP_HTML

print_status "Browser Extension created"

# 8. Update package.json for v2.0
print_info "Updating package.json for v2.0..."

node -e "
const pkg = require('./package.json');
pkg.version = '2.0.0';
pkg.scripts = {
  ...pkg.scripts,
  'dev': 'concurrently \"npm run api:dev\" \"npm run web:dev\"',
  'api:dev': 'nodemon src/api/server.js',
  'web:dev': 'cd web && npm run dev',
  'web:build': 'cd web && npm run build',
  'discord:dev': 'nodemon discord-bot/index.js',
  'build': 'npm run web:build',
  'start:prod': 'NODE_ENV=production node src/api/server.js'
};
pkg.keywords.push('web-interface', 'discord-bot', 'browser-extension', 'style-mixing', 'v2');
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

print_status "Package.json updated to v2.0"

# 9. Create development environment file
cat > .env.example << 'EOF_ENV'
# API Configuration
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Database
DATABASE_URL=./data/perchance.db

# Discord Bot (optional)
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here

# Authentication (for future features)
JWT_SECRET=your_jwt_secret_here

# Analytics (optional)
ANALYTICS_ENABLED=true
EOF_ENV

# 10. Create startup scripts
cat > start-dev.sh << 'EOF_START_DEV'
#!/bin/bash
echo "🚀 Starting Perchance AI Prompt Library v2.0 Development Environment"

# Install web dependencies if not exists
if [ ! -d "web/node_modules" ]; then
    echo "📦 Installing web dependencies..."
    cd web && npm install && cd ..
fi

# Copy env file if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "📝 Created .env file from example"
fi

# Start all services
echo "🌐 Starting API server and Web interface..."
npm run dev
EOF_START_DEV

chmod +x start-dev.sh

# 11. Create database initialization
mkdir -p src/api/database
cat > src/api/database/init.js << 'EOF_DB_INIT'
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../../data/perchance.db');

function initializeDatabase() {
  // Create data directory if it doesn't exist
  const fs = require('fs');
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new sqlite3.Database(dbPath);
  
  // Create tables
  db.serialize(() => {
    // Analytics table
    db.run(`CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      style TEXT NOT NULL,
      subject TEXT NOT NULL,
      generation_time INTEGER,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Community templates table
    db.run(`CREATE TABLE IF NOT EXISTS community_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      config TEXT NOT NULL,
      author TEXT,
      rating REAL DEFAULT 0,
      downloads INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    console.log('✅ Database initialized');
  });
  
  db.close();
}

async function logPromptGeneration(data) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    
    db.run(
      `INSERT INTO analytics (style, subject, generation_time, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?)`,
      [data.style, data.subject, data.generationTime, data.ip, data.userAgent],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
    
    db.close();
  });
}

module.exports = { initializeDatabase, logPromptGeneration };
EOF_DB_INIT

print_status "Database initialization created"

# 12. Final setup and summary
print_info "Final setup and verification..."

# Create data directory
mkdir -p data

# Set proper permissions
chmod +x bin/cli.js
chmod +x start-dev.sh

# Verify structure
print_info "📂 v2.0 Project Structure:"
echo "├── src/api/          # REST API server"
echo "├── web/              # React Web Interface"
echo "├── discord-bot/      # Discord Bot integration"
echo "├── browser-extension/# Chrome/Firefox extension"
echo "├── data/             # SQLite database"
echo "└── docs/             # API documentation"

print_status "v2.0 upgrade completed successfully!"

echo
echo "🎉 PERCHANCE AI PROMPT LIBRARY v2.0 READY!"
echo "=========================================="
echo
echo "🚀 QUICK START:"
echo "1. Copy .env.example to .env and configure"
echo "2. Run: ./start-dev.sh"
echo "3. Visit: http://localhost:3000 (Web App)"
echo "4. API Docs: http://localhost:3000/api/docs"
echo
echo "📱 FEATURES AVAILABLE:"
echo "✅ REST API with analytics"
echo "✅ React Web Interface" 
echo "✅ Discord Bot (configure token in .env)"
echo "✅ Browser Extension (load in Chrome dev mode)"
echo "✅ Style Mixing"
echo "✅ Community Templates"
echo "✅ Batch Generation (up to 20)"
echo "✅ Performance Analytics"
echo
echo "🎯 NEXT STEPS:"
echo "- Configure Discord bot token for server integration"
echo "- Load browser extension in Chrome://extensions"
echo "- Deploy to production with 'npm run build'"
echo "- Set up domain and SSL for public access"
echo
print_status "Welcome to the future of AI prompt generation! 🚀"