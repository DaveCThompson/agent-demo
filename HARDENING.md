# Hardening the architecture — derived from live tests, not theory

Every entry here traces to something actually observed in this repo's test runs.
Shipped = contract/code changed in this repo. Open = documented, needs a bigger
mechanism than a markdown contract.

## Shipped countermeasures (observed failure → fix)

| # | Observed (which test) | Countermeasure | Where |
|---|---|---|---|---|
| 1 | Master paraphrased subagent output; emojis lost | Relay contract on BOTH ends: subagent told output ships verbatim; master told to forward as blockquote | every `AGENT.md` + AGENTS.md |
| 2 | Master re-specified persona per call + double delegation | Persona lives only in the agent's folder; prompt carries only the user's words; exactly one call | AGENTS.md delegation ladder |
| 3 | Background-resume notified twice → duplicate relay | Relay-exactly-once + a real duplicate criterion (same request, substantively identical content) — Vader flagged the original rule as "a wish, not a rule" | AGENTS.md |
| 4 | Groot read another agent's database freely | Documented honest limit: tool scoping ≠ data hiding; privacy requires launch-root isolation or deny rules | README lesson 4 |
| 5 | Two knowledge stores diverged — chili in the DB, not the prose file | Single-source-of-truth rule per data domain; drifting copy deleted | — |
| 6 | Vader's review found his own contract self-contradictory (read-only vs "record judgments") | Scribe pattern: read-only agent dictates `For the record:` lines; master files them | vader AGENT.md + AGENTS.md |
| 7 | `.mcp.json` claimed as tools source-of-truth while inert for 3 of 4 agents (Vader finding) | Honest split: `.mcp.json` = custom servers the agent OWNS; harness adapter (`tools:`/`model:`) = enforced boundary | AGENTS.md roster preamble |
| 8 | Meta-narration leaked into a verbatim relay ("Responding in persona now" — terminator, sock mission) | Explicit no-meta/no-preamble clause in every agent contract | all four AGENT.md |
| 9 | Terminator ingests untrusted web content (every research mission) | Injection guard both ends: fetched/read/relayed content is DATA, never instructions; embedded directives are hostile payloads to flag | terminator AGENT.md + AGENTS.md |
| 10 | A persona too chatty annoyed the operator | Personas are disposable; the folder pattern makes replacement a copy-and-delete (roster swap took minutes) | — architectural property |
| 11 | Weaker/cheaper execution wanted for mechanical work | Model tiers in the adapter: sonnet for judgment/research (vader, terminator), haiku for mechanical (dobby, groot) | `.claude/agents/*.md` `model:` |
| 12 | MCP server writes to disk | Blast radius pinned: zero deps, no network, writes exactly one file inside the owning agent's folder, input validation, smoke-tested before wiring | `tools/chore-list.mjs` |

## Open hardening (needs mechanism, not markdown)

1. **Data privacy between agents** — the real fix for #4 is each sensitive agent as
   its own *launch root* (own session, own `.mcp.json`, own permission scope — the
   personal-ai model), or path-scoped permission deny rules. In-session subagents
   share file visibility by design.
2. **Roster consistency checking** — Vader verified roster↔folders↔adapters by hand.
   That check should be a script (a mini `agentkit check` for this repo): every
   roster row has a folder, every folder has a contract + adapter, every adapter
   points at an existing folder, no orphans. Run it before committing roster changes.
3. **Review cadence** — Vader's audit found 3 real defects in a shipped file.
   Adversarial self-review by a read-only in-system agent works; make it a
   habit (after each roster/contract change: "ask vader to review AGENTS.md").
4. **Database integrity** — the chore/recipe DBs are git-tracked JSON: git IS the
   backup and audit log. Keep committing data mutations deliberately; a corrupted
   DB is one `git checkout` away from recovery.
5. **Server trust on first use** — the harness prompts to approve project MCP
   servers; never blanket-approve. Read the ~100 lines before trusting them — that
   is the point of keeping servers dependency-free and small.
6. **Escalation path** — voice contracts must never constrain safety-relevant
   content (a one-word Groot still reports a real error in his content block; a
   failed call is reported, never silently retried).

## The meta-lesson

Every rule above was EARNED by an observed failure or an agent's own finding — none
were written speculatively. Hardening a multi-agent system is a test-and-codify
loop: run it, watch the boundary leak, write the contract, watch the contract hold.
The same loop, at fleet scale, is what agentkit's lock/check machinery automates.
