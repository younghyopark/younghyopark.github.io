#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const DATA_PATH = path.join(__dirname, 'csail-data.json');
const IMPORTS_PATH = path.join(__dirname, 'mgp-imports.json');
const BUILD_PATH = path.join(__dirname, 'build-data.js');
const MGP_HOST = 'genealogy.math.ndsu.nodak.edu';
const DEFAULT_MAX_DEPTH = 80;
const DEFAULT_MAX_PAGES = 250;

const HTML_ENTITIES = {
  amp: '&',
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
  apos: "'",
  rsquo: "'",
  lsquo: "'",
  rdquo: '"',
  ldquo: '"',
  mdash: '-',
  ndash: '-',
  aacute: 'á',
  agrave: 'à',
  acirc: 'â',
  auml: 'ä',
  aring: 'å',
  atilde: 'ã',
  aelig: 'æ',
  ccedil: 'ç',
  eacute: 'é',
  egrave: 'è',
  ecirc: 'ê',
  euml: 'ë',
  iacute: 'í',
  igrave: 'ì',
  icirc: 'î',
  iuml: 'ï',
  ntilde: 'ñ',
  oacute: 'ó',
  ograve: 'ò',
  ocirc: 'ô',
  ouml: 'ö',
  oslash: 'ø',
  otilde: 'õ',
  szlig: 'ß',
  uacute: 'ú',
  ugrave: 'ù',
  ucirc: 'û',
  uuml: 'ü',
  yacute: 'ý',
  yuml: 'ÿ'
};

function usage() {
  console.log(`Usage: node genealogy/import-mgp-lineage.js <MGP URL or id> [options]

Options:
  --dry-run         Fetch and print the import plan without writing files.
  --no-rebuild     Update mgp-imports.json but do not rebuild csail-data.json.
  --max-depth=N    Stop a branch after N advisor generations. Default: ${DEFAULT_MAX_DEPTH}.
  --max-pages=N    Stop after fetching N new MGP pages. Default: ${DEFAULT_MAX_PAGES}.
`);
}

function parseArgs(argv) {
  const options = {
    input: '',
    dryRun: false,
    rebuild: true,
    maxDepth: DEFAULT_MAX_DEPTH,
    maxPages: DEFAULT_MAX_PAGES
  };

  argv.forEach((arg) => {
    if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    }
    if (arg === '--dry-run') {
      options.dryRun = true;
      options.rebuild = false;
      return;
    }
    if (arg === '--no-rebuild') {
      options.rebuild = false;
      return;
    }
    if (arg.startsWith('--max-depth=')) {
      options.maxDepth = positiveIntegerOption(arg, '--max-depth');
      return;
    }
    if (arg.startsWith('--max-pages=')) {
      options.maxPages = positiveIntegerOption(arg, '--max-pages');
      return;
    }
    if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    }
    if (options.input) {
      throw new Error(`Unexpected extra argument: ${arg}`);
    }
    options.input = arg;
  });

  if (!options.input) {
    usage();
    throw new Error('Expected an MGP URL or numeric id.');
  }

  return options;
}

function positiveIntegerOption(arg, name) {
  const value = Number(arg.slice(name.length + 1));
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return value;
}

function mgpUrl(id) {
  return `https://${MGP_HOST}/id.php?id=${encodeURIComponent(id)}`;
}

function mgpIdFromInput(input) {
  if (/^\d+$/.test(input)) {
    return input;
  }

  let url;
  try {
    url = new URL(input);
  } catch (error) {
    throw new Error(`Could not parse MGP URL or id: ${input}`);
  }

  const host = url.hostname.replace(/^www\./, '');
  if (host !== MGP_HOST || !url.pathname.endsWith('/id.php')) {
    throw new Error(`Expected a ${MGP_HOST}/id.php URL.`);
  }

  const id = url.searchParams.get('id');
  if (!id || !/^\d+$/.test(id)) {
    throw new Error('MGP URL is missing a numeric id= query parameter.');
  }
  return id;
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&([a-z]+);/gi, (match, key) => HTML_ENTITIES[key.toLowerCase()] || match);
}

function cleanText(value) {
  return decodeHtml(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t\r\n]+/g, ' ')
    .trim();
}

function thesisTitleFromHtml(html) {
  const match = String(html).match(/<span[^>]*\bid=["']thesisTitle["'][^>]*>([\s\S]*?)<\/span>/i);
  if (!match) {
    return '';
  }

  const title = cleanText(match[1]);
  return /^\(?none\)?$/i.test(title) ? '' : title;
}

function extractYear(value) {
  const matches = String(value || '').match(/\b(1[3-9]\d{2}|20\d{2})\b/g);
  return matches && matches.length ? Number(matches[matches.length - 1]) : null;
}

function extractDegreeDetails(html) {
  const degreeBlockMatch = String(html).match(/<div[^>]*line-height:\s*30px[\s\S]*?<\/div>/i);
  const degreeBlock = degreeBlockMatch ? degreeBlockMatch[0] : String(html);
  const details = [];
  const degreePattern = /<span[^>]*>\s*[^<]*?\s*<span[^>]*color:\s*#006633[^>]*>([\s\S]*?)<\/span>\s*([^<]*?)<\/span>/gi;
  let match;

  while ((match = degreePattern.exec(degreeBlock))) {
    const school = cleanText(match[1]);
    const suffix = cleanText(match[2]).replace(/^,?\s*/, '');
    const detail = [school, suffix].filter(Boolean).join(' ');
    if (detail && !details.includes(detail)) {
      details.push(detail);
    }
  }

  return details.length ? details : ['???'];
}

function extractAdvisors(html) {
  const advisorParagraphs = String(html).match(/<p[^>]*>\s*Advisor[\s\S]*?<\/p>/gi) || [];
  const advisors = [];
  const seen = new Set();

  advisorParagraphs.forEach((paragraph) => {
    const linkPattern = /Advisor(?:\s+\d+)?\s*:\s*<a\s+href=["'][^"']*id\.php\?id=(\d+)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;

    while ((match = linkPattern.exec(paragraph))) {
      const id = match[1];
      if (!seen.has(id)) {
        advisors.push({ id, name: cleanText(match[2]) });
        seen.add(id);
      }
    }
  });

  return advisors;
}

function personFromHtml(id, html) {
  const nameMatch = String(html).match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  if (!nameMatch) {
    throw new Error(`Could not find a person name on MGP page ${id}.`);
  }

  const name = cleanText(nameMatch[1]).replace(/\s+/g, ' ');
  const details = extractDegreeDetails(html);
  const detail = details.join(' / ');
  const label = [name, ...details].join('\n');
  const thesisTitle = thesisTitleFromHtml(html);
  const node = {
    id,
    label,
    name,
    detail,
    year: extractYear(label),
    href: mgpUrl(id),
    role: 'other'
  };

  if (thesisTitle) {
    node.thesisTitle = thesisTitle;
  }

  return {
    ...node,
    advisors: extractAdvisors(html)
  };
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeImports(imports) {
  return {
    ...imports,
    nodes: Array.isArray(imports.nodes) ? imports.nodes : [],
    edges: Array.isArray(imports.edges) ? imports.edges : []
  };
}

function loadKnownGraph() {
  const data = readJson(DATA_PATH, { nodes: [], edges: [] });
  const imports = normalizeImports(readJson(IMPORTS_PATH, { nodes: [], edges: [] }));
  const knownNodes = [...(data.nodes || []), ...imports.nodes];
  const knownEdges = [...(data.edges || []), ...imports.edges];
  const ids = new Set(knownNodes.map((node) => node.id).filter(Boolean));
  const names = new Map(knownNodes.filter((node) => node.id).map((node) => [node.id, node.name || node.id]));
  const edges = new Set(knownEdges.map((edge) => `${edge.source}->${edge.target}`));

  return { imports, ids, names, edges };
}

function withoutAdvisorRuntimeFields(person) {
  const { advisors, ...node } = person;
  return node;
}

function mergeImportGraph(imports, fetchedPeople, fetchedOrder, newEdges) {
  const nodeIds = new Set(imports.nodes.map((node) => node.id));
  const edgeIds = new Set(imports.edges.map((edge) => `${edge.source}->${edge.target}`));
  const nodes = [...imports.nodes];
  const edges = [...imports.edges];

  fetchedOrder.forEach((id) => {
    if (!nodeIds.has(id)) {
      nodes.push(withoutAdvisorRuntimeFields(fetchedPeople.get(id)));
      nodeIds.add(id);
    }
  });

  newEdges.forEach((edge) => {
    const edgeId = `${edge.source}->${edge.target}`;
    if (!edgeIds.has(edgeId)) {
      edges.push(edge);
      edgeIds.add(edgeId);
    }
  });

  return { ...imports, nodes, edges };
}

function nameFor(id, fetchedPeople, knownNames) {
  return fetchedPeople.get(id)?.name || knownNames.get(id) || id;
}

function formatPath(pathIds, fetchedPeople, knownNames) {
  return pathIds.map((id) => `${nameFor(id, fetchedPeople, knownNames)} (${id})`).join(' <- ');
}

async function fetchPerson(id, fetchedCount) {
  const response = await fetch(mgpUrl(id), {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; younghyopark.me genealogy importer)'
    }
  });

  if (!response.ok) {
    throw new Error(`Could not fetch ${id}: ${response.status} ${response.statusText}`);
  }

  const person = personFromHtml(id, await response.text());
  console.log(`Fetched ${fetchedCount}: ${person.name} (${id})`);
  return person;
}

async function main() {
  if (typeof fetch !== 'function') {
    throw new Error('This script needs Node.js 18+ so global fetch is available.');
  }

  const options = parseArgs(process.argv.slice(2));
  const startId = mgpIdFromInput(options.input);
  const known = loadKnownGraph();

  if (known.ids.has(startId)) {
    console.log(`${nameFor(startId, new Map(), known.names)} (${startId}) is already in the genealogy database.`);
    return;
  }

  const fetchedPeople = new Map();
  const fetchedOrder = [];
  const inFlight = new Set();
  const newEdgesById = new Map();
  const branchStops = [];
  let fetchedCount = 0;

  async function walk(id, depth, pathIds) {
    if (known.ids.has(id)) {
      branchStops.push({ kind: 'existing', pathIds: [...pathIds, id] });
      return;
    }
    if (depth > options.maxDepth) {
      throw new Error(`Stopped at ${id}: exceeded --max-depth=${options.maxDepth}.`);
    }
    if (fetchedPeople.has(id)) {
      branchStops.push({ kind: 'visited', pathIds: [...pathIds, id] });
      return;
    }
    if (inFlight.has(id)) {
      throw new Error(`Cycle detected while walking advisor chain at ${id}.`);
    }
    if (fetchedCount >= options.maxPages) {
      throw new Error(`Stopped before ${id}: exceeded --max-pages=${options.maxPages}.`);
    }

    inFlight.add(id);
    fetchedCount += 1;
    const person = await fetchPerson(id, fetchedCount);
    fetchedPeople.set(id, person);
    fetchedOrder.push(id);

    if (!person.advisors.length) {
      branchStops.push({ kind: 'no-advisor', pathIds: [...pathIds, id] });
    }

    for (const advisor of person.advisors) {
      const edgeId = `${advisor.id}->${id}`;
      if (!known.edges.has(edgeId) && !newEdgesById.has(edgeId)) {
        newEdgesById.set(edgeId, { source: advisor.id, target: id });
      }
      await walk(advisor.id, depth + 1, [...pathIds, id]);
    }

    inFlight.delete(id);
  }

  await walk(startId, 0, []);

  const newEdges = Array.from(newEdgesById.values());
  const mergedImports = mergeImportGraph(known.imports, fetchedPeople, fetchedOrder, newEdges);
  const stopCounts = branchStops.reduce((counts, stop) => {
    counts[stop.kind] = (counts[stop.kind] || 0) + 1;
    return counts;
  }, {});

  console.log('');
  console.log(`Import plan: ${fetchedOrder.length} new node(s), ${newEdges.length} new edge(s).`);
  console.log(`Branch stops: ${Object.entries(stopCounts).map(([kind, count]) => `${count} ${kind}`).join(', ') || 'none'}.`);
  branchStops.forEach((stop) => {
    console.log(`- ${stop.kind}: ${formatPath(stop.pathIds, fetchedPeople, known.names)}`);
  });

  if (options.dryRun) {
    console.log('');
    console.log('Dry run only; no files written.');
    return;
  }

  fs.writeFileSync(IMPORTS_PATH, `${JSON.stringify(mergedImports, null, 2)}\n`);
  console.log('');
  console.log(`Updated ${path.relative(process.cwd(), IMPORTS_PATH)}.`);

  if (options.rebuild) {
    const result = spawnSync(process.execPath, [BUILD_PATH], {
      cwd: path.dirname(__dirname),
      stdio: 'inherit'
    });
    if (result.status !== 0) {
      throw new Error(`Rebuild failed with status ${result.status}.`);
    }
  } else {
    console.log(`Skipped rebuild. Run node ${path.relative(process.cwd(), BUILD_PATH)} when ready.`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
