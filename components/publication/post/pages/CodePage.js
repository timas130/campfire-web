import classNames from "classnames";
import classes from "../../../../styles/Page.module.css";
import {useEffect, useMemo, useRef, useState} from "react";

import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import dynamic from "next/dynamic";
import FeedTypeSelectorCard from "../../../cards/FeedTypeSelectorCard";
import {EditToolbar, ToolbarActions} from "./Page";
import Input from "../../../controls/Input";
import InputLabel from "../../../controls/InputLabel";
import isTouchDevice from "is-touch-device";

const Editor = dynamic(() => import("@monaco-editor/react")
  .then(a => a.loader.config({
    paths: {
      vs: "/vs",
    },
    "vs/nls": {
      availableLanguages: {
        "*": "ru",
      },
    },
  }))
  .then(() => import("@monaco-editor/react"))
  .then(a => a.default));

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

const languageNames = {
  "c": "C", "cs": "C#", "java": "Java", "bash": "Bash", "python": "Python",
  "perl": "Perl", "ruby": "Ruby", "js": "JavaScript (умный)",
  "coffee": "CoffeeScript", "rust": "Rust", "basic": "Basic", "clj": "Clojure",
  "css": "CSS (умный)", "dart": "Dart", "erlang": "Erlang", "go": "Go", "hs": "Haskell",
  "lisp": "Lisp", "llvm": "LLVM", "lua": "Lua", "matlab": "Matlab",
  "fs": "ML (OCaml, SML, F#)", "mumps": "Mumps", "n": "Nemerle",
  "pascal": "Pascal", "r": "R", "rd": "Rd", "scala": "Scala", "sql": "SQL",
  "tex": "Tex", "vb": "Visual Basic", "vhdl": "VHDL", "apollo": "Apollo",
  "tcl": "Tcl", "wiki.meta": "Wiki", "xq": "XQuery", "yaml": "YAML",
  "md": "Markdown", "json": "JSON (умный)", "xml": "HTML/XML (умный)",
  "proto": "Protobuf", "regex": "Regex",
};
const languageOverrides = {
  "clj": "clojure",
  "fs": "fsharp",
  "mumps": "powershell",
  "n": "python",
  "rd": "r",
  "apollo": "python",
  "wiki.meta": "wiki",
  "xq": "xquery",
  "proto": "protobuf",
};
const monacoOverrides = {
  "cs": "csharp",
  "bash": "shell",
  "js": "javascript",
  "coffee": "coffeescript",
  "basic": "common",
  "clj": "clojure",
  "erlang": "common",
  "hs": "common",
  "lisp": "common",
  "llvm": "common",
  "lua": "lua",
  "matlab": "common",
  "fs": "fsharp",
  "mumps": "common",
  "n": "common",
  "r": "r",
  "rd": "common",
  "tex": "common",
  "vb": "common",
  "vhdl": "common",
  "apollo": "common",
  "wiki.meta": "common",
  "xq": "common",
  "md": "markdown",
  "xml": "html",
  "regex": "Regex",
};

export default function CodePage({ page, onEdit = null }) {
  const code = page.code || "";
  let language = useMemo(() => {
    let language = page.language || "";

    if (languageOverrides[language]) language = languageOverrides[language];
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

  return <div className={classNames(classes.codePage, onEdit && classes.editable)} onClick={onEdit}>
    <pre>
      <code ref={codeRef} className={`language-${language}`}>{code}</code>
    </pre>
  </div>;
}

export function CodePageEdit({page: initialPage, commit: _commit}) {
  const [page, setPage] = useState(initialPage || {
    J_PAGE_TYPE: 16,
    code: "",
    language: "c",
  });
  const [editorType, _setEditorType] = useState("monaco");
  const editorRef = useRef(null);

  useEffect(() => {
    _setEditorType(isTouchDevice() ? "mobile" : "monaco");
  }, []);

  const updatePage = () => {
    if (editorType === "monaco") {
      const newPage = {...page, code: editorRef.current.getValue()};
      setPage(newPage);
      return newPage;
    }
    return page;
  };
  const setEditorType = type => {
    updatePage();
    _setEditorType(type);
  };
  const commit = arg => {
    if (arg?.__page) {
      const page = updatePage();
      _commit(page);
    } else {
      _commit(arg);
    }
  };

  return <section className={classNames(classes.editing)}>
    <FeedTypeSelectorCard
      type={editorType} setType={setEditorType}
      types={{monaco: "VS Code", mobile: "Мобильный редактор"}}
      className={classes.codePageEditorToolbar}
    />
    {editorType === "monaco" ? <Editor
      height="300px"
      language={monacoOverrides[page.language] || page.language || "common"}
      defaultValue={page.code}
      onMount={editor => editorRef.current = editor}
      theme="vs-dark"
      options={{
        minimap: {enabled: false},
        fontFamily: "\"JetBrains Mono\", SFMono-Regular, Menlo, Monaco, Consolas, " +
          "\"Liberation Mono\", \"Courier New\", monospace",
        fontLigatures: true,
      }}
    /> : <div className={classes.codePageEditorInputWrap}><Input
      el="textarea"
      value={page.code} onChange={ev => setPage(a => ({...a, code: ev.target.value}))}
      placeholder={
        "fn main() -> Result<(), ()> {\n" +
        "    println!(\"Hello, world!\");\n" +
        "    Ok(())\n" +
        "}"
      }
      autoComplete="none" spellCheck={false}
    /></div>}
    <div className={classes.codePageEditorToolbar}>
      <EditToolbar>
        <InputLabel className={classes.codePageEditorCodeLabel} horizontal noInputMargin>
          Язык:&nbsp;
          <Input
            el="select" className={classes.codePageEditorSelect}
            value={page.language} onChange={ev => setPage(a => ({...a, language: ev.target.value}))}
          >
            {Object.entries(languageNames).map(lang => <option key={lang[0]} value={lang[0]}>{lang[1]}</option>)}
          </Input>
        </InputLabel>
        <ToolbarActions page={{__page: true}} commit={commit} />
      </EditToolbar>
    </div>
  </section>;
}
