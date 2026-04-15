import React from "react";
import FormattedText from "./FormattedText";
import MarkdownText from "./MarkdownText";

export default function SmartText({text, newFormatting, className, ...rest}) {
  if (newFormatting) {
    return <MarkdownText text={text} className={className} />;
  }
  return <FormattedText text={text} className={className} {...rest} />;
}
