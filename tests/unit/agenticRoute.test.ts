jest.mock('../../src/agents/agenticRunner', () => ({
  getAgenticStatus: jest.fn(() => ({
    totalAgents: 7,
    agents: [{ id: 'syntax-master', name: 'SyntaxMaster', skills: [], expertise: [] }],
    memoryEntries: 0,
    groqConfigured: false
  })),
  runAgenticBrainstorm: jest.fn()
}));

import express from 'express';
import request from 'supertest';

const perchanceRoutes = require('../../src/api/routes/perchance');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/perchance', perchanceRoutes);
  return app;
}

describe('POST /api/perchance/agentic', () => {
  const prevKey = process.env.GROQ_API_KEY;

  beforeEach(() => {
    delete process.env.GROQ_API_KEY;
    jest.clearAllMocks();
  });

  afterAll(() => {
    if (prevKey) process.env.GROQ_API_KEY = prevKey;
  });

  it('returns 503 when GROQ_API_KEY is missing', async () => {
    const res = await request(createApp())
      .post('/api/perchance/agentic')
      .send({ description: 'test generator' });

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('GROQ_API_KEY');
  });

  it('returns 400 when description is missing', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const res = await request(createApp()).post('/api/perchance/agentic').send({});
    expect(res.status).toBe(400);
    delete process.env.GROQ_API_KEY;
  });
});

describe('GET /api/perchance/agentic/status', () => {
  it('returns agent list', async () => {
    const res = await request(createApp()).get('/api/perchance/agentic/status');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAgents).toBe(7);
  });
});
