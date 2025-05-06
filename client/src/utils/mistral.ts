import { Mistral } from "@mistralai/mistralai";

const MistralApiKey1 = import.meta.env.WXT_MISTRAL_API_KEY1

export const mistral = new Mistral({
    apiKey: MistralApiKey1
});