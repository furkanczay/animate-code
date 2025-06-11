"use client";

import React from "react";

interface Step {
  id: string;
  name: string;
  code: string;
  delay: number;
}

interface SidebarProps {
  steps: Step[];
  onAddStep: () => void;
  onDeleteStep: (id: string) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  steps,
  onAddStep,
  onDeleteStep,
  isPlaying,
  setIsPlaying,
}) => {
  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-xl font-bold mb-4">Animation Steps</h2>

      {/* Add Step Button */}
      <button
        onClick={onAddStep}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        disabled={isPlaying}
      >
        Add Step
      </button>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {steps.map((step, index) => (
          <div key={step.id} className="bg-gray-50 p-3 rounded border">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Step {index + 1}</span>
              <button
                onClick={() => onDeleteStep(step.id)}
                className="text-red-500 hover:text-red-700 text-sm"
                disabled={isPlaying}
              >
                Delete
              </button>
            </div>
            <div className="text-xs text-gray-600 bg-white p-2 rounded font-mono">
              {step.code.substring(0, 50)}...
            </div>
          </div>
        ))}
      </div>

      {/* Preview Controls */}
      <div className="mt-4 pt-4 border-t">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`w-full px-4 py-2 rounded transition-colors ${
            isPlaying
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
          disabled={steps.length === 0}
        >
          {isPlaying ? "Stop Animation" : "Start Preview"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
