import classNames from "classnames";
import classes from "../../../../styles/Page.module.css";
import {useEffect, useMemo, useRef} from "react";

import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";

async function loadLanguage(lang) {
  switch (lang) {
    case "c": return await import("prismjs/components/prism-c.js");
    case "csharp": return await import("prismjs/components/prism-csharp.js");
    case "java": return await import("prismjs/components/prism-java.js");
    case "bash": return await import("prismjs/components/prism-bash.js");
    case "python": return await import("prismjs/components/prism-python.js");
    case "perl": return await import("prismjs/components/prism-perl.js");
    case "ruby": return await import("prismjs/components/prism-ruby.js");
    case "javascript": return await import("prismjs/components/prism-javascript.js");
    case "coffeescript": return await import("prismjs/components/prism-coffeescript.js");
    case "rust": return await import("prismjs/components/prism-rust.js");
    case "basic": return await import("prismjs/components/prism-basic.js");
    case "clojure": return await import("prismjs/components/prism-clojure.js");
    case "css": return await import("prismjs/components/prism-css.js");
    case "dart": return await import("prismjs/components/prism-dart.js");
    case "erlang": return await import("prismjs/components/prism-erlang.js");
    case "go": return await import("prismjs/components/prism-go.js");
    case "haskell": return await import("prismjs/components/prism-haskell.js");
    case "lisp": return await import("prismjs/components/prism-lisp.js");
    case "llvm": return await import("prismjs/components/prism-llvm.js");
    case "lua": return await import("prismjs/components/prism-lua.js");
    case "matlab": return await import("prismjs/components/prism-matlab.js");
    case "fsharp": return await import("prismjs/components/prism-fsharp.js");
    case "pascal": return await import("prismjs/components/prism-pascal.js");
    case "r": return await import("prismjs/components/prism-r.js");
    case "scala": return await import("prismjs/components/prism-scala.js");
    case "sql": return await import("prismjs/components/prism-sql.js");
    case "latex": return await import("prismjs/components/prism-latex.js");
    case "visual-basic": return await import("prismjs/components/prism-visual-basic.js");
    case "vhdl": return await import("prismjs/components/prism-vhdl.js");
    case "tcl": return await import("prismjs/components/prism-tcl.js");
    case "wiki": return await import("prismjs/components/prism-wiki.js");
    case "xquery": return await import("prismjs/components/prism-xquery.js");
    case "yaml": return await import("prismjs/components/prism-yaml.js");
    case "markdown": return await import("prismjs/components/prism-markdown.js");
    case "json": return await import("prismjs/components/prism-json.js");
    case "markup": return await import("prismjs/components/prism-markup.js");
    case "protobuf": return await import("prismjs/components/prism-protobuf.js");
    case "regex": return await import("prismjs/components/prism-regex.js");
  }
}

export default function CodePage({ page }) {
  const code = page.code || "";
  let language = useMemo(() => {
    let language = page.language || "";

    if (language === "clj") language = "clojure";
    else if (language === "fs") language = "fsharp";
    else if (language === "mumps") language = "powershell";
    else if (language === "n") language = "python";
    else if (language === "rd") language = "r";
    else if (language === "apollo") language = "python";
    else if (language === "wiki.meta") language = "wiki";
    else if (language === "xq") language = "xquery";
    else if (language === "proto") language = "protobuf";

    else if (!language.match(/^[a-z]+$/)) language = "c";

    return language;
  }, [page.language]);

  const codeRef = useRef();

  useEffect(() => {
    if (!codeRef.current) return;
    (async () => {
      await loadLanguage(language);
      Prism.highlightElement(codeRef.current);
    })();
  }, [code, language]);

  return <div className={classNames(classes.codePage)}>
    <pre>
      <code ref={codeRef} className={`language-${language}`}>{code}</code>
    </pre>
  </div>;
}
