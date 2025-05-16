import fs from 'fs';
import { Request, Response } from 'express';
import { returnResumeFilledSchema} from "../services/mistral_service"
import PdfParse,{Result} from "pdf-parse"

export const fileReadController = async (req: Request, res: Response) => {
  try {
    // Check if the file is present in the request
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read file as buffer instead of utf-8 string
    const buffer:Buffer = fs.readFileSync(req.file.path);

    // Clean up the temporary file
    await fs.promises.unlink(req.file.path);

    // extract data from the PDF
    const data:Result = await PdfParse(buffer);

    // Use pdf-parse to extract text from the PDF
    const pdfText:string = data.text;

    // Check if the data contains the expected texts using RegExp.test()
    const educationRegex = /\b(education)\b/i;
    const experienceRegex = /\b(experience)\b/i;
    const skillsRegex = /\b(skills)\b/i;
    const projectsRegex = /\b(projects)\b/i;
    const certificationsRegex = /\b(certifications)\b/i;
    
    if (!educationRegex.test(data.text) || !experienceRegex.test(data.text) || !skillsRegex.test(data.text) || !projectsRegex.test(data.text) || !certificationsRegex.test(data.text)) {
      let errorMessage = 'The resume does not have ';
      let missingFields = [];
      if(educationRegex.test(data.text) === false) missingFields.push('education');
      if(experienceRegex.test(data.text) === false) missingFields.push('experience');
      if(skillsRegex.test(data.text) === false) missingFields.push('skills');
      if(projectsRegex.test(data.text) === false) missingFields.push('projects');
      if(certificationsRegex.test(data.text) === false) missingFields.push('certifications');
      errorMessage += missingFields.join(' and ');
      
      return res.status(400).json({ error: errorMessage });
    }

    // Log PDF information
    console.log('Number of pages:', data.numpages);
    console.log('Number of rendered pages:', data.numrender);
    console.log('PDF info:', data.info);
    console.log('PDF metadata:', data.metadata);
    console.log('PDF.js version:', data.version);

    // get the schema from the PDF text
    const schemaResponse = await returnResumeFilledSchema(pdfText)

    return res.status(200).json({
      ...schemaResponse
    });
    
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: "Error reading file" });
  }
};