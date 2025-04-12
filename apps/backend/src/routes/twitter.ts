import express from 'express';
import { RequestHandler } from 'express';
import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';

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

// Define request body interface for type safety
interface AnalyzeRequestBody {
  url: string;
}
// Use RequestHandler type with appropriate generic parameters
const analyzeHandler: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { url } = req.body as AnalyzeRequestBody;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'Invalid URL provided' });
      return;
    }

    console.log(`Fetching content for URL: ${url}`);
    const pageContent = await fetchUrlContent(url);
    console.log(`Content fetched, length: ${pageContent.length}`);
    if (!pageContent) {
      res.status(500).json({ error: 'Could not extract content from the URL.' });
      return;
    }

    console.log('Analyzing content with OpenAI...');
    // Analyze content with OpenAI to create mind map
    const analysis = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Use a model supporting JSON mode
      messages: [
        {
          role: "system",
          content: "Analyze the provided text content from a Twitter profile page. Identify key topics, recurring themes, user interests, and the style of communication. Create a structured mind map representation of this analysis, focusing on factors that seem to drive engagement (based on inferred context like common phrases, questions asked, etc.). Output ONLY the JSON for the mind map."
        },
        {
          role: "user",
          content: pageContent // Pass the scraped content
        }
      ],
      response_format: { type: "json_object" },
    });
    
    const mindMapContent = analysis.choices[0].message?.content;
    console.log('Mind map analysis complete.');
    
    if (!mindMapContent) {
        throw new Error('OpenAI did not return analysis content.');
    }

    console.log('Generating tweet suggestions with OpenAI...');
    // Generate tweet suggestions based on the analysis
    const suggestions = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Use a model supporting JSON mode
      messages: [
        {
          role: "system",
          content: "Based on the provided mind map analysis of a Twitter profile, generate 5 distinct tweet ideas (max 280 characters each) that mimic the user's style and topics, aiming for high engagement. Consider common engagement tactics like asking questions, using relevant hashtags, or being conversational. Output ONLY a JSON array of strings, where each string is a tweet suggestion."
        },
        {
          role: "user",
          content: mindMapContent // Use the mind map analysis as context
        }
      ],
      response_format: { type: "json_object" },
    });

    const tweetSuggestionsContent = suggestions.choices[0].message?.content;
    console.log('Tweet suggestions generated.');

    if (!tweetSuggestionsContent) {
        throw new Error('OpenAI did not return tweet suggestions.');
    }

    // Attempt to parse the JSON outputs, handle potential errors
    let mindMapData = {};
    let tweetSuggestionsData: string[] = [];

    try {
        // Assuming OpenAI returns a JSON object string for the mind map
        mindMapData = JSON.parse(mindMapContent);
    } catch (e) {
        console.error("Failed to parse mind map JSON from OpenAI:", mindMapContent);
        // Keep mindMapData as {} or provide fallback structure
    }

    try {
        // OpenAI will likely wrap the array in an object when response_format is json_object
        // E.g., { "suggestions": ["tweet1", "tweet2"] }
        const parsedSuggestions = JSON.parse(tweetSuggestionsContent);
        // Extract the array, assuming a key like "suggestions" or similar
        // This might need adjustment based on actual OpenAI output format
        const suggestionsKey = Object.keys(parsedSuggestions)[0]; 
        const extractedArray = parsedSuggestions[suggestionsKey];

        if (Array.isArray(extractedArray) && extractedArray.every(item => typeof item === 'string')) {
           tweetSuggestionsData = extractedArray;
        } else {
           console.error("Parsed tweet suggestions is not an array of strings:", parsedSuggestions);
           // Attempt to find an array of strings within the object
           for(const key in parsedSuggestions) {
              if (Array.isArray(parsedSuggestions[key]) && parsedSuggestions[key].every((item: unknown) => typeof item === 'string')) {
                tweetSuggestionsData = parsedSuggestions[key];
                break;
              }
           }
           if (tweetSuggestionsData.length === 0) {
             console.warn("Could not find a valid string array in suggestions response.");
           }
        }
    } catch (e) {
        console.error("Failed to parse tweet suggestions JSON from OpenAI:", tweetSuggestionsContent);
        // Keep tweetSuggestionsData as []
    }


    res.json({
      mindMap: mindMapData,
      suggestions: tweetSuggestionsData
    });

  } catch (error: any) {
    console.error('Error analyzing Twitter profile via URL:', error);
    // More specific error reporting if possible
    const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to analyze Twitter profile via URL';
    res.status(500).json({ error: errorMessage });
  }
};

// Register the route handler
router.post('/analyze', analyzeHandler);

export default router;