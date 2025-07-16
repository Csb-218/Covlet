import express from 'express';
import fileRoutes from './routes/fileRoutes';
import resumeRoutes from './routes/resumeRoutes';  
import cors from 'cors';
import { config } from 'dotenv';
config(); // Load environment variables from .env file

const app = express();

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors({
  origin: process.env.ORIGIN, // Allow only localhost
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Allow specific HTTP methods
  credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the File Upload and Read API');
});
// File upload and read routes
app.use('/read', fileRoutes);
app.use('/resume', resumeRoutes); 

export default app;