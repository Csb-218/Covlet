import axios from 'axios';
import type { IProfileSchema } from '../types';

// This function uploads a resume file to the server and returns the response data.
export async function uploadResume(file: File) {
    try{
        const formData = new FormData();
        formData.append('file', file);
        console.log("FormData:", formData);
        console.log("File:", file);
        const options = {
        url : "/read",
        method: "POST",
        baseURL: import.meta.env.WXT_SERVER_URL,
        data: formData
        }
        
        const response = await axios.request(options)

        return response.data
    }catch(error){
        console.error("Error uploading file:", error);
        throw new Error("File upload failed. Please try again.");
    }
}

// API endpoint to add resume data to the database
export async function addResumeDataToDB(resume: IProfileSchema) {
    try {
        const options = {
            url : "/resume/add",
            method: "POST",
            baseURL: import.meta.env.WXT_SERVER_URL,
            data: {
                resume
            }
        }
        
        const response = await axios.request(options)
        return response.data
    } catch (error) {
        console.error("Error adding resume data to DB:", error);
        throw new Error("Failed to add resume data to DB.");
    }
}

// API endpoint to get resume data from the database
export async function getResumeDataFromDB(email: string) {
    try {
        const options = {
            url : `/resume/${email}`,
            method: "GET",
            baseURL: import.meta.env.WXT_SERVER_URL,
            data: {
                email: email
            }
        }
        
        const response = await axios.request(options)

        if (response.status !== 200) {
            throw new Error("Failed to fetch resume data");
        }

        return response.data as IProfileSchema;
        
    } catch (error) {
        console.error("Error getting resume data from DB:", error);
        throw new Error("Failed to get resume data from DB.");
    }
}