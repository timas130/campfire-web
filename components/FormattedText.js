// feel free to copy+paste this to r/shittyprogramming, i didn't write it
class TextFormatter {
  static charProtector = "\\";
  static charProtectorWord = "@";
  static chars = ["\\", "@", "*", "^", "~", "_", "{", "}"];
  static charNoFormat = "[noFormat]";
  static charNoFormatEnd = "[/noFormat]";

  constructor(text = "") {
    this.text = this.encode(text);
    this.result = null;
    this.i = 0;
    this.skipToSpace = false;
    this.skipToNextNoFormat = false;
  }

  encode(r) {
    return r.replace(/[\x26<>'"]/g, (r) => ("&#" + r.charCodeAt(0) + ";"));
  }

  parseHtml() {
    if (this.result === null) this.parseText();
    return this.result;
  }

  parseText() {
    this.result = "";
    while (this.i < this.text.length) {
      if (this.skipToSpace) {
        if (this.text.charAt(this.i) === " ") {
          this.skipToSpace = false;
          if (
            this.text.charAt(this.i - 1) !== "@" &&
            TextFormatter.chars.includes(this.text.charAt(this.i - 1))
          ) {
            this.i = this.i - 1;
          }
        } else {
          this.result += this.text.charAt(this.i++);
          continue;
        }
      }

      //#region [noFormat]
      if (this.skipToNextNoFormat) {
        if (
          this.text.charAt(this.i) === "[" &&
          this.text.length - 1 >= TextFormatter.charNoFormatEnd.length &&
          this.text.substring(this.i, this.i + TextFormatter.charNoFormatEnd.length) === TextFormatter.charNoFormatEnd &&
          (this.i === 0 || this.text.charAt(this.i - 1) !== TextFormatter.charProtector)
        ) {
          this.i += TextFormatter.charNoFormatEnd.length;
          this.skipToNextNoFormat = false;
        } else {
          this.result += this.text.charAt(this.i++);
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
        this.result += this.text.charAt(this.i++);
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
        this.result += this.text.charAt(this.i++);
        continue;
      }
      if (this.text.charAt(this.i) === "\n") {
        this.result += "<br />";
        this.i++;
        continue;
      }
      if (this.parseHtmlTag("*", "<b>", "</b>")) continue;
      if (this.parseHtmlTag("^", "<i>", "</i>")) continue;
      if (this.parseHtmlTag("~", "<s>", "</s>")) continue;
      if (this.parseHtmlTag("_", "<u>", "</u>")) continue;
      if (this.parseColorHash()) continue;
      // TODO continue translating TextFormatter.kt
      this.result += this.text.charAt(this.i++);
    }
  }

  parseHtmlTag(c, open, close) {
    if (this.text.charAt(this.i) === c) {
      const next = this.findNext(c, 0);
      if (next !== -1) {
        this.result += open + new TextFormatter(this.text.substring(this.i + 1, next)).parseHtml() + close;
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
            this.result += `<span style="color: #${color};">${
              new TextFormatter(this.text.substring(this.i + 8, next)).parseHtml()
            }</span>`;
            this.i = next + 1;
            return true;
          }
        }
      }
      return false;
    } catch (e) {
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
}

export default function FormattedText(props) {
  const {text} = props;
  return <span dangerouslySetInnerHTML={{__html: new TextFormatter(text).parseHtml()}} />;
}
