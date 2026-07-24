# Mission: current Node.js LTS version

Date: 2026-07-24

Objective: Identify current Node.js LTS version(s) and support status.

Findings:
- Node.js 24 "Krypton" — Active LTS. Entered LTS Oct 2025, last updated Jun 23 2026. Supported until Apr 30, 2028 (30-month total lifecycle). Source: https://nodejs.org/en/about/previous-releases
- Node.js 22 "Jod" — also Active LTS, last updated Jun 22 2026. Source: https://nodejs.org/en/about/previous-releases
- Node.js 20 "Iron" — reached End-of-Life Mar 24, 2026. Source: https://nodejs.org/en/about/previous-releases
- Node.js 26 — Current (non-LTS) release since May 5, 2026. Scheduled to enter Active LTS in October 2026. Source: https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule , https://www.inmotionhosting.com/support/news/nodejs-v26-released/
- Release model change: starting with Node.js 27 (Oct 2026), Node.js moves from two majors/year to one major/year; every major becomes LTS eventually (no more odd/even split). Source: https://www.infoq.com/news/2026/06/nodejs-release-changes/ , https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule

Assessment: For new/upgraded production stacks in July 2026, Node 24 is the safe current Active LTS target (longest remaining runway before Node 26 takes over as LTS in Oct 2026). Node 22 remains a viable Active LTS fallback. Node 20 is dead — migrate off it now.

Verdict: Node 24 "Krypton" is the current recommended Node.js LTS.
