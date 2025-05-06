import { mistral } from "../config/mistral"
import z from "zod"

export async function uploadFile(file:File | Blob) {
    try {
        const uploaded_pdf = await mistral.files.upload({
            file: file,
            purpose: "ocr"
        });

        return uploaded_pdf;
    } catch (e) {
        console.error("Error uploading file:", e);
        throw new Error("File upload failed");
    }
}

export async function getFile(fileId: string) {
    try {
        const fileContents = await mistral.files.retrieve({
            fileId: fileId
        });

        return fileContents;

    } catch (e) {
        console.error("Error getting file:", e);
        throw new Error("File retrieval failed");
    }
}

export async function getSignedUrl(fileId: string) {
    try {
        const signedUrl = await mistral.files.getSignedUrl({
            fileId: fileId
        });

        return signedUrl;

    } catch (e) {
        console.error("Error getting signed URL:", e);
        throw new Error("Signed URL retrieval failed");
    }
}

export async function getOCRResult(signedUrl:string){
    try {
        const ocrResult = await mistral.ocr.process({
            model:"mistral-ocr-latest",
            document:{
                type:"document_url",
                documentUrl:signedUrl
            }
        });

        return ocrResult;

    } catch (e) {
        console.error("Error getting OCR result:", e);
        throw new Error("OCR result retrieval failed");
    }

}

export async function returnResumeFilledSchema(markdown:string){

    const profileSchema = z.object({
        personal: z.object({
          name: z.string(),
          email: z.string(),
          phone: z.string(),
          linkedin: z.string()
        }),
        summary: z.string(),
        experience: z.array(z.object({
          title: z.string(),
          company: z.string(),
          startDate: z.string(),
          endDate: z.string(),
          responsibilities: z.string(),
          achievements: z.string()
        })),
        education: z.array(z.object({
          degree: z.string(),
          institution: z.string(),
          startDate: z.string(),
          endDate: z.string(),  
          coursework: z.string()
        })),
        skills: z.object({
          technical: z.array(z.string()),
          soft: z.array(z.string())
        }),
        certifications: z.array(z.object({
          name: z.string(),
          year: z.string()
        })),
        languages: z.array(z.string()),
        projects: z.array(z.object({
          name: z.string(),
          description: z.string(),
          link: z.string(),
        }))
    }); 

    try {

        const filledSchema = await mistral.chat.parse({
            model: "ministral-8b-latest",
            messages: [
                {
                    role:"system",
                    content: markdown
                },
                {
                    role:"user",
                    content: `Please fill the resume schema with the information provided in the markdown.Your output should be an instance of a JSON object following this schema: ${{ profileSchema }}`
                }
            ],
            responseFormat:profileSchema 
        });

        return filledSchema?.choices?.[0]?.message?.parsed ?? null;

    } catch (e) {
        console.error("Error getting filled schema:", e);
        throw new Error("Filled schema retrieval failed");
    }
}

