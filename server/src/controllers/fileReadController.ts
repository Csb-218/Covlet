import fs from 'fs';
import { Request, Response } from 'express';
import { returnResumeFilledSchema} from "../services/mistral_service"
const pdf = require('pdf-parse');

export const fileReadController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read file as buffer instead of utf-8 string
    const buffer = fs.readFileSync(req.file.path);
    
    // Convert buffer to Blob
    // const blob = new Blob([buffer], { type: req.file.mimetype });

    const data = await pdf(buffer);
    
    // Log PDF information
    console.log('Number of pages:', data.numpages);
    console.log('Number of rendered pages:', data.numrender);
    console.log('PDF info:', data.info);
    console.log('PDF metadata:', data.metadata);
    console.log('PDF.js version:', data.version);
    // console.log('PDF text:', data.text);

    // Clean up the temporary file
    await fs.promises.unlink(req.file.path);

    const schemaResponse = await returnResumeFilledSchema(data.text)

    return res.status(200).json({
      email: req.body.email,
      ...schemaResponse
    });
    
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Error reading file' });
  }
};