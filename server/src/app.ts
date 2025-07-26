import express from 'express';
import fileRoutes from './routes/fileRoutes';
import resumeRoutes from './routes/resumeRoutes';  
import cors from 'cors';
import { config } from 'dotenv';
config(); // Load environment variables from .env file

const app = express();

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    "https://wellfound.com/*",
    /^chrome-extension:\/\/.*$/, // Allow any Chrome extension
    /^moz-extension:\/\/.*$/,    // Allow any Firefox extension (optional)
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions)); // Enable CORS with specified options

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the File Upload and Read API');
});
// File upload and read routes
app.use('/read', fileRoutes);
app.use('/resume', resumeRoutes); 

export default app;