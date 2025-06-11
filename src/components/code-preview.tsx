"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as Diff from "diff";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  id: string;
  content: string;
  title: string;
  changedFiles?: string[];
  files?: any[];
  delay?: number;
}

interface DiffLine {
  content: string;
  type: "added" | "removed" | "normal" | "changed";
}

interface PreviewProps {
  steps: Step[];
  currentStep: number;
  isPlaying: boolean;
  delay: number;
  onStepChange: (step: number) => void;
  onPlayPause: () => void;
  onRestart: () => void;
}

export default function Preview({
  steps,
  currentStep,
  isPlaying,
  delay,
  onStepChange,
  onPlayPause,
  onRestart,
}: PreviewProps) {
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentFileIndex(0);
  }, [currentStep]);

  useEffect(() => {
    if (!isPlaying || steps.length === 0) {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    const currStep = steps[currentStep];
    const changedFiles = currStep.changedFiles || [];
    const stepDelay =
      typeof currStep.delay === "number" ? currStep.delay : delay;
    if (changedFiles.length === 0) {
      if (currentStep < steps.length - 1) {
        animationRef.current = setTimeout(() => {
          onStepChange(currentStep + 1);
        }, stepDelay);
      } else {
        animationRef.current = setTimeout(() => {
          onPlayPause();
        }, 500);
      }
      return;
    }
    animationRef.current = setTimeout(() => {
      if (currentFileIndex < changedFiles.length - 1) {
        setCurrentFileIndex((i) => i + 1);
      } else if (currentStep < steps.length - 1) {
        setCurrentFileIndex(0);
        onStepChange(currentStep + 1);
      } else {
        onPlayPause();
      }
    }, stepDelay);
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isPlaying, currentStep, currentFileIndex, steps, delay]);

  useEffect(() => {
    if (steps.length === 0) {
      setDiffLines([]);
      return;
    }
    const currStep = steps[currentStep];
    const prevStep = currentStep > 0 ? steps[currentStep - 1] : null;
    const changedFiles = currStep.changedFiles || [];
    let filePath =
      changedFiles[currentFileIndex] ||
      (currStep.files && currStep.files[0]?.fullPath);
    if (!filePath) {
      setDiffLines([]);
      return;
    }
    const currFile = currStep.files?.find((f: any) => f.fullPath === filePath);
    const prevFile = prevStep?.files?.find((f: any) => f.fullPath === filePath);
    const currContent = currFile?.content || "";
    const prevContent = prevFile?.content || "";
    if (currentStep === 0) {
      setDiffLines(
        currContent
          .split("\n")
          .map((line: string) => ({ content: line, type: "normal" }))
      );
    } else {
      setDiffLines(computeDiff(prevContent, currContent));
    }
  }, [steps, currentStep, currentFileIndex]);

  const computeDiff = useCallback(
    (oldContent: string, newContent: string): DiffLine[] => {
      const diff = Diff.diffLines(oldContent, newContent);
      const lines: DiffLine[] = [];
      let i = 0;
      while (i < diff.length) {
        const part = diff[i];
        if (part.removed && i + 1 < diff.length && diff[i + 1].added) {
          const removedLines = part.value.split("\n");
          const addedLines = diff[i + 1].value.split("\n");
          if (
            removedLines.length > 1 &&
            removedLines[removedLines.length - 1] === ""
          )
            removedLines.pop();
          if (addedLines.length > 1 && addedLines[addedLines.length - 1] === "")
            addedLines.pop();
          const maxLen = Math.max(removedLines.length, addedLines.length);
          for (let j = 0; j < maxLen; j++) {
            const oldLine = removedLines[j] || "";
            const newLine = addedLines[j] || "";
            if (oldLine && newLine) {
              const match = oldLine.match(/^(\s*)/);
              const oldIndent = match ? match[1] : "";
              const match2 = newLine.match(/^(\s*)/);
              const newIndent = match2 ? match2[1] : "";
              let commonIndent = "";
              for (
                let k = 0;
                k < Math.min(oldIndent.length, newIndent.length);
                k++
              ) {
                if (oldIndent[k] === newIndent[k]) {
                  commonIndent += oldIndent[k];
                } else {
                  break;
                }
              }
              const oldRest = oldLine.slice(commonIndent.length);
              const newRest = newLine.slice(commonIndent.length);
              const wordDiff = Diff.diffWords(oldRest, newRest);
              lines.push({
                content:
                  `<span>${commonIndent.replace(/ /g, "&nbsp;")}</span>` +
                  wordDiff
                    .map((w) =>
                      w.added
                        ? `<span style='background:#22c55e;color:#fff;padding:0 2px;border-radius:2px;'>${w.value}</span>`
                        : w.removed
                        ? `<span style='background:#ef4444;color:#fff;padding:0 2px;border-radius:2px;'>${w.value}</span>`
                        : `<span>${w.value}</span>`
                    )
                    .join(""),
                type: "changed",
              });
            } else if (oldLine) {
              lines.push({ content: oldLine, type: "removed" });
            } else if (newLine) {
              lines.push({ content: newLine, type: "added" });
            }
          }
          i += 2;
          continue;
        }
        const partLines = part.value.split("\n");
        if (partLines.length > 1 && partLines[partLines.length - 1] === "")
          partLines.pop();
        partLines.forEach((line) => {
          if (part.added) {
            lines.push({ content: line, type: "added" });
          } else if (part.removed) {
            lines.push({ content: line, type: "removed" });
          } else {
            lines.push({ content: line, type: "normal" });
          }
        });
        i++;
      }
      return lines;
    },
    []
  );

  if (steps.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        Add some steps to see the preview
      </div>
    );
  }
  const currStep = steps[currentStep];
  const changedFiles = currStep.changedFiles || [];
  const fileTabs =
    changedFiles.length > 0
      ? changedFiles
      : currStep.files?.map((f: any) => f.fullPath);
  const currentFilePath = fileTabs?.[currentFileIndex] || "";
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-shrink-0 p-4 border-b bg-background">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {currStep?.title || `Step ${currentStep + 1}`}
          </h3>
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onRestart}
            disabled={isPlaying}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0 || isPlaying}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onPlayPause}>
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onStepChange(Math.min(steps.length - 1, currentStep + 1))
            }
            disabled={currentStep === steps.length - 1 || isPlaying}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={steps.length - 1}
            value={currentStep}
            onChange={(e) => onStepChange(parseInt(e.target.value))}
            disabled={isPlaying}
            className="flex-1"
          />
        </div>
        <div className="flex gap-2 mt-4">
          {fileTabs?.map((file: string, idx: number) => (
            <button
              key={file}
              className={`px-3 py-1 rounded-t bg-gray-800 text-xs font-mono border-b-2 ${
                idx === currentFileIndex
                  ? "border-purple-500 text-purple-200 bg-gray-900"
                  : "border-transparent text-gray-400"
              }`}
              onClick={() => setCurrentFileIndex(idx)}
              disabled={isPlaying}
            >
              {file}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-4 bg-[#181A20]">
        <div className="max-w-none overflow-x-auto h-full min-h-0">
          <div className="text-sm font-mono leading-relaxed">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep + ":" + currentFileIndex}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.35, ease: [0.4, 0.2, 0.2, 1] }}
              >
                {diffLines.map((line, index) => {
                  let lineClass = "text-neutral-200";
                  let symbol = <span className="opacity-0">-</span>;
                  let style: React.CSSProperties = {};
                  if (line.type === "added") {
                    lineClass =
                      "text-green-200 flex items-center w-full font-mono";
                    style = {
                      background:
                        "linear-gradient(90deg, rgba(34,197,94,0.22) 0%, rgba(34,197,94,0.10) 100%)",
                      borderRadius: "10px",
                      boxShadow: "0 2px 12px 0 rgba(34,197,94,0.10)",
                      border: "1px solid rgba(34,197,94,0.18)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      marginBottom: "2px",
                    };
                    symbol = (
                      <span className="text-green-400 font-bold">+</span>
                    );
                  } else if (line.type === "removed") {
                    lineClass =
                      "text-red-200 flex items-center w-full font-mono";
                    style = {
                      background:
                        "linear-gradient(90deg, rgba(239,68,68,0.22) 0%, rgba(239,68,68,0.10) 100%)",
                      borderRadius: "10px",
                      boxShadow: "0 2px 12px 0 rgba(239,68,68,0.10)",
                      border: "1px solid rgba(239,68,68,0.18)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      marginBottom: "2px",
                    };
                    symbol = <span className="text-red-400 font-bold">-</span>;
                  } else if (line.type === "changed") {
                    const isFullAdded = line.content.match(
                      /^<span>(?:&nbsp;|\s)*<span style='background:#22c55e;color:#fff;padding:0 2px;border-radius:2px;'>[\s\S]*<\/span><\/span>$|^<span>(?:&nbsp;|\s)*<\/span><span style='background:#22c55e;color:#fff;padding:0 2px;border-radius:2px;'>[\s\S]*<\/span>$/
                    );
                    const isFullRemoved = line.content.match(
                      /^<span>(?:&nbsp;|\s)*<span style='background:#ef4444;color:#fff;padding:0 2px;border-radius:2px;'>[\s\S]*<\/span><\/span>$|^<span>(?:&nbsp;|\s)*<\/span><span style='background:#ef4444;color:#fff;padding:0 2px;border-radius:2px;'>[\s\S]*<\/span>$/
                    );
                    if (isFullAdded) {
                      lineClass =
                        "text-green-200 flex items-center w-full font-mono";
                      style = {
                        background:
                          "linear-gradient(90deg, rgba(34,197,94,0.22) 0%, rgba(34,197,94,0.10) 100%)",
                        borderRadius: "10px",
                        boxShadow: "0 2px 12px 0 rgba(34,197,94,0.10)",
                        border: "1px solid rgba(34,197,94,0.18)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        marginBottom: "2px",
                      };
                      const cleaned = line.content.replace(
                        /<span style='background:#22c55e;color:#fff;padding:0 2px;border-radius:2px;'>([\s\S]*?)<\/span>/g,
                        "$1"
                      );
                      return (
                        <div
                          key={index}
                          className={`${lineClass} px-3 py-1 rounded-sm`}
                          style={style}
                        >
                          <span
                            className="inline-block w-6 text-xs mr-2 text-center"
                            style={{ minWidth: "1.5rem" }}
                          >
                            <span className="text-green-400 font-bold">+</span>
                          </span>
                          <span
                            className="whitespace-pre"
                            style={{ width: "100%" }}
                            dangerouslySetInnerHTML={{
                              __html: cleaned === "" ? "\u00A0" : cleaned,
                            }}
                          />
                        </div>
                      );
                    } else if (isFullRemoved) {
                      lineClass =
                        "text-red-200 flex items-center w-full font-mono";
                      style = {
                        background:
                          "linear-gradient(90deg, rgba(239,68,68,0.22) 0%, rgba(239,68,68,0.10) 100%)",
                        borderRadius: "10px",
                        boxShadow: "0 2px 12px 0 rgba(239,68,68,0.10)",
                        border: "1px solid rgba(239,68,68,0.18)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        marginBottom: "2px",
                      };
                      const cleaned = line.content.replace(
                        /<span style='background:#ef4444;color:#fff;padding:0 2px;border-radius:2px;'>([\s\S]*?)<\/span>/g,
                        "$1"
                      );
                      return (
                        <div
                          key={index}
                          className={`${lineClass} px-3 py-1 rounded-sm`}
                          style={style}
                        >
                          <span
                            className="inline-block w-6 text-xs mr-2 text-center"
                            style={{ minWidth: "1.5rem" }}
                          >
                            <span className="text-red-400 font-bold">-</span>
                          </span>
                          <span
                            className="whitespace-pre"
                            style={{ width: "100%" }}
                            dangerouslySetInnerHTML={{
                              __html: cleaned === "" ? "\u00A0" : cleaned,
                            }}
                          />
                        </div>
                      );
                    } else {
                      lineClass =
                        "text-yellow-200 flex items-center w-full font-mono";
                      symbol = (
                        <span className="text-yellow-400 font-bold">±</span>
                      );
                    }
                  } else {
                    lineClass =
                      "text-neutral-200 flex items-center w-full font-mono";
                  }
                  return (
                    <div
                      key={index}
                      className={`${lineClass} px-3 py-1 rounded-sm`}
                      style={style}
                    >
                      <span
                        className="inline-block w-6 text-xs mr-2 text-center"
                        style={{ minWidth: "1.5rem" }}
                      >
                        {symbol}
                      </span>
                      <span
                        className="whitespace-pre"
                        style={{ width: "100%" }}
                        dangerouslySetInnerHTML={{
                          __html: line.content === "" ? "\u00A0" : line.content,
                        }}
                      />
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
