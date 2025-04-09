import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { json, urlencoded } from 'body-parser';
import { setupCloudWatchLogging } from './middleware/logger';
import { setupDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import fileRoutes from './routes/fileRoutes';
import { startReminderJob } from './jobs/reminderJob';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to PostgreSQL database
setupDatabase();

// Set up middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(compression()); // Compress responses
app.use(json()); // Parse JSON requests
app.use(urlencoded({ extended: true }));
app.use(setupCloudWatchLogging()); // AWS CloudWatch integration

// API routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/files', fileRoutes);

// Global error handler
app.use(errorHandler);

// Start reminder service
if (process.env.NODE_ENV === 'production') {
  startReminderJob();
}

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
}

export default app;