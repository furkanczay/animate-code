"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import he from "he";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import * as Diff from "diff";
import { ProjectFile } from "@/app/page";

interface Step {
  id: string;
  content: string;
  title: string;
  changedFiles?: string[];
  files?: ProjectFile[];
  delay?: number;
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

interface DiffLine {
  content: string;
  type: "added" | "removed" | "normal";
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
  const [scale, setScale] = useState(1);
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
    const filePath =
      changedFiles[currentFileIndex] ||
      (currStep.files && currStep.files[0]?.fullPath);
    if (!filePath) {
      setDiffLines([]);
      return;
    }
    const currFile = currStep.files?.find((f) => f.fullPath === filePath);
    const prevFile = prevStep?.files?.find((f) => f.fullPath === filePath);
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

  const computeDiff = (oldContent: string, newContent: string): DiffLine[] => {
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
          const oldLine = removedLines[j] ?? "";
          const newLine = addedLines[j] ?? "";
          if (newLine && !oldLine) {
            lines.push({ content: newLine, type: "added" });
          } else if (!newLine && oldLine) {
            lines.push({ content: oldLine, type: "removed" });
          } else if (newLine && oldLine) {
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
          if (line !== "") lines.push({ content: line, type: "added" });
        } else if (part.removed) {
          if (line !== "") lines.push({ content: line, type: "removed" });
        } else {
          lines.push({ content: line, type: "normal" });
        }
      });
      i++;
    }
    return lines;
  };

  if (steps.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        Önizleme için adım bulunamadı.
      </div>
    );
  }
  const currStep = steps[currentStep];
  const changedFiles = currStep.changedFiles || [];
  const fileTabs =
    changedFiles.length > 0
      ? changedFiles
      : (currStep.files?.map((f) => f.fullPath).filter(Boolean) as string[]);
  const currentFilePath = fileTabs?.[currentFileIndex] || "";
  return (
    <div className="relative flex flex-col h-full min-h-screen bg-transparent">
      <div className="absolute top-6 left-6 z-30 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRestart}
          disabled={isPlaying}
          className="backdrop-blur bg-background/80 border border-border shadow"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0 || isPlaying}
          className="backdrop-blur bg-background/80 border border-border shadow"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onPlayPause}
          className="backdrop-blur bg-background/80 border border-border shadow"
        >
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
          className="backdrop-blur bg-background/80 border border-border shadow"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="absolute top-6 right-6 z-30 flex flex-col items-end">
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-background/80 border border-border shadow text-xs font-mono text-muted-foreground">
            <span className="text-xs">
              Sahne {currentStep + 1} / {steps.length}
            </span>
          </div>
          <div className="flex gap-1">
            <button
              className={`px-2 py-1 rounded text-xs font-mono border transition-colors ${
                scale === 1
                  ? "bg-purple-700 text-white border-purple-500"
                  : "bg-background border-border text-muted-foreground"
              }`}
              onClick={() => setScale(1)}
            >
              1x
            </button>
            <button
              className={`px-2 py-1 rounded text-xs font-mono border transition-colors ${
                scale === 1.5
                  ? "bg-purple-700 text-white border-purple-500"
                  : "bg-background border-border text-muted-foreground"
              }`}
              onClick={() => setScale(1.5)}
            >
              1.5x
            </button>
          </div>
          <div className="flex gap-2">
            {fileTabs?.map((file: string, idx: number) => (
              <button
                key={file}
                className={`px-3 py-1 rounded bg-background border text-xs font-mono transition-colors ${
                  idx === currentFileIndex
                    ? "border-purple-500 text-purple-200 bg-purple-900/60"
                    : "border-border text-muted-foreground"
                }`}
                onClick={() => setCurrentFileIndex(idx)}
                disabled={isPlaying}
                style={{ minWidth: 80 }}
              >
                {file}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-screen flex flex-col items-center justify-center bg-transparent">
        <div className="w-full h-full flex flex-col items-center justify-center p-8">
          <div
            className="w-full max-w-5xl mx-auto rounded-2xl overflow-hidden relative border border-border bg-gradient-to-br from-[#181A20] via-black to-[#23272f] dark:from-[#181A20] dark:via-black dark:to-[#23272f] shadow-xl"
            style={{
              minHeight: 420,
              minWidth: 600,
              transform: `scale(${scale})`,
              transformOrigin: "top center",
              boxShadow: "0 4px 32px 0 rgba(0,0,0,0.18)",
              transition: "transform 0.2s",
            }}
          >
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span>{currentFilePath}</span>
            </div>
            <div className="w-full h-full px-12 py-10">
              <div>
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
                  } else {
                    lineClass =
                      "text-neutral-200 flex items-center w-full font-mono";
                  }
                  return (
                    <motion.div
                      key={index + line.type + line.content}
                      initial={
                        line.type === "added"
                          ? { opacity: 0, x: 48 }
                          : { opacity: 0 }
                      }
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: line.type === "added" ? 48 : 0 }}
                      transition={{ duration: 0.4, ease: [0.4, 0.2, 0.2, 1] }}
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
                          __html: he.encode(
                            line.content === "" ? "\u00A0" : line.content
                          ),
                        }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
