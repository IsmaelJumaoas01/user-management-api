import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from './_helpers/database';
import userRoutes from './routes/user';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/users', userRoutes); // Register the user routes

// Database connection
AppDataSource.initialize()
    .then(() => {
        console.log('Database connection established');
        // Start server only after database connection is established
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to database:', error);
        process.exit(1); // Exit if database connection fails
    });