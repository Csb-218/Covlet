import mongoose from 'mongoose';
require('dotenv').config();

const uri:string = process.env.DB_URL || ''
const clientOptions = { serverApi: { version: "1" as const, strict: true, deprecationErrors: true } };

export const connectDB = async () => {
  try {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db?.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};