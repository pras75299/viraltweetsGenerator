"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2, Bot } from "lucide-react";
import { useTweetSuggestionsStore } from "@/store/suggestions-store";

interface Tweet {
  id: string;
  text: string;
  createdAt: string;
}

interface ApiResponse {
  tweets: Tweet[];
}

export function TwitterUrlForm() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setTweets = useTweetSuggestionsStore((state) => state.setTweets);
  const clearTweets = useTweetSuggestionsStore((state) => state.clearTweets);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    clearTweets();

    try {
      const response = await fetch(
        "http://localhost:3001/api/twitter/generate-tweets",
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
        throw new Error(errorData.error || "Failed to generate tweets");
      }

      const data: ApiResponse = await response.json();
      setTweets(data.tweets);
    } catch (err) {
      console.error("Error generating tweets:", err);
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
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-lg text-gray-200">
            Enter Twitter Profile URL
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label htmlFor="twitter-url" className="sr-only">
                  Twitter Profile URL
                </label>
                <Input
                  id="twitter-url"
                  type="url"
                  placeholder="https://x.com/username"
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
                    Generating...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Generate Tweets
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
