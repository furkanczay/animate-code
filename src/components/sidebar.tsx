"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import {
  Github,
  Instagram,
  Linkedin,
  Plus,
  Trash2,
  Youtube,
} from "lucide-react";
import { Badge } from "./ui/badge";
import ThemeToggle from "./theme-toggle";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import Link from "next/link";

interface ProjectFile {
  id: string;
  name: string;
  content: string;
  type: "file";
  extension: string;
}

interface ProjectFolder {
  id: string;
  name: string;
  type: "folder";
  children: (ProjectFile | ProjectFolder)[];
  isExpanded?: boolean;
}

interface Step {
  id: string;
  name: string;
  files: (ProjectFile | ProjectFolder)[];
  activeFileId: string | null;
  delay: number;
}

interface SidebarProps {
  steps: Step[];
  selectedStepId: string | null;
  onAddStep: () => void;
  onDeleteStep: (id: string) => void;
  onSelectStep: (id: string) => void;
  onUpdateStepDelay: (id: string, delay: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  steps,
  selectedStepId,
  onAddStep,
  onDeleteStep,
  onSelectStep,
  onUpdateStepDelay,
}) => {
  return (
    <motion.div
      className="h-full flex flex-col p-6 bg-gradient-to-b from-background to-background/50"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <h1 className="text-3xl font-bold text-center mb-6">
        CodeFlow <Badge variant={"outline"}>BETA</Badge>
      </h1>
      <motion.h2
        className="text-lg font-bold mb-6 text-foreground flex items-center justify-between"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <span>Sahneler</span>
        <ThemeToggle />
      </motion.h2>
      <motion.div
        onClick={onAddStep}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Button className="flex items-center justify-center space-x-2 w-full mb-10">
          <Plus className="w-4 h-4" />
          <span>Sahne Ekle</span>
        </Button>
      </motion.div>
      <div className="flex-1 overflow-y-auto space-y-3">
        <AnimatePresence>
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 0, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 0.9 }}
              exit={{ opacity: 0, y: 0, scale: 0.9 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 20,
              }}
              layout
              whileHover={{ scale: 1 }}
              onClick={() => onSelectStep(step.id)}
            >
              <Card
                className={`transition-all duration-200 cursor-pointer ${
                  selectedStepId === step.id
                    ? "border-blue-300 shadow-lg"
                    : "shadow-sm hover:shadow-md"
                }`}
              >
                <CardHeader>
                  <div className="flex justify-between items-center mb-3">
                    <motion.span
                      className="font-semibold text-foreground flex items-center space-x-2"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Badge>{index + 1}</Badge>
                      <span>Sahne {index + 1}</span>
                    </motion.span>
                    <motion.button
                      onClick={() => onDeleteStep(step.id)}
                      className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="text-xs text-foreground bg-background p-3 rounded-lg font-mono border"
                    transition={{ duration: 0.2 }}
                  >
                    {step.files.length > 0
                      ? `${step.files.length} file${
                          step.files.length > 1 ? "s" : ""
                        } • ${
                          step.files.find((f) => f.id === step.activeFileId)
                            ?.name ||
                          step.files[0]?.name ||
                          "No active file"
                        }`
                      : "No files"}
                  </motion.div>
                </CardContent>
                <CardFooter>
                  <motion.div
                    className="mt-3 flex items-center space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-xs text-foreground">⏱️ Delay:</span>
                    <input
                      type="number"
                      value={step.delay}
                      onChange={(e) =>
                        onUpdateStepDelay(
                          step.id,
                          parseInt(e.target.value) || 1000
                        )
                      }
                      min="100"
                      max="10000"
                      step="100"
                      className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-xs text-foreground">ms</span>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {steps.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-12 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="text-4xl mb-4"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              📝
            </motion.div>
            <p className="text-sm text-center">
              No steps yet.
              <br />
              Start by adding your first step!
            </p>
          </motion.div>
        )}
      </div>
      <div className="border mt-6 py-10">
        <div className="flex justify-center space-x-4">
          <Button asChild variant={"outline"}>
            <Link href={"https://github.com/furkanczay"} target="_blank">
              <Github />
            </Link>
          </Button>
          <Button asChild variant={"outline"}>
            <Link href={"https://linkedin.com/in/furkanczay"} target="_blank">
              <Linkedin />
            </Link>
          </Button>
          <Button asChild variant={"outline"}>
            <Link href={"https://youtube.com/@furkanczay"} target="_blank">
              <Youtube />
            </Link>
          </Button>
          <Button asChild variant={"outline"}>
            <Link href={"https://instagram.com/furkanczay"} target="_blank">
              <Instagram />
            </Link>
          </Button>
        </div>
        <div className="flex justify-center mt-4 text-xs text-muted-foreground">
          <span>Made by Furkan Özay</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
