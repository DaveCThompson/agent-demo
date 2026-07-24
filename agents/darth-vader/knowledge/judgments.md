# Judgments

- Reviewed JSON artifacts across agent-demo — .mcp.json files (root, groot, terminator, darth-vader) consistent and disciplined; agents/dobby/knowledge/chore-list.json and agents/dobby/tools/chore-list.mjs:41 flagged — chore records lack a unique id, and complete_chore's substring match risks striking the wrong pending chore when task text overlaps.
