import classNames from "classnames";
import classes from "../../../../styles/Page.module.css";
import {useEffect, useMemo, useRef} from "react";

import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-c.js";
import "prismjs/components/prism-csharp.js";
import "prismjs/components/prism-java.js";
import "prismjs/components/prism-bash.js";
import "prismjs/components/prism-python.js";
import "prismjs/components/prism-perl.js";
import "prismjs/components/prism-ruby.js";
import "prismjs/components/prism-javascript.js";
import "prismjs/components/prism-coffeescript.js";
import "prismjs/components/prism-rust.js";
import "prismjs/components/prism-basic.js";
import "prismjs/components/prism-clojure.js";
import "prismjs/components/prism-css.js";
import "prismjs/components/prism-dart.js";
import "prismjs/components/prism-erlang.js";
import "prismjs/components/prism-go.js";
import "prismjs/components/prism-haskell.js";
import "prismjs/components/prism-lisp.js";
import "prismjs/components/prism-llvm.js";
import "prismjs/components/prism-lua.js";
import "prismjs/components/prism-matlab.js";
import "prismjs/components/prism-fsharp.js";
import "prismjs/components/prism-pascal.js";
import "prismjs/components/prism-r.js";
import "prismjs/components/prism-scala.js";
import "prismjs/components/prism-sql.js";
import "prismjs/components/prism-latex.js";
import "prismjs/components/prism-visual-basic.js";
import "prismjs/components/prism-vhdl.js";
import "prismjs/components/prism-tcl.js";
import "prismjs/components/prism-wiki.js";
import "prismjs/components/prism-xquery.js";
import "prismjs/components/prism-yaml.js";
import "prismjs/components/prism-markdown.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-markup.js";
import "prismjs/components/prism-protobuf.js";
import "prismjs/components/prism-regex.js";

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
    Prism.highlightElement(codeRef.current, true);
  }, [code, language]);

  return <div className={classNames(classes.codePage)}>
    <pre>
      <code ref={codeRef} className={`language-${language}`}>{code}</code>
    </pre>
  </div>;
}
