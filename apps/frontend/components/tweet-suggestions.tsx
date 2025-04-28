"use client";

import { useTweetSuggestionsStore } from "@/store/suggestions-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Tweet {
  id: string;
  text: string;
  createdAt: string;
}

export function TweetSuggestions() {
  const tweets = useTweetSuggestionsStore((state) => state.tweets);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (tweets.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-gray-800/50 border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-gray-100">
            <Bot className="mr-3 h-6 w-6 text-emerald-400" />
            Viral Tweet Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <AnimatePresence>
              {tweets.map((tweet: Tweet, index: number) => (
                <motion.li
                  key={tweet.id}
                  className="p-4 bg-gray-700/60 rounded-lg border border-gray-600 flex justify-between items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex-1">
                    <p className="text-gray-200">{tweet.text}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Generated on {new Date(tweet.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(tweet.text, index)}
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
