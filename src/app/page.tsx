"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import CodeEditor from "@/components/CodeEditor";
import Preview from "@/components/Preview";

interface Step {
  id: string;
  name: string;
  code: string;
  delay: number;
}

const HomePage = () => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentCode, setCurrentCode] = useState("// Kodunuzu buraya yazın...");
  const [isPlaying, setIsPlaying] = useState(false);

  const addStep = () => {
    const newStep: Step = {
      id: Date.now().toString(),
      name: `Step ${steps.length + 1}`,
      code: currentCode,
      delay: 1000,
    };
    setSteps([...steps, newStep]);
  };

  const deleteStep = (id: string) => {
    setSteps(steps.filter((step) => step.id !== id));
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200">
        <Sidebar
          steps={steps}
          onAddStep={addStep}
          onDeleteStep={deleteStep}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Code Editor */}
        <div className="h-1/2 border-b border-gray-200">
          <CodeEditor code={currentCode} onChange={setCurrentCode} />
        </div>

        {/* Preview */}
        <div className="h-1/2">
          <Preview
            steps={steps}
            isPlaying={isPlaying}
            onPlayingChange={setIsPlaying}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
