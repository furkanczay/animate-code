"use client";

import React from "react";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  fileName?: string;
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  fileName = "untitled",
  language = "javascript",
}) => {
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || "");
  };

  const { resolvedTheme } = useTheme();

  const getLanguageForMonaco = (fileName: string, lang?: string) => {
    if (fileName && fileName.includes(".")) {
      const ext = fileName.split(".").pop()?.toLowerCase();
      switch (ext) {
        case "js":
        case "jsx":
          return "javascript";
        case "ts":
        case "tsx":
          return "typescript";
        case "css":
          return "css";
        case "scss":
        case "sass":
          return "scss";
        case "json":
          return "json";
        case "html":
          return "html";
        case "md":
          return "markdown";
        case "ejs":
          return "html";
        case "npmrc":
        case "prettierrc":
          return "plaintext";
        default:
          return "plaintext";
      }
    }
    return lang || "plaintext";
  };

  const extension = fileName.includes(".")
    ? fileName.split(".").pop()?.toUpperCase()
    : "";
  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.div
        className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-3 text-sm font-medium shadow-lg"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center space-x-3 justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              className="flex space-x-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </motion.div>
            <span>
              {fileName ? `Kod Düzenleyici - ${fileName}` : "Kod Düzenleyici"}
            </span>
            <motion.span
              className="text-xs bg-blue-500/30 px-2 py-1 rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨ Live
            </motion.span>
          </div>
          {extension && (
            <Badge className="ml-2" variant="secondary">
              {extension}
            </Badge>
          )}
        </div>
      </motion.div>
      <motion.div
        className="flex-1 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Editor
          height="100%"
          language={getLanguageForMonaco(fileName, language)}
          theme={resolvedTheme === "dark" ? "vs-dark" : "vs-light"}
          value={code}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            fontFamily:
              "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
            fontLigatures: true,
            lineHeight: 1.6,
            padding: { top: 16, bottom: 16 },
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
          }}
        />
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-900/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-900/20 to-transparent"></div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CodeEditor;
