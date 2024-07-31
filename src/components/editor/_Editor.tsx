import { useKeyPress } from "@/utils";
import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Compartment } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { EditorView, basicSetup } from "codemirror";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface CodeEditorProps {
  code: string;
  onChange: (code: string, packages: string[]) => void;
  handleSave: () => void;
}

const langauge = new Compartment();

const highlightStyle = HighlightStyle.define([
  { tag: tags.string, color: "#ffffff" },
  { tag: tags.keyword, color: "#ffffff90" },
  { tag: tags.comment, color: "#ffffff50", fontStyle: "italic" },
  { tag: tags.definition(tags.typeName), color: "#ffffff" },
  { tag: tags.typeName, color: "#ffffff80" },
  { tag: tags.angleBracket, color: "#ffffff80" },
  { tag: tags.tagName, color: "#ffffff80" },
  { tag: tags.attributeName, color: "#ffffff80" },
  { tag: tags.number, color: "#ffffff60" },
  { tag: tags.bool, color: "#ffffff60" },
  { tag: tags.null, color: "#ffffff60" },
  { tag: tags.operator, color: "#ffffff60" },
  { tag: tags.className, color: "#ffffff70" }
]);

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, handleSave }) => {
  useKeyPress(["s"], () => handleSave(), true);

  const editorView = useRef<EditorView | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const [, setDetectedPackages] = useState<string[]>([]);

  const detectPackages = useCallback((code: string) => {
    const importRegex = /import.*from\s+['"](.+)['"]/g;
    const packages = new Set<string>();
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      const packageName = match[1];
      if (!packageName.startsWith(".") && packageName !== "react" && packageName !== "react-dom") {
        // For scoped packages or packages with paths, we only want the main package name
        const mainPackage = packageName.split("/")[0];
        packages.add(mainPackage);
      }
    }
    return Array.from(packages);
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      const packages = detectPackages(value);
      setDetectedPackages(packages);
      onChange(value, packages);
    },
    [onChange, detectPackages]
  );

  useEffect(() => {
    const initialPackages = detectPackages(code);
    setDetectedPackages(initialPackages);
    onChange(code, initialPackages);
  }, [code, detectPackages]);

  useEffect(() => {
    if (!editorRef.current) return;
    if (!editorView.current)
      editorView.current = new EditorView({
        doc: code,
        extensions: [
          basicSetup,
          langauge.of(javascript()),
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              handleChange(update.state.doc.toString());
            }
          }),
          EditorView.lineWrapping,
          keymap.of([indentWithTab]),
          syntaxHighlighting(highlightStyle),
          EditorView.theme(
            {
              "&": {
                color: "white",
                fontSize: "13px",
                height: "100%",
                maxHeight: "100%",
                border: "none",
                padding: "0px",
                margin: "0px",
                background: "transparent",
                outline: "none",
                overflow: "hidden"
              },
              ".cm-scroller": { overflow: "auto" },
              ".cm-selectionLayer .cm-selectionBackground": {
                backgroundColor: "rgba(255,255,255,0.1) !important"
              },
              "&.cm-focused": {
                border: "none !important",
                outline: "none !important"
              },
              ".cm-content": {
                caretColor: "white !important",
                paddingBottom: "25vh"
              },
              "&.cm-focused .cm-cursor": {
                borderLeftColor: "#ffffff",
                borderLeftWidth: "1.5px"
              },
              "&.cm-focused .cm-selectionBackground, ::selection": {
                backgroundColor: "rgba(255,255,255,0.3)"
              },
              ".cm-gutters": {
                backgroundColor: "transparent",
                display: "none",
                visibility: "hidden"
              },
              ".cm-activeLine .cm-line": {
                backgroundColor: "rgba(255,255,255,0.1)"
              },
              ".cm-selectionMatch": {
                backgroundColor: "rgba(255,0,0,0.3)"
              },
              ".cm-activeLine": {
                backgroundColor: "rgba(255,255,255,0.1) !important"
              },
              ".cm-line": {
                caretColor: "white !important"
              }
            },
            { dark: true }
          )
        ],
        parent: editorRef.current
      });
  }, []);

  useEffect(() => {
    if (!editorView.current) return;
    if (editorView.current.state.doc.toString() !== code) {
      editorView.current.dispatch({
        changes: { from: 0, to: editorView.current.state.doc.length, insert: code }
      });
    }
  }, [code, editorView]);

  return <div ref={editorRef} className="pointer-events-auto relative h-full w-full" />;
};

export default CodeEditor;
