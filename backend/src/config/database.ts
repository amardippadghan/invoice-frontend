import mongoose from 'mongoose';
import { config } from './index';
import { logger } from '../utils/logger';

export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error(error, 'Failed to connect to MongoDB');
        process.exit(1);
    }
};
