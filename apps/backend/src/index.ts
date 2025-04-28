import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Import cors
import twitterRouter from './routes/twitter'; // Import the router
import { connectDB } from './config/db';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001; // Use environment variable or default

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json()); // Parse JSON request bodies

// Connect to MongoDB
connectDB().catch(console.error);

// Mount the router
app.use('/api/twitter', twitterRouter); // All routes in twitter.ts will be prefixed with /api/twitter

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server is running!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

