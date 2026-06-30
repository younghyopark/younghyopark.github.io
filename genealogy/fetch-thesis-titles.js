const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'csail-data.json');
const OUT_PATH = path.join(__dirname, 'thesis-titles.json');
const MGP_HOST = 'genealogy.math.ndsu.nodak.edu';
const CONCURRENCY = 8;

function decodeHtml(value) {
  const named = {
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

  return String(value || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&([a-z]+);/gi, (match, key) => named[key.toLowerCase()] || match);
}

function cleanTitle(rawTitle) {
  return decodeHtml(rawTitle)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function thesisTitleFromHtml(html) {
  const match = String(html).match(/<span[^>]*\bid=["']thesisTitle["'][^>]*>([\s\S]*?)<\/span>/i);
  if (!match) {
    return '';
  }

  const title = cleanTitle(match[1]);
  return /^\(?none\)?$/i.test(title) ? '' : title;
}

function mgpIdFromNode(node) {
  if (!node.href) {
    return '';
  }

  try {
    const url = new URL(node.href);
    if (url.hostname !== MGP_HOST || !url.pathname.endsWith('/id.php')) {
      return '';
    }
    return url.searchParams.get('id') || '';
  } catch (error) {
    return '';
  }
}

function readCache() {
  if (!fs.existsSync(OUT_PATH)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
}

function writeCache(cache) {
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(cache, null, 2)}\n`);
}

async function fetchTitle(mgpId) {
  const url = `https://${MGP_HOST}/id.php?id=${encodeURIComponent(mgpId)}`;
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; younghyopark.me genealogy title cache)'
    }
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return thesisTitleFromHtml(await response.text());
}

async function main() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const cache = readCache();
  const refresh = process.argv.includes('--refresh');
  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity;
  const jobs = data.nodes
    .map((node) => ({ id: node.id, mgpId: mgpIdFromNode(node), name: node.name }))
    .filter((job) => job.mgpId && (refresh || cache[job.id] === undefined))
    .slice(0, limit);

  let cursor = 0;
  let finished = 0;

  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor];
      cursor += 1;

      try {
        const title = await fetchTitle(job.mgpId);
        cache[job.id] = title || null;
      } catch (error) {
        cache[job.id] = null;
        console.warn(`Could not fetch ${job.id} (${job.name}): ${error.message}`);
      }

      finished += 1;
      if (finished % 25 === 0 || finished === jobs.length) {
        writeCache(cache);
        console.log(`Fetched ${finished}/${jobs.length} new thesis title pages`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, worker));
  writeCache(cache);
  const titleCount = Object.values(cache).filter(Boolean).length;
  console.log(`Cached ${titleCount} thesis titles in ${path.relative(process.cwd(), OUT_PATH)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
