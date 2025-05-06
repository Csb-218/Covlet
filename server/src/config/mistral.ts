import { Mistral } from "@mistralai/mistralai";
require('dotenv').config();


const MistralApiKey1 = process.env.WXT_MISTRAL_API_KEY1

export const mistral = new Mistral({
    apiKey: MistralApiKey1
});