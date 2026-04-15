import ReactMarkdown from "react-markdown";
import Link from "next/link";
import React from "react";
import classNames from "classnames";
import classes from "../styles/Markdown.module.css";

// Legacy TextFormatter color syntax (still mixed into newFormatting bodies):
//   {66cc33 text}, {red text}, {campfire text}, ...
const COLOR_RE = /\{([0-9a-fA-F]{6}|[a-zA-Z]+) ([^{}]+)\}/g;

const NAMED_COLORS = {
  red: "#D32F2F",
  green: "#388E3C",
  blue: "#1976D2",
  orange: "#FF6D00",
  campfire: "#FF6D00",
  yellow: "#FBC02D",
  purple: "#7B1FA2",
  pink: "#FF6DAA",
};

function resolveColor(token) {
  return NAMED_COLORS[token.toLowerCase()] || ("#" + token);
}

function visitText(node, transform) {
  if (!node || !Array.isArray(node.children)) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.type === "text") {
      const replaced = transform(child.value);
      if (replaced) {
        node.children.splice(i, 1, ...replaced);
        i += replaced.length - 1;
      }
    } else {
      visitText(child, transform);
    }
  }
}

function remarkLegacyColor() {
  return (tree) => {
    visitText(tree, (text) => {
      COLOR_RE.lastIndex = 0;
      if (!COLOR_RE.test(text)) return null;
      COLOR_RE.lastIndex = 0;
      const out = [];
      let cursor = 0;
      let m;
      while ((m = COLOR_RE.exec(text))) {
        if (m.index > cursor) {
          out.push({type: "text", value: text.slice(cursor, m.index)});
        }
        out.push({
          type: "emphasis",
          children: [{type: "text", value: m[2]}],
          data: {
            hName: "span",
            hProperties: {style: `color: ${resolveColor(m[1])}`},
          },
        });
        cursor = m.index + m[0].length;
      }
      if (cursor < text.length) out.push({type: "text", value: text.slice(cursor)});
      return out;
    });
  };
}

export default function MarkdownText({text, className}) {
  if (!text) return null;
  return (
    <ReactMarkdown
      className={classNames(classes.markdown, className)}
      skipHtml
      remarkPlugins={[remarkLegacyColor]}
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
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
