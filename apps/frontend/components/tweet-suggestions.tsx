"use client";

import { useTweetSuggestionsStore } from "@/store/suggestions-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function TweetSuggestions() {
  const suggestions = useTweetSuggestionsStore((state) => state.suggestions);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
  };

  if (suggestions.length === 0) {
    return null; // Don't render anything if there are no suggestions
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }} // Add slight delay
    >
      <Card className="bg-gray-800/50 border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-gray-100">
            <Bot className="mr-3 h-6 w-6 text-emerald-400" />
            Generated Tweet Ideas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <AnimatePresence>
              {suggestions.map((tweet, index) => (
                <motion.li
                  key={index}
                  className="p-4 bg-gray-700/60 rounded-lg border border-gray-600 flex justify-between items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <p className="text-gray-200 flex-1">{tweet}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(tweet, index)}
                    className="text-gray-400 hover:text-emerald-400 hover:bg-gray-600/50"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copiedIndex === index ? "Copied!" : "Copy"}
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
