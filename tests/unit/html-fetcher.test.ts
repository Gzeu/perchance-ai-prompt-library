import { fetchHtml } from '../../src/utils/html-fetcher.js';

function mockFetch(status: number, statusText: string, body: string) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText,
    text: () => Promise.resolve(body),
  }) as any;
}

describe('fetchHtml', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).fetch;
  });

  it('should fetch and return HTML', async () => {
    mockFetch(200, 'OK', '<html><body>hello</body></html>');
    const html = await fetchHtml('https://example.com');
    expect(html).toBe('<html><body>hello</body></html>');
  });

  it('should use default user-agent', async () => {
    mockFetch(200, 'OK', 'ok');
    await fetchHtml('https://example.com');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        headers: { 'User-Agent': expect.stringContaining('Chrome/120') },
      }),
    );
  });

  it('should use AbortSignal.timeout for timeout', async () => {
    mockFetch(200, 'OK', 'ok');
    await fetchHtml('https://example.com', 5000);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        signal: expect.anything(),
      }),
    );
  });

  it('should throw on HTTP error', async () => {
    mockFetch(404, 'Not Found', '');
    await expect(fetchHtml('https://example.com')).rejects.toThrow(
      'HTTP 404',
    );
  });

  it('should throw on HTTP 503', async () => {
    mockFetch(503, 'Service Unavailable', '');
    await expect(fetchHtml('https://example.com')).rejects.toThrow(
      'HTTP 503',
    );
  });

  it('should use custom timeout', async () => {
    mockFetch(200, 'OK', 'ok');
    await fetchHtml('https://example.com', 5000);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should include cache-busting parameter when called with API URL', async () => {
    mockFetch(200, 'OK', '<html>ok</html>');
    const url = 'https://perchance.org/api/downloadGenerator?generatorName=test&__cacheBust=123';
    await fetchHtml(url);
    expect(global.fetch).toHaveBeenCalledWith(url, expect.any(Object));
  });

  it('should handle network errors', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as any;
    await expect(fetchHtml('https://example.com')).rejects.toThrow('Network error');
  });
});
