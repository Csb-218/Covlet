import fs from 'fs';
import { Request, Response } from 'express';
import { fileReadController } from '../../src/controllers/fileReadController';
import { returnResumeFilledSchema } from "../../src/services/mistral_service";
import { jest } from '@jest/globals';


// Mock dependencies
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  promises: {
    unlink: jest.fn<()=>Promise<undefined>>().mockResolvedValue(undefined)
  }
}));
// Mock pdf-parse
jest.mock('pdf-parse', () => 
  jest.fn<()=>Promise<any>>().mockResolvedValue({
    text: 'Sample PDF text with education and experience',
    numpages: 1,
    numrender: 1,
    info: {},
    metadata: {},
    version: '1.0'
  })
);

jest.mock('../../src/services/mistral_service');

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
      path: '/uploads/test.pdf',
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

  it('should process PDF file and return schema response', async () => {

    const mockPdfText = 'Sample PDF text with education and experience';

    const mockSchemaResponse = {
      email: 'test@example.com',
      skills: ['JavaScript', 'TypeScript'],
      experience: []
    };
    
    (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from(mockPdfText));

    
    (returnResumeFilledSchema as jest.Mock).mockReturnValue(mockSchemaResponse);
   
    fs.promises.unlink = jest.fn<()=>Promise<undefined>>().mockResolvedValue(undefined);
  

    await fileReadController(mockRequest as Request, mockResponse as Response);
    expect(fs.readFileSync).toHaveBeenCalledWith(mockFile.path);
    expect(fs.promises.unlink).toHaveBeenCalledWith(mockFile.path);
    expect(returnResumeFilledSchema).toHaveBeenCalledWith(mockPdfText);
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
