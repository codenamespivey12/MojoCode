import React from "react";
import { ExtraProps } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

// See https://github.com/remarkjs/react-markdown?tab=readme-ov-file#use-custom-components-syntax-highlight

/**
 * Component to render code blocks in markdown.
 */
export function code({
  children,
  className,
}: React.ClassAttributes<HTMLElement> &
  React.HTMLAttributes<HTMLElement> &
  ExtraProps) {
  const match = /language-(\w+)/.exec(className || ""); // get the language

  if (!match) {
    const isMultiline = String(children).includes("\n");

    if (!isMultiline) {
      return (
        <code
          className={className}
          style={{
            backgroundColor: "#f6f8fa",
            padding: "0.2em 0.4em",
            borderRadius: "4px",
            color: "#24292f",
            border: "1px solid #d0d7de",
          }}
        >
          {children}
        </code>
      );
    }

    return (
      <pre
        style={{
          backgroundColor: "#f6f8fa",
          padding: "1em",
          borderRadius: "4px",
          color: "#24292f",
          border: "1px solid #d0d7de",
          overflow: "auto",
        }}
      >
        <code className={className}>{String(children).replace(/\n$/, "")}</code>
      </pre>
    );
  }

  return (
    <SyntaxHighlighter
      className="rounded-lg"
      style={oneLight}
      language={match?.[1]}
      PreTag="div"
    >
      {String(children).replace(/\n$/, "")}
    </SyntaxHighlighter>
  );
}
