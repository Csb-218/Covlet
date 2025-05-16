import app from "../../src/index"
import request,{} from "supertest";   
import {beforeEach,it,jest,describe}  from "@jest/globals";

describe("File Upload and Read API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  }
  );

  it("should read a file and give a filledSchema in response body", async () => {

    const response = await request(app)
      .post("/read")
      .attach("file", "uploads/resume_cs_bhagwant.pdf"); // Adjust the path to your test PDF file

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body).toHaveProperty("experience");
    expect(response.body).toHaveProperty("education");
    expect(response.body.experience).toBeDefined();
    expect(response.body.education).toBeDefined();
    
  });

  it("should return 400 if no file is uploaded", async () => {
    const response = await request(app).post("/read");
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "No file uploaded" });
  });

  it("should return 400 if the file is not a PDF", async () => {
    const response = await request(app)
      .post("/read")
      .attach("file", "uploads/me2.jpeg"); // Adjust the path to your test text file

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Only pdf formats are allowed" });
  });

  it("should return 400 if the PDF does not contain 'education' or 'experience'", async () => {
    const response = await request(app)
      .post("/read")
      .attach("file", "uploads/invalid-resume.pdf"); // Adjust the path to your test PDF file

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "The resume does not have skills and certifications" });
  });

})