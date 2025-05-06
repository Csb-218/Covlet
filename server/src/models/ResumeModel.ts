import mongoose, { Schema, Document } from 'mongoose';
import { IProfileSchema } from '../types';

// Extend Document with IProfileSchema
interface IResume extends Document, IProfileSchema {}

const ResumeSchema = new Schema<IResume>({
  personal: {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    linkedin: { type: String, required: true }
  },
  summary: { type: String, required: true },
  experience: [{
    title: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    responsibilities: { type: String, required: true },
    achievements: { type: String, required: true }
  }],
  education: [{
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    coursework: { type: String, required: true }
  }],
  skills: {
    technical: [{ type: String }],
    soft: [{ type: String }]
  },
  certifications: [{
    name: { type: String, required: true },
    year: { type: String, required: true }
  }],
  languages: [{ type: String }],
  projects: [{
    name: { type: String, required: true, minlength: 2 },
    description: { type: String, required: true, minlength: 10 },
    link: { type: String, required: false }
  }]
}, {
  timestamps: true
});

export const Resume = mongoose.model<IResume>('Resume', ResumeSchema);