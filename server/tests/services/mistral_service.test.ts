import { jest,describe,it } from '@jest/globals';
import mistral from "../../src/services/mistral_service"
import mistralInstance from "../../src/config/mistral"


jest.mock("../../src/config/mistral",()=>({
        chat: {
            parse: jest.fn()
    }
}))





describe('mistral_service', () => {
    it('should return a valid schema', async () => {

        const pdfText = 'Sample PDF text with education and experience';

        mistral.returnResumeFilledSchema = jest.fn<()=>Promise<any>>().mockResolvedValue({})
        mistralInstance.chat.parse = jest.fn<()=>Promise<any>>().mockResolvedValue({})
            
        
   
        const schemaResponse = await mistral.returnResumeFilledSchema(pdfText);
        expect(mistralInstance.chat.parse).toHaveBeenCalled();
        expect(schemaResponse).toBeDefined();
        expect(schemaResponse).toHaveProperty('schema');
        expect(schemaResponse).toHaveProperty('filledSchema');
    });
}
);