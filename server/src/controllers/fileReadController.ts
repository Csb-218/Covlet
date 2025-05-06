import fs from 'fs';
import { Request, Response } from 'express';
import { uploadFile , getSignedUrl ,getOCRResult , returnResumeFilledSchema} from "../services/mistral_service"

export const fileReadController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read file as buffer instead of utf-8 string
    const buffer = fs.readFileSync(req.file.path);
    
    // Convert buffer to Blob
    const blob = new Blob([buffer], { type: req.file.mimetype });
    
    // Pass the blob to readFileOCR
    const readFile = await uploadFile(blob);
    const signedUrl = await getSignedUrl(readFile.id);
    const ocrResult = await getOCRResult(signedUrl.url);

    // join all the markdowns from the ocrResult
    const markdowns = ocrResult.pages.map(({markdown}) => markdown).join('\n\n');
    // "# C.S Bhagwant \n\n9861289352 | csbhagwant@gmail.com | Linkedin | Github | Twitter\n\n## EXPERIENCE\n\nFront-end Developer Intern\nJuly 18,2024 - Oct 28, 2024\nRablo Learning pvt. Itd. (Remote)\n\n- Collaborated with the design and backend teams to implement responsive design solutions, ensuring seamless functionality across various devices and browsers.\n- Implemented dynamic imports which reduced loading time by $50 \\%$.\n- Developed and optimized user interfaces using HTML, SCSS, and JavaScript, enhancing the overall user experience and performance of Rablo.in's web applications.\n\n\n## PROJECTS\n\nFireTube (Video streaming platform) link Code\n\n- This web application is a clone of the front end of YouTube(youtube.com).\n- Technologies used: Next.js(React) Framework, Tailwind CSS and react-query(server-side rendering).\n\nZ wallet (Decentralized cryptocurrency wallet) link Code\n\n- A digital decentralized web3 wallet(Ethereum chain).\n- Technologies used: React.js, Tailwind CSS, Redux and ethers.js .\n\nDocuload (Document Management System - backend) link code\n\n- Allows users to create folders, set specific restrictions ( file type and max file limit), upload files with metadata.\n- Manage files/folders with CRUD operations.\n- Technologies used : node.js , express.js , cloudinary.js , supabase , postgres\n\nURL Shortener (A url shortening service.) link Code\n\n- A web service that shortens long urls and returns minified urls.\n- Technologies used: Typescript,React.js, Tailwind CSS,Express.js,Node.js and MongoDb(MERN) .\n\nTask (A task management application to manage your daily schedule.) link Code\n\n- Integrated with Firefoxe(FCM) to notify the user via push web notification system.\n- Technologies used: React.js, Tailwind CSS,Redux,Express.js,node.js and mongoDb(MERN) .\n\n\n## SKILLS\n\nLanguages: HTML, CSS, Javascript,Typescript,Python,SQL and No-SQL\nFrameworks and tools: React.js, Next.js, Tailwind ,SASS,SCSS , node.js, Express.js, Redux, Mongodb,Supabase and Django.\nCloud Technologies: AWS\n\n## EDUCATION\n\nBachelor of Technology in Computer Science and Engineering May 2021 - May 2025\nKalinga Institute of Industrial Technology, Bhubaneswar.\n\n## CERTIFICATIONS\n\nAWS Academy Graduate - AWS Academy Introduction to Cloud Semester 1\nCredential: https://www.credly.com/badges/e9777163-324...\n\n## Data Structures and Algorithms\n\nCredential:https://ninjasfiles.s3.amazonaws.com/certificate..."
    

    const schemaResponse = await returnResumeFilledSchema(markdowns)

    // Clean up the temporary file
    await fs.promises.unlink(req.file.path);

    res.status(200).json({
      email: req.body.email,
      result: ocrResult,
      combinedMarkdown: markdowns,
      ...schemaResponse
    });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Error reading file' });
  }
};