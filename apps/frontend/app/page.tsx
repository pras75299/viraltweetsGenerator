import { Card } from "@/components/ui/card";
import { TwitterUrlForm } from "@/components/twitter-url-form";
import { TweetSuggestions } from "@/components/tweet-suggestions";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3 pt-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-500 pb-2">
            AI Viral Tweet Generator
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Paste a Twitter profile URL to generate viral tweet ideas using AI.
          </p>
        </div>

        <TwitterUrlForm />

        <TweetSuggestions />
      </div>
    </main>
  );
}
