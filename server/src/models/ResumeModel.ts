import mongoose, { Schema, Document } from 'mongoose';
import { IProfileSchema } from '../types';

// Extend Document with IProfileSchema
interface IResume extends Document, IProfileSchema {}

const ResumeSchema = new Schema<IResume>({
  personal: {
    name: { type: String , required: true },
    email: { type: String ,required: true , unique: true },
    phone: { type: String},
    linkedin: { type: String }
  },
  summary: { type: String },
  experience: [{
    title: { type: String },
    company: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    responsibilities: { type: String },
    achievements: { type: String }
  }],
  education: [{
    degree: { type: String },
    institution: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    coursework: { type: String }
  }],
  skills: {
    technical: [{ type: String}],
    soft: [{ type: String}]
  },
  certifications: [{
    name: { type: String },
    year: { type: String }
  }],
  languages: [{ type: String }],
  projects: [{
    name: { type: String, minlength: 2 },
    description: { type: String, minlength: 10 },
    link: { type: String, required: false }
  }]
}, {
  timestamps: true
});

export const ResumeModel = mongoose.model<IResume>('Resume', ResumeSchema);