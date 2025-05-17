import app from "./app";
import {connectDB} from "./config/database"
import dotenv from 'dotenv';

dotenv.config();
const PORT:number = Number(process.env.PORT) || 4000;
// connect database
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});