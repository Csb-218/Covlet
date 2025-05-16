import express from 'express';
import fileRoutes from './routes/fileRoutes';
import resumeRoutes from './routes/resumeRoutes';  // Add this line
import cors from 'cors';
import {connectDB} from "./config/database"
require('dotenv').config();



const app = express();
const PORT:number = Number(process.env.PORT) || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// connect database
connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the File Upload and Read API');
});
// File upload and read routes
app.use('/read', fileRoutes);
app.use('/resume', resumeRoutes);  // Add this line

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


export default app;