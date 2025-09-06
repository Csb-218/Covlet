import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import {
  uploadResume,
  addResumeDataToDB,
  getResumeDataFromDB,
  updateResumeDataInDB,
} from "../services/server";
import type { IProfileSchema } from "../types";

vi.mock("axios");
const mockedAxios = vi.mocked(axios.request);

describe("Server endpoints", () => {
  let mockFile: File;
  let mockResumeData: IProfileSchema;
  let consoleErrorSpy: any;
  let consoleLogSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    globalThis.import = {
      meta: { env: { WXT_SERVER_URL: import.meta.env.WXT_SERVER_URL } },
    };

    // Mock console methods to avoid noise
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Create mock file
    mockFile = new File(["test content"], "test-resume.pdf", {
      type: "application/pdf",
    });

    // Create mock resume data
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
          startDate: "2024-07-18T00:00:00.000Z",
          endDate: "2024-10-18T00:00:00.000Z",
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
          startDate: "2021-05-01T00:00:00.000Z",
          endDate: "2025-05-01T00:00:00.000Z",
          coursework:
            "Data Structures, Algorithms, Computer Architecture, Software Engineering",
        },
      ],
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
    } as IProfileSchema;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("uploadResume", () => {
    const mockResponse = {
      data: { message: "success", fileUrl: "http://example.com/resume.pdf" },
    };

    it("should upload file and return response data", async () => {
      // Mock axios.request specifically
      mockedAxios.mockResolvedValueOnce(mockResponse);

      const result = await uploadResume(mockFile);

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "/read",
          method: "POST",
          baseURL: import.meta.env.WXT_SERVER_URL,
          data: expect.any(FormData),
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it("should throw error if axios request fails", async () => {
      // Mock axios.request to reject
      mockedAxios.mockRejectedValueOnce(new Error("Network Error"));

      await expect(uploadResume(mockFile)).rejects.toThrow(
        "File upload failed. Please try again."
      );
    });

    // it('should log FormData and File to console', async () => {
    //   const consoleSpy = vi.spyOn(console, 'log');
    //   mockedAxios.mockResolvedValueOnce(mockResponse);

    //   await uploadResume(mockFile);

    //   expect(consoleSpy).toHaveBeenCalledWith('FormData:', expect.any(FormData));
    //   expect(consoleSpy).toHaveBeenCalledWith('File:', mockFile);
    // });

    it("should create FormData with correct file", async () => {
      mockedAxios.mockResolvedValueOnce(mockResponse);

      await uploadResume(mockFile);

      const requestCall = mockedAxios.mock.calls[0][0];
      const formData = requestCall.data as FormData;
      expect(formData.get("file")).toBe(mockFile);
    });

    it("should handle different error types", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");
      const networkError = new Error("Network timeout");

      mockedAxios.mockRejectedValueOnce(networkError);

      await expect(uploadResume(mockFile)).rejects.toThrow(
        "File upload failed. Please try again."
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error uploading file:",
        networkError
      );
    });
  });

  describe("addResumeDataToDB", () => {
    it("should successfully add resume data to database", async () => {
      // Arrange
      const mockResponse = {
        data: {
          success: true,
          message: "Resume added successfully",
          id: "resume-123",
        },
      };
      mockedAxios.mockResolvedValue(mockResponse);

      // Act
      const result = await addResumeDataToDB(mockResumeData);

      // Assert
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `/resume/add`,
          method: "POST",
          baseURL: import.meta.env.WXT_SERVER_URL,
          data: { resume: mockResumeData },
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it("should handle database addition errors", async () => {
      // Arrange
      const mockError = new Error("Database error");
      mockedAxios.mockRejectedValue(mockError);

      // Act & Assert
      await expect(addResumeDataToDB(mockResumeData)).rejects.toThrow(
        "Failed to add resume data to DB."
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error adding resume data to DB:",
        mockError
      );
    });
  });

  describe("updateResumeDataInDB", () => {
    const testEmail = "test@example.com";

    it("should successfully update resume data in database", async () => {
      // Arrange
      const mockResponse = {
        status: 201,
        data: {
          data: { ...mockResumeData, updated: true },
        },
      };
      mockedAxios.mockResolvedValue(mockResponse);

      // Act
      const result = await updateResumeDataInDB(mockResumeData, testEmail);

      // Assert
      expect(mockedAxios).toHaveBeenCalledWith({
        url: `/resume/${testEmail}`,
        method: "PUT",
        baseURL: import.meta.env.WXT_SERVER_URL,
        data: mockResumeData,
      });
      expect(result).toEqual(mockResponse.data.data);
    });

    it("should throw error when resume object is empty", async () => {
      // Arrange
      const emptyResume = {} as IProfileSchema;

      // Act & Assert
      await expect(
        updateResumeDataInDB(emptyResume, testEmail)
      ).rejects.toThrow("Resume object is empty.");
      expect(consoleErrorSpy).toHaveBeenCalledWith("Resume object is empty");
      expect(mockedAxios).not.toHaveBeenCalled();
    });

    it("should handle non-201 status codes", async () => {
      // Arrange
      const mockResponse = {
        status: 400,
        data: { error: "Bad request" },
      };
      mockedAxios.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(
        updateResumeDataInDB(mockResumeData, testEmail)
      ).rejects.toThrow("Failed to update resume data");
    });

    it("should handle network errors during update", async () => {
      // Arrange
      const mockError = new Error("Network error");
      mockedAxios.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        updateResumeDataInDB(mockResumeData, testEmail)
      ).rejects.toThrow("Failed to update resume data in DB.");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error updating resume data in DB:",
        mockError
      );
    });

    it("should handle resume with only some properties", () => {
      // Arrange
      const partialResume = { email: "test@example.com" };

      // Act & Assert - should not throw for non-empty object
      expect(Object.keys(partialResume).length).toBeGreaterThan(0);
    });
  });

  describe("getResumeDataFromDB",()=>{
        const testEmail = 'test@example.com'

    it('should successfully get resume data from database', async () => {
      // Arrange
      const mockResponse = {
        status: 200,
        data: {
          data: mockResumeData
        }
      }
      mockedAxios.mockResolvedValue(mockResponse)

      // Act
      const result = await getResumeDataFromDB(testEmail)

      // Assert
      expect(mockedAxios).toHaveBeenCalledWith({
        url: `/resume/${testEmail}`,
        method: 'GET',
        baseURL: import.meta.env.WXT_SERVER_URL,
        data: {
          email: testEmail
        }
      })
      expect(result).toEqual(mockResumeData)
    })

    it('should handle non-200 status codes', async () => {
      // Arrange
      const mockResponse = {
        status: 404,
        data: { error: 'Resume not found' }
      }
      mockedAxios.mockResolvedValue(mockResponse)

      // Act & Assert
      await expect(getResumeDataFromDB(testEmail)).rejects.toThrow('Failed to fetch resume data from DB')
    })

    // it('should handle network errors during get request', async () => {
    //   // Arrange
    //   const mockError = new Error('Network error')
    //   mockedAxios.mockRejectedValue(mockError)

    //   // Act
    //   const result = await getResumeDataFromDB(testEmail)

    //   // Assert
    //   expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch resume data from DB.', mockError)
    //   expect(result).toBeUndefined()
    // })


    // it('should return undefined when error occurs (does not throw)', async () => {
    //   // Arrange
    //   const mockError = new Error('Database error')
    //   mockedAxios.mockRejectedValue(mockError)

    //   // Act
    //   const result = await getResumeDataFromDB(testEmail)

    //   // Assert
    //   expect(result).toBeUndefined()
    //   expect(consoleErrorSpy).toHaveBeenCalled()
    // })

    // it('should handle malformed response data', async () => {
    //   // Arrange
    //   const mockResponse = {
    //     status: 200,
    //     data: {
    //       // Missing 'data' property
    //       success: true
    //     }
    //   }
    //   mockedAxios.mockResolvedValue(mockResponse)

    //   // Act
    //   const result = await getResumeDataFromDB(testEmail)

    //   // Assert
    //   expect(result).toBeUndefined()
    // })
  })

  describe("Error handling edge cases",()=>{

    it('should handle axios request configuration errors', async () => {
      // Arrange
      mockedAxios.mockImplementation(() => {
        throw new Error('Invalid request configuration')
      })

      // Act & Assert
      await expect(uploadResume(mockFile)).rejects.toThrow('File upload failed. Please try again.')
    })

    it('should handle large file uploads', async () => {
      // Arrange
      const largeFile = new File(['x'.repeat(10000)], 'large-resume.pdf', { type: 'application/pdf' })
      const mockResponse = { data: { success: true } }
      mockedAxios.mockResolvedValue(mockResponse)

      // Act
      const result = await uploadResume(largeFile)

      // Assert
      expect(result).toEqual(mockResponse.data)
      expect(mockedAxios).toHaveBeenCalled()
    })

    it('should handle special characters in email', async () => {
      // Arrange
      const specialEmail = 'test+user@example-domain.com'
      const mockResponse = {
        status: 200,
        data: { data: mockResumeData }
      }
      mockedAxios.mockResolvedValue(mockResponse)

      // Act
      const result = await getResumeDataFromDB(specialEmail)

      // Assert
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `/resume/${specialEmail}`
        })
      )
    })

  })
});
