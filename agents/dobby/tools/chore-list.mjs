#!/usr/bin/env node
// chore-list — Dobby's personal MCP server (stdio, JSON-RPC 2.0, zero dependencies).
// Tools operate on the chore database inside Dobby's own knowledge folder.
import { createInterface } from 'node:readline';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DB = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'knowledge', 'chore-list.json');

function loadDb() {
  try { return JSON.parse(readFileSync(DB, 'utf8')); } catch { return { chores: [] }; }
}
function saveDb(db) { writeFileSync(DB, JSON.stringify(db, null, 2) + '\n'); }

const TOOLS = [
  { name: 'list_chores', description: "List every chore on Dobby's list, pending and done.",
    inputSchema: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'add_chore', description: "Add a chore to Dobby's list.",
    inputSchema: { type: 'object', properties: { task: { type: 'string' } }, required: ['task'] } },
  { name: 'complete_chore', description: 'Mark a chore done by task text (partial match on pending chores).',
    inputSchema: { type: 'object', properties: { task: { type: 'string' } }, required: ['task'] } },
];

function callTool(name, args) {
  const db = loadDb();
  if (name === 'list_chores') {
    return db.chores.length
      ? db.chores.map((c) => `${c.done ? '[x]' : '[ ]'} ${c.task}`).join('\n')
      : 'The chore list is empty.';
  }
  if (name === 'add_chore') {
    const task = String(args?.task ?? '').trim();
    if (!task) throw new Error('task is required');
    db.chores.push({ task, done: false });
    saveDb(db);
    return `Added "${task}". ${db.chores.filter((c) => !c.done).length} chores pending.`;
  }
  if (name === 'complete_chore') {
    const q = String(args?.task ?? '').toLowerCase();
    const hit = db.chores.find((c) => !c.done && c.task.toLowerCase().includes(q));
    if (!hit) return `No pending chore matching "${args?.task}".`;
    hit.done = true;
    saveDb(db);
    return `Done: "${hit.task}". ${db.chores.filter((c) => !c.done).length} chores remain.`;
  }
  throw new Error(`Unknown tool: ${name}`);
}

const rl = createInterface({ input: process.stdin });
function send(msg) { process.stdout.write(JSON.stringify(msg) + '\n'); }

rl.on('line', (line) => {
  line = line.trim();
  if (!line) return;
  let req;
  try { req = JSON.parse(line); } catch { return; }
  const { id, method, params } = req;
  if (method === 'initialize') {
    send({ jsonrpc: '2.0', id, result: {
      protocolVersion: params?.protocolVersion ?? '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'chore-list', version: '1.0.0' },
    } });
  } else if (method === 'tools/list') {
    send({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
  } else if (method === 'tools/call') {
    try {
      const text = callTool(params?.name, params?.arguments ?? {});
      send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text }] } });
    } catch (e) {
      send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true } });
    }
  } else if (method === 'ping') {
    send({ jsonrpc: '2.0', id, result: {} });
  } else if (id !== undefined) {
    send({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } });
  }
});
