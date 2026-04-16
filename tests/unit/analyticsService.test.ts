// tests/unit/analyticsService.test.ts — v5.0.0
import { AnalyticsService } from '../../src/services/analyticsService';
import { generatePrompt } from '../../src/generators/promptGenerator';

describe('AnalyticsService', () => {
  let svc: AnalyticsService;

  beforeEach(() => { svc = new AnalyticsService(); });

  describe('record()', () => {
    it('increments count', () => {
      svc.record(generatePrompt('anime', 'cinematic', []));
      expect(svc.count).toBe(1);
    });

    it('tracks multiple records', () => {
      for (let i = 0; i < 5; i++) {
        svc.record(generatePrompt('realistic', 'painterly', []));
      }
      expect(svc.count).toBe(5);
    });
  });

  describe('recordBatch()', () => {
    it('records all prompts in batch', () => {
      const batch = [
        generatePrompt('anime', 'cinematic', []),
        generatePrompt('fantasy', 'watercolor', []),
        generatePrompt('scifi', 'cyberpunk', []),
      ];
      svc.recordBatch(batch);
      expect(svc.count).toBe(3);
    });
  });

  describe('getStats()', () => {
    it('returns zero stats on empty service', () => {
      const stats = svc.getStats();
      expect(stats.totalGenerated).toBe(0);
      expect(stats.averageQuality).toBe(0);
      expect(stats.topTags).toHaveLength(0);
      expect(stats.dailyActivity).toHaveLength(0);
    });

    it('counts categories correctly', () => {
      svc.record(generatePrompt('anime', 'cinematic', []));
      svc.record(generatePrompt('anime', 'cinematic', []));
      svc.record(generatePrompt('fantasy', 'watercolor', []));
      const stats = svc.getStats();
      expect(stats.categoryCounts['anime']).toBe(2);
      expect(stats.categoryCounts['fantasy']).toBe(1);
    });

    it('computes averageQuality > 0 when prompts exist', () => {
      svc.recordBatch([
        generatePrompt('anime', 'cinematic', [], 'high'),
        generatePrompt('realistic', 'painterly', [], 'ultra'),
      ]);
      expect(svc.getStats().averageQuality).toBeGreaterThan(0);
    });

    it('returns top tags sorted by count', () => {
      svc.record(generatePrompt('anime', 'cinematic', ['dragon', 'fire']));
      svc.record(generatePrompt('anime', 'cinematic', ['dragon', 'water']));
      svc.record(generatePrompt('anime', 'cinematic', ['sakura']));
      const stats = svc.getStats();
      expect(stats.topTags[0].tag).toBe('dragon');
      expect(stats.topTags[0].count).toBe(2);
    });
  });

  describe('clear()', () => {
    it('resets count to 0', () => {
      svc.record(generatePrompt('anime', 'cinematic', []));
      svc.clear();
      expect(svc.count).toBe(0);
      expect(svc.getStats().totalGenerated).toBe(0);
    });
  });
});
