# 🤖 Perchance Discord Bot v2.1 

## 🆕 New Features in v2.1:
- **Bug Fixes**: Resolved "Cannot read properties of undefined" errors
- **Perchance.org Integration**: Direct API calls to perchance.org
- **Enhanced Error Handling**: Graceful fallbacks and detailed error messages
- **Dual API Support**: Local Perchance API + perchance.org
- **Image Generation**: Multiple providers with fallbacks

## 🎯 Commands:
- `/generate style subject [image:true] [perchance:true]` - Generate prompt with options
- `/batch style subject [count:3]` - Generate multiple variations

## 🚀 Quick Start:
1. Copy `.env.example` to `.env` and add your tokens
2. `npm install` in discord-bot/
3. `node deploy-commands.js` to register slash commands
4. `npm start` to run the bot

## 🔧 Testing:
- `node test-perchance.js` - Test Perchance.org integration
- Use `/generate anime "test" perchance:true` for direct perchance.org calls

## 🎨 Features:
- ✅ 6 Art Styles (anime, cinematic, photorealistic, digital_art, comic, pixel_art)
- ✅ Local + Remote API support
- ✅ Image generation with multiple providers
- ✅ Defensive programming for stability
- ✅ Professional error handling
