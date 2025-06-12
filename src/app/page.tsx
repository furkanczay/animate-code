"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/sidebar";
import CodeEditor from "@/components/code-editor";
import { PlayCircle } from "lucide-react";
import Preview from "@/components/code-preview";

export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  type: "file";
  extension: string;
  fullPath?: string;
}

interface Step {
  id: string;
  name: string;
  files: ProjectFile[];
  activeFileId: string | null;
  delay: number;
}

const HomePage = () => {
  const initialFile: ProjectFile = {
    id: "file1",
    name: "App.tsx",
    content: `import React from "react";\n\n`,
    type: "file",
    extension: "tsx",
  };
  const initialSteps: Step[] = [
    {
      id: "1",
      name: "Sahne 1",
      files: [
        {
          ...initialFile,
          content: `import React from "react";\n\ninterface CounterProps {}\n\nfunction Counter(props: CounterProps) {\n  return <div>Counter</div>;\n}\n\nexport default Counter;`,
        },
      ],
      activeFileId: "file1",
      delay: 1500,
    },
    {
      id: "2",
      name: "Sahne 2",
      files: [
        {
          ...initialFile,
          content: `import React, { useState } from "react";\n\ninterface CounterProps {}\n\nfunction Counter(props: CounterProps) {\n  const [count, setCount] = useState<number>(0);\n  return <div>Counter: {count}</div>;\n}\n\nexport default Counter;`,
        },
      ],
      activeFileId: "file1",
      delay: 1500,
    },
  ];
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [selectedStepId, setSelectedStepId] = useState<string | null>("1");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPreviewStep, setCurrentPreviewStep] = useState(0);
  const [previewDelay] = useState(1000);
  const [showPreview, setShowPreview] = useState(false);

  function getChangedFiles(prev: ProjectFile[], next: ProjectFile[]): string[] {
    if (!prev[0] || !next[0]) return [];
    return prev[0].content !== next[0].content ? [next[0].name] : [];
  }

  const convertToPreviewSteps = (steps: Step[]) => {
    return steps.map((step, index) => {
      const file = { ...step.files[0], fullPath: step.files[0].name };
      let changedFiles: string[] = [];
      if (index > 0) {
        changedFiles = getChangedFiles(
          steps[index - 1].files.map((f) => ({ ...f, fullPath: f.name })),
          [file]
        );
      } else {
        changedFiles = [file.name];
      }
      return {
        id: step.id,
        content: file.content,
        title: step.name,
        changedFiles,
        files: [file],
        delay: step.delay,
      };
    });
  };

  const addStep = () => {
    const previousStep = steps[steps.length - 1];
    const newStep: Step = {
      id: Date.now().toString(),
      name: `Step ${steps.length + 1}`,
      files: previousStep ? [{ ...previousStep.files[0] }] : [initialFile],
      activeFileId: previousStep?.activeFileId || null,
      delay: 1000,
    };
    setSteps([...steps, newStep]);
    setSelectedStepId(newStep.id);
  };

  const updateStepDelay = (id: string, delay: number) => {
    setSteps(steps.map((step) => (step.id === id ? { ...step, delay } : step)));
  };

  const deleteStep = (id: string) => {
    if (steps.length <= 1) {
      const newStep: Step = {
        id: Date.now().toString(),
        name: "Step 1",
        files: [initialFile],
        activeFileId: "file1",
        delay: 1000,
      };
      setSteps([newStep]);
      setSelectedStepId(newStep.id);
      return;
    }
    const newSteps = steps.filter((step) => step.id !== id);
    setSteps(newSteps);
    if (selectedStepId === id) {
      setSelectedStepId(newSteps[0]?.id || null);
    }
  };

  const updateFileContent = (fileId: string, content: string) => {
    if (selectedStepId) {
      setSteps(
        steps.map((step) =>
          step.id === selectedStepId
            ? {
                ...step,
                files: step.files.map((file) =>
                  file.id === fileId ? { ...file, content } : file
                ),
              }
            : step
        )
      );
    }
  };

  const updateFileName = (fileId: string, name: string) => {
    if (selectedStepId) {
      setSteps(
        steps.map((step) =>
          step.id === selectedStepId
            ? {
                ...step,
                files: step.files.map((file) =>
                  file.id === fileId ? { ...file, name } : file
                ),
              }
            : step
        )
      );
    }
  };

  const selectedStep = steps.find((step) => step.id === selectedStepId);
  const currentFile = selectedStep ? selectedStep.files[0] : null;
  const currentCode = currentFile?.content || "";

  return (
    <motion.div
      className="h-screen flex bg-gradient-to-br from-background to-background/50 min-h-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {!showPreview && (
        <motion.div
          className="w-80 bg-background border-r border-muted shadow-lg min-h-0"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Sidebar
            steps={steps}
            selectedStepId={selectedStepId}
            onAddStep={addStep}
            onDeleteStep={deleteStep}
            onSelectStep={setSelectedStepId}
            onUpdateStepDelay={updateStepDelay}
          />
        </motion.div>
      )}
      <motion.div
        className="flex-1 flex flex-col min-h-0"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.div
          className="flex-1 relative min-h-0"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {!showPreview ? (
            <>
              <div className="p-4 flex items-center gap-2">
                <input
                  type="text"
                  value={currentFile?.name || ""}
                  onChange={(e) =>
                    currentFile &&
                    updateFileName(currentFile.id, e.target.value)
                  }
                  className="px-3 py-1 rounded bg-muted text-muted-foreground border text-xs font-mono w-72"
                  placeholder="/components/button.tsx"
                />
              </div>
              <CodeEditor
                code={currentCode}
                onChange={(content) =>
                  currentFile && updateFileContent(currentFile.id, content)
                }
                fileName={currentFile?.name || ""}
                language={currentFile?.extension || "tsx"}
              />
              <div className="absolute bottom-6 right-6 flex gap-4">
                <button
                  onClick={() => setShowPreview(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <span>
                    <PlayCircle />
                  </span>
                  <span>Önizle</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Preview
                steps={convertToPreviewSteps(steps)}
                currentStep={currentPreviewStep}
                isPlaying={isPlaying}
                delay={previewDelay}
                onStepChange={setCurrentPreviewStep}
                onPlayPause={() => setIsPlaying(!isPlaying)}
                onRestart={() => {
                  setCurrentPreviewStep(0);
                  setIsPlaying(false);
                }}
              />
              <div className="absolute bottom-6 right-6 flex gap-4 z-40">
                <button
                  onClick={() => setShowPreview(false)}
                  className="bg-background border border-border text-foreground px-6 py-3 rounded-xl shadow-lg font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <span>Önizlemeden Çık</span>
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
