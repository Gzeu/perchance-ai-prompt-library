import { Logger, LogLevel, createLogger } from './logger.js';

describe('Logger', () => {
  let logger: Logger;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new Logger(LogLevel.DEBUG);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Constructor', () => {
    it('should create logger with default INFO level', () => {
      const defaultLogger = new Logger();
      expect(defaultLogger['level']).toBe(LogLevel.INFO);
    });

    it('should create logger with custom level', () => {
      const debugLogger = new Logger(LogLevel.DEBUG);
      expect(debugLogger['level']).toBe(LogLevel.DEBUG);
    });

    it('should create logger with context', () => {
      const contextLogger = new Logger(LogLevel.INFO, 'TestContext');
      expect(contextLogger['context']).toBe('TestContext');
    });
  });

  describe('setLevel', () => {
    it('should change log level', () => {
      logger.setLevel(LogLevel.WARN);
      expect(logger['level']).toBe(LogLevel.WARN);
    });
  });

  describe('setContext', () => {
    it('should change context', () => {
      logger.setContext('NewContext');
      expect(logger['context']).toBe('NewContext');
    });
  });

  describe('debug', () => {
    it('should log debug messages when level allows', () => {
      logger.debug('Test debug message');
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('DEBUG');
      expect(loggedMessage).toContain('Test debug message');
    });

    it('should not log debug messages when level is higher', () => {
      logger.setLevel(LogLevel.INFO);
      logger.debug('Test debug message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should include context in debug messages', () => {
      logger.setContext('TestContext');
      logger.debug('Test message');
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('[TestContext]');
    });

    it('should include extra context as JSON', () => {
      logger.debug('Test message', { key: 'value' });
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('key');
      expect(loggedMessage).toContain('value');
    });
  });

  describe('info', () => {
    it('should log info messages when level allows', () => {
      logger.info('Test info message');
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('INFO');
    });

    it('should not log info messages when level is higher', () => {
      logger.setLevel(LogLevel.WARN);
      logger.info('Test info message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should log warn messages when level allows', () => {
      logger.warn('Test warn message');
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('WARN');
    });

    it('should not log warn messages when level is ERROR', () => {
      logger.setLevel(LogLevel.ERROR);
      logger.warn('Test warn message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should always log error messages', () => {
      logger.setLevel(LogLevel.ERROR);
      logger.error('Test error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('ERROR');
    });
  });

  describe('Convenience methods', () => {
    it('should log operation debug', () => {
      logger.debugOperation('testOperation', { param: 'value' });
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('Operation: testOperation');
    });

    it('should log operation info', () => {
      logger.infoOperation('testOperation');
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('Operation: testOperation');
    });

    it('should log operation warn', () => {
      logger.warnOperation('testOperation');
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('Operation: testOperation');
    });

    it('should log operation error with error object', () => {
      const testError = new Error('Test error');
      logger.errorOperation('testOperation', testError);
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('Operation failed: testOperation');
      expect(loggedMessage).toContain('Test error');
    });

    it('should log operation error with details', () => {
      logger.errorOperation('testOperation', undefined, { key: 'value' });
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('key');
    });
  });

  describe('Message formatting', () => {
    it('should include timestamp in ISO format', () => {
      logger.info('Test message');
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format
    });

    it('should format message correctly', () => {
      logger.info('Test message');
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      const parts = loggedMessage.split(' ');
      expect(parts.length).toBeGreaterThanOrEqual(3); // timestamp, level, message
    });
  });
});

describe('createLogger', () => {
  it('should create logger with context', () => {
    const logger = createLogger('TestContext');
    expect(logger['context']).toBe('TestContext');
  });

  it('should create logger with custom level', () => {
    const logger = createLogger('TestContext', LogLevel.DEBUG);
    expect(logger['level']).toBe(LogLevel.DEBUG);
  });

  it('should use global level if not specified', () => {
    const logger = createLogger('TestContext');
    expect(logger['level']).toBeDefined();
  });
});
