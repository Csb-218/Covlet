import { z } from "zod";

export const profileSchema = z.object({
  personal: z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Invalid phone number").max(10, "Invalid phone number"),
    linkedin: z.string().url("Invalid LinkedIn URL"),
  }),
  summary: z.string().min(50, "Summary should be at least 50 characters"),
  experience: z
    .array(
      z.object({
        title: z.string().min(2, "Job title is required"),
        company: z.string().min(2, "Company name is required"),
        startDate: z.union([z.string(), z.coerce.date()]).refine(
          (date) => {
            const dateObj = typeof date === "string" ? new Date(date) : date;
            return !dateObj || dateObj <= new Date();
          },
          { message: "Start date cannot be in the future" }
        ),
        endDate: z
          .union([z.string(), z.coerce.date()])
          .nullable()
          .refine(
            (date) => {
              if (!date) return true;
              const dateObj = typeof date === "string" ? new Date(date) : date;
              return !dateObj || dateObj <= new Date();
            },
            { message: "End date cannot be in the future" }
          ),
        isPresent: z.boolean().optional(),
        responsibilities: z.string(),
        achievements: z.string(),
      })
    )
    .refine(
      (experience) => {
        return experience.every((exp) => {
          if (exp.startDate && exp.endDate) {
            const startDate = typeof exp.startDate === "string" ? new Date(exp.startDate) : exp.startDate;
            const endDate = typeof exp.endDate === "string" ? new Date(exp.endDate) : exp.endDate;
            return startDate <= endDate;
          }
          return true;
        });
      },
      { message: "End date must be after start date" }
    ),
  education: z
    .array(
      z.object({
        degree: z.string(),
        institution: z.string(),
        startDate: z.union([z.string(), z.coerce.date()]).refine(
          (date) => {
            const dateObj = typeof date === "string" ? new Date(date) : date;
            return !dateObj || dateObj <= new Date();
          },
          { message: "Start date cannot be in the future" }
        ),
        endDate: z
          .union([z.string(), z.coerce.date()])
          .nullable()
          .refine(
            (date) => {
              if (!date) return true;
              const dateObj = typeof date === "string" ? new Date(date) : date;
              return !dateObj || dateObj <= new Date();
            },
            { message: "End date cannot be in the future" }
          ),
        coursework: z.string(),
      })
    )
    .refine(
      (education) => {
        return education.every((edu) => {
          if (edu.startDate && edu.endDate) {
            const startDate = typeof edu.startDate === "string" ? new Date(edu.startDate) : edu.startDate;
            const endDate = typeof edu.endDate === "string" ? new Date(edu.endDate) : edu.endDate;
            return startDate <= endDate;
          }
          return true;
        });
      },
      { message: "End date must be after start date" }
    ),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
  }),
  certifications: z.array(
    z.object({
      name: z.string(),
      year: z.string(),
    })
  ),
  languages: z.array(z.string()),
  projects: z.array(
    z.object({
      name: z.string().min(2, "Project name is required"),
      description: z.string().min(10, "Description should be at least 10 characters"),
      link: z.string().url("Invalid project URL").optional(),
    })
  ),
});

export type ProfileFormData = z.infer<typeof profileSchema>;