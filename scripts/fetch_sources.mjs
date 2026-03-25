#!/usr/bin/env node
/**
 * fetch_sources.mjs — Discover and document benchmark sources
 *
 * This script searches for publicly available German spelling/grammar
 * correction benchmarks via official APIs (GitHub Search API, etc.).
 * It does NOT scrape HTML pages — only documented, official endpoints.
 *
 * Usage:
 *   node scripts/fetch_sources.mjs [--dry-run] [--output data/benchmark_candidates.jsonl]
 *
 * Principles:
 *   - Prefer official APIs over scraping
 *   - Respect robots.txt, rate limits, and TOS
 *   - Store provenance for every item
 *   - Flag unclear licenses
 *   - Do not copy large copyrighted text passages
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data');

// ─── Configuration ──────────────────────────────────────────────────────

const GITHUB_SEARCH_QUERIES = [
  'german spelling correction benchmark language:Python',
  'german grammar error correction dataset',
  'deutsches Rechtschreibung Korrektur Benchmark',
  'GEC German evaluation',
  'learner corpus german errors',
  'confusion set german spelling',
  'adversarial typo dataset german',
];

const KNOWN_SOURCES = [
  {
    id: 'languagetool',
    url: 'https://github.com/languagetool-org/languagetool',
    title: 'LanguageTool — Open Source Grammar Checker',
    license: 'LGPL-2.1',
    type: 'github',
    status: 'accepted',
    reason: 'Primary baseline comparison tool with German grammar rules',
  },
  {
    id: 'tatoeba',
    url: 'https://tatoeba.org/',
    title: 'Tatoeba — Collaborative Sentence Database',
    license: 'CC-BY 2.0 FR',
    type: 'web',
    status: 'accepted',
    reason: 'Large collection of correct German sentences for negative set',
  },
  {
    id: 'merlin-corpus',
    url: 'https://merlin-platform.eu/',
    title: 'Merlin — Multilingual Learner Corpus',
    license: 'CC-BY-SA (verify per subcorpus)',
    type: 'web',
    status: 'conditional',
    reason: 'Authentic German learner errors; license verification required',
  },
  {
    id: 'falko-corpus',
    url: 'https://www.linguistik.hu-berlin.de/de/institut/professuren/korpuslinguistik/forschung/falko',
    title: 'Falko — German Learner Corpus (FU Berlin)',
    license: 'Academic use (verify)',
    type: 'web',
    status: 'conditional',
    reason: 'Annotated German learner essays; license verification required',
  },
  {
    id: 'wikipedia-de',
    url: 'https://de.wikipedia.org/',
    title: 'Wikipedia Deutsch',
    license: 'CC-BY-SA 3.0',
    type: 'web',
    status: 'accepted',
    reason: 'Correct German sentences for negative set via MediaWiki API',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────

function makeEntry(source) {
  return {
    id: `src-${source.id}`,
    source_type: source.type,
    source_url: source.url,
    source_title: source.title,
    source_license: source.license,
    retrieval_date: new Date().toISOString().slice(0, 10),
    status: source.status,
    reason: source.reason,
    notes: source.status === 'conditional'
      ? 'License verification required before use'
      : null,
  };
}

/**
 * Search GitHub for relevant repositories using the GitHub REST API.
 * Requires GITHUB_TOKEN environment variable for authenticated requests.
 *
 * NOTE: This function makes real API calls. In CI or offline mode,
 * it gracefully falls back to known sources only.
 */
async function searchGitHub(query) {
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'SPIN-Benchmark-Fetcher/1.0',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5&sort=stars`;

  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      console.warn(`  ⚠ GitHub API returned ${res.status} for query: ${query}`);
      return [];
    }
    const data = await res.json();
    return (data.items || []).map(repo => ({
      id: `gh-${repo.full_name.replace('/', '-')}`,
      type: 'github',
      url: repo.html_url,
      title: `${repo.full_name} — ${repo.description || 'No description'}`,
      license: repo.license?.spdx_id || 'UNKNOWN',
      status: repo.license?.spdx_id ? 'candidate' : 'rejected',
      reason: repo.license?.spdx_id
        ? `Found via GitHub search: "${query}"`
        : `No clear license — rejected per policy`,
      stars: repo.stargazers_count,
    }));
  } catch (err) {
    console.warn(`  ⚠ GitHub search failed for "${query}": ${err.message}`);
    return [];
  }
}

// ─── Main ───────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const outputIdx = args.indexOf('--output');
  const outputPath = outputIdx >= 0
    ? args[outputIdx + 1]
    : join(DATA_DIR, 'source_discovery.jsonl');

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  SPIN Benchmark — Source Discovery               ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log();

  // Step 1: List known sources
  console.log('Step 1: Known sources');
  const entries = KNOWN_SOURCES.map(s => {
    console.log(`  ✓ ${s.id} [${s.status}] — ${s.license}`);
    return makeEntry(s);
  });
  console.log();

  // Step 2: Search GitHub (if online)
  console.log('Step 2: GitHub API search');
  const seenUrls = new Set(entries.map(e => e.source_url));
  let githubResults = 0;

  for (const query of GITHUB_SEARCH_QUERIES) {
    console.log(`  Searching: "${query}"`);
    const results = await searchGitHub(query);
    for (const r of results) {
      if (seenUrls.has(r.url)) continue;
      seenUrls.add(r.url);
      entries.push({
        id: r.id,
        source_type: r.type,
        source_url: r.url,
        source_title: r.title,
        source_license: r.license,
        retrieval_date: new Date().toISOString().slice(0, 10),
        status: r.status,
        reason: r.reason,
        notes: r.status === 'rejected' ? 'Rejected: no clear license' : null,
      });
      githubResults++;
    }
  }
  console.log(`  Found ${githubResults} new candidate(s) via GitHub`);
  console.log();

  // Step 3: Write output
  if (dryRun) {
    console.log('Dry run — not writing files.');
    console.log(`Would write ${entries.length} entries to ${outputPath}`);
  } else {
    const lines = entries.map(e => JSON.stringify(e)).join('\n') + '\n';
    writeFileSync(outputPath, lines, 'utf-8');
    console.log(`Wrote ${entries.length} entries to ${outputPath}`);
  }

  // Step 4: Summary
  console.log();
  console.log('Summary:');
  const byStatus = {};
  for (const e of entries) {
    byStatus[e.status] = (byStatus[e.status] || 0) + 1;
  }
  for (const [status, count] of Object.entries(byStatus)) {
    console.log(`  ${status}: ${count}`);
  }
  console.log();
  console.log('⚠ REMINDER: Conditional sources require license verification');
  console.log('  before any data from them can enter the holdout set.');

  return entries.length;
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
