import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import React, {useState} from "react";
import classNames from "classnames";
import classes from "../styles/Markdown.module.css";

// ─── BonfireFormattingCore extensions (Kotlin: bfm/*) ──────────────────────
//
// Every extension is implemented as a text-node walker in a single remark
// plugin. We don't write proper micromark/commonmark extensions because the
// markdown is already parsed by react-markdown — splicing custom nodes into
// existing text nodes after the fact gives us the same end result.
//
// Underline `__text__` is special: standard markdown emits these as <strong>,
// so we override the strong component renderer below to read the source and
// switch to <u> when the original delimiter was `_`.

const NAMED_COLORS = {
  red: "#D32F2F", pink: "#C2185B", purple: "#7B1FA2",
  indigo: "#303F9F", blue: "#1976D2", cyan: "#0097A7",
  teal: "#00796B", green: "#388E3C", lime: "#689F38",
  yellow: "#FBC02D", amber: "#FFA000", orange: "#F57C00",
  brown: "#5D4037", grey: "#616161", gray: "#616161",
  campfire: "#FF6D00", bonfire: "#FF6D00",
};

function resolveColorToken(token) {
  const named = NAMED_COLORS[token.toLowerCase()];
  if (named) return named;
  let hex = token.startsWith("#") ? token.slice(1) : token;
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) return "#" + hex;
  return null;
}

function colorStyle(tokens) {
  const colors = tokens.split(":").map(resolveColorToken).filter(Boolean);
  if (colors.length === 0) return null;
  if (colors.length === 1) return {color: colors[0]};
  // gradient — clip to text via background-clip
  return {
    background: `linear-gradient(90deg, ${colors.join(", ")})`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
  };
}

// Mentions: `@user` / `#tag`. Must be preceded and followed by whitespace,
// punctuation, or string boundary (matches Kotlin MentionPostProcessor DELIM).
const MENTION_DELIM = "[\\s$'\"()\\\\^`{}|~./:;<=>+,*%&!?]";
const MENTION_RE = new RegExp(
  `(^|${MENTION_DELIM})([@#]([a-zA-Z0-9\\-_#]+))(?=$|${MENTION_DELIM})`,
  "g",
);

// Inline patterns processed in order — each takes (text) and returns
// either null (no match → leave the text node alone) or an array of
// {leadingText, replacement} segments produced by splitting on the match.
//
// Color is `{COLOR text}`. The color spec is the run before the first
// whitespace inside the braces. `[^{}]` keeps it from spanning across
// other braces.
const COLOR_RE = /\{([^\s{}]+)\s+([^{}]+)\}/g;

// `==text==`
const MARKED_RE = /==([^=\n]+?)==/g;

// `||text||`
const SPOILER_RE = /\|\|([^\n|]+?)\|\|/g;

// `^text^` — superscript. Disallow whitespace immediately inside.
const SUPER_RE = /\^(\S[^^\n]*?\S|\S)\^/g;

// `~text~` — subscript. Single tilde. GFM strike already consumed `~~...~~`.
const SUB_RE = /(?<!~)~(?!~)([^~\n]+?)~(?!~)/g;

function makeNode(hName, value, props = {}) {
  return {
    type: "bfmInline",
    children: typeof value === "string" ? [{type: "text", value}] : value,
    data: {hName, hProperties: props},
  };
}

function applyPattern(text, re, build) {
  re.lastIndex = 0;
  let m, cursor = 0;
  const out = [];
  while ((m = re.exec(text))) {
    if (m.index > cursor) out.push({type: "text", value: text.slice(cursor, m.index)});
    const node = build(m);
    if (node) {
      if (Array.isArray(node)) out.push(...node);
      else out.push(node);
    }
    cursor = m.index + m[0].length;
  }
  if (cursor === 0) return null;
  if (cursor < text.length) out.push({type: "text", value: text.slice(cursor)});
  return out;
}

// Each pattern is a single (text → nodes[] | null) function. The plugin
// runs them as separate visitor passes so a text segment created by one
// pattern can still be matched by later ones.
const textPatterns = [
  text => applyPattern(text, COLOR_RE, m => {
    const style = colorStyle(m[1]);
    if (!style) return null;
    return makeNode("span", m[2], {style: styleObjectToString(style)});
  }),
  text => applyPattern(text, MARKED_RE, m => makeNode("mark", m[1])),
  text => applyPattern(text, SPOILER_RE, m => ({
    type: "bfmInline",
    children: [{type: "text", value: m[1]}],
    data: {hName: "bfm-spoiler"},
  })),
  text => applyPattern(text, SUPER_RE, m => makeNode("sup", m[1])),
  text => applyPattern(text, SUB_RE, m => makeNode("sub", m[1])),
  text => applyPattern(text, MENTION_RE, m => [
    {type: "text", value: m[1]},
    {
      type: "link",
      url: `/r/${m[3]}`,
      children: [{type: "text", value: m[2]}],
    },
  ]),
];

function styleObjectToString(style) {
  return Object.entries(style)
    .map(([k, v]) => {
      const prop = k.startsWith("Webkit") ? "-webkit-" + k.slice(6).toLowerCase() :
        k.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${prop}: ${v}`;
    })
    .join("; ");
}

function visitTextNodes(node, transform, insideLink = false) {
  if (!node || !Array.isArray(node.children)) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const childInLink = insideLink || child.type === "link" || child.type === "linkReference";
    if (child.type === "text" && !insideLink) {
      const replaced = transform(child.value);
      if (replaced) {
        node.children.splice(i, 1, ...replaced);
        i += replaced.length - 1;
        continue;
      }
    }
    visitTextNodes(child, transform, childInLink);
  }
}

// Color spans can wrap nested markdown (e.g. `{red **bold**}`). After
// markdown parsing, the `{`, content, and `}` end up in separate sibling
// nodes; this walker pairs `{COLOR ` openers with `}` closers across
// siblings of the same parent and rewraps everything in between.
const COLOR_OPEN_RE = /\{([^\s{}]+)\s+/;

function spanColorAcrossChildren(parent) {
  if (!Array.isArray(parent.children)) return;
  // depth-first so existing children are processed before we wrap them
  for (const child of parent.children) spanColorAcrossChildren(child);

  let i = 0;
  while (i < parent.children.length) {
    const child = parent.children[i];
    if (child.type !== "text") { i++; continue; }

    const open = COLOR_OPEN_RE.exec(child.value);
    if (!open) { i++; continue; }

    const colorToken = open[1];
    const openStart = open.index;
    const contentStart = openStart + open[0].length;

    let closeIdx = -1, closePos = -1;
    const sameRest = child.value.slice(contentStart);
    const sameClose = sameRest.indexOf("}");
    if (sameClose !== -1) {
      closeIdx = i;
      closePos = contentStart + sameClose;
    } else {
      for (let j = i + 1; j < parent.children.length; j++) {
        const sib = parent.children[j];
        if (sib.type !== "text") continue;
        const k = sib.value.indexOf("}");
        if (k !== -1) { closeIdx = j; closePos = k; break; }
      }
    }
    if (closeIdx === -1) { i++; continue; }

    const style = colorStyle(colorToken);
    if (!style) { i++; continue; }

    const replacement = [];
    if (openStart > 0) {
      replacement.push({type: "text", value: child.value.slice(0, openStart)});
    }
    const colorChildren = [];
    if (closeIdx === i) {
      const inner = child.value.slice(contentStart, closePos);
      if (inner) colorChildren.push({type: "text", value: inner});
    } else {
      const headInner = child.value.slice(contentStart);
      if (headInner) colorChildren.push({type: "text", value: headInner});
      for (let j = i + 1; j < closeIdx; j++) {
        colorChildren.push(parent.children[j]);
      }
      const tailInner = parent.children[closeIdx].value.slice(0, closePos);
      if (tailInner) colorChildren.push({type: "text", value: tailInner});
    }
    replacement.push(makeNode("span", colorChildren, {style: styleObjectToString(style)}));
    const post = parent.children[closeIdx].value.slice(closePos + 1);
    if (post) replacement.push({type: "text", value: post});

    parent.children.splice(i, closeIdx - i + 1, ...replacement);
    i += replacement.length;
  }
}

function remarkBfm() {
  return (tree) => {
    spanColorAcrossChildren(tree);
    // text-only patterns (skip color since it was just done with spanning)
    for (let p = 1; p < textPatterns.length; p++) {
      visitTextNodes(tree, textPatterns[p]);
    }
  };
}

function Spoiler({children}) {
  const [shown, setShown] = useState(false);
  return (
    <span
      className={classNames(classes.spoiler, shown && classes.spoilerShown)}
      onClick={() => setShown(s => !s)}
      role="button"
      tabIndex={0}
      onKeyDown={ev => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          setShown(s => !s);
        }
      }}
    >
      {children}
    </span>
  );
}

export default function MarkdownText({text, className}) {
  if (!text) return null;
  return (
    <div className={classNames(classes.markdown, className)}>
    <ReactMarkdown
      skipHtml
      remarkPlugins={[remarkGfm, remarkBfm]}
      components={{
        a: ({href, children, ...rest}) => {
          if (!href) return <span {...rest}>{children}</span>;
          if (href.startsWith("/")) {
            return <Link href={href}>{children}</Link>;
          }
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
              {children}
            </a>
          );
        },
        // Underline `__text__` — markdown emits <strong> for both `**` and
        // `__`. Read the source position to decide which delimiter was used.
        strong: ({node, children}) => {
          const offset = node?.position?.start?.offset;
          if (typeof offset === "number" && text.charAt(offset) === "_") {
            return <u>{children}</u>;
          }
          return <strong>{children}</strong>;
        },
        "bfm-spoiler": Spoiler,
      }}
    >
      {text}
    </ReactMarkdown>
    </div>
  );
}
