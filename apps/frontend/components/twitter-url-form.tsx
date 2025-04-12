"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2, Bot } from "lucide-react";
import { useMindMapStore } from "@/store/mindmap-store";
import { useTweetSuggestionsStore } from "@/store/suggestions-store";

export function TwitterUrlForm() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setMindMapData = useMindMapStore((state) => state.setData);
  const setSuggestions = useTweetSuggestionsStore(
    (state) => state.setSuggestions
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setMindMapData(null);
    setSuggestions([]);

    try {
      const response = await fetch(
        "http://localhost:8080/api/twitter/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze Twitter profile");
      }

      const data = await response.json();
      console.log("Analysis data:", data);

      setMindMapData(data.mindMap);
      setSuggestions(data.suggestions);
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-gray-800/50 border-gray-700 shadow-lg">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-lg text-gray-200">
            Enter Twitter Profile URL
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label htmlFor="twitter-url" className="sr-only">
                  Twitter Profile URL
                </label>
                <Input
                  id="twitter-url"
                  type="url"
                  placeholder="https://x.com/username or https://twitter.com/username"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !url}
                className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm mt-2 font-medium bg-red-900/30 px-3 py-2 rounded-md border border-red-700"
              >
                Error: {error}
              </motion.p>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
