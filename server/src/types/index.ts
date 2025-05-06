export type FileUploadResponse = {
  id: string;
  object: string;
  sizeBytes: number;
  createdAt: number;
  filename: string;
  purpose: string;
  sampleType: string;
  numLines: null | string;
  source: string;
};

export interface IProfileSchema {
  personal: {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    startDate: Date;
    endDate: Date;
    responsibilities: string;
    achievements: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    startDate: Date;
    endDate: Date;
    coursework: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
  };
  certifications: Array<{
    name: string;
    year: string;
  }>;
  languages: string[];
  projects: Array<{
    name: string;
    description: string;
    link?: string;
  }>;
}
