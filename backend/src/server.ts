import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { logger } from './utils/logger';
import { connectDB } from './config/database';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/logger.middleware';

const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json());
app.use(requestLogger);
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', routes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Error Handler
app.use(errorHandler);

// Start Server
const startServer = async () => {
    try {
        app.listen(config.port, () => {
            logger.info(`Server running on port ${config.port}`);
        });
    } catch (error) {
        logger.error(error, 'Failed to start server');
        process.exit(1);
    }
};

startServer();
