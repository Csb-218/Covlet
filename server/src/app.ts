import express from 'express';
import fileRoutes from './routes/fileRoutes';
import resumeRoutes from './routes/resumeRoutes';  // Add this line
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the File Upload and Read API');
});
// File upload and read routes
app.use('/read', fileRoutes);
app.use('/resume', resumeRoutes);  // Add this line

export default app;