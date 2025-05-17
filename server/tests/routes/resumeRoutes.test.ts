import request from "supertest";
import { beforeEach, it, jest, describe } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import app from "../../src/app";

describe("Resume Routes", () => {
  let mongod: any;

  const mockResume = {
    personal: {
      name: "John Doe",
      email: "xyz@gmail.com",
      phone: "1234567890",
      linkedin: "linkedin.com/in/johndoe",
    },
    summary: "Experienced developer.",
    experience: [
      {
        title: "Software Engineer",
        company: "Tech Corp",
        startDate: "2020-01-01T00:00:00.000Z",
        endDate: "2022-01-01T00:00:00.000Z",
        responsibilities: "Developed software.",
        achievements: "Employee of the Month",
      },
    ],
    education: [
      {
        degree: "B.Sc. Computer Science",
        institution: "University X",
        startDate: "2016-01-01T00:00:00.000Z",
        endDate: "2020-01-01T00:00:00.000Z",
        coursework: "Algorithms, Data Structures",
      },
    ],
    skills: {
      technical: ["JavaScript", "TypeScript"],
      soft: ["Communication", "Teamwork"],
    },
    certifications: [
      {
        name: "Certified Developer",
        year: "2021",
      },
    ],
    languages: ["English", "Spanish"],
    projects: [
      {
        name: "Project A",
        description: "A cool project.",
        link: "xyz.com",
      },
    ],
  };

  const mockResumeWithId = {
    ...mockResume,
    __v: expect.any(Number),
    _id: expect.any(String),
    certifications: [
      {
        _id: expect.any(String),
        ...mockResume.certifications[0],
      },
    ],
    education: [
      {
        _id: expect.any(String),
        ...mockResume.education[0],
      },
    ],
    experience: [
      {
        _id: expect.any(String),
        ...mockResume.experience[0],
      },
    ],
    projects: [
      {
        _id: expect.any(String),
        ...mockResume.projects[0],
      },
    ],
    updatedAt: expect.any(String),
    createdAt: expect.any(String),
  };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  });
  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /resume/add", () => {
    it("should add a new resume and return 201", async () => {
      const response = await request(app).post("/resume/add").send(mockResume);

      expect(response.status).toBe(201);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response.body).toEqual({
        success: true,
        message: "Resume added successfully",
        data: {
          ...mockResume,
          _id: expect.any(String),
        },
      });
    });

    it("should return 400 if the resume already exists", async () => {
      await request(app).post("/resume/add").send(mockResume);

      const response = await request(app).post("/resume/add").send(mockResume);

      expect(response.status).toBe(400);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response.body).toEqual({
        success: false,
        message: "Resume already exists for this email",
      });
    });

    it("should return 400 if the request body is invalid", async () => {
      const response = await request(app).post("/resume/add").send({});

      expect(response.status).toBe(400);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response.body).toEqual({
        success: false,
        message: "Invalid request body",
      });
    });

    it("should return 400 if the email is not provided", async () => {
      const invalidResume = {
        ...mockResume,
        personal: { ...mockResume.personal, email: "" },
      };

      const response = await request(app)
        .post("/resume/add")
        .send(invalidResume);

      expect(response.status).toBe(400);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response.body).toEqual({
        success: false,
        message: "Email is required",
      });
    });

    it("should return 500 if there is a server error", async () => {
      // spy on the mongoose create method to throw an error
      jest.spyOn(mongoose.Model, "create").mockImplementationOnce(() => {
        throw new Error("Server error");
      });

      const response = await request(app).post("/resume/add").send(mockResume);

      expect(response.status).toBe(500);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response.body).toEqual({
        success: false,
        message: "Error adding resume to database",
        error: "Server error",
      });
    });
  });

  describe("GET /resume/:email", () => {
    it("should return a resume by email", async () => {
      await request(app).post("/resume/add").send(mockResume);

      const response = await request(app).get("/resume/xyz@gmail.com");
      expect(response.status).toBe(200);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response.body).toEqual({
        success: true,
        data: mockResumeWithId,
      });
    });

    it("should return 404 if the resume is not found", async () => {
      const response = await request(app).get("/resume/abc");
      expect(response.status).toBe(404);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response.body).toEqual({
        success: false,
        message: "Resume not found",
      });
    });

    it("should return 500 if there is a server error", async () => {
      // spy on the mongoose findOne method to throw an error
      jest.spyOn(mongoose.Model, "findOne").mockImplementationOnce(() => {
        throw new Error("Server error");
      });
      const response = await request(app).get("/resume/abc");
      expect(response.status).toBe(500);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response.body).toEqual({
        success: false,
        message: "Error fetching resume from database",
        error: "Server error",
      });
    });
  });

  describe("PUT /resume/:email", () => {
    it("should update a resume by email", async () => {
      await request(app).post("/resume/add").send(mockResume);

      const updatedResume = {
        ...mockResume,
        personal: { ...mockResume.personal, name: "Jane Doe" },
      };

      const response = await request(app)
        .put("/resume/xyz@gmail.com")
        .send(updatedResume);
      expect(response.status).toBe(201);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response.body).toEqual({
        success: true,
        message: "Resume updated successfully",
        data: {
          ...mockResumeWithId,
          personal: { ...mockResumeWithId.personal, name: "Jane Doe" },
        },
      });
    });

    it("should return 400 if the request body is invalid", async () => {
      await request(app).post("/resume/add").send(mockResume);
      const response = await request(app).put("/resume/xyz@gmail.com").send({});
      expect(response.status).toBe(400);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response.body).toEqual({
        success: false,
        message: "Invalid request body",
      });
    });

    it("should return 404 if the resume is not found", async () => {
      const response = await request(app).put("/resume/abc").send(mockResume);
      expect(response.status).toBe(404);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response.body).toEqual({
        success: false,
        message: "Resume not found",
      });
    });

    it("should return 500 if there is a server error", async () => {
      // spy on the mongoose findOne method to throw an error
      jest
        .spyOn(mongoose.Model, "findOneAndUpdate")
        .mockImplementationOnce(() => {
          throw new Error("Server error");
        });
      const response = await request(app)
        .put("/resume/xyz@gmail.com")
        .send(mockResume);

      expect(response.status).toBe(500);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response.body).toEqual({
        success: false,
        message: "Error updating resume in database",
        error: "Server error",
      });
    });
  });

  describe("DELETE /resume/:email", () => {
    it("should delete a resume by email", async () => {
      await request(app).post("/resume/add").send(mockResume);

      const response = await request(app).delete("/resume/xyz@gmail.com");
      expect(response.status).toBe(200);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response.body).toEqual({
        success: true,
        message: "Resume deleted successfully",
        data: mockResumeWithId,
      });
    });

    it("should return 404 if the resume is not found", async () => {
      const response = await request(app).delete("/resume/abc");
      expect(response.status).toBe(404);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response.body).toEqual({
        success: false,
        message: "Resume not found",
      });
    });
    it("should return 500 if there is a server error", async () => {
      // spy on the mongoose findOne method to throw an error
      jest
        .spyOn(mongoose.Model, "findOneAndDelete")
        .mockImplementationOnce(() => {
          throw new Error("Server error");
        }
      );
      const response = await request(app).delete("/resume/x");
      expect(response.status).toBe(500);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response.body).toEqual({
        success: false,
        message: "Error deleting resume from database",
        error: "Server error",
      })
    })
  });
});
