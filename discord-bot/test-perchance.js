const { PerchanceIntegration } = require('./services/perchance-integration');

async function testPerchanceIntegration() {
  console.log('🧪 Testing Perchance.org Integration...');
  
  // Test connection
  const connection = await PerchanceIntegration.testConnection();
  console.log('Connection test:', connection);
  
  // Test prompt generation
  const promptResult = await PerchanceIntegration.generatePrompt('anime', 'space warrior');
  console.log('Prompt generation test:', promptResult);
  
  // Test image generation
  const imageResult = await PerchanceIntegration.generateImage('anime space warrior');
  console.log('Image generation test:', imageResult);
  
  console.log('✅ Integration tests completed');
}

testPerchanceIntegration().catch(console.error);
