import ReactMarkdown from "react-markdown";
import Link from "next/link";
import React from "react";
import classNames from "classnames";
import classes from "../styles/Markdown.module.css";

export default function MarkdownText({text, className}) {
  if (!text) return null;
  return (
    <ReactMarkdown
      className={classNames(classes.markdown, className)}
      skipHtml
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
