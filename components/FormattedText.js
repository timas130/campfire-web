// feel free to copy+paste this to r/programminghorror, i didn't write it
import React, {useMemo} from "react";
import linkify from "linkify-it";
import Link from "next/link";
import linkifyRe from "linkify-it/lib/re";

const handleMatcher = {
  validate(text, pos, self) {
    const tail = text.slice(pos);
    if (!self.re.handle) {
      self.re.handle = new RegExp("^([a-zA-Z0-9#_-]+)(?=$|" + self.re.src_ZPCc + ")");
    }
    if (self.re.handle.test(tail)) {
      if (tail[0] === "@" || tail[0] === "#") { // http://##
        return false;
      }
      if (pos >= 2 && (tail[pos - 2] === "@" || tail[pos - 2] === "#")) { // ##handle
        return false;
      }
      return tail.match(self.re.handle)[0].length;
    }
    return 0;
  },
  normalize(match) {
    match.url = "/r/" + encodeURIComponent(match.url.replace(/^[@#]/, ""));
  },
};

const linkifyInst = linkify()
  .add("@", handleMatcher)
  .add("#", handleMatcher);
export const sayzenLink = /^https?:\/\/(?:sayzen\.ru|campfiresayzen\.net)\/r\/r\.php\?a=(.+)$/;

export class TextFormatter {
  static whitespace = /[\x00-\x1F\x7F-\x9F \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;
  static charProtector = "\\";
  static charProtectorWord = "@";
  static chars = ["\\", "@", "*", "^", "~", "_", "{", "}"];
  static charNoFormat = "[noFormat]";
  static charNoFormatEnd = "[/noFormat]";
  static colors = {
    "red": "#D32F2F",
    "pink": "#C2185B",
    "purple": "#7B1FA2",
    "indigo": "#303F9F",
    "blue": "#1976D2",
    "cyan": "#0097A7",
    "teal": "#00796B",
    "green": "#388E3C",
    "lime": "#689F38",
    "yellow": "#FBC02D",
    "amber": "#FFA000",
    "orange": "#F57C00",
    "brown": "#5D4037",
    "grey": "#616161",
    "campfire": "#FF6D00",
    "_cweb_text": "var(--text)",
    "_cweb_secondary": "var(--text-secondary)",
    "_cweb_red": "var(--red)",
    "_cweb_green": "var(--green)",
  };

  static textChars = new RegExp(linkifyRe().src_ZPCc);

  constructor(text = "", key = undefined) {
    this.text = text;
    this.linkMatches = linkifyInst.match(text);
    if (!this.linkMatches) this.linkMatches = [];
    this.result = null;
    this.i = 0;
    this.skipToSpace = false;
    this.skipToNextNoFormat = false;
    this.key = key;
  }

  parseHtml() {
    if (this.result === null) this.parseText();
    return this.result;
  }
  parseDry() {
    return dryReact(this.parseHtml());
  }

  parseText() {
    this.result = React.createElement("span", {
      style: {color: undefined},
      key: this.key,
    }, []);
    while (this.i < this.text.length) {
      if (this.skipToSpace) {
        if (TextFormatter.whitespace.test(this.text.charAt(this.i))) {
          this.skipToSpace = false;
          if (
            this.text.charAt(this.i - 1) !== "@" &&
            TextFormatter.chars.includes(this.text.charAt(this.i - 1))
          ) {
            this.i = this.i - 1;
          }
        } else {
          this.pushStr(this.text.charAt(this.i++));
          continue;
        }
      }

      if (this.text.charAt(this.i) === "\n") {
        this.result.props.children.push(React.createElement("br", {key: this.i}));
        this.i++;
        continue;
      }

      //#region [noFormat]
      if (this.skipToNextNoFormat) {
        if (
          this.text.charAt(this.i) === "[" &&
          this.text.length - 1 >= TextFormatter.charNoFormatEnd.length &&
          this.text.substring(this.i, this.i + TextFormatter.charNoFormatEnd.length) ===
          TextFormatter.charNoFormatEnd &&
          (this.i === 0 || this.text.charAt(this.i - 1) !== TextFormatter.charProtector)
        ) {
          this.i += TextFormatter.charNoFormatEnd.length;
          this.skipToNextNoFormat = false;
        } else {
          this.pushStr(this.text.charAt(this.i++));
        }
        continue;
      }
      if (
        this.text.charAt(this.i) === TextFormatter.charProtector &&
        this.text.length > this.i + 1 &&
        this.text.charAt(this.i + 1) !== TextFormatter.charProtector &&
        TextFormatter.chars.includes(this.text.charAt(this.i + 1))
      ) {
        this.i++;
        this.pushStr(this.text.charAt(this.i++));
        continue;
      }
      if (
        this.text.charAt(this.i) === "[" &&
        this.text.length - this.i >= TextFormatter.charNoFormat.length &&
        this.text.substring(this.i, this.i + TextFormatter.charNoFormat.length) === TextFormatter.charNoFormat &&
        (this.i === 0 || this.text.charAt(this.i - 1) !== TextFormatter.charProtector)
      ) {
        this.i += TextFormatter.charNoFormat.length;
        this.skipToNextNoFormat = true;
        continue;
      }
      //#endregion [/noFormat]

      if (this.text.charAt(this.i) === TextFormatter.charProtectorWord) {
        this.skipToSpace = true;
        this.pushStr(this.text.charAt(this.i++));
        continue;
      }
      if (this.parseHtmlTag("*", "b")) continue;
      if (this.parseHtmlTag("^", "i")) continue;
      if (this.parseHtmlTag("~", "s")) continue;
      if (!this.isInLink() && this.parseHtmlTag("_", "u")) continue;
      if (this.parseLink()) continue;
      if (this.text.charAt(this.i) === "{") {
        if (this.parseColorHash()) continue;

        let colorMatches = false;
        for (const color in TextFormatter.colors) {
          let matches = true;
          if (this.text.length - this.i < color.length + 2) continue;

          const colorWithSpace = color + " ";
          for (let i = 0; i < color.length; i++) {
            if (this.text.charAt(this.i + i + 1).toLowerCase() !== colorWithSpace.charAt(i)) {
              matches = false;
              break;
            }
          }
          if (matches && this.parseColorName(color, TextFormatter.colors[color])) {
            colorMatches = true;
            break;
          }
        }
        if (colorMatches) continue;
      }
      this.pushStr(this.text.charAt(this.i++));
    }
  }

  isInLink() {
    for (const match of this.linkMatches) {
      if (this.i >= match.index && this.i < match.lastIndex) {
        return true;
      }
    }
    return false;
  }

  pushStr(s) {
    const lastIdx = this.result.props.children.length - 1;
    if (typeof this.result.props.children[lastIdx] === "string") {
      this.result.props.children[lastIdx] += s;
    } else {
      this.result.props.children.push(s);
    }
  }

  parseHtmlTag(c, tag) {
    if (this.text.charAt(this.i) === c) {
      const next = this.findNext(c, 0);
      if (next !== -1) {
        const inner = new TextFormatter(this.text.substring(this.i + 1, next)).parseHtml();
        const el = React.createElement(tag, {key: this.i}, []);
        for (const child of inner.props.children) {
          el.props.children.push(child);
        }
        this.result.props.children.push(el);

        this.i = next + 1;
        return true;
      }
    }
    return false;
  }

  findNext(c, offset) {
    let next = -1;
    let skip = false;
    let skipToSpace = false;
    let n = this.i + 1 + offset;
    while (n < this.text.length) {
      if (skip) {
        skip = false;
        n++;
        continue;
      }
      if (skipToSpace) {
        if (this.text.charAt(n) === " ") {
          skipToSpace = false;
          if (
            this.text.charAt(n - 1) !== TextFormatter.charProtectorWord &&
            TextFormatter.chars.includes(this.text[n - 1])
          ) n--;
        } else {
          n++;
          continue;
        }
      }
      if (this.text.charAt(n) === c) {
        next = n;
        break;
      } else if (this.text.charAt(n) === TextFormatter.charProtector) {
        skip = true;
      } else if (this.text.charAt(n) === TextFormatter.charProtectorWord) {
        skipToSpace = true;
      }
      n++;
    }
    return next;
  }

  parseLink() {
    try {
      if (this.text.charAt(this.i) === "[") {
        const nextClose = this.findNext("]", 0);
        if (nextClose === -1) return false;

        let nextSpace = this.findNext(" ", nextClose - this.i);
        if (nextSpace === -1) nextSpace = this.text.length;

        if (TextFormatter.textChars.test(this.text.charAt(nextSpace - 1))) nextSpace--;
        const name = this.text.substring(this.i + 1, nextClose);
        const link = this.text.substring(nextClose + 1, nextSpace);

        if (this.isWebLink(link) || link.startsWith(TextFormatter.charProtectorWord)) {
          const el = React.createElement("a", {
            href: this.castToWebLink(link),
            key: this.i,
          }, name);
          this.i = nextSpace;
          this.result.props.children.push(el);
          return true;
        }
      }
    } catch (e) {
      console.warn("parser error:", e);
    }
    return false;
  }
  isWebLink(s) {
    let x = s.indexOf(".");
    if (x === -1) return false;
    while (x !== -1) {
      if (x === s.length - 1) return false;
      x = s.indexOf(".", x + 1);
    }
    return true;
  }
  castToWebLink(s) {
    // noinspection HttpUrlsUsage
    if (s.startsWith("https://") || s.startsWith("http://")) {
      return s;
    } else {
      return "https://" + s;
    }
  }

  parseColorHash() {
    try {
      if (this.text.charAt(this.i) === "{") {
        const c = [
          this.nextColorChar(this.i + 1),
          this.nextColorChar(this.i + 2),
          this.nextColorChar(this.i + 3),
          this.nextColorChar(this.i + 4),
          this.nextColorChar(this.i + 5),
          this.nextColorChar(this.i + 6),
        ];
        if (!c.includes(null) && this.text.charAt(this.i + 7) === " ") {
          const color = c.join("");
          const next = this.findNext("}", 7);
          if (next !== -1) {
            const t = new TextFormatter(this.text.substring(this.i + 8, next), this.i).parseHtml();
            t.props.style.color = "#" + color;
            this.result.props.children.push(t);
            this.i = next + 1;
            return true;
          }
        }
      }
      return false;
    } catch (e) {
      console.warn("parser error:", e);
      return false;
    }
  }
  nextColorChar(i) {
    const char = this.text.charAt(i).toLowerCase();
    const charCode = char.charCodeAt(0);
    if (
      (charCode >= 48 && charCode <= 57) ||
      (charCode >= 97 && charCode <= 102)
    ) return char;
    return null;
  }

  parseColorName(name, hash) {
    try {
      const next = this.findNext("}", name.length + 1);
      if (next !== -1) {
        const t = new TextFormatter(this.text.substring(this.i + name.length + 2, next), this.i).parseHtml();
        t.props.style.color = hash;
        this.result.props.children.push(t);
        this.i = next + 1;
      }
      return true;
    } catch (e) {
      console.warn("parser error:", e);
    }
    return false;
  }
}

// stolen and simplified from yarn.pm/react-linkify
export function linkifyReact(children, key = 0) {
  if (typeof children === "string") {
    if (children === "") return children;
    const matches = linkifyInst.match(children);
    if (! matches) return children;

    const result = [];
    let lastIndex = 0;
    matches.forEach((match, i) => {
      if (match.index > lastIndex) {
        result.push(children.substring(lastIndex, match.index));
      }

      // replace http://sayzen.ru/r/r.php?a= links with /r/
      let url = match.url;
      const sayzenMatch = url.match(sayzenLink);
      if (sayzenMatch) url = "/r/" + encodeURIComponent(sayzenMatch[1]);

      let text = match.text;
      const textSayzenMatch = text.match(sayzenLink);
      if (textSayzenMatch) text = "@" + encodeURIComponent(textSayzenMatch[1]);

      // add the result
      result.push(<Link href={url} key={i}>{text}</Link>);
      lastIndex = match.lastIndex;
    });

    if (children.length > lastIndex) {
      result.push(children.substring(lastIndex));
    }

    return (result.length === 1) ? result[0] : result;
  } else if (React.isValidElement(children) && children.type !== "a") {
    return React.cloneElement(children, {key}, linkifyReact(children.props.children));
  } else if (Array.isArray(children)) {
    return children.map((child, i) => linkifyReact(child, i));
  }

  return children;
}

// converts a react element into plain text
export function dryReact(el) {
  if (! el.props.children) return "";
  let result = "";

  for (const child of el.props.children) {
    if (typeof child === "string") {
      result += child;
    } else {
      result += dryReact(child);
    }
  }

  return result;
}

export default function FormattedText({text}) {
  return useMemo(() => <React.Fragment>
    {linkifyReact(new TextFormatter(text).parseHtml())}
  </React.Fragment>, [text]);
}
