import { create } from 'zustand'

interface Tweet {
  id: string;
  text: string;
  createdAt: string;
}

interface TweetSuggestionsState {
  tweets: Tweet[];
  setTweets: (tweets: Tweet[]) => void;
  clearTweets: () => void;
}

export const useTweetSuggestionsStore = create<TweetSuggestionsState>((set) => ({
  tweets: [],
  setTweets: (tweets) => set({ tweets }),
  clearTweets: () => set({ tweets: [] }),
})) 