const {
  cleanCode,
  mapGroqError,
  isGroqConfigured,
  getErrorStatus
} = require('../../src/services/groqService');

describe('groqService', () => {
  describe('cleanCode', () => {
    it('strips markdown fences', () => {
      const raw = '```perchance\noutput\n  hello\n```';
      expect(cleanCode(raw)).toBe('output\n  hello');
    });
  });

  describe('mapGroqError', () => {
    it('maps 429 to rate limit message', () => {
      const mapped = mapGroqError({ status: 429 });
      expect(mapped.status).toBe(429);
      expect(mapped.message).toContain('Rate limit');
    });

    it('maps 401 to 503 with key hint', () => {
      const mapped = mapGroqError({ status: 401 });
      expect(mapped.status).toBe(503);
      expect(mapped.message).toContain('GROQ_API_KEY');
    });
  });

  describe('isGroqConfigured', () => {
    it('returns false when GROQ_API_KEY is unset', () => {
      const prev = process.env.GROQ_API_KEY;
      delete process.env.GROQ_API_KEY;
      expect(isGroqConfigured()).toBe(false);
      if (prev) process.env.GROQ_API_KEY = prev;
    });
  });

  describe('getErrorStatus', () => {
    it('reads nested error status', () => {
      expect(getErrorStatus({ error: { status: 503 } })).toBe(503);
    });
  });
});
