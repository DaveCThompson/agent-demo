# agent-demo

Multi-agent demo — **vendor-agnostic, agent-as-folder layout, real per-agent tools**.

```
AGENTS.md                  ← dog-man (master) + the roster, canonical (open standard filename)
CLAUDE.md                  ← one line: @AGENTS.md (Claude Code adapter)
.mcp.json                  ← session adapter: registers Dobby's server for the Claude session
agents/
  terminator/              ← the researcher — the ONLY agent with network access
    AGENT.md               ←   terse fact-based voice; briefing format; "Terminated."
    knowledge/             ←   mission reports get saved here
    .mcp.json              ←   stub (a dedicated research MCP would register here)
  darth-vader/             ← the inspector — read-only by DESIGN: sees all, alters nothing
    AGENT.md               ←   verdicts with file:line citations; *khoooh... phaaah*
    knowledge/             ←   judgments worth remembering
    .mcp.json              ←   stub
  dobby/                   ← the housekeeper — owns the chore list
    AGENT.md               ←   third-person eager voice; chore list = single source of truth
    knowledge/chore-list.json ← his DATABASE (the MCP server reads/writes this)
    tools/chore-list.mjs   ←   his MCP server — plain Node stdio, zero dependencies
    .mcp.json              ←   canonical declaration of HIS toolset
  groot/                   ← the grunt worker
    AGENT.md               ←   one-word voice; work rides in fenced content blocks
    knowledge/README.md
    .mcp.json              ←   stub
.claude/agents/            ← Claude Code adapters: register subagents, point at folders,
  terminator.md            ←   WebSearch/WebFetch + files — network is HIS alone
  darth-vader.md           ←   Read/Glob/Grep ONLY — enforced read-only reviewer
  dobby.md                 ←   file tools + the three chore-list MCP tools
  groot.md                 ←   file + shell tools, no MCP tools
```

The tool asymmetry IS the architecture: researcher gets the network, inspector gets
read-only, housekeeper gets his own database, worker gets the shell. Nobody gets
everything.

## Run

Claude Code: `claude` in this folder. First run will ask you to **approve the
project MCP server `chore-list`** — it's `agents/dobby/tools/chore-list.mjs`, local
stdio, no network, writes only to Dobby's `knowledge/chore-list.json`.

## What a passing test looks like

- "have the terminator research <topic>" → WebSearch/WebFetch calls in the trace; a
  briefing (objective → findings with source URLs → assessment) in a content block;
  terse speech; "Terminated." Facts labeled vs. inferences.
- "ask vader to review AGENTS.md" → read-only inspection; a verdict citing specific
  lines; breathing between sentences; no file modified.
- "tell dobby to add a chore: buy more socks" → `add_chore` fires;
  `agents/dobby/knowledge/chore-list.json` contains it (mutation verifiable on disk).
- "ask groot to list the files here" → "I am Groot." + fenced listing.
- Multi-agent: "have the terminator research X, then dobby add the follow-ups as
  chores" → two delegations, two attributed relays, chores on disk.
- A failed call is reported, never silently retried; every relay is verbatim and
  happens exactly once.

## Lessons this demo encodes

1. **Relay contracts live on both ends.** Subagent told its output ships verbatim;
   master told to forward, not summarize — and relay exactly once (background
   resumes can notify twice; validated live).
2. **An agent is a folder, not a voice.** Contract + own knowledge + own tools travel
   together — Dobby's database and the server that owns it live in HIS folder.
3. **Vendor surfaces are thin adapters.** AGENTS.md canonical; CLAUDE.md imports it;
   `.claude/agents/*.md` point at folders; root `.mcp.json` mirrors the owning
   agent's declaration. Duplication is drift. (Hand-rolled agentkit.)
4. **Tool scoping is per-agent and real — with an honest limit.** Only the
   terminator reaches the network; only Dobby writes the chore list; Vader can't
   modify anything. But scoping ≠ data hiding: any agent with Read can inspect
   another's files (observed live in v6 — groot audited the recipe database he had
   no tools for, and his audit caught real drift). Privacy needs deny rules.
5. **Speech and payload are separate channels.** Groot's word is "Groot."; Vader's
   verdict and the terminator's briefing ride in content blocks. Persona constraints
   must never degrade work quality.
6. **An MCP server is ~100 lines of plain Node.** stdio + JSON-RPC: `initialize`,
   `tools/list`, `tools/call`. No SDK required to understand the layer everything
   else builds on.

## History

v1–v9 evolved through live testing: relay compression → both-ends contract (v2);
vendor-agnostic layout (v3); agent-as-folder (v4); relay-exactly-once (v5);
recipe-box MCP + tool ownership (v6, grandma era); single-source-of-truth fix from
groot's audit (v7); roster evolution — terminator/vader/dobby replace grandma (v8);
v9: Vader's own review of AGENTS.md drove three contract fixes (scribe pattern for
the read-only inspector, honest tools source-of-truth, dedup criterion with teeth),
plus ALL-CAPS breathing, model tiers (sonnet/haiku per adapter), no-meta clauses
(terminator leaked "Responding in persona now" into a verbatim relay), and
prompt-injection guards for web-fetching agents. See `HARDENING.md` for the full
observed-failure → countermeasure map.
