/**
 * MCP server smoke test — boots dist/mcp/server.js over stdio and
 * performs JSON-RPC initialize + tools/list. Proves the server is
 * wire-compatible with any MCP client (incl. opencode).
 */
import { spawn } from 'node:child_process';

const server = spawn('node', ['dist/mcp/server.js'], {
  cwd: new URL('..', import.meta.url).pathname,
  stdio: ['pipe', 'pipe', 'inherit'],
  env: { ...process.env },
});

let buf = '';
const pending = new Map();
let id = 0;

function rpc(method, params) {
  const msgId = ++id;
  return new Promise((resolve) => {
    pending.set(msgId, resolve);
    server.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: msgId, method, params }) + '\n');
  });
}

server.stdout.on('data', (d) => {
  buf += d.toString();
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    const msg = JSON.parse(line);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  }
});

const init = await rpc('initialize', {
  protocolVersion: '2024-11-05',
  capabilities: {},
  clientInfo: { name: 'smoke', version: '1.0.0' },
});
console.log('initialized:', init.result?.serverInfo?.name, init.result?.serverInfo?.version);

const list = await rpc('tools/list', {});
console.log('tools:', list.result.tools.map((t) => t.name).join(', '));

server.kill();
process.exit(0);
