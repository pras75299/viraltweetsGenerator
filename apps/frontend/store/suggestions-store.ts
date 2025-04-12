import { create } from 'zustand'

interface TweetSuggestionsState {
  suggestions: string[];
  setSuggestions: (suggestions: string[]) => void;
}

export const useTweetSuggestionsStore = create<TweetSuggestionsState>((set) => ({
  suggestions: [],
  setSuggestions: (suggestions) => set({ suggestions }),
})) 