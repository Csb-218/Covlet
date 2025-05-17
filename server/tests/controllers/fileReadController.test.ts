import fs, { PathLike } from 'fs';
import { Request, Response } from 'express';
import { fileReadController } from '../../src/controllers/fileReadController';
import mistral from "../../src/services/mistral_service";
import { jest } from '@jest/globals';

// Mock returnResumeFilledSchema as a jest function
jest.mock("../../src/services/mistral_service", () => ({
  returnResumeFilledSchema: jest.fn(),
}));
import PdfParse, {Result,Version} from "pdf-parse"


// Mock dependencies
jest.mock('fs',
   () => ({
  readFileSync: jest.fn(),
  promises: {
    unlink: jest.fn<(text:string)=>Promise<undefined>>().mockResolvedValue(undefined)
  }
})
);
//  mock pdf-parse
jest.mock('pdf-parse', () => 
  jest.fn().mockImplementation((_args: unknown) => 
    Promise.resolve({
      text: 'Sample PDF text with education and experience',
      numpages: 1,
      numrender: 1,
      info: {},
      metadata: {},
      version: '1.0.0' as Version
    })
  )
);

describe('fileReadController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockFile: Express.Multer.File;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock response methods
    mockResponse = {
      status: jest.fn((code: number) => mockResponse as Response),
      json: jest.fn<()=>Response<any, Record<string, any>>>()
    };

    // Mock file data
    mockFile = {
      path: '/uploads/resume_cs_bhagwant.pdf',
      mimetype: 'application/pdf',
    } as Express.Multer.File;

    // Mock request object
    mockRequest = {
      file: mockFile
    };

  });

  it('should return 400 if no file is uploaded', async () => {
    mockRequest.file = undefined;
    
    await fileReadController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'No file uploaded' });
  });

  it('should return 400 if resume doest have "education" or "experience"', async () => {

    const mockPdfText = 'Sample PDF text ';

    (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from(mockPdfText));
 
    (PdfParse as jest.Mock).mockReturnValue({
      text: mockPdfText,
      numpages: 1,
      numrender: 1,
      info: {},
      metadata: {},
      version: '1.0.0' as Version
    });

    fs.promises.unlink = jest.fn<()=>Promise<undefined>>().mockResolvedValue(undefined);

    await fileReadController(mockRequest as Request, mockResponse as Response);

    expect(fs.readFileSync).toHaveBeenCalledWith(mockFile.path);
    expect(fs.promises.unlink).toHaveBeenCalledWith(mockFile.path);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'The resume does not have education and experience and skills and projects and certifications' });
  });

  it('should process PDF file and return schema response', async () => {

    const mockPdfText = 'Sample PDF text with education and experience skills and projects and certifications';

    const mockSchemaResponse = {
      email: 'test@example.com',
      skills: ['JavaScript', 'TypeScript'],
      experience: []
    };
    
    (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from(mockPdfText));

    (PdfParse as jest.Mock).mockReturnValue({
      text: mockPdfText,
      numpages: 1,
      numrender: 1,
      info: {},
      metadata: {},
      version: '1.0.0' as Version
    });
 
    // Mock the returnResumeFilledSchema function
    mistral.returnResumeFilledSchema = jest.fn<(text:string)=>Promise<any>>().mockResolvedValue(mockSchemaResponse);
    

   
    fs.promises.unlink = jest.fn<()=>Promise<undefined>>().mockResolvedValue(undefined);
  

    await fileReadController(mockRequest as Request, mockResponse as Response);
    expect(fs.readFileSync).toHaveBeenCalledWith(mockFile.path);
    expect(fs.promises.unlink).toHaveBeenCalledWith(mockFile.path);
    expect(mistral.returnResumeFilledSchema).toHaveBeenCalledTimes(1);
    expect(mistral.returnResumeFilledSchema).toHaveBeenCalledWith(mockPdfText);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockSchemaResponse);
    
  });

  it('should handle errors and return 500 status', async () => {
    const error = new Error('Test error');
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await fileReadController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error reading file' });
  });
});
