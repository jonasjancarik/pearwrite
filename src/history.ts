// A short history of what changed in the document while Pearwrite runs, for the
// page's change list. Changes are worked out per block by comparing the file
// before and after each write, so every way of changing it is covered the same
// way: typing on the page, an agent editing the file, or the MCP tools.

import { createHash } from "node:crypto";

import { ID_ATTR, parse, type Node } from "./htmldoc.js";

/**
 * Who made a change. `id` and `name` are only there when a host knows who it is; locally there is
 * one person and one agent, with neither.
 */
export type Author =
  | { kind: "person"; id?: string; name?: string }
  | { kind: "agent"; id?: string; name?: string };

export const YOU: Author = { kind: "person" };
export const AGENT: Author = { kind: "agent" };

/** An author from saved data or a request, including the old "you" and "agent" strings. */
export function readAuthor(value: unknown): Author | undefined {
  if (value === "you") return YOU;
  if (value === "agent") return AGENT;
  if (typeof value !== "object" || value === null) return undefined;
  const { kind, id, name } = value as Record<string, unknown>;
  if (kind !== "person" && kind !== "agent") return undefined;
  return { kind, ...(typeof id === "string" ? { id } : {}), ...(typeof name === "string" ? { name } : {}) };
}

export const sameAuthor = (a: Author, b: Author) => a.kind === b.kind && a.id === b.id;

/**
 * Where a block sits: the id of the nearest block around it ("" at the top),
 * and the elements with an id right before and after it in the same parent element.
 */
export interface Place {
  parent: string;
  prev?: string;
  next?: string;
}

export interface BlockChange {
  id: string;
  kind: "added" | "removed" | "changed" | "moved";
  tag: string;
  fromTag?: string; // set when the element's tag changed, e.g. p → h2
  before?: string; // plain text
  after?: string;
  place?: Place; // where a removed or moved block was before the change
  // For a changed block whose words stayed the same: the words whose formatting changed (bold,
  // italics, a link…), or sameLook when only the markup behind it changed and it looks the same
  // (History leaves those out).
  restyled?: string;
  sameLook?: true;
  // Fingerprints of the block's markup and of how it looks, before and after, so that formatting
  // changes folded together can tell whether they undid each other.
  marks?: { from: string; to: string; fromLook: string; toLook: string };
}

export interface HistoryEntry {
  n: number;
  by: Author;
  started: string; // ISO time of the first change in the entry
  at: string; // ISO time of the latest
  changes: BlockChange[];
}

const TEXT_MAX = 600;
const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/**
 * A copy of `text` that doesn't keep the string it was cut from in memory. A slice shares the
 * memory of the whole string it came from, so keeping a short piece of a large file would
 * otherwise keep all of it.
 */
export const copyOf = (text: string) => (" " + text).slice(1);

/** The readable text of some HTML, on one line. */
export function plainText(html: string): string {
  const text = html
    .replace(/<\/?(?:br|p|div|li|dt|dd|h[1-6]|t[rdh]|caption|figcaption|blockquote)\b[^>]*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) =>
      e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : ENTITIES[e.toLowerCase()] ?? m)
    .replace(/\s+/g, " ")
    .trim();
  return text.length <= TEXT_MAX ? text : text.slice(0, TEXT_MAX) + "…";
}

/** Inline tags that change how text looks, with the name they're compared by. */
const LOOKS: Record<string, string> = {
  b: "b", strong: "b", i: "i", em: "i", u: "u", s: "s", strike: "s", del: "del", ins: "ins", mark: "mark",
  sub: "sub", sup: "sup", code: "code", kbd: "code", small: "small", big: "big", a: "a", q: "q", abbr: "abbr",
};

/** A block's own text, one entry per character, each with the formatting it's shown in. */
function styledText(own: string): { text: string; styles: string[] } {
  const open: string[] = [];
  let text = "";
  const styles: string[] = [];
  const decode = (t: string) => t.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) =>
    e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : ENTITIES[e.toLowerCase()] ?? m);
  const push = (chunk: string) => {
    for (const ch of chunk) {
      const space = /\s/.test(ch);
      // Runs of spaces show as one, and a space looks the same in any formatting.
      if (space && (text === "" || text.endsWith(" "))) continue;
      text += space ? " " : ch;
      styles.push(space ? "" : [...new Set(open)].sort().join(" "));
    }
  };
  for (const [token] of own.matchAll(/<!--[\s\S]*?-->|<[^>]*>|[^<]+/g)) {
    if (token.startsWith("<!--")) continue;
    const tag = /^<(\/?)([a-zA-Z][\w-]*)([^>]*)>$/.exec(token);
    if (!tag) {
      if (!token.startsWith("<")) push(decode(token));
      continue;
    }
    const [, closing, rawName, rest] = tag;
    const name = rawName.toLowerCase();
    if (name === "br") push(" ");
    const look = LOOKS[name];
    if (!look) continue;
    const key = look === "a" ? `a(${/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(rest)?.slice(1).find((h) => h !== undefined) ?? ""})` : look;
    if (closing) {
      const k = open.findLastIndex((o) => o === key || (look === "a" && o.startsWith("a(")));
      if (k !== -1) open.splice(k, 1);
    } else if (!rest.trimEnd().endsWith("/")) open.push(key);
  }
  if (text.endsWith(" ")) {
    text = text.slice(0, -1);
    styles.pop();
  }
  return { text, styles };
}

/**
 * For a block whose words didn't change: the words whose formatting did, or sameLook when it
 * looks the same (the markup was only tidied, say by merging two bold runs into one). Nothing
 * when it can't tell.
 */
export function formattingChange(beforeOwn: string, afterOwn: string): Pick<BlockChange, "restyled" | "sameLook" | "marks"> {
  const a = styledText(beforeOwn), b = styledText(afterOwn);
  if (a.text !== b.text) return {};
  const print = (t: string) => createHash("sha1").update(t).digest("hex").slice(0, 10);
  const marks = { from: print(beforeOwn), to: print(afterOwn), fromLook: print(a.styles.join("|")), toLook: print(b.styles.join("|")) };
  // The words, and which of them have a character shown differently.
  const words: { text: string; changed: boolean }[] = [];
  let word = { text: "", changed: false };
  for (let i = 0; i <= b.text.length; i++) {
    if (i === b.text.length || b.text[i] === " ") {
      if (word.text) words.push(word);
      word = { text: "", changed: false };
      continue;
    }
    word.text += b.text[i];
    if (a.styles[i] !== b.styles[i]) word.changed = true;
  }
  if (!words.some((w) => w.changed)) return { sameLook: true, marks };
  // Neighbouring changed words read as one stretch; stretches apart are joined with an ellipsis.
  const stretches: string[] = [];
  words.forEach((w, k) => {
    if (!w.changed) return;
    if (k > 0 && words[k - 1].changed) stretches[stretches.length - 1] += " " + w.text;
    else stretches.push(w.text);
  });
  const restyled = stretches.join(" … ");
  return { restyled: restyled.length > 160 ? restyled.slice(0, 159) + "…" : restyled, marks };
}

interface Block {
  tag: string;
  parent: string; // id of the nearest block around it, "" at the top
  own: string; // its content without the blocks nested in it, for comparing
  text: string;
  place: Place;
}

/** The nearest elements with an id inside `node`, not looking further into them. */
function nested(node: Node): Node[] {
  const found: Node[] = [];
  for (const child of node.children) {
    if (child.attrs.has(ID_ATTR)) found.push(child);
    else found.push(...nested(child));
  }
  return found;
}

type Blocks = { blocks: Map<string, Block>; order: Map<string, string[]> };

// The last two files looked at: each change compares the file before it, which is usually the
// one the previous change produced, with the file after it.
const recent: { source: string; result: Blocks }[] = [];

/** Every block with an id, in document order, and the order of blocks within each parent. */
function blocksOf(source: string): Blocks {
  const hit = recent.findLast((r) => r.source === source);
  if (hit) return hit.result;
  const result = readBlocks(source);
  recent.push({ source, result });
  if (recent.length > 2) recent.shift();
  return result;
}

function readBlocks(source: string): Blocks {
  const blocks = new Map<string, Block>();
  const order = new Map<string, string[]>();
  // Each element's children that have an id, and where each of them is among those, worked out
  // once per element rather than once per child.
  const idChildren = new Map<Node, Node[]>();
  const position = new Map<Node, number>();
  const withIds = (node: Node) => {
    let found = idChildren.get(node);
    if (!found) {
      idChildren.set(node, (found = node.children.filter((s) => s.attrs.has(ID_ATTR))));
      found.forEach((s, k) => position.set(s, k));
    }
    return found;
  };
  const visit = (node: Node, parent: string) => {
    for (const child of nested(node)) {
      const id = child.attrs.get(ID_ATTR)!;
      if (blocks.has(id)) continue;
      let own = "";
      let at = child.openEnd;
      for (const inner of nested(child)) {
        own += source.slice(at, inner.start);
        at = inner.end;
      }
      own += source.slice(at, child.innerEnd);
      const siblings = withIds(child.parent!);
      const k = position.get(child)!;
      const place: Place = { parent };
      if (k > 0) place.prev = siblings[k - 1].attrs.get(ID_ATTR)!;
      if (k < siblings.length - 1) place.next = siblings[k + 1].attrs.get(ID_ATTR)!;
      blocks.set(id, {
        tag: child.tag,
        parent,
        own: own.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim(),
        text: copyOf(plainText(source.slice(child.openEnd, child.innerEnd))),
        place,
      });
      const ids = order.get(parent);
      if (ids) ids.push(id);
      else order.set(parent, [id]);
      visit(child, id);
    }
  };
  visit(parse(source), "");
  return { blocks, order };
}

/** A short fingerprint of each block's own content, to tell later whether it was changed outside Pearwrite. */
export function fingerprints(source: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const [id, b] of blocksOf(source).blocks) found.set(id, createHash("sha1").update(`${b.tag}\0${b.own}`).digest("hex").slice(0, 10));
  return found;
}

/** Where the block with this id sits in the file, or undefined if it isn't there. */
export function placeOf(source: string, id: string): Place | undefined {
  return blocksOf(source).blocks.get(id)?.place;
}

/** Items of `a` that stay in place when `a` is reordered into `b` (a longest common subsequence). */
function stable(a: string[], b: string[]): Set<string> {
  // Whatever both start and end with stays in place; only the part between needs the full
  // comparison, which is slow for long lists. Ids are unique, so this keeps the same items.
  const keep = new Set<string>();
  let head = 0;
  while (head < a.length && head < b.length && a[head] === b[head]) keep.add(a[head++]);
  let tail = 0;
  while (tail < a.length - head && tail < b.length - head && a[a.length - 1 - tail] === b[b.length - 1 - tail]) {
    keep.add(a[a.length - 1 - tail++]);
  }
  a = a.slice(head, a.length - tail);
  b = b.slice(head, b.length - tail);
  const w = b.length + 1;
  const len = new Int32Array((a.length + 1) * w);
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      len[i * w + j] = a[i] === b[j] ? len[(i + 1) * w + j + 1] + 1 : Math.max(len[(i + 1) * w + j], len[i * w + j + 1]);
  for (let i = 0, j = 0; i < a.length && j < b.length;) {
    if (a[i] === b[j]) { keep.add(a[i]); i++; j++; }
    else if (len[(i + 1) * w + j] >= len[i * w + j + 1]) i++;
    else j++;
  }
  return keep;
}

/** What changed between two versions of the file, block by block. */
export function diffBlocks(beforeSource: string, afterSource: string): BlockChange[] {
  const before = blocksOf(beforeSource);
  const after = blocksOf(afterSource);
  const changes: BlockChange[] = [];
  const moved = new Set<string>();
  for (const [parent, ids] of after.order) {
    const was = (before.order.get(parent) ?? []).filter((id) => after.blocks.get(id)?.parent === parent);
    const now = ids.filter((id) => before.blocks.get(id)?.parent === parent);
    const keep = stable(was, now);
    for (const id of now) if (!keep.has(id)) moved.add(id);
  }
  for (const [id, b] of after.blocks) {
    const a = before.blocks.get(id);
    if (!a) {
      if (!after.blocks.has(b.parent) || before.blocks.has(b.parent))
        changes.push({ id, kind: "added", tag: b.tag, after: b.text });
    } else if (a.own !== b.own || a.tag !== b.tag) {
      changes.push({ id, kind: "changed", tag: b.tag, ...(a.tag !== b.tag ? { fromTag: a.tag } : {}), before: a.text, after: b.text,
        ...(a.tag === b.tag && a.text === b.text ? formattingChange(a.own, b.own) : {}) });
    } else if (moved.has(id) || a.parent !== b.parent) {
      changes.push({ id, kind: "moved", tag: b.tag, after: b.text, place: a.place });
    }
  }
  for (const [id, a] of before.blocks) {
    if (!after.blocks.has(id) && (!before.blocks.has(a.parent) || after.blocks.has(a.parent)))
      changes.push({ id, kind: "removed", tag: a.tag, before: a.text, place: a.place });
  }
  return changes;
}

/** Fold a later change to the same block into an earlier one. Returns false if they cancel out. */
function fold(prev: BlockChange, next: BlockChange): boolean {
  // Where the block was before the first of them.
  if (!prev.place && next.place && prev.kind !== "added") prev.place = next.place;
  if (prev.kind === "added") {
    if (next.kind === "removed") return false;
    prev.tag = next.tag;
    prev.after = next.after ?? prev.after;
    return true;
  }
  if (next.kind === "removed") {
    prev.kind = "removed";
    prev.before ??= next.before;
    delete prev.after;
    delete prev.fromTag;
    return true;
  }
  if (next.kind === "changed" || prev.kind === "changed") {
    if (prev.kind === "moved") prev.before = prev.after;
    prev.kind = "changed";
    const from = prev.fromTag ?? (prev.tag !== next.tag ? prev.tag : undefined);
    if (from && from !== next.tag) prev.fromTag = from;
    else delete prev.fromTag;
  }
  prev.tag = next.tag;
  prev.after = next.after ?? prev.after;
  if (prev.kind !== "changed") return true;
  // Whether the words ended up the same, and so whether only the formatting is left to show.
  const marks = prev.before === prev.after && prev.marks && next.marks
    ? { from: prev.marks.from, to: next.marks.to, fromLook: prev.marks.fromLook, toLook: next.marks.toLook } : undefined;
  const restyled = next.restyled ?? prev.restyled;
  delete prev.restyled;
  delete prev.sameLook;
  delete prev.marks;
  if (prev.before !== prev.after) return true;
  if (!marks) return !!prev.fromTag; // without fingerprints, words back as they were count as undone
  prev.marks = marks;
  if (marks.from === marks.to) return !!prev.fromTag;
  // Looking the same as before the first of them is nothing to show either.
  if (marks.fromLook === marks.toLook) return !!prev.fromTag;
  if (restyled) prev.restyled = restyled;
  return true;
}

/**
 * The list of changes, newest last. Changes by the same author within
 * `windowMs` of each other go into one entry, so a burst of typing or an
 * agent's several quick edits read as one step.
 */
export class History {
  readonly entries: HistoryEntry[] = [];
  /** Goes up whenever the list changes, including when an entry grows. */
  revision = 0;
  private next = 1;

  constructor(readonly windowMs = 30_000, readonly max = 100) {}

  /** Returns true if the list changed. */
  add(by: Author, changes: BlockChange[], now = new Date()): boolean {
    const last = this.entries.at(-1);
    const joins = !!last && sameAuthor(last.by, by) && now.getTime() - Date.parse(last.at) < this.windowMs;
    // A change nobody can see (tidier markup, the same look) isn't worth a line, unless it's
    // folded into an earlier change to the same block, whose fingerprints it carries on.
    changes = changes.filter((c) => !c.sameLook || (joins && last!.changes.some((p) => p.id === c.id)));
    if (!changes.length) return false;
    if (joins && last) {
      for (const change of changes) {
        const i = last.changes.findIndex((c) => c.id === change.id);
        if (i === -1) last.changes.push({ ...change });
        else if (!fold(last.changes[i], change)) last.changes.splice(i, 1);
      }
      last.at = now.toISOString();
      if (!last.changes.length) this.entries.pop();
      this.revision++;
      return true;
    }
    this.entries.push({ n: this.next++, by: { ...by }, started: now.toISOString(), at: now.toISOString(), changes: changes.map((c) => ({ ...c })) });
    if (this.entries.length > this.max) this.entries.shift();
    this.revision++;
    return true;
  }
}
