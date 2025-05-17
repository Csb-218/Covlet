import { jest,describe,it } from '@jest/globals';
import mistral from "../../src/services/mistral_service"
import mistralInstance from "../../src/config/mistral"



jest.mock("../../src/config/mistral",()=>({
        chat: {
            parse: jest.fn()
    }
}))

// Mock zod with proper schema building functions
jest.mock("zod", () => ({
    z: {
        object: jest.fn().mockReturnValue({
            parse: jest.fn(),
            array: jest.fn().mockReturnThis(),
            string: jest.fn().mockReturnThis(),
        }),
        string: jest.fn().mockReturnThis(),
        array: jest.fn().mockReturnThis(),
    }
}));

 describe('returnResumeFilledSchema', () => {
        const mockMarkdown = 'Sample resume markdown content';

        const mockParsed = {
            personal: {
                name: "John Doe",
                email: "john@example.com",
                phone: "1234567890",
                linkedin: "linkedin.com/in/johndoe"
            },
            summary: "Experienced developer.",
            experience: [
                {
                    title: "Software Engineer",
                    company: "Tech Corp",
                    startDate: "2020-01-01",
                    endDate: "2022-01-01",
                    responsibilities: "Developed software.",
                    achievements: "Employee of the Month"
                }
            ],
            education: [
                {
                    degree: "B.Sc. Computer Science",
                    institution: "University X",
                    startDate: "2016-01-01",
                    endDate: "2020-01-01",
                    coursework: "Algorithms, Data Structures"
                }
            ],
            skills: {
                technical: ["JavaScript", "TypeScript"],
                soft: ["Communication", "Teamwork"]
            },
            certifications: [
                {
                    name: "Certified Developer",
                    year: "2021"
                }
            ],
            languages: ["English", "Spanish"],
            projects: [
                {
                    name: "Project X",
                    description: "A cool project.",
                    link: "https://github.com/johndoe/projectx"
                }
            ]
        };

        it('should return parsed schema when mistral.chat.parse resolves', async () => {

            mistralInstance.chat.parse = jest.fn<()=>any>().mockResolvedValue({
                choices: [
                    {
                        message: {
                            parsed: mockParsed
                        }
                    }
                ]
            });



            const result = await mistral.returnResumeFilledSchema(mockMarkdown);
            expect(mistralInstance.chat.parse).toHaveBeenCalled();
            expect(result).toEqual(mockParsed);
        });

        it('should throw an error when mistral.chat.parse rejects', async () => {
            mistralInstance.chat.parse = jest.fn<()=>any>().mockRejectedValue(new Error("Filled schema retrieval failed"));

            await expect(mistral.returnResumeFilledSchema(mockMarkdown)).rejects.toThrow("Filled schema retrieval failed");
        }
        );

});