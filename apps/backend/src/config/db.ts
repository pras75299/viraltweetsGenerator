import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

export const connectDB = async () => {
    try {
        // Set mongoose options
        mongoose.set('strictQuery', false);
        
        // Connect with options
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
            maxPoolSize: 10,
            minPoolSize: 5,
            connectTimeoutMS: 10000,
            retryWrites: true,
            w: 'majority'
        });

        // Get the connection
        const db = mongoose.connection;

        // Handle connection events
        db.on('error', (error) => {
            console.error('MongoDB connection error:', error);
        });

        db.once('open', () => {
            console.log('MongoDB connected successfully');
        });

        db.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            await disconnectDB();
            process.exit(0);
        });

    } catch (error) {
        console.error('MongoDB connection error:', error);
        // Don't exit the process immediately, let the application handle the error
        throw error;
    }
};

export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('MongoDB disconnected successfully');
    } catch (error) {
        console.error('MongoDB disconnection error:', error);
        throw error;
    }
}; 