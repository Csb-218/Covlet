import { Request, Response } from "express";
import {
  addResume,
  deleteResume,
  getResume,
  updateResume,
} from "../../src/controllers/resumeController";
import { jest, beforeEach, describe, expect, test, it } from "@jest/globals";
import { ResumeModel } from "../../src/models/ResumeModel";
import { Types, ObjectId } from "mongoose";
import type { IProfileSchema } from "../../src/types";

describe("Resume Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockResumeData: Partial<IProfileSchema> & { _id?: string };
  
  const unknownEmail = "xyz@email.com"

  // Mock the ResumeModel
  jest.mock("../../src/models/ResumeModel");

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock response methods
    mockResponse = {
      status: jest.fn((code: number) => mockResponse as Response),
      json: jest.fn<() => Response<any, Record<string, any>>>(),
    };

    // Mock resume data
    mockResumeData = {
      personal: {
        name: "C.S Bhagwant",
        email: "csbhagwant@gmail.com",
        phone: "+91 9861289352",
        linkedin: "www.linkedin.com/in/c-s-bhagwant-82461b197",
      },
      summary:
        "A skilled Full-Stack Developer with a strong focus on building scalable web applications and integrating AI into modern SaaS products. I love crafting seamless user experiences, optimizing performance, and exploring no-code solutions for rapid development.",
      experience: [
        {
          title: "Front-end Developer Intern",
          company: "Rablo pvt. ltd.",
          startDate: new Date("2024-07-18T00:00:00.000Z"),
          endDate: new Date("2024-10-18T00:00:00.000Z"),
          responsibilities:
            "Collaborated with the design and backend teams to implement responsive design solutions, ensuring seamless functionality across various devices and browsers. Implemented dynamic imports which reduced loading time by 50%. Developed and optimized user interfaces using HTML, SCSS, and JavaScript, enhancing the overall user experience and performance of Rablo.in's web applications.",
          achievements:
            "Implemented dynamic imports which reduced loading time by 50%",
        },
      ],
      education: [
        {
          degree: "Bachelor of Science in Computer Engineering",
          institution: "Kalinga Institute of Technology",
          startDate: new Date("2021-05-01T00:00:00.000Z"),
          endDate: new Date("2025-05-01T00:00:00.000Z"),
          coursework:
            "Data Structures, Algorithms, Computer Architecture, Software Engineering",
        },
      ],
      _id: "6824cf3d32bfb18e58da1b1b",
      skills: {
        technical: [
          "TypeScript",
          "React",
          "Node.js",
          "AWS",
          "Docker",
          "HTML",
          "CSS",
          "JavaScript",
          "PostgreSQL",
          "MongoDB",
          "Express.js",
          "Next.js",
          "Vue.js",
          "Tailwind CSS",
          "Git",
          "Jest",
          "Python",
          "FastApi",
        ],
        soft: [
          "Problem Solving",
          "Teamwork",
          "Communication",
          "Adaptability",
          "Time Management",
          "Critical Thinking",
          "Creativity",
          "Attention to Detail",
        ],
      },
      certifications: [
        {
          name: "AWS Academy Graduate - AWS Academy Introduction to Cloud Semester 1",
          year: "2024",
        },
      ],
      languages: ["English", "Hindi", "Odia"],
      projects: [
        {
          name: "AI-Powered Analytics Platform",
          description:
            "Developed a real-time analytics platform using machine learning for predictive insights",
          link: "https://github.com/sarahjohnson/ai-analytics",
        },
        {
          name: "Cloud Migration Framework",
          description:
            "Created an automated framework for seamless cloud migration of legacy applications",
          link: "https://github.com/sarahjohnson/cloud-migration",
        },
      ],
    };
  });

  describe("Add resume controller", () => {
    
    it("should add a new resume", async () => {
      mockRequest = {
        body: {
          ...mockResumeData,
        },
      };

      const mockObjectId = new Types.ObjectId("6824cf3d32bfb18e58da1b1b");

      // Mock Types.ObjectId constructor to always return our fixed ID
      jest.spyOn(Types, "ObjectId").mockReturnValue(mockObjectId);

      const mockQuery = {"personal.email" : mockResumeData.personal?.email } ;

      const expectedNewResume = {
        ...mockResumeData,
        _id: mockObjectId,
      };

      ResumeModel.findOne = jest
        .fn<(mockQuery: object) => any>()
        .mockResolvedValue(null);

      ResumeModel.create = jest
        .fn<() => any>()
        .mockResolvedValue(expectedNewResume);

      await addResume(mockRequest as Request, mockResponse as Response);

      expect(ResumeModel.findOne).toHaveBeenCalledWith(mockQuery);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Resume added successfully",
        data: expectedNewResume,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it("should return 400 if resume already exists", async () => {
      mockRequest = {
        body: {
          ...mockResumeData,
        },
      };

      const mockQuery = {"personal.email" : mockResumeData.personal?.email } ;

      ResumeModel.findOne = jest
        .fn<(mockQuery: object) => any>()
        .mockResolvedValue(mockResumeData);

      await addResume(mockRequest as Request, mockResponse as Response);

      expect(ResumeModel.findOne).toHaveBeenCalledWith(mockQuery);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Resume already exists for this email",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 if an error occurs", async () => {
      mockRequest = {
        body: {
          ...mockResumeData,
        },
      };

      const mockQuery = {"personal.email" : mockResumeData.personal?.email } ;

      ResumeModel.findOne = jest
        .fn<(mockQuery: object) => any>()
        .mockRejectedValue(new Error("Database error"));

      await addResume(mockRequest as Request, mockResponse as Response);

      expect(ResumeModel.findOne).toHaveBeenCalledWith(mockQuery);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Error adding resume to database",
        error: "Database error",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

  });

  describe("Get resume controller", () => {

    it("should get a resume by email", async () => {

      mockRequest = {
        params: {
          email: "csbhagwant@gmail.com",
        },
      };

      const mockQuery = {"personal.email" : mockRequest.params?.email } ;

      ResumeModel.findOne = jest
        .fn<(mockQuery: object) => any>()
        .mockResolvedValue(mockResumeData);

      await getResume(mockRequest as Request, mockResponse as Response);

      expect(ResumeModel.findOne).toHaveBeenCalledWith(mockQuery);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResumeData,     
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);  
    }
    );

    it("should return 404 if resume not found", async () => {

      mockRequest = {
        params: {
          email: unknownEmail,
        },
      };

      const mockQuery = {"personal.email" : mockRequest.params?.email } ;

      ResumeModel.findOne = jest
        .fn<(mockQuery: object) => any>()
        .mockResolvedValue(null);

      await getResume(mockRequest as Request, mockResponse as Response);

      expect(ResumeModel.findOne).toHaveBeenCalledWith(mockQuery);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Resume not found",  
      });
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it("should return 500 if an error occurs", async () => {

      mockRequest = {
        params: {
          email: unknownEmail,
        },
      };

      const mockQuery = {"personal.email" : mockRequest.params?.email } ;

      ResumeModel.findOne = jest
        .fn<(mockQuery: object) => any>()
        .mockRejectedValue(new Error("Database error"));

      await getResume(mockRequest as Request, mockResponse as Response);

      expect(ResumeModel.findOne).toHaveBeenCalledWith(mockQuery);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Error fetching resume from database",
        error: "Database error",  
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);  
      
    });

  });

  describe("Delete resume controller", () => {

    it("should delete a resume by email", async () => {

      mockRequest = {
        params: {
          email: "csbhagwant@gmail.com",
        },
      };

      const mockQuery = {"personal.email" : mockRequest.params?.email } ;

      ResumeModel.findOneAndDelete = jest
        .fn<(mockQuery: object) => any>()
        .mockResolvedValue(mockResumeData);

      await deleteResume(mockRequest as Request, mockResponse as Response);

      expect(ResumeModel.findOneAndDelete).toHaveBeenCalledWith(mockQuery);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Resume deleted successfully",
        data: mockResumeData, 
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if resume not found", async () => {
      mockRequest = {
        params: {
          email: unknownEmail,
        },
      };
      const mockQuery = {"personal.email" : mockRequest.params?.email } ;
      ResumeModel.findOneAndDelete = jest
        .fn<(mockQuery: object) => any>()
        .mockResolvedValue(null);
      await deleteResume(mockRequest as Request, mockResponse as Response);
      expect(ResumeModel.findOneAndDelete).toHaveBeenCalledWith(mockQuery);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Resume not found",  
      });
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it("should return 500 if an error occurs", async () => {
      mockRequest = {
        params: {
          email: unknownEmail,
        },
      };
      const mockQuery = {"personal.email" : mockRequest.params?.email } ;
      ResumeModel.findOneAndDelete = jest
        .fn<(mockQuery: object) => any>()
        .mockRejectedValue(new Error("Database error"));
      await deleteResume(mockRequest as Request, mockResponse as Response);
      expect(ResumeModel.findOneAndDelete).toHaveBeenCalledWith(mockQuery);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Error deleting resume from database",
        error: "Database error",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

  })

  describe("Update resume controller", () => {
    it("should update a resume by email", async () => {
      mockRequest = {
        params: {
          email: "csbhagwant@gmail.com",
        },
        body: {
          ...mockResumeData,
        },
      };
      const mockQuery = {"personal.email" : mockRequest.params?.email } ;
      ResumeModel.findOneAndUpdate = jest
        .fn<(mockQuery: object) => any>()
        .mockResolvedValue(mockResumeData);
      await updateResume(mockRequest as Request, mockResponse as Response);
      expect(ResumeModel.findOneAndUpdate).toHaveBeenCalledWith(
        mockQuery,
        mockRequest.body,
        { new: true }
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Resume updated successfully",
        data: mockResumeData, 
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);  
    }
    );
    it("should return 404 if resume not found", async () => {
      mockRequest = {
        params: {
          email: unknownEmail,
        },
        body: {
          ...mockResumeData,
        },
      };
      const mockQuery = {"personal.email" : mockRequest.params?.email } ;
      ResumeModel.findOneAndUpdate = jest
        .fn<(mockQuery: object) => any>()
        .mockResolvedValue(null);
      await updateResume(mockRequest as Request, mockResponse as Response);
      expect(ResumeModel.findOneAndUpdate).toHaveBeenCalledWith(
        mockQuery,
        mockRequest.body,
        { new: true }
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Resume not found",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
    it("should return 500 if an error occurs", async () => {
      mockRequest = {
        params: {
          email: unknownEmail,
        },
        body: {
          ...mockResumeData,
        },
      };
      const mockQuery = {"personal.email" : mockRequest.params?.email } ; 
      ResumeModel.findOneAndUpdate = jest
        .fn<(mockQuery: object) => any>()
        .mockRejectedValue(new Error("Database error"));
      await updateResume(mockRequest as Request, mockResponse as Response);
      expect(ResumeModel.findOneAndUpdate).toHaveBeenCalledWith(
        mockQuery,
        mockRequest.body,
        { new: true }
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Error updating resume in database",
        error: "Database error",  
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });


});
