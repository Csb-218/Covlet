import { Mistral } from "@mistralai/mistralai";
import dotenv from 'dotenv';

dotenv.config();

const MistralApiKey1 = process.env.WXT_MISTRAL_API_KEY1

const mistralInstance = new Mistral({
    apiKey: MistralApiKey1
});

export default mistralInstance;