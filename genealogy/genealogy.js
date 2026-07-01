(function () {
  const stage = document.getElementById('stage');
  const edgeCanvas = document.getElementById('edge-canvas');
  const appShell = document.querySelector('.genealogy-app');
  const graphHost = document.getElementById('graph-host');
  const mapWorld = document.getElementById('map-world');
  const nodeLayer = document.getElementById('node-layer');
  const loading = document.getElementById('loading');
  const exploreToggle = document.getElementById('explore-toggle');
  const exploreClose = document.getElementById('explore-close');
  const exploreToggleLabel = exploreToggle ? exploreToggle.querySelector('.explore-toggle-label') : null;
  const exploreToggleDetail = exploreToggle ? exploreToggle.querySelector('.explore-toggle-detail') : null;
  const mobileConnectionTitle = document.getElementById('mobile-connection-title');
  const mobileConnectionPeople = document.getElementById('mobile-connection-people');
  const mobileConnectionLabel = document.getElementById('mobile-connection-label');
  const findModeButton = document.getElementById('mode-find');
  const connectModeButton = document.getElementById('mode-connect');
  const findPanel = document.getElementById('find-panel');
  const connectPanel = document.getElementById('connect-panel');
  const searchInput = document.getElementById('person-search');
  const searchResults = document.getElementById('search-results');
  const connectFromInput = document.getElementById('connect-from-search');
  const connectToInput = document.getElementById('connect-to-search');
  const connectFromResults = document.getElementById('connect-from-results');
  const connectToResults = document.getElementById('connect-to-results');
  const connectRun = document.getElementById('connect-run');
  const connectSwap = document.getElementById('connect-swap');
  const connectClear = document.getElementById('connect-clear');
  const connectionStrict = document.getElementById('connection-strict');
  const connectStatus = document.getElementById('connect-status');
  const lineageToggle = document.getElementById('lineage-toggle');
  const lineageFullAction = document.getElementById('lineage-full-action');
  const topbar = document.querySelector('.topbar');
  const titleHeading = document.querySelector('.title-block h1');
  const titleSubtitle = document.querySelector('.title-block span');
  const explorePanel = document.querySelector('.explore-panel');
  const sourceStrip = document.querySelector('.source-strip');
  const ctx = edgeCanvas.getContext('2d');
  const NODE_W = 174;
  const NODE_H = 54;
  const LINEAGE_NODE_W = 360;
  const TREE_GAP_X = 430;
  const ROW_GAP_Y = 42;
  const PARENT_TO_SELECTED_GAP_Y = 86;
  const SELECTED_TO_CHILD_GAP_Y = 132;
  const TREE_MARGIN = 180;
  const VIEW_MARGIN_X = 220;
  const VIEW_MARGIN_Y = 92;
  const MAX_COMPACT_VIEW_WIDTH = 1680;
  const COMPACT_DEPTH = 3;
  const PEEK_DEPTH = 1;
  const MORPH_DURATION_MS = 980;
  const INITIAL_PERSON_ID = 'younghyo_park';
  const HOME_URL = 'https://younghyopark.me/';
  const DEFAULT_TITLE = 'CSAIL Academic Genealogy';
  const DEFAULT_SUBTITLE = '2026-06-27 interactive HTML map';
  const EDGE_LABELS = new Map([
    ['18769->younghyo_park', 'SNU (Undergrad)'],
    ['238967->younghyo_park', 'MIT (PhD)']
  ]);
  let measureParts = null;

  const state = {
    data: null,
    nodesById: new Map(),
    slugById: new Map(),
    idBySlug: new Map(),
    nodeElements: new Map(),
    parentsById: new Map(),
    childrenById: new Map(),
    neighborsById: new Map(),
    edgeByNode: new Map(),
    edgeByPair: new Map(),
    interactionMode: 'find',
    selectedId: null,
    lineageMode: 'compact',
    connectionActiveSlot: 'from',
    connectionFromId: null,
    connectionToId: null,
    connectionStrictCommonAncestor: false,
    connectionPathIds: [],
    connectionEdgeIds: new Set(),
    scale: 1,
    x: 0,
    y: 0,
    minScale: 0.025,
    maxScale: 3.2,
    isDragging: false,
    dragMoved: false,
    pointerStart: null,
    lastPointer: null,
    searchMatches: new Set(),
    highlightedNodes: new Set(),
    relatedEdgeIds: new Set(),
    lineageEdgeIds: new Set(),
    contextEdgeIds: new Set(),
    lineageEdgeDepths: new Map(),
    lineageNodeDepths: new Map(),
    focusedNodeIds: null,
    focusedBounds: null,
    activePositions: new Map(),
    canvasWidth: 0,
    canvasHeight: 0,
    resizeFrame: 0,
    pendingViewportFit: false,
    nodeAnimations: new Set(),
    morphCleanup: null,
    dpr: window.devicePixelRatio || 1
  };

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function slugify(value) {
    return normalize(String(value || '').replace(/\([^)]*\)/g, ''))
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function displayNameForTitle(node) {
    return String((node && node.name) || '')
      .replace(/\s*\([^)]*\)\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function possessiveName(name) {
    return /s$/i.test(name) ? `${name}'` : `${name}'s`;
  }

  const COUNTRY_FLAGS = {
    Austria: '🇦🇹',
    Belgium: '🇧🇪',
    Canada: '🇨🇦',
    Czechia: '🇨🇿',
    Denmark: '🇩🇰',
    France: '🇫🇷',
    Germany: '🇩🇪',
    Hungary: '🇭🇺',
    Israel: '🇮🇱',
    Italy: '🇮🇹',
    Netherlands: '🇳🇱',
    Norway: '🇳🇴',
    Poland: '🇵🇱',
    Russia: '🇷🇺',
    Serbia: '🇷🇸',
    'South Korea': '🇰🇷',
    Sweden: '🇸🇪',
    Switzerland: '🇨🇭',
    Turkey: '🇹🇷',
    'United Kingdom': '🇬🇧',
    'United States': '🇺🇸'
  };

  const ACADEMIC_COUNTRY_RULES = [
    ['united states', /\b(mit|stanford|uc berkeley|harvard|cmu|princeton|columbia|cornell|caltech|cal tech|case western|michigan|penn|chicago|uw-madison|u\. washington|brown|nyu|uiuc|ucla|usc|wisconsin|jhu|purdue|minnesota|ohio state|florida|pitt|unc-chapel hill|clark|yale|iowa state|illinois)\b/],
    ['united kingdom', /\b(cambridge|oxford|edinburgh|king's college london|london)\b/],
    ['germany', /\b(wittenberg|gottingen|göttingen|leipzig|hu berlin|tubingen|tübingen|jena|heidelberg|munchen|münchen|bonn|konigsberg|königsberg|berlin|helmstedt|wurzburg|würzburg|erlangen|giessen|gießen|marburg|rostock|rwth aachen|tu darmstadt|tu munchen|tu münchen|karlsruhe|freiburg|ingolstadt|kiel)\b/],
    ['austria', /\b(wien|vienna)\b/],
    ['france', /\b(universite de paris|université de paris|paris|ecole normale|école normale|college de france|collège de france|ecole polytechnique|école polytechnique|faculte des sciences|faculté des sciences|jardin du roi|orsay|grenoble|inp grenoble|orleans|orléans)\b/],
    ['netherlands', /\b(leiden|utrecht|franeker|deventer)\b/],
    ['italy', /\b(padua|bologna|florence|rome|ferrara|pavia|pisa|politecnico di milano|accademia)\b/],
    ['switzerland', /\b(basel|eth zurich|eth zürich)\b/],
    ['sweden', /\buppsala\b/],
    ['israel', /\b(hebrew university|technion|tel aviv)\b/],
    ['canada', /\btoronto\b/],
    ['belgium', /\blouvain\b/],
    ['russia', /\b(moscow state|st\. petersburg|saint petersburg)\b/],
    ['denmark', /\bcopenhagen\b/],
    ['norway', /\b(oslo|christiania)\b/],
    ['poland', /\b(uniwersytet jagiellonski|uniwersytet warszawski)\b/],
    ['hungary', /\beotvos|eötvös\b/],
    ['turkey', /\bconstantinople\b/],
    ['czechia', /\bprague\b/],
    ['serbia', /\bserbian academy\b/],
    ['south korea', /\b(snu|seoul national)\b/]
  ];

  function countryDisplayName(countryKey) {
    return countryKey.replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function academicCountryForText(value) {
    const text = String(value || '').toLowerCase();
    const match = ACADEMIC_COUNTRY_RULES.find(([, pattern]) => pattern.test(text));
    return match ? countryDisplayName(match[0]) : null;
  }

  function academicCountriesForNode(node) {
    const detail = String((node && node.detail) || '');
    if (!detail || /^[?\s]+$/.test(detail) || /self-taught/i.test(detail)) {
      return [];
    }

    const seen = new Set();
    return detail.split(/\s*\/\s*/).reduce((countries, segment) => {
      const country = academicCountryForText(segment) || academicCountryForText(detail);
      if (country && !seen.has(country)) {
        seen.add(country);
        countries.push(country);
      }
      return countries;
    }, []);
  }

  function focusedTitle(node) {
    const name = displayNameForTitle(node);
    return name ? `${possessiveName(name)} Academic Genealogy` : DEFAULT_TITLE;
  }

  function topbarTitle(node, isFocusedTitle) {
    if (!compactViewport()) {
      return isFocusedTitle ? focusedTitle(node) : DEFAULT_TITLE;
    }

    if (isFocusedTitle) {
      const name = displayNameForTitle(node);
      return name ? `${possessiveName(name)} Genealogy` : 'Genealogy';
    }

    return 'CSAIL Genealogy';
  }

  function registerPersonSlug(slug, id) {
    if (slug && !state.idBySlug.has(slug)) {
      state.idBySlug.set(slug, id);
    }
  }

  function canonicalPathname() {
    const withoutIndex = window.location.pathname.replace(/\/index\.html$/, '');
    return withoutIndex.replace(/\/$/, '') || '/';
  }

  function personPath(id) {
    const slug = state.slugById.get(id) || slugify(id);
    return `${canonicalPathname()}?${encodeURIComponent(slug)}`;
  }

  function connectionPath(fromId, toId) {
    const fromSlug = state.slugById.get(fromId) || slugify(fromId);
    const toSlug = state.slugById.get(toId) || slugify(toId);
    return `${canonicalPathname()}?${encodeURIComponent(`${fromSlug}-and-${toSlug}`)}`;
  }

  function updateConnectionUrl(fromId, toId, replace) {
    if (!window.history || !state.nodesById.has(fromId) || !state.nodesById.has(toId)) {
      return;
    }
    const nextPath = connectionPath(fromId, toId);
    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (nextPath === currentPath) {
      return;
    }
    const action = replace ? 'replaceState' : 'pushState';
    window.history[action]({ connectionFromId: fromId, connectionToId: toId }, '', nextPath);
  }

  function updatePersonUrl(id, replace) {
    if (!window.history || !state.nodesById.has(id)) {
      return;
    }
    const nextPath = personPath(id);
    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (nextPath === currentPath) {
      return;
    }
    const action = replace ? 'replaceState' : 'pushState';
    window.history[action]({ personId: id }, '', nextPath);
  }

  function updateBaseUrl(replace) {
    if (!window.history) {
      return;
    }
    const nextPath = canonicalPathname();
    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (nextPath === currentPath) {
      return;
    }
    const action = replace ? 'replaceState' : 'pushState';
    window.history[action]({}, '', nextPath);
  }

  function requestedQueryValue() {
    const rawQuery = window.location.search.replace(/^\?/, '').split('&')[0];
    if (!rawQuery) {
      return null;
    }

    let rawValue = rawQuery;
    try {
      rawValue = decodeURIComponent(rawQuery.replace(/\+/g, ' '));
    } catch (error) {
      rawValue = rawQuery;
    }

    return rawValue;
  }

  function resolvePersonQueryValue(value) {
    if (state.nodesById.has(value)) {
      return value;
    }
    return state.idBySlug.get(slugify(value)) || null;
  }

  function requestedConnectionIds() {
    const rawValue = requestedQueryValue();
    if (!rawValue) {
      return null;
    }

    const explicitMatch = rawValue.match(/^(?:connect|connection|path|between)=(.+)$/);
    const value = explicitMatch ? explicitMatch[1] : rawValue;
    const normalized = slugify(value);
    const parts = normalized.split('-and-');
    if (parts.length < 2) {
      return null;
    }

    for (let index = 1; index < parts.length; index += 1) {
      const fromId = resolvePersonQueryValue(parts.slice(0, index).join('-and-'));
      const toId = resolvePersonQueryValue(parts.slice(index).join('-and-'));
      if (fromId && toId) {
        return { fromId, toId };
      }
    }

    return null;
  }

  function requestedPersonId() {
    const rawValue = requestedQueryValue();
    if (!rawValue) {
      return null;
    }

    const explicitMatch = rawValue.match(/^(?:person|id|name)=(.+)$/);
    const value = explicitMatch ? explicitMatch[1] : rawValue;
    return resolvePersonQueryValue(value);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function reducedMotion() {
    return window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function compactViewport() {
    return window.matchMedia &&
      window.matchMedia('(max-width: 560px)').matches;
  }

  function mobileControlsOpen() {
    return Boolean(appShell && appShell.classList.contains('is-controls-open'));
  }

  function updateMobileControlToggle() {
    if (!exploreToggleLabel || !exploreToggleDetail) {
      return;
    }

    if (state.interactionMode === 'connect') {
      exploreToggleLabel.textContent = 'Controls';
      exploreToggleDetail.textContent = state.connectionPathIds.length > 1
        ? 'Connection'
        : 'Connect';
      return;
    }

    exploreToggleLabel.textContent = 'Controls';
    exploreToggleDetail.textContent = state.selectedId
      ? 'Person'
      : 'Search';
  }

  function setMobileControlsOpen(open, options) {
    if (!appShell || !exploreToggle) {
      return;
    }

    const shouldOpen = Boolean(open);
    appShell.classList.toggle('is-controls-open', shouldOpen);
    exploreToggle.setAttribute('aria-expanded', String(shouldOpen));
    exploreToggle.setAttribute('aria-label', shouldOpen ? 'Close controls' : 'Open controls');
    if (!shouldOpen) {
      hideAllSearchResults();
      if (!options || options.blur !== false) {
        [searchInput, connectFromInput, connectToInput].forEach((input) => {
          if (input && document.activeElement === input) {
            input.blur();
          }
        });
      }
    }
    scheduleViewportFit();
  }

  function foldMobileControls(options) {
    if (compactViewport()) {
      setMobileControlsOpen(false, options);
    }
  }

  function openMobileControls(options) {
    if (!compactViewport()) {
      return;
    }

    setMobileControlsOpen(true, { blur: false });
    if (options && options.focus === false) {
      return;
    }

    window.setTimeout(() => {
      if (state.interactionMode === 'connect') {
        connectionInput(state.connectionActiveSlot).focus();
      } else {
        searchInput.focus();
      }
    }, 0);
  }

  function lineageLayoutMetrics() {
    if (!compactViewport()) {
      return {
        lineageNodeW: LINEAGE_NODE_W,
        treeGapX: TREE_GAP_X,
        rowGapY: ROW_GAP_Y,
        parentToSelectedGapY: PARENT_TO_SELECTED_GAP_Y,
        selectedToChildGapY: SELECTED_TO_CHILD_GAP_Y,
        treeMargin: TREE_MARGIN,
        viewMarginX: VIEW_MARGIN_X,
        viewMarginY: VIEW_MARGIN_Y,
        maxCompactViewWidth: MAX_COMPACT_VIEW_WIDTH,
        minViewWidth: 900,
        minWorldWidth: 900,
        minWorldHeight: 520
      };
    }

    return {
      lineageNodeW: 250,
      treeGapX: 270,
      rowGapY: 22,
      parentToSelectedGapY: 50,
      selectedToChildGapY: 62,
      treeMargin: 72,
      viewMarginX: 18,
      viewMarginY: 34,
      maxCompactViewWidth: 560,
      minViewWidth: 520,
      minWorldWidth: 580,
      minWorldHeight: 400
    };
  }

  function cancelMorphAnimation() {
    state.nodeAnimations.forEach((animation) => animation.cancel());
    state.nodeAnimations.clear();
    if (state.morphCleanup) {
      const cleanup = state.morphCleanup;
      state.morphCleanup = null;
      cleanup();
    }
    graphHost.classList.remove('is-morphing');
    state.nodeElements.forEach((element) => {
      element.classList.remove('is-morph-leaving');
      element.style.transformOrigin = '';
      element.style.willChange = '';
    });
  }

  function hasActiveMorph() {
    return Boolean(state.morphCleanup || state.nodeAnimations.size);
  }

  function flushPendingViewportFit() {
    if (!state.pendingViewportFit || state.resizeFrame || hasActiveMorph()) {
      return;
    }
    scheduleViewportFit();
  }

  function roleLabel(role) {
    if (role === 'current') {
      return 'Current CSAIL PI';
    }
    if (role === 'former') {
      return 'Former CSAIL / LCS / AI PI';
    }
    if (role === 'notable') {
      return 'Highlighted non-CSAIL name';
    }
    return 'Academic genealogy entry';
  }

  function currentBounds() {
    return state.focusedBounds || state.data.bounds;
  }

  function nodeBox(id) {
    return state.activePositions.get(id) || state.nodesById.get(id);
  }

  function setWorldBounds(bounds) {
    mapWorld.style.width = `${bounds.width}px`;
    mapWorld.style.height = `${bounds.height}px`;
    nodeLayer.style.width = `${bounds.width}px`;
    nodeLayer.style.height = `${bounds.height}px`;
  }

  function worldToScreen(x, y) {
    return {
      x: state.x + x * state.scale,
      y: state.y + y * state.scale
    };
  }

  function applyTransform() {
    mapWorld.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
    mapWorld.style.setProperty('--inverse-scale', 1 / state.scale);
    renderEdges();
  }

  function resizeCanvas() {
    const box = stage.getBoundingClientRect();
    state.canvasWidth = box.width;
    state.canvasHeight = box.height;
    state.dpr = window.devicePixelRatio || 1;
    edgeCanvas.width = Math.round(box.width * state.dpr);
    edgeCanvas.height = Math.round(box.height * state.dpr);
    edgeCanvas.style.width = `${box.width}px`;
    edgeCanvas.style.height = `${box.height}px`;
    renderEdges();
  }

  function edgeCurve(edge) {
    const source = nodeBox(edge.source);
    const target = nodeBox(edge.target);
    const x1 = source.x + source.w / 2;
    const y1 = source.y + source.h;
    const x2 = target.x + target.w / 2;
    const y2 = target.y;
    const dy = y2 - y1;
    const bend = Math.max(70, Math.abs(dy) * 0.42) * (dy < 0 ? -1 : 1);

    return {
      p1: worldToScreen(x1, y1),
      c1: worldToScreen(x1, y1 + bend),
      c2: worldToScreen(x2, y2 - bend),
      p2: worldToScreen(x2, y2)
    };
  }

  function curveInView(curve) {
    const xs = [curve.p1.x, curve.c1.x, curve.c2.x, curve.p2.x];
    const ys = [curve.p1.y, curve.c1.y, curve.c2.y, curve.p2.y];
    const pad = 60;
    return Math.max(...xs) >= -pad &&
      Math.min(...xs) <= state.canvasWidth + pad &&
      Math.max(...ys) >= -pad &&
      Math.min(...ys) <= state.canvasHeight + pad;
  }

  function drawArrow(curve, color, size) {
    const angle = Math.atan2(curve.p2.y - curve.c2.y, curve.p2.x - curve.c2.x);
    const left = angle + Math.PI * 0.78;
    const right = angle - Math.PI * 0.78;

    ctx.beginPath();
    ctx.moveTo(curve.p2.x, curve.p2.y);
    ctx.lineTo(curve.p2.x + Math.cos(left) * size, curve.p2.y + Math.sin(left) * size);
    ctx.lineTo(curve.p2.x + Math.cos(right) * size, curve.p2.y + Math.sin(right) * size);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawEdgeLabel(edge, curve) {
    if (!state.focusedNodeIds || state.selectedId !== INITIAL_PERSON_ID || state.lineageMode === 'full') {
      return;
    }

    const label = EDGE_LABELS.get(`${edge.source}->${edge.target}`);
    if (!label) {
      return;
    }

    const source = nodeBox(edge.source);
    const target = nodeBox(edge.target);
    const sourceBottom = worldToScreen(source.x + source.w / 2, source.y + source.h);
    const targetTop = worldToScreen(target.x + target.w / 2, target.y);
    const point = {
      x: (sourceBottom.x + targetTop.x) / 2,
      y: (sourceBottom.y + targetTop.y) / 2
    };
    const side = source.x + source.w / 2 < target.x + target.w / 2 ? -1 : 1;
    const textSize = 12;
    const padX = 8;
    const padY = 5;
    const offsetX = side * 48;
    const offsetY = -2;

    ctx.save();
    ctx.font = `700 ${textSize}px Lato, Verdana, Helvetica, sans-serif`;
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(label).width;
    const labelWidth = textWidth + padX * 2;
    const labelHeight = textSize + padY * 2;
    const x = point.x + offsetX - labelWidth / 2;
    const y = point.y + offsetY - labelHeight / 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = 'rgba(23, 114, 208, 0.52)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, labelWidth, labelHeight, 7);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#145ca6';
    ctx.fillText(label, x + padX, y + labelHeight / 2);
    ctx.restore();
  }

  function drawEdge(edge, style) {
    const curve = edgeCurve(edge);
    if (!curveInView(curve)) {
      return;
    }

    ctx.beginPath();
    ctx.moveTo(curve.p1.x, curve.p1.y);
    ctx.bezierCurveTo(curve.c1.x, curve.c1.y, curve.c2.x, curve.c2.y, curve.p2.x, curve.p2.y);
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;
    ctx.stroke();

    if (style.arrow) {
      drawArrow(curve, style.color, style.arrowSize);
    }

    drawEdgeLabel(edge, curve);
  }

  function renderEdges() {
    if (!state.data) {
      return;
    }

    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);

    const filtered = state.selectedId ||
      state.searchMatches.size > 0 ||
      state.connectionFromId ||
      state.connectionToId ||
      state.connectionPathIds.length > 0;
    const base = filtered
      ? { color: 'rgba(50, 46, 40, 0.025)', width: 0.65, arrow: false, arrowSize: 0 }
      : { color: 'rgba(50, 46, 40, 0.18)', width: 0.9, arrow: state.scale > 0.16, arrowSize: 4.8 };
    const related = { color: '#1772d0', width: 2.2, arrow: true, arrowSize: 7 };
    const contextEdge = { color: 'rgba(76, 110, 245, 0.13)', width: 1, arrow: false, arrowSize: 0 };
    const connectionEdge = { color: '#2b8a3e', width: 3, arrow: true, arrowSize: 7.5 };

    function lineageStyle(edge) {
      const depth = state.lineageEdgeDepths.get(edge.id) || 1;
      const source = nodeBox(edge.source);
      const target = nodeBox(edge.target);
      const span = Math.abs(target.y - source.y);
      const muted = state.lineageMode === 'compact' && depth > COMPACT_DEPTH;

      if (muted) {
        return { color: 'rgba(76, 110, 245, 0.16)', width: 0.9, arrow: false, arrowSize: 0 };
      }

      if (depth === 1) {
        return { color: '#1772d0', width: 2.7, arrow: true, arrowSize: 7 };
      }
      if (depth <= 5 && span < 800) {
        return { color: 'rgba(76, 110, 245, 0.7)', width: 1.8, arrow: state.scale > 0.16, arrowSize: 6 };
      }

      const alpha = span > 1600 ? 0.13 : depth > 18 ? 0.18 : depth > 9 ? 0.26 : 0.38;
      const width = span > 1600 ? 0.85 : depth > 9 ? 1.05 : 1.25;
      return { color: `rgba(76, 110, 245, ${alpha})`, width, arrow: false, arrowSize: 0 };
    }

    if (state.focusedNodeIds) {
      if (state.connectionPathIds.length) {
        state.data.edges.forEach((edge) => {
          if (state.connectionEdgeIds.has(edge.id)) {
            drawEdge(edge, connectionEdge);
          }
        });
        return;
      }

      state.data.edges.forEach((edge) => {
        if (state.contextEdgeIds.has(edge.id) && !state.lineageEdgeIds.has(edge.id)) {
          drawEdge(edge, contextEdge);
        }
      });
      state.data.edges.forEach((edge) => {
        if (state.lineageEdgeIds.has(edge.id)) {
          drawEdge(edge, lineageStyle(edge));
        }
      });
      return;
    }

    state.data.edges.forEach((edge) => {
      if (!state.relatedEdgeIds.has(edge.id) && !state.lineageEdgeIds.has(edge.id)) {
        drawEdge(edge, base);
      }
    });
    state.data.edges.forEach((edge) => {
      if (state.relatedEdgeIds.has(edge.id) && !state.lineageEdgeIds.has(edge.id)) {
        drawEdge(edge, related);
      }
    });
    state.data.edges.forEach((edge) => {
      if (state.lineageEdgeIds.has(edge.id)) {
        drawEdge(edge, lineageStyle(edge));
      }
    });
  }

  function visibleFrame() {
    const stageBox = stage.getBoundingClientRect();
    const pad = stageBox.width < 560 ? 12 : 18;
    let left = pad;
    let right = stageBox.width - pad;
    let top = frameTopWithChrome(stageBox, pad);
    let bottom = stageBox.height - pad;

    if (sourceStrip) {
      const box = sourceStrip.getBoundingClientRect();
      if (box.width > 0 && box.height > 0) {
        bottom = Math.min(bottom, box.top - stageBox.top - pad);
      }
    }

    if (right - left < 260) {
      left = pad / 2;
      right = stageBox.width - pad / 2;
    }

    if (bottom - top < 260) {
      bottom = stageBox.height - pad;
      if (bottom - top < 180) {
        top = pad;
      }
    }

    return {
      x: left,
      y: top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top)
    };
  }

  function fitTransformForBounds(bounds) {
    const frame = visibleFrame();
    const boundsX = bounds.x || 0;
    const boundsY = bounds.y || 0;
    const nextScale = Math.min(frame.width / bounds.width, frame.height / bounds.height) * (compactViewport() ? 0.98 : 0.92);
    const scale = clamp(nextScale, state.minScale, state.maxScale);
    return {
      scale,
      x: frame.x + (frame.width - bounds.width * scale) / 2 - boundsX * scale,
      y: frame.y + (frame.height - bounds.height * scale) / 2 - boundsY * scale
    };
  }

  function visibleElementBottom(element, stageBox, pad) {
    if (!element) {
      return null;
    }

    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) {
      return null;
    }

    const box = element.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0) {
      return null;
    }

    return box.bottom - stageBox.top + pad;
  }

  function frameTopWithChrome(stageBox, pad) {
    let top = pad;
    [topbar, mobileConnectionTitle].forEach((element) => {
      const bottom = visibleElementBottom(element, stageBox, pad);
      if (bottom !== null) {
        top = Math.max(top, bottom);
      }
    });
    return top;
  }

  function leftOfControlFrame(stageBox, pad) {
    if (compactViewport()) {
      return null;
    }

    const top = frameTopWithChrome(stageBox, pad);
    let right = stageBox.width - pad;
    [explorePanel, sourceStrip].forEach((element) => {
      if (!element) {
        return;
      }
      const box = element.getBoundingClientRect();
      if (box.width <= 0 || box.height <= 0) {
        return;
      }
      const localLeft = box.left - stageBox.left;
      if (localLeft > stageBox.width * 0.45) {
        right = Math.min(right, localLeft - pad);
      }
    });

    if (right - pad < 420) {
      return null;
    }

    return {
      x: pad,
      y: top,
      width: right - pad,
      height: Math.max(1, stageBox.height - top - pad)
    };
  }

  function fullConnectionFrame(stageBox, pad) {
    const top = frameTopWithChrome(stageBox, pad);
    return {
      x: pad,
      y: top,
      width: Math.max(1, stageBox.width - pad * 2),
      height: Math.max(1, stageBox.height - top - pad)
    };
  }

  function localElementRect(element, stageBox, pad) {
    if (!element) {
      return null;
    }

    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) {
      return null;
    }

    const box = element.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0) {
      return null;
    }

    return {
      x: box.left - stageBox.left - pad,
      y: box.top - stageBox.top - pad,
      width: box.width + pad * 2,
      height: box.height + pad * 2
    };
  }

  function connectionObstacleRects(stageBox, pad) {
    return [explorePanel, sourceStrip]
      .map((element) => localElementRect(element, stageBox, pad))
      .filter(Boolean);
  }

  function rectOverlapArea(a, b) {
    const left = Math.max(a.x, b.x);
    const right = Math.min(a.x + a.width, b.x + b.width);
    const top = Math.max(a.y, b.y);
    const bottom = Math.min(a.y + a.height, b.y + b.height);
    if (right <= left || bottom <= top) {
      return 0;
    }
    return (right - left) * (bottom - top);
  }

  function totalOverlapArea(rect, obstacles) {
    return obstacles.reduce((sum, obstacle) => {
      return sum + rectOverlapArea(rect, obstacle);
    }, 0);
  }

  function viewportTransformOnly(transform) {
    return {
      scale: transform.scale,
      x: transform.x,
      y: transform.y
    };
  }

  function transformForFrame(bounds, frame, paddingFactor, options) {
    const boundsX = bounds.x || 0;
    const boundsY = bounds.y || 0;
    const nextScale = Math.min(frame.width / bounds.width, frame.height / bounds.height) * paddingFactor;
    const scale = clamp(nextScale, state.minScale, state.maxScale);
    const screenWidth = bounds.width * scale;
    const screenHeight = bounds.height * scale;
    const minCenterX = frame.x + screenWidth / 2;
    const maxCenterX = frame.x + frame.width - screenWidth / 2;
    const minCenterY = frame.y + screenHeight / 2;
    const maxCenterY = frame.y + frame.height - screenHeight / 2;
    const preferredCenterX = options && Number.isFinite(options.preferredCenterX)
      ? options.preferredCenterX
      : frame.x + frame.width / 2;
    const preferredCenterY = options && Number.isFinite(options.preferredCenterY)
      ? options.preferredCenterY
      : frame.y + frame.height / 2;
    const centerX = minCenterX <= maxCenterX
      ? clamp(preferredCenterX, minCenterX, maxCenterX)
      : frame.x + frame.width / 2;
    const centerY = minCenterY <= maxCenterY
      ? clamp(preferredCenterY, minCenterY, maxCenterY)
      : frame.y + frame.height / 2;
    const x = centerX - (boundsX + bounds.width / 2) * scale;
    const y = centerY - (boundsY + bounds.height / 2) * scale;
    return {
      scale,
      x,
      y,
      screenRect: {
        x: x + boundsX * scale,
        y: y + boundsY * scale,
        width: screenWidth,
        height: screenHeight
      }
    };
  }

  function readableConnectionTransformForBounds(bounds) {
    const stageBox = stage.getBoundingClientRect();
    const pad = stageBox.width < 560 ? 12 : 18;
    const paddingFactor = compactViewport() ? 0.99 : 0.98;
    const preferredCenterX = stageBox.width / 2;
    const safeFrame = visibleFrame();
    const centeredFrame = fullConnectionFrame(stageBox, pad);
    const centeredTransform = transformForFrame(bounds, centeredFrame, paddingFactor, {
      preferredCenterX
    });
    const obstacles = connectionObstacleRects(stageBox, pad);

    if (totalOverlapArea(centeredTransform.screenRect, obstacles) < 1) {
      return viewportTransformOnly(centeredTransform);
    }

    const safeTransform = transformForFrame(bounds, safeFrame, paddingFactor, {
      preferredCenterX
    });
    const sideFrame = leftOfControlFrame(stageBox, pad);

    if (sideFrame) {
      const sideTransform = transformForFrame(bounds, sideFrame, paddingFactor, {
        preferredCenterX
      });
      const sideOverlap = totalOverlapArea(sideTransform.screenRect, obstacles);
      const meaningfulScaleGain = sideTransform.scale >= safeTransform.scale * 1.07;
      if (sideOverlap < 1 && meaningfulScaleGain) {
        return viewportTransformOnly(sideTransform);
      }
    }

    return viewportTransformOnly(safeTransform);
  }

  function applyViewportTransform(transform) {
    state.scale = transform.scale;
    state.x = transform.x;
    state.y = transform.y;
    applyTransform();
  }

  function fitGraph() {
    if (!state.data) {
      return;
    }

    cancelMorphAnimation();
    applyViewportTransform(fitTransformForBounds(currentBounds()));
  }

  function centerOnPerson(id, zoomFloor) {
    const node = nodeBox(id);
    if (!node) {
      return;
    }

    const frame = visibleFrame();
    const targetScale = clamp(Math.max(state.scale, zoomFloor || 0.72), state.minScale, state.maxScale);
    cancelMorphAnimation();
    applyViewportTransform({
      scale: targetScale,
      x: frame.x + frame.width / 2 - (node.x + node.w / 2) * targetScale,
      y: frame.y + frame.height / 2 - (node.y + node.h / 2) * targetScale
    });
  }

  function zoomBy(factor, anchorX, anchorY) {
    cancelMorphAnimation();
    const stageBox = stage.getBoundingClientRect();
    const frame = visibleFrame();
    const localX = anchorX == null ? frame.x + frame.width / 2 : anchorX - stageBox.left;
    const localY = anchorY == null ? frame.y + frame.height / 2 : anchorY - stageBox.top;
    const graphX = (localX - state.x) / state.scale;
    const graphY = (localY - state.y) / state.scale;
    const nextScale = clamp(state.scale * factor, state.minScale, state.maxScale);

    state.x = localX - graphX * nextScale;
    state.y = localY - graphY * nextScale;
    state.scale = nextScale;
    applyTransform();
  }

  function setNodeDetailContent(element, node) {
    const detailText = document.createElement('span');

    detailText.className = 'node-detail-text';
    detailText.textContent = node.detail || node.id;
    element.replaceChildren(detailText);
  }

  function setNodeCountryFlag(element, node) {
    const countries = node.academicCountries || academicCountriesForNode(node);

    if (!countries.length) {
      element.hidden = true;
      return;
    }

    element.hidden = false;
    element.title = `Academic country: ${countries.join(', ')}`;
    element.setAttribute('aria-label', element.title);
    element.textContent = countries
      .slice(0, 2)
      .map((country) => COUNTRY_FLAGS[country] || country)
      .join('');
  }

  function createNodeElement(node) {
    const card = document.createElement('div');
    const name = document.createElement('span');
    const detail = document.createElement('span');
    const country = document.createElement('span');
    const thesis = node.thesisUrl ? document.createElement('a') : document.createElement('span');

    card.className = 'person-node';
    card.tabIndex = 0;
    card.dataset.personId = node.id;
    card.dataset.role = node.role;
    card.style.left = `${node.x}px`;
    card.style.top = `${node.y}px`;
    card.style.width = `${node.w}px`;
    card.style.height = `${node.h}px`;
    card.setAttribute(
      'aria-label',
      `${node.name}${node.detail ? `, ${node.detail}` : ''}${node.thesisTitle ? `, dissertation: ${node.thesisTitle}` : ''}`
    );

    name.className = 'node-name';
    name.textContent = node.name;
    detail.className = 'node-detail';
    setNodeDetailContent(detail, node);
    country.className = 'node-country-flag';
    setNodeCountryFlag(country, node);
    thesis.className = 'node-thesis';
    thesis.textContent = node.thesisTitle || '';
    if (node.thesisUrl) {
      thesis.href = node.thesisUrl;
      thesis.target = '_blank';
      thesis.rel = 'noreferrer';
      thesis.setAttribute('aria-label', `Open thesis PDF: ${node.thesisTitle}`);
      thesis.addEventListener('click', (event) => {
        event.stopPropagation();
      });
      thesis.addEventListener('keydown', (event) => {
        event.stopPropagation();
      });
    }

    card.append(name, detail, thesis, country);
    card.addEventListener('click', () => {
      activatePersonFromGraph(node.id);
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activatePersonFromGraph(node.id);
      }
    });

    return card;
  }

  function ensureMeasureParts() {
    if (measureParts) {
      return measureParts;
    }

    const button = document.createElement('button');
    const name = document.createElement('span');
    const detail = document.createElement('span');
    const country = document.createElement('span');
    const thesis = document.createElement('span');

    button.type = 'button';
    button.className = 'person-node';
    button.tabIndex = -1;
    button.setAttribute('aria-hidden', 'true');
    button.style.position = 'fixed';
    button.style.left = '-10000px';
    button.style.top = '0';
    button.style.visibility = 'hidden';
    button.style.pointerEvents = 'none';
    button.style.height = 'auto';

    name.className = 'node-name';
    detail.className = 'node-detail';
    country.className = 'node-country-flag';
    thesis.className = 'node-thesis';
    button.append(name, detail, thesis, country);
    document.body.appendChild(button);

    measureParts = { button, name, detail, country, thesis };
    return measureParts;
  }

  function measureNodeHeight(node, width, isLineageCard, showsThesis) {
    const parts = ensureMeasureParts();
    parts.button.dataset.role = node.role;
    parts.button.style.width = `${width}px`;
    parts.button.style.height = 'auto';
    parts.button.classList.toggle('is-lineage-card', isLineageCard);
    parts.button.classList.toggle('shows-thesis', showsThesis);
    parts.name.textContent = node.name;
    setNodeDetailContent(parts.detail, node);
    setNodeCountryFlag(parts.country, node);
    parts.thesis.textContent = node.thesisTitle || '';
    return Math.ceil(parts.button.getBoundingClientRect().height);
  }

  function buildIndexes() {
    const slugCounts = new Map();

    state.data.nodes.forEach((node) => {
      const baseSlug = slugify(node.name) || slugify(node.id);
      slugCounts.set(baseSlug, (slugCounts.get(baseSlug) || 0) + 1);
    });

    state.data.nodes.forEach((node) => {
      const baseSlug = slugify(node.name) || slugify(node.id);
      const idSlug = slugify(node.id);
      const detailSlug = slugify(`${node.name} ${node.detail}`);
      const canonicalSlug = slugCounts.get(baseSlug) > 1 && idSlug && idSlug !== baseSlug
        ? `${baseSlug}-${idSlug}`
        : baseSlug;

      node.academicCountries = academicCountriesForNode(node);
      node.searchText = normalize(`${node.name} ${node.detail} ${(node.academicCountries || []).join(' ')} ${node.thesisTitle || ''} ${roleLabel(node.role)} ${node.id}`);
      state.nodesById.set(node.id, node);
      state.slugById.set(node.id, canonicalSlug);
      state.parentsById.set(node.id, new Set());
      state.childrenById.set(node.id, new Set());
      state.neighborsById.set(node.id, new Set());
      state.edgeByNode.set(node.id, new Set());

      state.idBySlug.set(canonicalSlug, node.id);
      registerPersonSlug(idSlug, node.id);
      registerPersonSlug(detailSlug, node.id);
      if (slugCounts.get(baseSlug) === 1) {
        registerPersonSlug(baseSlug, node.id);
      }
    });

    state.data.edges.forEach((edge) => {
      state.parentsById.get(edge.target).add(edge.source);
      state.childrenById.get(edge.source).add(edge.target);
      state.neighborsById.get(edge.source).add(edge.target);
      state.neighborsById.get(edge.target).add(edge.source);
      state.edgeByNode.get(edge.source).add(edge);
      state.edgeByNode.get(edge.target).add(edge);
      state.edgeByPair.set(`${edge.source}->${edge.target}`, edge);
    });
  }

  function renderNodes() {
    const fragment = document.createDocumentFragment();
    state.data.nodes.forEach((node) => {
      const element = createNodeElement(node);
      state.nodeElements.set(node.id, element);
      fragment.appendChild(element);
    });
    nodeLayer.replaceChildren(fragment);
  }

  function setNodeElementBox(element, box) {
    element.style.left = `${box.x}px`;
    element.style.top = `${box.y}px`;
    element.style.width = `${box.w}px`;
    element.style.height = `${box.h}px`;
  }

  function applyNodeLayoutClasses(element, node, box, visibleIds, contextIds, forceVisible) {
    element.classList.toggle('is-hidden', !forceVisible && Boolean(visibleIds && !visibleIds.has(node.id)));
    element.classList.toggle('is-context', Boolean(contextIds && contextIds.has(node.id)));
    element.classList.toggle('is-lineage-card', Boolean(box.isLineageCard));
    element.classList.toggle('shows-thesis', Boolean(box.showsThesis));
  }

  function isVisibleInLayout(id, visibleIds) {
    return !visibleIds || visibleIds.has(id);
  }

  function visibleIdsForLayout(visibleIds) {
    if (visibleIds) {
      return new Set(visibleIds);
    }
    return new Set(state.data.nodes.map((node) => node.id));
  }

  function captureNodeRects(ids) {
    const rects = new Map();
    ids.forEach((id) => {
      const element = state.nodeElements.get(id);
      if (!element || element.classList.contains('is-hidden')) {
        return;
      }

      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        rects.set(id, rect);
      }
    });
    return rects;
  }

  function animateNodeFromRect(element, fromRect, toRect, options) {
    if (!element.animate) {
      return null;
    }

    const shouldFade = Boolean(options && (options.entering || options.leaving));
    const parentScale = state.scale || 1;
    const dx = (fromRect.left - toRect.left) / parentScale;
    const dy = (fromRect.top - toRect.top) / parentScale;
    const sx = toRect.width ? fromRect.width / toRect.width : 1;
    const sy = toRect.height ? fromRect.height / toRect.height : 1;
    const parsedOpacity = parseFloat(window.getComputedStyle(element).opacity);
    const targetOpacity = Number.isNaN(parsedOpacity) ? 1 : parsedOpacity;
    const fromOpacity = options && options.entering ? 0 : targetOpacity;
    const toOpacity = options && options.leaving ? 0 : targetOpacity;
    const springTransform = (distance) => {
      return `translate(${dx * distance}px, ${dy * distance}px) scale(${1 + (sx - 1) * distance}, ${1 + (sy - 1) * distance})`;
    };
    const keyframes = [
      {
        transform: springTransform(1),
        easing: 'cubic-bezier(0.18, 0.86, 0.22, 1)'
      },
      {
        transform: springTransform(0)
      }
    ];

    if (shouldFade) {
      keyframes[0].opacity = fromOpacity;
      keyframes[1].opacity = toOpacity;
    }

    element.style.transformOrigin = 'top left';
    element.style.willChange = shouldFade ? 'transform, opacity' : 'transform';

    return element.animate(
      keyframes,
      {
        duration: MORPH_DURATION_MS,
        fill: 'both'
      }
    );
  }

  function applyNodeLayout(positions, visibleIds, bounds, fitBounds, contextIds, options) {
    const targetBounds = bounds || state.data.bounds;
    const targetFitBounds = fitBounds || targetBounds;
    const targetTransform = options && options.transformForBounds
      ? options.transformForBounds(targetFitBounds)
      : fitTransformForBounds(targetFitBounds);
    const shouldAnimate = Boolean(options && options.animate) &&
      !reducedMotion() &&
      state.nodeElements.size > 0;
    const oldVisibleIds = state.focusedNodeIds;
    const oldLayoutIds = visibleIdsForLayout(oldVisibleIds);
    const nextLayoutIds = visibleIdsForLayout(visibleIds);
    const animatedIds = new Set([...oldLayoutIds, ...nextLayoutIds]);
    const oldRects = shouldAnimate ? captureNodeRects(animatedIds) : new Map();

    cancelMorphAnimation();

    state.focusedNodeIds = visibleIds;
    state.focusedBounds = targetFitBounds;
    setWorldBounds(targetBounds);
    state.activePositions = positions;

    state.data.nodes.forEach((node) => {
      const element = state.nodeElements.get(node.id);
      const wasVisible = isVisibleInLayout(node.id, oldVisibleIds);
      const willBeVisible = isVisibleInLayout(node.id, visibleIds);
      const shouldKeepVisible = shouldAnimate && (wasVisible || willBeVisible);
      const targetBox = positions.get(node.id) || node;

      applyNodeLayoutClasses(element, node, targetBox, visibleIds, contextIds, shouldKeepVisible);
      element.classList.toggle('is-morph-leaving', false);
      setNodeElementBox(element, targetBox);
    });

    applyViewportTransform(targetTransform);

    if (!shouldAnimate || !oldRects.size) {
      return;
    }

    const finalRects = captureNodeRects(animatedIds);
    const animations = [];
    const finalizeMorph = () => {
      state.data.nodes.forEach((node) => {
        const element = state.nodeElements.get(node.id);
        const box = positions.get(node.id) || node;
        element.classList.remove('is-morph-leaving');
        element.style.transformOrigin = '';
        element.style.willChange = '';
        applyNodeLayoutClasses(element, node, box, visibleIds, contextIds);
        setNodeElementBox(element, box);
      });
      graphHost.classList.remove('is-morphing');
      flushPendingViewportFit();
    };

    graphHost.classList.add('is-morphing');
    state.morphCleanup = finalizeMorph;

    animatedIds.forEach((id) => {
      const element = state.nodeElements.get(id);
      const finalRect = finalRects.get(id);
      if (!element || !finalRect) {
        return;
      }

      const wasVisible = isVisibleInLayout(id, oldVisibleIds);
      const willBeVisible = isVisibleInLayout(id, visibleIds);
      const oldRect = oldRects.get(id) || finalRect;
      const animation = animateNodeFromRect(element, oldRect, finalRect, {
        entering: !wasVisible && willBeVisible,
        leaving: wasVisible && !willBeVisible
      });
      if (!animation) {
        return;
      }

      if (wasVisible && !willBeVisible) {
        element.classList.add('is-morph-leaving');
      }
      state.nodeAnimations.add(animation);
      animations.push(animation);
    });

    Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (state.morphCleanup !== finalizeMorph) {
        return;
      }
      state.nodeAnimations.forEach((animation) => animation.cancel());
      state.nodeAnimations.clear();
      state.morphCleanup = null;
      finalizeMorph();
    });
  }

  function restoreGlobalLayout(options) {
    state.contextEdgeIds.clear();
    applyNodeLayout(new Map(), null, state.data.bounds, state.data.bounds, null, options);
    hideLineageActions();
  }

  function activateFocusedTree(startId, options) {
    const lineage = collectFocusedLineage(startId);
    const layout = buildLineageLayout(lineage);
    const visibleIds = new Set(layout.rows.flatMap((row) => row.ids));
    const positions = new Map();
    state.contextEdgeIds = new Set(layout.contextEdgeIds);

    layout.rows.forEach((row) => {
      row.items.forEach((item) => {
        const original = state.nodesById.get(item.id);
        positions.set(item.id, {
          ...original,
          x: Math.round(layout.centerX + item.slot * layout.treeGapX - item.width / 2),
          y: Math.round(row.y),
          w: item.width,
          h: item.height,
          isLineageCard: item.isLineageCard,
          showsThesis: item.showsThesis
        });
      });
    });

    const fitBounds = state.lineageMode === 'full' ? layout.worldBounds : layout.viewBounds;
    applyNodeLayout(positions, visibleIds, layout.worldBounds, fitBounds, layout.contextIds, options);
    updateLineageActions(lineage, layout);
  }

  function branchContext(lineageIds, allLineageIds) {
    const lineageSet = new Set(lineageIds);
    const seen = new Set();
    const ids = [];
    const edgeIds = [];

    lineageIds.forEach((id) => {
      (state.parentsById.get(id) || new Set()).forEach((parentId) => {
        (state.childrenById.get(parentId) || new Set()).forEach((childId) => {
          if (lineageSet.has(childId) || allLineageIds.has(childId) || seen.has(childId)) {
            return;
          }

          const edge = state.edgeByPair.get(`${parentId}->${childId}`);
          seen.add(childId);
          ids.push(childId);
          if (edge) {
            edgeIds.push(edge.id);
          }
        });
      });
    });

    ids.sort((a, b) => {
      const left = state.nodesById.get(a);
      const right = state.nodesById.get(b);
      return (left.year || 9999) - (right.year || 9999) || left.name.localeCompare(right.name);
    });

    return { ids, edgeIds };
  }

  function directChildren(id) {
    return sortNodeIds(state.childrenById.get(id) || new Set());
  }

  function buildLineageLayout(lineage) {
    const metrics = lineageLayoutMetrics();
    const ancestorRows = lineage.ancestors.levels.slice(1).map((ids, index) => {
      const depth = index + 1;
      return { ids, lineageIds: ids, depth, offset: -depth };
    }).reverse();
    const childIds = directChildren(lineage.startId);
    const descendantRow = childIds.length
      ? { ids: childIds, lineageIds: childIds, depth: 1, offset: 1, isDescendantRow: true }
      : null;
    const rows = [
      ...ancestorRows,
      { ids: [lineage.startId], lineageIds: [lineage.startId], depth: 0, offset: 0 },
      ...(descendantRow ? [descendantRow] : [])
    ];
    const descendantIds = new Set(childIds);
    const focusLineageIds = new Set(lineage.nodeIds);
    const contextIds = new Set();
    const contextEdgeIds = new Set();
    let requiredLeft = NODE_W / 2;
    let requiredRight = NODE_W / 2;

    descendantIds.forEach((id) => focusLineageIds.add(id));

    rows.forEach((row) => {
      const rowLineageIds = new Set(row.lineageIds);
      const context = row.isDescendantRow ? { ids: [], edgeIds: [] } : branchContext(row.lineageIds, focusLineageIds);
      const midpoint = Math.ceil(context.ids.length / 2);
      const left = context.ids.slice(0, midpoint);
      const right = context.ids.slice(midpoint);
      const lineageCenterOffset = (row.lineageIds.length - 1) / 2;

      row.ids = [...left, ...row.lineageIds, ...right];
      row.items = [];
      left.forEach((id, index) => {
        row.items.push({ id, slot: -(lineageCenterOffset + left.length - index) });
      });
      row.lineageIds.forEach((id, index) => {
        row.items.push({ id, slot: index - lineageCenterOffset });
      });
      right.forEach((id, index) => {
        row.items.push({ id, slot: lineageCenterOffset + 1 + index });
      });
      row.ids.forEach((id) => {
        if (!rowLineageIds.has(id)) {
          contextIds.add(id);
        }
      });
      context.edgeIds.forEach((id) => contextEdgeIds.add(id));

      row.items = row.items.map((item) => {
        const node = state.nodesById.get(item.id);
        const isContext = !rowLineageIds.has(item.id);
        const depth = row.isDescendantRow ? 1 : (lineage.nodeDepths.get(item.id) || row.depth || 0);
        const isMuted = state.lineageMode !== 'full' && depth > COMPACT_DEPTH;
        const isLineageCard = !isContext && !isMuted;
        const showsThesis = Boolean(node.thesisTitle) && isLineageCard;
        const width = isLineageCard ? metrics.lineageNodeW : NODE_W;
        const height = isLineageCard ? measureNodeHeight(node, width, isLineageCard, showsThesis) : NODE_H;
        return { ...item, width, height, isContext, isLineageCard, showsThesis };
      });

      row.height = Math.max(NODE_H, ...row.items.map((item) => item.height));
      row.items.forEach((item) => {
        const itemCenter = item.slot * metrics.treeGapX;
        requiredLeft = Math.max(requiredLeft, Math.max(0, -itemCenter + item.width / 2));
        requiredRight = Math.max(requiredRight, Math.max(0, itemCenter + item.width / 2));
      });
    });
    childIds.forEach((childId) => {
      const edge = state.edgeByPair.get(`${lineage.startId}->${childId}`);
      if (edge) {
        contextEdgeIds.add(edge.id);
      }
    });

    const centerX = metrics.treeMargin + requiredLeft;
    const selectedRowIndex = ancestorRows.length;
    let rowY = metrics.treeMargin;

    rows.forEach((row) => {
      row.y = rowY;
      let nextGap = metrics.rowGapY;
      if (row.offset === -1) {
        nextGap = metrics.parentToSelectedGapY;
      } else if (row.offset === 0 && descendantRow) {
        nextGap = metrics.selectedToChildGapY;
      }
      rowY += row.height + nextGap;
    });

    const width = Math.max(metrics.minWorldWidth, requiredLeft + requiredRight + metrics.treeMargin * 2);
    const height = Math.max(metrics.minWorldHeight, rowY - metrics.rowGapY + metrics.treeMargin);
    const focusDepth = COMPACT_DEPTH + PEEK_DEPTH;
    const focusRows = rows.filter((row) => row.offset >= -focusDepth);
    const fitItemsForRow = (row) => {
      const lineageItems = row.items.filter((item) => !item.isContext);
      return lineageItems.length ? lineageItems : row.items;
    };
    const focusLeft = Math.max(NODE_W / 2, ...focusRows.map((row) => {
      return Math.max(...fitItemsForRow(row).map((item) => {
        return Math.max(0, -item.slot * metrics.treeGapX + item.width / 2);
      }));
    }));
    const focusRight = Math.max(NODE_W / 2, ...focusRows.map((row) => {
      return Math.max(...fitItemsForRow(row).map((item) => {
        return Math.max(0, item.slot * metrics.treeGapX + item.width / 2);
      }));
    }));
    const rowBasedViewWidth = Math.max(focusLeft, focusRight) * 2 + metrics.viewMarginX * 2;
    const viewWidth = Math.min(width, Math.max(metrics.minViewWidth, Math.min(metrics.maxCompactViewWidth, rowBasedViewWidth)));
    const upperRows = Math.min(ancestorRows.length, COMPACT_DEPTH);
    const topRowIndex = Math.max(0, selectedRowIndex - upperRows);
    const peekDistance = topRowIndex > 0 ? (rows[topRowIndex].y - rows[topRowIndex - 1].y) * 0.48 : 0;
    const lowerRows = descendantRow ? 1 : 0;
    const bottomRowIndex = Math.min(rows.length - 1, selectedRowIndex + lowerRows);
    const viewTop = rows[topRowIndex].y - metrics.viewMarginY - peekDistance;
    const viewBottom = rows[bottomRowIndex].y + rows[bottomRowIndex].height + metrics.viewMarginY;
    const viewHeight = Math.min(
      height,
      Math.max(metrics.minWorldHeight, viewBottom - viewTop)
    );
    const viewBounds = {
      x: clamp(centerX - viewWidth / 2, 0, Math.max(0, width - viewWidth)),
      y: clamp(viewTop, 0, Math.max(0, height - viewHeight)),
      width: Math.round(viewWidth),
      height: Math.round(viewHeight)
    };

    return {
      rows,
      contextIds,
      contextEdgeIds,
      descendantIds,
      centerX,
      treeGapX: metrics.treeGapX,
      worldBounds: {
        x: 0,
        y: 0,
        width: Math.round(width),
        height: Math.round(height)
      },
      viewBounds
    };
  }

  function hideLineageActions() {
    lineageFullAction.hidden = true;
  }

  function setLineageAction(button, text, x, y, ariaLabel) {
    button.textContent = text;
    button.style.left = `${Math.round(x)}px`;
    button.style.top = `${Math.round(y)}px`;
    button.setAttribute('aria-label', ariaLabel);
    button.hidden = false;
  }

  function updateLineageActions(lineage, layout) {
    hideLineageActions();
    if (state.lineageMode === 'full' || compactViewport()) {
      return;
    }

    const hiddenAncestors = lineage.ancestors.ancestorIds.size - countCompactNodes(lineage.ancestors.ancestorIds, lineage.ancestors.nodeDepths);
    const hasOverflow = hiddenAncestors > 0;

    if (hasOverflow) {
      setLineageAction(
        lineageFullAction,
        'Show full lineage',
        layout.centerX,
        layout.viewBounds.y + 46,
        'Show full lineage'
      );
    }
  }

  function clearHighlightedClasses() {
    state.highlightedNodes.forEach((id) => {
      const element = state.nodeElements.get(id);
      if (element) {
        element.classList.remove(
          'is-selected',
          'is-parent',
          'is-descendant',
          'is-lineage',
          'is-muted-lineage',
          'is-connection-source',
          'is-connection-target',
          'is-connection-path'
        );
      }
    });
    state.highlightedNodes.clear();
    state.relatedEdgeIds.clear();
    state.lineageEdgeIds.clear();
    state.lineageEdgeDepths.clear();
    state.lineageNodeDepths.clear();
  }

  function markNode(id, className) {
    const element = state.nodeElements.get(id);
    if (!element) {
      return;
    }
    element.classList.add(className);
    state.highlightedNodes.add(id);
  }

  function sortNodeIds(ids) {
    return Array.from(ids).sort((a, b) => {
      const left = state.nodesById.get(a);
      const right = state.nodesById.get(b);
      return (left.year || 9999) - (right.year || 9999) || left.name.localeCompare(right.name);
    });
  }

  function collectAncestorLineage(startId, maxDepth) {
    const ancestorIds = new Set();
    const edgeIds = new Set();
    const edgeDepths = new Map();
    const nodeDepths = new Map([[startId, 0]]);
    const levels = [[startId]];
    let frontier = [startId];
    const seen = new Set([startId]);
    let depth = 0;
    const limit = maxDepth == null ? Infinity : maxDepth;

    while (frontier.length) {
      if (depth >= limit) {
        break;
      }

      const nextLevel = [];
      depth += 1;

      frontier.forEach((id) => {
        sortNodeIds(state.parentsById.get(id) || new Set()).forEach((parentId) => {
          const edge = state.edgeByPair.get(`${parentId}->${id}`);
          if (edge) {
            edgeIds.add(edge.id);
            edgeDepths.set(edge.id, Math.min(edgeDepths.get(edge.id) || depth, depth));
          }
          if (!seen.has(parentId)) {
            seen.add(parentId);
            ancestorIds.add(parentId);
            nodeDepths.set(parentId, depth);
            nextLevel.push(parentId);
          }
        });
      });

      if (!nextLevel.length) {
        break;
      }

      frontier = nextLevel;
      levels.push(frontier);
    }

    const roots = sortNodeIds(Array.from(seen).filter((id) => {
      return id !== startId && !(state.parentsById.get(id) || new Set()).size;
    }));

    return {
      levels,
      roots,
      ancestorIds,
      edgeIds,
      edgeDepths,
      nodeDepths
    };
  }

  function mergeDepthMap(target, source) {
    source.forEach((depth, id) => {
      if (!target.has(id) || depth < target.get(id)) {
        target.set(id, depth);
      }
    });
  }

  function collectFocusedLineage(startId) {
    const ancestors = collectAncestorLineage(startId);
    const nodeIds = new Set([startId]);
    const edgeIds = new Set();
    const edgeDepths = new Map();
    const nodeDepths = new Map([[startId, 0]]);

    ancestors.ancestorIds.forEach((id) => nodeIds.add(id));
    ancestors.edgeIds.forEach((id) => edgeIds.add(id));
    mergeDepthMap(edgeDepths, ancestors.edgeDepths);
    mergeDepthMap(nodeDepths, ancestors.nodeDepths);

    return {
      startId,
      ancestors,
      nodeIds,
      edgeIds,
      edgeDepths,
      nodeDepths
    };
  }

  function countCompactNodes(ids, nodeDepths) {
    let count = 0;
    ids.forEach((id) => {
      if ((nodeDepths.get(id) || Infinity) <= COMPACT_DEPTH) {
        count += 1;
      }
    });
    return count;
  }

  function connectionLayoutMetrics() {
    if (!compactViewport()) {
      return {
        nodeW: LINEAGE_NODE_W,
        treeGapX: TREE_GAP_X,
        rowGapY: 72,
        treeMargin: TREE_MARGIN,
        viewMarginX: 150,
        viewMarginY: 56,
        minWorldWidth: 900,
        minWorldHeight: 520
      };
    }

    return {
      nodeW: 250,
      treeGapX: 270,
      rowGapY: 48,
      treeMargin: 72,
      viewMarginX: 14,
      viewMarginY: 24,
      minWorldWidth: 580,
      minWorldHeight: 400
    };
  }

  function connectionInput(slot) {
    return slot === 'to' ? connectToInput : connectFromInput;
  }

  function connectionResults(slot) {
    return slot === 'to' ? connectToResults : connectFromResults;
  }

  function connectionId(slot) {
    return slot === 'to' ? state.connectionToId : state.connectionFromId;
  }

  function setConnectionId(slot, id) {
    if (slot === 'to') {
      state.connectionToId = id;
    } else {
      state.connectionFromId = id;
    }
  }

  function connectionInputValue(node) {
    return node ? node.name : '';
  }

  function connectionEndpointName(id) {
    const node = state.nodesById.get(id);
    return node ? displayNameForTitle(node) || node.name : '';
  }

  function connectionTitleText() {
    if (!state.connectionFromId || !state.connectionToId) {
      return DEFAULT_TITLE;
    }

    return `How ${connectionEndpointName(state.connectionFromId)} and ${connectionEndpointName(state.connectionToId)} Are Connected Academically`;
  }

  function setConnectionActiveSlot(slot) {
    state.connectionActiveSlot = slot === 'to' ? 'to' : 'from';
  }

  function updateConnectionStatus(message) {
    if (!connectStatus) {
      return;
    }

    if (message) {
      connectStatus.textContent = message;
      updateMobileControlToggle();
      return;
    }

    if (state.connectionFromId && state.connectionToId) {
      connectStatus.textContent = state.connectionStrictCommonAncestor
        ? 'Click Connect to find the strict common-ancestor chain.'
        : 'Click Connect to find the shortest chain.';
    } else if (state.connectionFromId) {
      connectStatus.textContent = `Choose a second person to connect from ${connectionEndpointName(state.connectionFromId)}.`;
    } else if (state.connectionToId) {
      connectStatus.textContent = `Choose a first person to connect to ${connectionEndpointName(state.connectionToId)}.`;
    } else {
      connectStatus.textContent = 'Select two people to find the shortest connection.';
    }
    updateMobileControlToggle();
  }

  function hideAllSearchResults() {
    [searchResults, connectFromResults, connectToResults].forEach((results) => {
      if (results) {
        results.hidden = true;
      }
    });
  }

  function findPersonMatches(query, limit) {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery || !state.data) {
      return [];
    }

    return state.data.nodes
      .map((node) => ({ node, score: scoreNode(node, normalizedQuery) }))
      .filter((item) => item.score < 99)
      .sort((a, b) => a.score - b.score || a.node.name.localeCompare(b.node.name))
      .slice(0, limit || 12);
  }

  function renderAutocomplete(input, results, onPick) {
    const query = normalize(input.value);
    clearSearchMatches();
    results.replaceChildren();

    if (!query) {
      results.hidden = true;
      renderEdges();
      return [];
    }

    const matches = findPersonMatches(query, 12);
    graphHost.classList.add('has-search');
    matches.forEach(({ node }, index) => {
      const element = state.nodeElements.get(node.id);
      if (element) {
        element.classList.add('is-search-match');
      }
      state.searchMatches.add(node.id);

      const button = relationButton(node, onPick);
      if (index === 0) {
        button.classList.add('is-active');
      }
      results.appendChild(button);
    });

    if (!matches.length) {
      const empty = document.createElement('button');
      const name = document.createElement('span');
      const meta = document.createElement('span');
      empty.type = 'button';
      empty.disabled = true;
      name.className = 'result-name';
      name.textContent = 'No matches';
      meta.className = 'result-meta';
      meta.textContent = 'Try a different query';
      empty.append(name, meta);
      results.appendChild(empty);
    }

    results.hidden = false;
    renderEdges();
    return matches;
  }

  function hideConnectionResults() {
    [connectFromResults, connectToResults].forEach((results) => {
      if (results) {
        results.hidden = true;
        results.replaceChildren();
      }
    });
  }

  function clearConnectionPath(options) {
    state.connectionPathIds = [];
    state.connectionEdgeIds.clear();
    state.contextEdgeIds.clear();
    clearHighlightedClasses();
    graphHost.classList.remove('has-connection');
    hideLineageActions();
    updateSelectionControls();

    if (options && options.restore) {
      restoreGlobalLayout({ animate: options.animate !== false });
      return;
    }

    renderEdges();
  }

  function clearConnection(options) {
    state.connectionFromId = null;
    state.connectionToId = null;
    state.connectionActiveSlot = 'from';
    if (connectFromInput) {
      connectFromInput.value = '';
    }
    if (connectToInput) {
      connectToInput.value = '';
    }
    hideConnectionResults();
    clearSearchMatches();
    clearConnectionPath({
      restore: !options || options.restore !== false,
      animate: !options || options.animate !== false
    });
    if (!options || options.updateUrl !== false) {
      updateBaseUrl(options && options.replaceUrl);
    }
    updateConnectionStatus();
  }

  function refreshConnectionHighlights() {
    clearHighlightedClasses();
    graphHost.classList.remove('has-selection');

    const hasConnectionState = state.connectionFromId ||
      state.connectionToId ||
      state.connectionPathIds.length > 0;
    if (!hasConnectionState) {
      graphHost.classList.remove('has-connection');
      renderEdges();
      return;
    }

    graphHost.classList.add('has-connection');
    state.connectionEdgeIds.forEach((id) => {
      state.lineageEdgeIds.add(id);
      state.lineageEdgeDepths.set(id, 1);
    });

    if (state.connectionPathIds.length) {
      state.connectionPathIds.forEach((id) => {
        if (id === state.connectionFromId) {
          markNode(id, 'is-connection-source');
        } else if (id === state.connectionToId) {
          markNode(id, 'is-connection-target');
        } else {
          markNode(id, 'is-connection-path');
        }
      });
    } else {
      if (state.connectionFromId) {
        markNode(state.connectionFromId, 'is-connection-source');
      }
      if (state.connectionToId && state.connectionToId !== state.connectionFromId) {
        markNode(state.connectionToId, 'is-connection-target');
      }
    }

    renderEdges();
  }

  function edgeForConnectionStep(leftId, rightId) {
    return state.edgeByPair.get(`${leftId}->${rightId}`) ||
      state.edgeByPair.get(`${rightId}->${leftId}`) ||
      null;
  }

  function connectionEdgesForPath(pathIds) {
    const edges = [];
    for (let index = 1; index < pathIds.length; index += 1) {
      const edge = edgeForConnectionStep(pathIds[index - 1], pathIds[index]);
      if (edge) {
        edges.push(edge);
      }
    }
    return edges;
  }

  function connectionStepDirection(fromId, toId) {
    const edge = edgeForConnectionStep(fromId, toId);
    if (!edge) {
      return null;
    }
    return edge.source === fromId && edge.target === toId ? 'down' : 'up';
  }

  function connectionSearchKey(id, phase) {
    return `${phase}\u0000${id}`;
  }

  function connectionSearchId(key) {
    return key.slice(key.indexOf('\u0000') + 1);
  }

  function shortestConnectionPath(fromId, toId, options) {
    if (!state.nodesById.has(fromId) || !state.nodesById.has(toId)) {
      return null;
    }
    if (fromId === toId) {
      return [fromId];
    }

    const strict = Boolean(options && options.strictCommonAncestor);
    const startKey = connectionSearchKey(fromId, strict ? 'up' : 'any');
    const queue = [{ id: fromId, phase: strict ? 'up' : 'any', key: startKey }];
    const previous = new Map([[startKey, null]]);
    let targetKey = null;

    for (let index = 0; index < queue.length; index += 1) {
      const { id, phase, key } = queue[index];
      const neighbors = sortNodeIds(state.neighborsById.get(id) || new Set());
      for (const neighborId of neighbors) {
        const direction = connectionStepDirection(id, neighborId);
        if (strict && phase === 'down' && direction === 'up') {
          continue;
        }

        const nextPhase = strict && (phase === 'down' || direction === 'down')
          ? 'down'
          : phase;
        const neighborKey = connectionSearchKey(neighborId, nextPhase);
        if (previous.has(neighborKey)) {
          continue;
        }
        previous.set(neighborKey, key);
        if (neighborId === toId) {
          targetKey = neighborKey;
          index = queue.length;
          break;
        }
        queue.push({ id: neighborId, phase: nextPhase, key: neighborKey });
      }
    }

    if (!targetKey) {
      return null;
    }

    const pathIds = [];
    for (let key = targetKey; key; key = previous.get(key)) {
      pathIds.push(connectionSearchId(key));
    }
    return pathIds.reverse();
  }

  function connectionLayerForStep(prevId, nextId, prevLayer) {
    const edge = edgeForConnectionStep(prevId, nextId);
    if (!edge) {
      return prevLayer + 1;
    }

    if (edge.source === prevId && edge.target === nextId) {
      return prevLayer + 1;
    }
    if (edge.source === nextId && edge.target === prevId) {
      return prevLayer - 1;
    }

    const prevNode = state.nodesById.get(prevId);
    const nextNode = state.nodesById.get(nextId);
    const prevRank = prevNode && Number.isFinite(prevNode.rank) ? prevNode.rank : 0;
    const nextRank = nextNode && Number.isFinite(nextNode.rank) ? nextNode.rank : prevRank + 1;
    return nextRank >= prevRank ? prevLayer + 1 : prevLayer - 1;
  }

  function connectionRowsForPath(pathIds) {
    const layersById = new Map();
    const pathIndexById = new Map();
    let minLayer = 0;

    pathIds.forEach((id, index) => {
      pathIndexById.set(id, index);
      if (index === 0) {
        layersById.set(id, 0);
        return;
      }

      const prevId = pathIds[index - 1];
      const layer = connectionLayerForStep(prevId, id, layersById.get(prevId) || 0);
      layersById.set(id, layer);
      minLayer = Math.min(minLayer, layer);
    });

    const rows = [];
    pathIds.forEach((id) => {
      const rowIndex = (layersById.get(id) || 0) - minLayer;
      if (!rows[rowIndex]) {
        rows[rowIndex] = [];
      }
      rows[rowIndex].push(id);
    });

    return rows.map((ids) => {
      return ids.sort((a, b) => pathIndexById.get(a) - pathIndexById.get(b));
    });
  }

  function connectionPathRelations(pathIds) {
    const pathSet = new Set(pathIds);
    const parentIdsById = new Map(pathIds.map((id) => [id, []]));
    const childIdsById = new Map(pathIds.map((id) => [id, []]));

    connectionEdgesForPath(pathIds).forEach((edge) => {
      if (!pathSet.has(edge.source) || !pathSet.has(edge.target)) {
        return;
      }
      parentIdsById.get(edge.target).push(edge.source);
      childIdsById.get(edge.source).push(edge.target);
    });

    return { parentIdsById, childIdsById };
  }

  function average(values) {
    if (!values.length) {
      return 0;
    }
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function spreadConnectionRow(items, minGap) {
    const sorted = items.slice().sort((a, b) => {
      return a.desiredSlot - b.desiredSlot || a.pathIndex - b.pathIndex;
    });

    sorted.forEach((item, index) => {
      item.slot = index === 0
        ? item.desiredSlot
        : Math.max(item.desiredSlot, sorted[index - 1].slot + minGap);
    });

    const desiredCenter = average(sorted.map((item) => item.desiredSlot));
    const actualCenter = average(sorted.map((item) => item.slot));
    const shift = desiredCenter - actualCenter;
    sorted.forEach((item) => {
      item.slot += shift;
    });
  }

  function assignConnectionSlots(rows, pathIds, metrics, cardWidth) {
    const pathIndexById = new Map(pathIds.map((id, index) => [id, index]));
    const relations = connectionPathRelations(pathIds);
    const slotsById = new Map();
    const minSlotGap = Math.max(1, (cardWidth + 32) / metrics.treeGapX);

    rows.forEach((row) => {
      const rowCenterOffset = (row.items.length - 1) / 2;

      row.items.forEach((item, index) => {
        const parentSlots = (relations.parentIdsById.get(item.id) || [])
          .filter((id) => slotsById.has(id))
          .map((id) => slotsById.get(id));

        item.pathIndex = pathIndexById.get(item.id) || 0;
        item.desiredSlot = parentSlots.length
          ? average(parentSlots)
          : index - rowCenterOffset;
      });

      spreadConnectionRow(row.items, minSlotGap);
      row.items.forEach((item) => {
        slotsById.set(item.id, item.slot);
      });
    });
  }

  function buildConnectionPathLayout(pathIds) {
    const metrics = connectionLayoutMetrics();
    const positions = new Map();
    const cardWidth = metrics.nodeW;
    const rows = connectionRowsForPath(pathIds).map((ids) => {
      const items = ids.map((id) => {
        const node = state.nodesById.get(id);
        const showsThesis = Boolean(node.thesisTitle);
        const height = measureNodeHeight(node, cardWidth, true, showsThesis);
        return { id, node, width: cardWidth, height, showsThesis };
      });
      return {
        items,
        height: Math.max(NODE_H, ...items.map((item) => item.height))
      };
    });

    assignConnectionSlots(rows, pathIds, metrics, cardWidth);
    const requiredLeft = Math.max(cardWidth / 2, ...rows.flatMap((row) => {
      return row.items.map((item) => Math.max(0, -item.slot * metrics.treeGapX + item.width / 2));
    }));
    const requiredRight = Math.max(cardWidth / 2, ...rows.flatMap((row) => {
      return row.items.map((item) => Math.max(0, item.slot * metrics.treeGapX + item.width / 2));
    }));
    const centerX = metrics.treeMargin + requiredLeft;
    const worldWidth = Math.max(metrics.minWorldWidth, requiredLeft + requiredRight + metrics.treeMargin * 2);
    let rowY = metrics.treeMargin;

    rows.forEach((row) => {
      row.items.forEach((item) => {
        positions.set(item.id, {
          ...item.node,
          x: Math.round(centerX + item.slot * metrics.treeGapX - item.width / 2),
          y: Math.round(rowY + (row.height - item.height) / 2),
          w: item.width,
          h: item.height,
          isLineageCard: true,
          showsThesis: item.showsThesis
        });
      });
      rowY += row.height + metrics.rowGapY;
    });

    const contentHeight = rowY - metrics.rowGapY + metrics.treeMargin;
    const worldHeight = Math.max(metrics.minWorldHeight, contentHeight);
    const boxes = Array.from(positions.values());
    const left = Math.min(...boxes.map((box) => box.x));
    const right = Math.max(...boxes.map((box) => box.x + box.w));
    const top = Math.min(...boxes.map((box) => box.y));
    const bottom = Math.max(...boxes.map((box) => box.y + box.h));
    const viewX = clamp(left - metrics.viewMarginX, 0, Math.max(0, worldWidth - 1));
    const viewY = clamp(top - metrics.viewMarginY, 0, Math.max(0, worldHeight - 1));
    const viewBounds = {
      x: Math.round(viewX),
      y: Math.round(viewY),
      width: Math.round(Math.min(worldWidth - viewX, right - left + metrics.viewMarginX * 2)),
      height: Math.round(Math.min(worldHeight - viewY, bottom - top + metrics.viewMarginY * 2))
    };

    return {
      positions,
      visibleIds: new Set(pathIds),
      worldBounds: {
        x: 0,
        y: 0,
        width: Math.round(worldWidth),
        height: Math.round(worldHeight)
      },
      viewBounds
    };
  }

  function activateConnectionPath(pathIds, options) {
    state.selectedId = null;
    state.lineageMode = 'compact';
    state.connectionPathIds = pathIds.slice();
    state.connectionEdgeIds = new Set(connectionEdgesForPath(pathIds).map((edge) => edge.id));
    state.lineageEdgeIds.clear();
    state.lineageEdgeDepths.clear();
    state.connectionEdgeIds.forEach((id) => {
      state.lineageEdgeIds.add(id);
      state.lineageEdgeDepths.set(id, 1);
    });
    graphHost.classList.remove('has-selection');
    updateSelectionControls();

    const layout = buildConnectionPathLayout(pathIds);
    applyNodeLayout(
      layout.positions,
      layout.visibleIds,
      layout.worldBounds,
      layout.viewBounds,
      null,
      {
        ...options,
        transformForBounds: readableConnectionTransformForBounds
      }
    );
    hideLineageActions();
    refreshConnectionHighlights();
  }

  function resolveConnectionInput(slot) {
    if (connectionId(slot)) {
      return true;
    }

    const input = connectionInput(slot);
    const matches = findPersonMatches(input.value, 1);
    if (!matches.length) {
      return false;
    }

    selectConnectionEndpoint(slot, matches[0].node.id, {
      animate: false,
      focusNext: false,
      run: false
    });
    return true;
  }

  function runConnection(options) {
    const shouldResolve = !options || options.resolve !== false;
    if (shouldResolve) {
      resolveConnectionInput('from');
      resolveConnectionInput('to');
    }

    hideAllSearchResults();
    clearSearchMatches();

    const fromId = state.connectionFromId;
    const toId = state.connectionToId;
    if (!fromId || !toId) {
      clearConnectionPath({
        restore: state.connectionPathIds.length > 0,
        animate: !options || options.animate !== false
      });
      refreshConnectionHighlights();
      updateConnectionStatus();
      return;
    }

    if (fromId === toId) {
      activateConnectionPath([fromId], { animate: !options || options.animate !== false });
      if (!options || options.updateUrl !== false) {
        updateConnectionUrl(fromId, toId, options && options.replaceUrl);
      }
      updateConnectionStatus('Same person selected.');
      if (!options || options.foldControls !== false) {
        foldMobileControls();
      }
      return;
    }

    const pathIds = shortestConnectionPath(fromId, toId, {
      strictCommonAncestor: state.connectionStrictCommonAncestor
    });
    if (!pathIds) {
      clearConnectionPath({
        restore: state.connectionPathIds.length > 0,
        animate: !options || options.animate !== false
      });
      refreshConnectionHighlights();
      updateConnectionStatus(`No ${state.connectionStrictCommonAncestor ? 'strict common-ancestor chain' : 'connection'} found between ${connectionEndpointName(fromId)} and ${connectionEndpointName(toId)} in the current graph.`);
      return;
    }

    activateConnectionPath(pathIds, { animate: !options || options.animate !== false });
    if (!options || options.updateUrl !== false) {
      updateConnectionUrl(fromId, toId, options && options.replaceUrl);
    }
    const linkCount = pathIds.length - 1;
    updateConnectionStatus(`${connectionEndpointName(fromId)} connects to ${connectionEndpointName(toId)} in ${linkCount} advisor-student ${linkCount === 1 ? 'link' : 'links'}${state.connectionStrictCommonAncestor ? ' with a strict common-ancestor chain' : ''}.`);
    if (!options || options.foldControls !== false) {
      foldMobileControls();
    }
  }

  function selectConnectionEndpoint(slot, id, options) {
    if (!state.nodesById.has(id)) {
      return;
    }

    setConnectionActiveSlot(slot);
    setConnectionId(slot, id);
    connectionInput(slot).value = connectionInputValue(state.nodesById.get(id));
    connectionResults(slot).hidden = true;
    clearSearchMatches();

    const shouldRun = state.connectionFromId &&
      state.connectionToId &&
      (!options || options.run !== false);
    if (state.connectionPathIds.length) {
      clearConnectionPath({
        restore: !shouldRun,
        animate: !options || options.animate !== false
      });
    }

    if (options && options.focusNext === false) {
      // Keep the current focus where it is.
    } else if (slot === 'from' && !state.connectionToId) {
      setConnectionActiveSlot('to');
      connectToInput.focus();
    } else if (slot === 'to' && !state.connectionFromId) {
      setConnectionActiveSlot('from');
      connectFromInput.focus();
    }

    if (shouldRun) {
      runConnection({
        animate: !options || options.animate !== false,
        resolve: false
      });
      return;
    }

    refreshConnectionHighlights();
    updateConnectionStatus();
  }

  function syncConnectionSlotFromInput(slot) {
    const id = connectionId(slot);
    const node = state.nodesById.get(id);
    if (!id || !node || connectionInput(slot).value === connectionInputValue(node)) {
      return false;
    }

    setConnectionId(slot, null);
    if (state.connectionPathIds.length) {
      clearConnectionPath({ restore: true, animate: true });
    }
    updateBaseUrl();
    return true;
  }

  function updateConnectionSearch(slot) {
    setConnectionActiveSlot(slot);
    const changedEndpoint = syncConnectionSlotFromInput(slot);
    renderAutocomplete(connectionInput(slot), connectionResults(slot), (node) => {
      selectConnectionEndpoint(slot, node.id);
    });
    if (changedEndpoint || !normalize(connectionInput(slot).value)) {
      refreshConnectionHighlights();
      updateConnectionStatus();
    }
  }

  function clearConnectionSlot(slot) {
    setConnectionId(slot, null);
    connectionInput(slot).value = '';
    connectionResults(slot).hidden = true;
    if (state.connectionPathIds.length) {
      clearConnectionPath({ restore: true, animate: true });
    }
    updateBaseUrl();
    refreshConnectionHighlights();
    updateConnectionStatus();
  }

  function swapConnectionEndpoints() {
    const fromId = state.connectionFromId;
    const toId = state.connectionToId;
    const fromValue = connectFromInput.value;
    const toValue = connectToInput.value;

    state.connectionFromId = toId;
    state.connectionToId = fromId;
    connectFromInput.value = toValue;
    connectToInput.value = fromValue;
    hideConnectionResults();
    clearSearchMatches();

    if (state.connectionFromId && state.connectionToId) {
      runConnection({ resolve: false });
      return;
    }

    clearConnectionPath({
      restore: state.connectionPathIds.length > 0,
      animate: true
    });
    refreshConnectionHighlights();
    updateConnectionStatus();
  }

  function updateConnectionStrictMode() {
    state.connectionStrictCommonAncestor = Boolean(connectionStrict && connectionStrict.checked);
    if (state.connectionFromId && state.connectionToId) {
      runConnection({ resolve: false, foldControls: false });
      return;
    }
    if (state.connectionPathIds.length) {
      clearConnectionPath({ restore: true, animate: true });
    }
    updateConnectionStatus();
  }

  function openConnection(fromId, toId, options) {
    setInteractionMode('connect', {
      animate: !options || options.animate !== false,
      focus: false,
      updateUrl: !options || options.updateUrl !== false
    });
    selectConnectionEndpoint('from', fromId, {
      animate: !options || options.animate !== false,
      focusNext: false,
      run: false
    });
    selectConnectionEndpoint('to', toId, {
      animate: !options || options.animate !== false,
      focusNext: false,
      run: false
    });
    runConnection({
      animate: !options || options.animate !== false,
      resolve: false,
      updateUrl: !options || options.updateUrl !== false,
      replaceUrl: options && options.replaceUrl
    });
  }

  function activatePersonFromGraph(id) {
    if (state.interactionMode === 'connect') {
      setInteractionMode('find', {
        animate: false,
        restore: false,
        updateUrl: false
      });
    }

    selectPerson(id, { center: false });
  }

  function updateModeControls() {
    const isConnect = state.interactionMode === 'connect';
    findModeButton.classList.toggle('is-active', !isConnect);
    connectModeButton.classList.toggle('is-active', isConnect);
    findModeButton.setAttribute('aria-selected', String(!isConnect));
    connectModeButton.setAttribute('aria-selected', String(isConnect));
    findPanel.hidden = isConnect;
    connectPanel.hidden = !isConnect;
    updateMobileControlToggle();
  }

  function setInteractionMode(mode, options) {
    if (mode !== 'find' && mode !== 'connect') {
      return;
    }
    if (state.interactionMode === mode) {
      return;
    }

    state.interactionMode = mode;
    updateModeControls();
    hideAllSearchResults();
    clearSearchMatches();

    if (mode === 'find') {
      clearConnection({
        animate: !options || options.animate !== false,
        restore: !options || options.restore !== false,
        updateUrl: !options || options.updateUrl !== false
      });
      return;
    }

    searchInput.value = '';
    if (state.selectedId) {
      clearSelection({
        animate: !options || options.animate !== false,
        updateUrl: !options || options.updateUrl !== false
      });
    } else if (!state.connectionPathIds.length) {
      restoreGlobalLayout({ animate: !options || options.animate !== false });
    }
    updateConnectionStatus();
    setConnectionActiveSlot(state.connectionFromId && !state.connectionToId ? 'to' : 'from');
    if (!options || options.focus !== false) {
      connectionInput(state.connectionActiveSlot).focus();
    }
  }

  function refreshHighlights() {
    clearHighlightedClasses();
    graphHost.classList.remove('has-connection');

    if (!state.selectedId) {
      graphHost.classList.remove('has-selection');
      state.contextEdgeIds.clear();
      renderEdges();
      return;
    }

    const lineage = collectFocusedLineage(state.selectedId);
    const parents = state.parentsById.get(state.selectedId) || new Set();
    const children = state.childrenById.get(state.selectedId) || new Set();
    const compact = state.lineageMode !== 'full';

    graphHost.classList.add('has-selection');
    markNode(state.selectedId, 'is-selected');
    parents.forEach((id) => markNode(id, 'is-parent'));
    children.forEach((id) => {
      markNode(id, 'is-descendant');
      const edge = state.edgeByPair.get(`${state.selectedId}->${id}`);
      if (edge) {
        state.lineageEdgeIds.add(edge.id);
        state.lineageEdgeDepths.set(edge.id, 1);
      }
    });
    lineage.nodeIds.forEach((id) => {
      if (id !== state.selectedId && !parents.has(id)) {
        const depth = lineage.nodeDepths.get(id) || Infinity;
        markNode(id, compact && depth > COMPACT_DEPTH ? 'is-muted-lineage' : 'is-lineage');
      }
    });
    lineage.edgeIds.forEach((id) => state.lineageEdgeIds.add(id));
    lineage.edgeDepths.forEach((depth, id) => state.lineageEdgeDepths.set(id, depth));
    lineage.nodeDepths.forEach((depth, id) => state.lineageNodeDepths.set(id, depth));

    renderEdges();
  }

  function relationButton(node, onPick) {
    const button = document.createElement('button');
    const name = document.createElement('span');
    const meta = document.createElement('span');

    button.type = 'button';
    name.className = 'result-name';
    name.textContent = node.name;
    meta.className = 'result-meta';
    meta.textContent = node.detail || node.id;
    button.append(name, meta);
    button.addEventListener('click', () => onPick(node));
    return button;
  }

  function updateTopbarMode() {
    const selectedNode = state.nodesById.get(state.selectedId);
    const isConnectionTitle = Boolean(state.connectionPathIds.length && state.connectionFromId && state.connectionToId);
    const isFocusedTitle = Boolean(isConnectionTitle || (selectedNode && state.lineageMode !== 'full'));

    if (appShell) {
      appShell.classList.toggle('has-mobile-connection-title', isConnectionTitle);
    }
    if (mobileConnectionTitle) {
      mobileConnectionTitle.hidden = !isConnectionTitle;
      mobileConnectionTitle.setAttribute('aria-hidden', String(!isConnectionTitle));
    }
    if (mobileConnectionPeople && isConnectionTitle) {
      const fromName = connectionEndpointName(state.connectionFromId);
      const toName = connectionEndpointName(state.connectionToId);
      const from = document.createElement('span');
      const arrow = document.createElement('span');
      const to = document.createElement('span');

      from.className = 'mobile-connection-name';
      from.textContent = fromName;
      arrow.className = 'mobile-connection-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      to.className = 'mobile-connection-name';
      to.textContent = toName;
      mobileConnectionPeople.setAttribute('aria-label', `${fromName} and ${toName}`);
      mobileConnectionPeople.replaceChildren(from, arrow, to);
    }
    if (mobileConnectionLabel && isConnectionTitle) {
      mobileConnectionLabel.textContent = 'Academic Connection Between';
    }
    if (topbar) {
      topbar.classList.toggle('is-focused-title', isFocusedTitle);
      topbar.classList.toggle('is-connection-title', isConnectionTitle);
    }
    if (titleHeading) {
      const nextTitle = isConnectionTitle
        ? connectionTitleText()
        : topbarTitle(selectedNode, isFocusedTitle);
      if (isConnectionTitle) {
        const peopleLine = document.createElement('span');
        const topicLine = document.createElement('span');
        peopleLine.className = 'connection-title-line';
        topicLine.className = 'connection-title-line';
        peopleLine.textContent = `${connectionEndpointName(state.connectionFromId)} and ${connectionEndpointName(state.connectionToId)}`;
        topicLine.textContent = 'Connected Academically';
        titleHeading.replaceChildren(peopleLine, topicLine);
      } else if (isFocusedTitle && state.selectedId === INITIAL_PERSON_ID) {
        const name = displayNameForTitle(selectedNode);
        const link = document.createElement('a');
        const suffix = compactViewport()
          ? `${/s$/i.test(name) ? "'" : "'s"} Genealogy`
          : `${/s$/i.test(name) ? "'" : "'s"} Academic Genealogy`;
        link.href = HOME_URL;
        link.textContent = name;
        titleHeading.replaceChildren(
          link,
          document.createTextNode(suffix)
        );
      } else {
        titleHeading.textContent = nextTitle;
      }
    }
    if (titleSubtitle) {
      titleSubtitle.textContent = DEFAULT_SUBTITLE;
      titleSubtitle.hidden = isFocusedTitle;
    }
    document.title = isConnectionTitle
      ? connectionTitleText()
      : (isFocusedTitle ? focusedTitle(selectedNode) : DEFAULT_TITLE);

    if (isFocusedTitle) {
      searchResults.hidden = true;
    }
  }

  function updateSelectionControls() {
    updateTopbarMode();
    lineageToggle.hidden = !state.selectedId;
    lineageToggle.textContent = state.lineageMode === 'full' ? '3 generations' : 'Full lineage';
    lineageToggle.setAttribute(
      'aria-label',
      state.lineageMode === 'full' ? 'Show three-generation ancestry' : 'Show full lineage'
    );
    updateMobileControlToggle();
  }

  function selectPerson(id, options) {
    if (!state.nodesById.has(id)) {
      return;
    }
    state.selectedId = id;
    state.lineageMode = 'compact';
    if (!options || options.updateUrl !== false) {
      updatePersonUrl(id, options && options.replaceUrl);
    }
    updateSelectionControls();
    refreshHighlights();
    activateFocusedTree(id, { animate: !options || options.animate !== false });
    if (options && options.center) {
      centerOnPerson(id);
    }
    if (!options || options.foldControls !== false) {
      foldMobileControls();
    }
  }

  function clearSelection(options) {
    state.selectedId = null;
    state.lineageMode = 'compact';
    if (!options || options.updateUrl !== false) {
      updateBaseUrl(options && options.replaceUrl);
    }
    updateSelectionControls();
    refreshHighlights();
    restoreGlobalLayout({ animate: !options || options.animate !== false });
  }

  function toggleLineageMode() {
    if (!state.selectedId) {
      return;
    }

    state.lineageMode = state.lineageMode === 'full' ? 'compact' : 'full';
    updateSelectionControls();
    refreshHighlights();
    activateFocusedTree(state.selectedId, { animate: true });
  }

  function clearSearchMatches() {
    state.searchMatches.forEach((id) => {
      const element = state.nodeElements.get(id);
      if (element) {
        element.classList.remove('is-search-match');
      }
    });
    state.searchMatches.clear();
    graphHost.classList.remove('has-search');
  }

  function refitViewport() {
    if (!state.data) {
      return;
    }

    resizeCanvas();
    if (state.selectedId) {
      updateSelectionControls();
      refreshHighlights();
      activateFocusedTree(state.selectedId, { animate: false });
      return;
    }
    if (state.connectionPathIds.length) {
      activateConnectionPath(state.connectionPathIds, { animate: false });
      return;
    }
    fitGraph();
  }

  function scheduleViewportFit() {
    state.pendingViewportFit = true;
    if (state.resizeFrame) {
      return;
    }
    state.resizeFrame = window.requestAnimationFrame(() => {
      state.resizeFrame = 0;
      if (hasActiveMorph()) {
        return;
      }
      state.pendingViewportFit = false;
      refitViewport();
    });
  }

  function scoreNode(node, query) {
    const name = normalize(node.name);
    const detail = normalize(node.detail);
    if (name === query) {
      return 0;
    }
    if (name.startsWith(query)) {
      return 1;
    }
    if (name.includes(query)) {
      return 2;
    }
    if (detail.includes(query)) {
      return 3;
    }
    if (node.searchText.includes(query)) {
      return 4;
    }
    return 99;
  }

  function updateSearch() {
    renderAutocomplete(searchInput, searchResults, (node) => {
      searchResults.hidden = true;
      selectPerson(node.id);
    });
  }

  function handleAutocompleteKeydown(event, input, results, onEscape) {
    if (event.key === 'Enter') {
      const first = results.querySelector('button:not([disabled])');
      if (first) {
        event.preventDefault();
        first.click();
        results.hidden = true;
        input.blur();
      }
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      onEscape();
    }
  }

  function bindControls() {
    if (exploreToggle) {
      exploreToggle.addEventListener('click', () => openMobileControls({ focus: false }));
    }
    if (exploreClose) {
      exploreClose.addEventListener('click', () => setMobileControlsOpen(false));
    }
    document.getElementById('zoom-out').addEventListener('click', () => zoomBy(0.8));
    document.getElementById('zoom-in').addEventListener('click', () => zoomBy(1.25));
    findModeButton.addEventListener('click', () => setInteractionMode('find'));
    connectModeButton.addEventListener('click', () => setInteractionMode('connect'));
    lineageToggle.addEventListener('click', toggleLineageMode);
    lineageFullAction.addEventListener('click', () => {
      if (state.selectedId && state.lineageMode !== 'full') {
        toggleLineageMode();
      }
    });
    document.getElementById('fit-graph').addEventListener('click', fitGraph);
    document.getElementById('clear-selection').addEventListener('click', () => {
      if (state.interactionMode === 'connect') {
        clearConnection();
      } else {
        clearSelection();
        searchInput.value = '';
        updateSearch();
      }
    });

    searchInput.addEventListener('input', updateSearch);
    searchInput.addEventListener('focus', () => openMobileControls({ focus: false }));
    searchInput.addEventListener('keydown', (event) => {
      handleAutocompleteKeydown(event, searchInput, searchResults, () => {
        searchInput.value = '';
        updateSearch();
      });
    });

    connectFromInput.addEventListener('focus', () => {
      openMobileControls({ focus: false });
      setConnectionActiveSlot('from');
    });
    connectToInput.addEventListener('focus', () => {
      openMobileControls({ focus: false });
      setConnectionActiveSlot('to');
    });
    connectFromInput.addEventListener('input', () => updateConnectionSearch('from'));
    connectToInput.addEventListener('input', () => updateConnectionSearch('to'));
    connectFromInput.addEventListener('keydown', (event) => {
      handleAutocompleteKeydown(event, connectFromInput, connectFromResults, () => clearConnectionSlot('from'));
    });
    connectToInput.addEventListener('keydown', (event) => {
      handleAutocompleteKeydown(event, connectToInput, connectToResults, () => clearConnectionSlot('to'));
    });
    connectRun.addEventListener('click', () => runConnection());
    connectSwap.addEventListener('click', swapConnectionEndpoints);
    connectClear.addEventListener('click', () => clearConnection());
    if (connectionStrict) {
      connectionStrict.checked = state.connectionStrictCommonAncestor;
      connectionStrict.addEventListener('change', updateConnectionStrictMode);
    }

    window.addEventListener('resize', scheduleViewportFit);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', scheduleViewportFit);
    }
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(scheduleViewportFit);
      if (topbar) {
        observer.observe(topbar);
      }
      if (explorePanel) {
        observer.observe(explorePanel);
      }
      if (sourceStrip) {
        observer.observe(sourceStrip);
      }
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleViewportFit);
    }
    window.addEventListener('popstate', () => {
      const connectionIds = requestedConnectionIds();
      if (connectionIds) {
        openConnection(connectionIds.fromId, connectionIds.toId, {
          animate: false,
          updateUrl: false
        });
        return;
      }

      const personId = requestedPersonId();
      if (state.interactionMode !== 'find') {
        setInteractionMode('find', { animate: false, restore: false, updateUrl: false });
      }
      if (personId) {
        selectPerson(personId, { updateUrl: false });
      } else {
        clearSelection({ updateUrl: false });
      }
    });
  }

  function bindPanZoom() {
    stage.addEventListener('pointerdown', (event) => {
      if (event.button === 0 && compactViewport() && mobileControlsOpen() && !event.target.closest('.explore-panel, .explore-toggle')) {
        setMobileControlsOpen(false);
      }
      if (event.button !== 0 || event.target.closest('.topbar, .explore-panel, .source-strip, .person-node, .lineage-action')) {
        return;
      }
      cancelMorphAnimation();
      state.isDragging = true;
      state.dragMoved = false;
      state.pointerStart = { x: event.clientX, y: event.clientY };
      state.lastPointer = { x: event.clientX, y: event.clientY };
      stage.classList.add('is-dragging');
      stage.setPointerCapture(event.pointerId);
    });

    stage.addEventListener('pointermove', (event) => {
      if (!state.isDragging) {
        return;
      }
      const dx = event.clientX - state.lastPointer.x;
      const dy = event.clientY - state.lastPointer.y;
      const totalDx = event.clientX - state.pointerStart.x;
      const totalDy = event.clientY - state.pointerStart.y;
      if (Math.hypot(totalDx, totalDy) > 4) {
        state.dragMoved = true;
      }
      state.x += dx;
      state.y += dy;
      state.lastPointer = { x: event.clientX, y: event.clientY };
      applyTransform();
    });

    function endDrag(event) {
      if (!state.isDragging) {
        return;
      }
      state.isDragging = false;
      stage.classList.remove('is-dragging');
      try {
        stage.releasePointerCapture(event.pointerId);
      } catch (error) {
        // The browser may already have released this pointer.
      }
      window.setTimeout(() => {
        state.dragMoved = false;
      }, 0);
    }

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('wheel', (event) => {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0012);
      zoomBy(factor, event.clientX, event.clientY);
    }, { passive: false });
  }

  async function loadGraph() {
    try {
      const response = await fetch('csail-data.json');
      if (!response.ok) {
        throw new Error(`Could not load graph data (${response.status})`);
      }

      state.data = await response.json();
      buildIndexes();

      setWorldBounds(state.data.bounds);

      renderNodes();
      bindPanZoom();
      bindControls();
      updateModeControls();
      updateConnectionStatus();
      resizeCanvas();
      const initialConnectionIds = requestedConnectionIds();
      const initialPersonId = requestedPersonId();
      if (initialConnectionIds) {
        openConnection(initialConnectionIds.fromId, initialConnectionIds.toId, {
          replaceUrl: true,
          animate: false
        });
      } else if (initialPersonId && state.nodesById.has(initialPersonId)) {
        selectPerson(initialPersonId, { replaceUrl: true, animate: false });
      } else {
        fitGraph();
      }
      loading.hidden = true;
    } catch (error) {
      loading.textContent = error.message;
      loading.style.color = '#c92a2a';
    }
  }

  loadGraph();
})();
