import express from 'express';
import { RequestHandler } from 'express';
import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import { Tweet } from '../models/tweet';

dotenv.config();

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to fetch and extract text content from a URL
async function fetchUrlContent(url: string): Promise<string> {
  try {
    const { data } = await axios.get(url, {
      headers: {
        // Mimic a browser request to potentially bypass simple bot detection
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    const $ = cheerio.load(data);
    
    // Attempt to extract meaningful text - This needs refinement based on Twitter's structure
    // This is a basic example, Twitter's actual structure is complex and dynamic
    let content = '';
    $('article div[lang]').each((_idx, el) => {
       content += $(el).text() + '\n\n'; // Extract text from tweet elements
    });

    if (!content) {
      // Fallback: Extract body text if specific elements aren't found
      content = $('body').text(); 
    }

    // Limit content size to avoid excessive token usage
    return content.substring(0, 15000); 
    
  } catch (error) {
    console.error('Error fetching URL content:', error);
    throw new Error('Failed to fetch content from the provided URL.');
  }
}

// Generate viral tweets based on profile content
async function generateViralTweets(content: string): Promise<string[]> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: [
      {
        role: "system",
        content: `You are a world-class viral tweet strategist and prompt engineer. When given a user’s profile content, do the following:

          1. Deeply analyze their niche, tone, audience interests, and past engagement patterns.  
          2. Research and weave in 1-2 trending topics or hashtags relevant to their niche.  
          3. Craft 15 unique tweets, each ≤ 280 characters, that are:  
            • Emotionally charged (start with a hook)  
            • Highly shareable (use a clear call-to-action or compelling question)  
            • Valuable or actionable (offer quick tips, insights, or resources)  
            • Copywriting-driven (apply AIDA, PAS, or similar frameworks)  
            • Branded and on-voice (reflect the profile's style and language)  
            • Enhanced with exactly one emoji for emphasis  

          4. Output must be **only** a JSON array of tweet strings,`
      },
      {
        role: "user",
        content
      }
    ],
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(completion.choices[0].message?.content || '{"tweets": []}');
  return Array.isArray(result.tweets) ? result.tweets : [];
}

interface GenerateTweetsRequestBody {
  url: string;
}

const generateTweetsHandler: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { url } = req.body as GenerateTweetsRequestBody;
    
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'Invalid URL provided' });
      return;
    }

    // Check if we already have recent tweets for this profile
    const existingTweets = await Tweet.find({ 
      profileUrl: url,
      lastUpdated: { 
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) 
      }
    });

    if (existingTweets.length > 0) {
      res.json({ tweets: existingTweets });
      return;
    }

    // Fetch and analyze profile content
    const pageContent = await fetchUrlContent(url);
    if (!pageContent) {
      res.status(500).json({ error: 'Could not extract content from the URL.' });
      return;
    }

    // Generate new viral tweets
    const tweetTexts = await generateViralTweets(pageContent);

    // Store tweets in database
    const savedTweets = await Promise.all(
      tweetTexts.map(async (tweetText) => {
        const tweet = new Tweet({
          text: tweetText,
          profileUrl: url,
          createdAt: new Date(),
          lastUpdated: new Date()
        });
        return await tweet.save();
      })
    );

    res.json({ tweets: savedTweets });

  } catch (error: any) {
    console.error('Error generating tweets:', error);
    const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to generate tweets';
    res.status(500).json({ error: errorMessage });
  }
};

// Get stored tweets for a profile
const getStoredTweetsHandler: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'Invalid URL provided' });
      return;
    }

    const tweets = await Tweet.find({ profileUrl: url })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ tweets });

  } catch (error: any) {
    console.error('Error fetching stored tweets:', error);
    res.status(500).json({ error: 'Failed to fetch stored tweets' });
  }
};

// Register routes
router.post('/generate-tweets', generateTweetsHandler);
router.get('/stored-tweets', getStoredTweetsHandler);

export default router;