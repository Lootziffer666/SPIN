/**
 * SPIN Node Graph — Offenes Wissensmodell für multimodale Stories
 *
 * Jede Information, die zur Entwicklung einer Story beiträgt, existiert
 * als Node: Figuren, Orte, Ereignisse, Objekte, Sinneseindrücke, Medien,
 * Motive, Regeln, Konzepte — und alles andere, was Sinn ergibt.
 *
 * Architektur-Prinzipien:
 *   1. Nodes sind NIE „voll belegt" — jeder Node ist offen für weitere
 *      Properties und Links.
 *   2. Links können jederzeit zwischen beliebigen Nodes entstehen —
 *      „Fäden spinnen".
 *   3. Links können Dokument- und Projektgrenzen überschreiten
 *      (SPIN ↔ FLOW ↔ LOOM ↔ SMASH).
 *   4. Der Graph wächst organisch — keine feste Struktur, kein Schema-Zwang.
 *   5. Typen sind offen — vordefinierte Typen als Orientierung, aber
 *      jeder beliebige Typ ist zulässig.
 *
 * Dieses Modul ist die Grundlage für LOOM (Zoom-out: Satz im Gewebe)
 * und für projektübergreifende Verknüpfung.
 */

// ═══════════════════════════════════════════════════════════════════════
// Vordefinierte Node-Typen (Orientierung, nicht Einschränkung)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Vordefinierte Node-Typen für multimodale Story-Entwicklung.
 * Diese Liste ist NICHT abschließend — jeder String ist ein gültiger Typ.
 */
export const NODE_TYPES = [
  // Narrative Elemente
  'character',       // Figur / Charakter
  'location',        // Ort / Schauplatz
  'event',           // Ereignis / Plot-Punkt
  'scene',           // Szene (Einheit aus Ort + Zeit + Handlung)
  'object',          // Gegenstand / Requisit
  'dialogue',        // Dialog-Fragment / Sprechakt

  // Struktur
  'chapter',         // Kapitel / Akt
  'arc',             // Handlungsbogen / Narrative Arc
  'theme',           // Thema (abstrakt)
  'motif',           // Motiv (wiederkehrendes Element)
  'conflict',        // Konflikt / Spannung

  // Multimodal
  'sensation',       // Sinneseindruck (visuell, auditiv, taktil, olfaktorisch)
  'medium',          // Medium-Referenz (Bild, Sound, Musik, Video)
  'atmosphere',      // Stimmung / Atmosphäre
  'rhythm',          // Rhythmus / Tempo

  // Welt
  'rule',            // Welt-Regel / Constraint
  'lore',            // Hintergrundwissen / Geschichte der Welt
  'faction',         // Fraktion / Gruppe / Organisation
  'system',          // System / Mechanik innerhalb der Welt

  // Meta
  'concept',         // Abstraktes Konzept / Idee
  'reference',       // Externe Referenz (Quelle, Inspiration)
  'annotation',      // Notiz / Kommentar
  'question',        // Offene Frage (bewusst ungelöst)
];

/**
 * Vordefinierte Link-Typen (Orientierung, nicht Einschränkung).
 */
export const LINK_TYPES = [
  'relates_to',      // allgemeine Verbindung
  'causes',          // A verursacht B
  'follows',         // A folgt auf B (temporal)
  'contains',        // A enthält B (Komposition)
  'opposes',         // A steht im Gegensatz zu B
  'transforms',      // A verwandelt sich in B
  'references',      // A verweist auf B
  'depends_on',      // A hängt von B ab
  'resembles',       // A ähnelt B
  'belongs_to',      // A gehört zu B
  'inspires',        // A inspiriert B
  'contradicts',     // A widerspricht B
];

// ═══════════════════════════════════════════════════════════════════════
// ID-Generierung
// ═══════════════════════════════════════════════════════════════════════

let _counter = 0;

function generateId(prefix = 'n') {
  _counter += 1;
  const timestamp = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${timestamp}-${rand}-${_counter}`;
}

// ═══════════════════════════════════════════════════════════════════════
// Graph erstellen
// ═══════════════════════════════════════════════════════════════════════

/**
 * Erstellt einen neuen, leeren Graphen.
 *
 * @param {object} [meta] - Optionale Metadaten (Projekt, Dokument, etc.)
 * @returns {object} Graph-Objekt
 */
export function createGraph(meta = {}) {
  return {
    id: generateId('g'),
    meta: {
      project: meta.project || 'SPIN',
      created: new Date().toISOString(),
      ...meta,
    },
    nodes: {},
    links: [],
  };
}

// ═══════════════════════════════════════════════════════════════════════
// Nodes
// ═══════════════════════════════════════════════════════════════════════

/**
 * Fügt einen Node zum Graphen hinzu.
 * Jeder Node ist offen — properties und links können jederzeit ergänzt werden.
 *
 * @param {object} graph - Der Graph
 * @param {object} spec - Node-Spezifikation
 * @param {string} spec.type - Node-Typ (beliebiger String)
 * @param {string} spec.label - Menschenlesbarer Name
 * @param {object} [spec.properties] - Beliebige Key-Value-Paare
 * @param {object} [spec.source] - Herkunft { document, project, line }
 * @param {string} [spec.id] - Eigene ID (optional, wird sonst generiert)
 * @returns {object} Der erstellte Node
 */
export function addNode(graph, spec) {
  const node = {
    id: spec.id || generateId('n'),
    type: spec.type || 'concept',
    label: spec.label || '',
    properties: { ...(spec.properties || {}) },
    source: spec.source || null,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
  };
  graph.nodes[node.id] = node;
  return node;
}

/**
 * Gibt einen Node anhand seiner ID zurück.
 *
 * @param {object} graph
 * @param {string} id
 * @returns {object|null}
 */
export function getNode(graph, id) {
  return graph.nodes[id] || null;
}

/**
 * Setzt eine Property auf einem Node. Überschreibt existierende, fügt neue hinzu.
 * Nodes sind nie „voll belegt" — diese Operation ist immer möglich.
 *
 * @param {object} graph
 * @param {string} nodeId
 * @param {string} key
 * @param {*} value
 * @returns {object|null} Der aktualisierte Node, oder null wenn nicht gefunden
 */
export function setProperty(graph, nodeId, key, value) {
  const node = graph.nodes[nodeId];
  if (!node) return null;
  node.properties[key] = value;
  node.modified = new Date().toISOString();
  return node;
}

/**
 * Entfernt einen Node und alle zugehörigen Links.
 *
 * @param {object} graph
 * @param {string} nodeId
 * @returns {boolean} true wenn entfernt
 */
export function removeNode(graph, nodeId) {
  if (!graph.nodes[nodeId]) return false;
  delete graph.nodes[nodeId];
  graph.links = graph.links.filter(
    l => l.source !== nodeId && l.target !== nodeId
  );
  return true;
}

// ═══════════════════════════════════════════════════════════════════════
// Links — „Fäden spinnen"
// ═══════════════════════════════════════════════════════════════════════

/**
 * Erstellt eine Verbindung zwischen zwei Nodes.
 * Links können Dokument- und Projektgrenzen überschreiten — target kann
 * eine ID aus einem anderen Graphen sein (z.B. „flow2:n-abc-123").
 *
 * @param {object} graph
 * @param {string} sourceId - Quell-Node-ID
 * @param {string} targetId - Ziel-Node-ID (kann cross-project sein)
 * @param {object} [spec] - Link-Spezifikation
 * @param {string} [spec.type] - Link-Typ (beliebiger String)
 * @param {string} [spec.label] - Menschenlesbare Beschreibung
 * @param {boolean} [spec.bidirectional] - Beidseitige Verbindung
 * @param {object} [spec.properties] - Beliebige Metadaten
 * @returns {object} Der erstellte Link
 */
export function link(graph, sourceId, targetId, spec = {}) {
  const l = {
    id: generateId('l'),
    source: sourceId,
    target: targetId,
    type: spec.type || 'relates_to',
    label: spec.label || '',
    bidirectional: spec.bidirectional || false,
    properties: { ...(spec.properties || {}) },
    created: new Date().toISOString(),
  };
  graph.links.push(l);
  return l;
}

/**
 * Gibt alle Links zurück, die einen bestimmten Node betreffen.
 *
 * @param {object} graph
 * @param {string} nodeId
 * @returns {object[]} Array von Links
 */
export function getLinks(graph, nodeId) {
  return graph.links.filter(
    l => l.source === nodeId || l.target === nodeId
  );
}

/**
 * Entfernt einen Link.
 *
 * @param {object} graph
 * @param {string} linkId
 * @returns {boolean}
 */
export function removeLink(graph, linkId) {
  const before = graph.links.length;
  graph.links = graph.links.filter(l => l.id !== linkId);
  return graph.links.length < before;
}

// ═══════════════════════════════════════════════════════════════════════
// Suche & Traversal
// ═══════════════════════════════════════════════════════════════════════

/**
 * Findet Nodes anhand von Filtern.
 * Alle Filter sind optional — leerer Filter gibt alle Nodes zurück.
 *
 * @param {object} graph
 * @param {object} [filter]
 * @param {string} [filter.type] - Exakter Typ-Match
 * @param {string} [filter.label] - Substring-Match im Label (case-insensitive)
 * @param {string} [filter.project] - Source-Project-Match
 * @param {function} [filter.predicate] - Beliebige Filter-Funktion (node) => boolean
 * @returns {object[]}
 */
export function findNodes(graph, filter = {}) {
  let nodes = Object.values(graph.nodes);

  if (filter.type) {
    nodes = nodes.filter(n => n.type === filter.type);
  }
  if (filter.label) {
    const lower = filter.label.toLowerCase();
    nodes = nodes.filter(n => n.label.toLowerCase().includes(lower));
  }
  if (filter.project) {
    nodes = nodes.filter(n => n.source && n.source.project === filter.project);
  }
  if (filter.predicate) {
    nodes = nodes.filter(filter.predicate);
  }

  return nodes;
}

/**
 * Gibt alle direkten Nachbarn eines Nodes zurück (über Links verbundene Nodes).
 *
 * @param {object} graph
 * @param {string} nodeId
 * @returns {object[]} Array von { node, link, direction }
 */
export function getNeighbors(graph, nodeId) {
  const neighbors = [];
  for (const l of graph.links) {
    if (l.source === nodeId) {
      const target = graph.nodes[l.target];
      if (target) neighbors.push({ node: target, link: l, direction: l.bidirectional ? 'both' : 'outgoing' });
    }
    if (l.target === nodeId) {
      const source = graph.nodes[l.source];
      if (source) neighbors.push({ node: source, link: l, direction: l.bidirectional ? 'both' : 'incoming' });
    }
  }
  return neighbors;
}

// ═══════════════════════════════════════════════════════════════════════
// Serialisierung — Export / Import
// ═══════════════════════════════════════════════════════════════════════

/**
 * Exportiert den Graphen als serialisierbares Objekt.
 * Kann als JSON gespeichert und später importiert werden.
 *
 * @param {object} graph
 * @returns {object}
 */
export function exportGraph(graph) {
  return {
    version: '0.1.0',
    type: 'spin-graph',
    id: graph.id,
    meta: { ...graph.meta },
    nodes: Object.values(graph.nodes).map(n => ({ ...n, properties: { ...n.properties } })),
    links: graph.links.map(l => ({ ...l, properties: { ...l.properties } })),
  };
}

/**
 * Importiert einen Graphen aus einem serialisierten Objekt.
 *
 * @param {object} data - Exportiertes Graph-Objekt
 * @returns {object} Graph
 */
export function importGraph(data) {
  const graph = {
    id: data.id || generateId('g'),
    meta: { ...data.meta },
    nodes: {},
    links: (data.links || []).map(l => ({ ...l, properties: { ...(l.properties || {}) } })),
  };
  for (const n of (data.nodes || [])) {
    graph.nodes[n.id] = { ...n, properties: { ...(n.properties || {}) } };
  }
  return graph;
}

// ═══════════════════════════════════════════════════════════════════════
// Graph-Zusammenführung — Projektübergreifend
// ═══════════════════════════════════════════════════════════════════════

/**
 * Führt einen fremden Graphen in den aktuellen ein.
 * Nodes werden kopiert (mit Präfix falls IDs kollidieren).
 * Links bleiben erhalten. Ermöglicht projektübergreifende Verknüpfung.
 *
 * @param {object} target - Ziel-Graph
 * @param {object} source - Quell-Graph
 * @param {string} [prefix] - Optional: Prefix für importierte Node-IDs
 * @returns {{ nodeMap: object, imported: number }} Mapping alte→neue IDs
 */
export function mergeGraph(target, source, prefix = '') {
  const nodeMap = {};
  let imported = 0;

  for (const node of Object.values(source.nodes)) {
    const newId = prefix ? `${prefix}:${node.id}` : node.id;
    if (!target.nodes[newId]) {
      target.nodes[newId] = {
        ...node,
        id: newId,
        properties: { ...node.properties },
        source: node.source || { project: source.meta.project || 'unknown' },
      };
      imported++;
    }
    nodeMap[node.id] = newId;
  }

  for (const l of source.links) {
    const newSource = nodeMap[l.source] || l.source;
    const newTarget = nodeMap[l.target] || l.target;
    target.links.push({
      ...l,
      id: generateId('l'),
      source: newSource,
      target: newTarget,
      properties: { ...l.properties },
    });
  }

  return { nodeMap, imported };
}
