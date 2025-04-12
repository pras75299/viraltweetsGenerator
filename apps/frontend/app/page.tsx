import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { TwitterUrlForm } from "@/components/twitter-url-form";
import { MindMap } from "@/components/mind-map";
import { TweetSuggestions } from "@/components/tweet-suggestions";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3 pt-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-500 pb-2">
            AI Tweet Analyzer & Generator
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Paste a Twitter profile URL to visualize content themes and generate
            engaging tweet ideas using AI.
          </p>
        </div>

        <TwitterUrlForm />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Card className="p-6 bg-gray-800/50 border-gray-700 shadow-lg h-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">
              Content Mind Map
            </h2>
            <MindMap />
          </Card>

          <TweetSuggestions />
        </div>
      </div>
    </main>
  );
}
