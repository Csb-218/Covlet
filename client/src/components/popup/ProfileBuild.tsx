import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getResumeDataFromDB,
  updateResumeDataInDB,
  deleteResumeDataFromDB,
} from "@/services/server";
import { z } from "zod";

import { IProfileSchema, user } from "@/types";
import { formatDateForInput } from "@/utils/helpers";

// Form validation schema
const profileSchema = z.object({
  personal: z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Invalid phone number"),
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
          {
            message: "Start date cannot be in the future",
          }
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
            {
              message: "End date cannot be in the future",
            }
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
            const startDate =
              typeof exp.startDate === "string"
                ? new Date(exp.startDate)
                : exp.startDate;
            const endDate =
              typeof exp.endDate === "string"
                ? new Date(exp.endDate)
                : exp.endDate;
            return startDate <= endDate;
          }
          return true;
        });
      },
      {
        message: "End date must be after start date",
      }
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
          {
            message: "Start date cannot be in the future",
          }
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
            {
              message: "End date cannot be in the future",
            }
          ),
        coursework: z.string(),
      })
    )
    .refine(
      (education) => {
        return education.every((edu) => {
          if (edu.startDate && edu.endDate) {
            const startDate =
              typeof edu.startDate === "string"
                ? new Date(edu.startDate)
                : edu.startDate;
            const endDate =
              typeof edu.endDate === "string"
                ? new Date(edu.endDate)
                : edu.endDate;
            return startDate <= endDate;
          }
          return true;
        });
      },
      {
        message: "End date must be after start date",
      }
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
      description: z
        .string()
        .min(10, "Description should be at least 10 characters"),
      link: z.string().url("Invalid project URL").optional(),
    })
  ),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileBuild = ({
  setUser,
  user,
}: {
  setUser: React.Dispatch<React.SetStateAction<user | null>>;
  user: user;
}) => {

  console.log("Hi profile");
  const location = useLocation();
  const resume: IProfileSchema = location.state?.resumeData;

  const [isDeleting, setIsDeleting] = useState(false);
  const [resumeData, setResumeData] = useState<IProfileSchema | null>(resume);

  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch, // Add this
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      personal: { name: "", email: "", phone: "", linkedin: "" },
      experience: [
        {
          title: "",
          company: "",
          startDate: new Date(),
          endDate: null,
          isPresent: false, // Add this
          responsibilities: "",
          achievements: "",
        },
      ],
      education: [
        {
          degree: "",
          institution: "",
          startDate: new Date(),
          endDate: null,
          coursework: "",
        },
      ],
      skills: { technical: [], soft: [] },
      certifications: [{ name: "", year: "" }],
      languages: [],
      projects: [{ name: "", description: "", link: "" }],
    },
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control,
    name: "experience",
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: "education",
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control,
    name: "certifications",
  });

  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({
    control,
    name: "projects",
  });

  // Stable handlers to prevent re-renders
  const handleTechnicalSkillsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const skills = e.target.value
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
      setValue("skills.technical", skills, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue]
  );

  const handleSoftSkillsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const skills = e.target.value
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
      setValue("skills.soft", skills, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue]
  );

  const handleLanguagesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const languages = e.target.value
        .split(",")
        .map((lang) => lang.trim())
        .filter(Boolean);
      setValue("languages", languages, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue]
  );

  // const loadSampleResume = () => {
  //   setIsLoadingSample(true);
  //   try {
  //     // Convert dates from string to Date objects if needed
  //     const formattedSample = {
  //       ...sample_resume_json,
  //       experience: sample_resume_json.experience.map(exp => ({
  //         ...exp,
  //         startDate:  new Date(exp.startDate),
  //         endDate: exp.endDate ? new Date(exp.endDate) : null,
  //       })),
  //       education: sample_resume_json.education.map(edu => ({
  //         ...edu,
  //         startDate:  new Date(edu.startDate),
  //         endDate: edu.endDate ? new Date(edu.endDate) : null,
  //       }))
  //     };

  //     console.log('date', formatDateForInput(formattedSample.experience[0].startDate));
  //     console.log("Sample Resume Data:", formattedSample);
  //     reset(formattedSample);
  //   } catch (error) {
  //     console.error('Error loading sample resume:', error);
  //   } finally {
  //     setIsLoadingSample(false);
  //   }
  // };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const formattedData = {
        ...data,
        experience: data.experience.map((exp) => ({
          ...exp,
          startDate:
            typeof exp.startDate === "string"
              ? new Date(exp.startDate)
              : exp.startDate,
          endDate: exp.isPresent
            ? null
            : typeof exp.endDate === "string"
            ? new Date(exp.endDate)
            : exp.endDate,
        })),
        education: data.education.map((edu) => ({
          ...edu,
          startDate:
            typeof edu.startDate === "string"
              ? new Date(edu.startDate)
              : edu.startDate,
          endDate:
            typeof edu.endDate === "string"
              ? new Date(edu.endDate)
              : edu.endDate,
        })),
      };
      console.log("Formatted Data:", formattedData);
      const response = await updateResumeDataInDB(formattedData, user.email);
    } catch (error) {
      console.error(error);
    } finally {
      console.log("saved successfully");
    }
  };

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await deleteResumeDataFromDB(user.email);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
      navigate("/");
    }
  };

  // Mount effect for logging and data fetching
  useEffect(() => {
    console.log("ProfileBuild component mounted");

    getResumeDataFromDB(user.email)
      .then((response) => {
        setResumeData(response);
      })
      .catch((error) => {
        console.error("Error fetching resume data:", error);
      });
  }, [user.email]);

  // fetch data and fill the form
  useEffect(() => {
    // fetch data and fill the form
    if (resumeData) {
      console.log("Resume Data:", resumeData);
      try {
        // Format dates from string to proper format for date inputs
        const formattedData = {
          ...resumeData,
          experience: resumeData.experience.map((exp) => ({
            ...exp,
            startDate: formatDateForInput(new Date(exp.startDate)),
            endDate: exp.endDate
              ? formatDateForInput(new Date(exp.endDate))
              : null,
          })),
          education: resumeData.education.map((edu) => ({
            ...edu,
            startDate: formatDateForInput(new Date(edu.startDate)),
            endDate: edu.endDate
              ? formatDateForInput(new Date(edu.endDate))
              : null,
          })),
        };

        // Reset form with formatted data
        reset(formattedData);

        // Handle arrays separately if needed
        if (resumeData.skills?.technical) {
          setValue("skills.technical", resumeData.skills.technical);
        }
        if (resumeData.skills?.soft) {
          setValue("skills.soft", resumeData.skills.soft);
        }
        if (resumeData.languages) {
          setValue("languages", resumeData.languages);
        }
      } catch (error) {
        console.error("Error prefilling form:", error);
      }
    }
  }, [resumeData, reset, setValue]);

  // Derived display values for comma-separated inputs
  const technicalSkillsValue = (watch("skills.technical") || []).join(", ");
  const softSkillsValue = (watch("skills.soft") || []).join(", ");
  const languagesValue = (watch("languages") || []).join(", ");

  return (
    <div className="h-full relative container">
     
      <div className="p-4 space-y-6 relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Edit Your Profile</h1>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
             aria-label="Delete entire profile"
              title="Delete entire profile"
          >
            {isDeleting ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
                >
                  <animateTransform
                    attributeName="transform"
                    dur="0.75s"
                    repeatCount="indefinite"
                    type="rotate"
                    values="0 12 12;360 12 12"
                  />
                </path>
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
              {/* Tooltip */}
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Delete profile
              </span>
          </button>
        </div>

      {/* profile form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)(e);
          }}
          className="space-y-6"
        >
          {/* Personal Information */}
          <section className="space-y-4 bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  {...register("personal.name")}
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                />
                {errors.personal?.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.personal.name.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  {...register("personal.email")}
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                />
                {errors.personal?.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.personal.email.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  {...register("personal.phone")}
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                />
                {errors.personal?.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.personal.phone.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  {...register("personal.linkedin")}
                  type="url"
                  placeholder="LinkedIn URL"
                  className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                />
                {errors.personal?.linkedin && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.personal.linkedin.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Summary Section */}
          <section className="space-y-4 bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800">
              Professional Summary
            </h2>
            <div>
              <textarea
                {...register("summary")}
                placeholder="Brief statement about your experience and skills..."
                className="w-full p-2 border border-gray-300 rounded-md bg-white h-32 focus:ring-2 focus:ring-blue-500"
              />
              {errors.summary && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.summary.message}
                </p>
              )}
            </div>
          </section>

          {/* Work Experience */}
          <section className="space-y-4 bg-white/40 backdrop-blur-sm rounded-xl p-4 border  border-white/30 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800">
              Work Experience
            </h2>
            {experienceFields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-4 p-4 border border-gray-200 rounded-md relative "
              >
                {/* Remove Button */}
                {experienceFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="absolute -top-5 -right-3 m-1 p-2 text-red-600 bg-white/80 hover:bg-red-100 rounded-full shadow transition-colors"
                    aria-label="Remove experience"
                    title="Remove this experience"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    {/* Tooltip */}
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Remove experience
                    </span>
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      {...register(`experience.${index}.title`)}
                      placeholder="Job Title"
                      className="w-full p-2 border border-gray-300 rounded-md bg-white"
                    />
                    {errors.experience?.[index]?.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.experience[index]?.title?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register(`experience.${index}.company`)}
                      placeholder="Company Name"
                      className="w-full p-2 border border-gray-300 rounded-md bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        {...register(`experience.${index}.startDate`)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                      />
                      {errors.experience?.[index]?.startDate && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.experience[index]?.startDate?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <div className="space-y-2">
                        <input
                          type="date"
                          {...register(`experience.${index}.endDate`)}
                          className="w-full p-2 border border-gray-300 rounded-md bg-white"
                        />
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            {...register(`experience.${index}.isPresent`, {
                              onChange: (e) => {
                                if (e.target.checked) {
                                  setValue(`experience.${index}.endDate`, null);
                                }
                              },
                            })}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                          />
                          <label className="ml-2 text-sm text-gray-600">
                            Present (Current)
                          </label>
                        </div>
                      </div>
                      {errors.experience?.[index]?.endDate && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.experience[index]?.endDate?.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <textarea
                      {...register(`experience.${index}.responsibilities`)}
                      placeholder="Responsibilities"
                      className="w-full p-2 border border-gray-300 rounded-md bg-white h-24"
                    />
                  </div>
                  <div>
                    <textarea
                      {...register(`experience.${index}.achievements`)}
                      placeholder="Achievements"
                      className="w-full p-2 border border-gray-300 rounded-md bg-white h-24"
                    />
                  </div>
                </div>
              </div>
            ))}
            {/* Add More Experience Button */}
            <button
              type="button"
              onClick={() =>
                appendExperience({
                  title: "",
                  company: "",
                  startDate: new Date(),
                  endDate: null,
                  isPresent: false, // Add this
                  responsibilities: "",
                  achievements: "",
                })
              }
              className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add More Experience
            </button>
          </section>

          {/* Projects Section */}
          <section className="space-y-4 bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800">Projects</h2>
            {projectFields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-4 p-4 border border-gray-100 rounded-md relative "
              >
                {/* Remove Button */}
                {projectFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    className="absolute -top-5 -right-3 m-1 p-2 text-red-600 bg-white/80 hover:bg-red-100 rounded-full shadow transition-colors"
                    aria-label="Remove project"
                    title="Remove this project"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    {/* Tooltip */}
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Remove project
                    </span>
                  </button>
                )}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <input
                      {...register(`projects.${index}.name`)}
                      placeholder="Project Name"
                      className="w-full p-2 border border-gray-300 rounded-md bg-white"
                    />
                    {errors.projects?.[index]?.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.projects[index]?.name?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <textarea
                      {...register(`projects.${index}.description`)}
                      placeholder="Project Description"
                      className="w-full p-2 border border-gray-300 rounded-md bg-white h-24"
                    />
                    {errors.projects?.[index]?.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.projects[index]?.description?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register(`projects.${index}.link`)}
                      type="url"
                      placeholder="Project URL (optional)"
                      className="w-full p-2 border border-gray-300 rounded-md bg-white"
                    />
                    {errors.projects?.[index]?.link && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.projects[index]?.link?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* Add More Projects Button */}
            <button
              type="button"
              onClick={() =>
                appendProject({ name: "", description: "", link: "" })
              }
              className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add More Projects
            </button>
          </section>

          {/* Education Section */}
          <section className="space-y-4 bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800">Education</h2>
            {educationFields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-4 p-4 border border-gray-100 rounded-md relative "
              >
                {/* Remove Button */}
                {educationFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="absolute -top-5 -right-3 m-1 p-2 text-red-600 bg-white/80 hover:bg-red-100 rounded-full shadow transition-colors"
                    aria-label="Remove education"
                    title="Remove this education"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    {/* Tooltip */}
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Remove education
                    </span>
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      {...register(`education.${index}.degree`)}
                      placeholder="Degree"
                      className="w-full p-2 border border-gray-300 rounded-md bg-white"
                    />
                    {errors.education?.[index]?.degree && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.education[index]?.degree?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register(`education.${index}.institution`)}
                      placeholder="Institution"
                      className="w-full p-2 border border-gray-300 rounded-md bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        {...register(`education.${index}.startDate`)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        {...register(`education.${index}.endDate`)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <input
                      {...register(`education.${index}.coursework`)}
                      placeholder="Relevant Coursework"
                      className="w-full p-2 border border-gray-300 rounded-md bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
            {/* Add More Education Button */}
            <button
              type="button"
              onClick={() =>
                appendEducation({
                  degree: "",
                  institution: "",
                  startDate: new Date(),
                  endDate: null,
                  coursework: "",
                })
              }
              className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add More Education
            </button>
          </section>

          {/* Skills Section */}
          <section className="space-y-4 bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800">Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technical Skills
                </label>
                <input
                  value={technicalSkillsValue}
                  placeholder="Add skills separated by commas"
                  className="w-full p-2 border border-gray-300 rounded-md bg-white"
                  onChange={handleTechnicalSkillsChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soft Skills
                </label>
                <input
                  value={softSkillsValue}
                  placeholder="Add skills separated by commas"
                  className="w-full p-2 border border-gray-300 rounded-md bg-white"
                  onChange={handleSoftSkillsChange}
                />
              </div>
            </div>
          </section>

          {/* Certifications Section */}
          <section className="space-y-4 bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800">
              Certifications
            </h2>
            {certificationFields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border border-gray-100 rounded-md  space-y-4 relative"
              >
                {/* Remove Button */}
                {certificationFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCertification(index)}
                    className="absolute -top-5 -right-3 m-1 p-2 text-red-600 bg-white/80 hover:bg-red-100 rounded-full shadow transition-colors"
                    aria-label="Remove certification"
                    title="Remove this certification"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                     {/* Tooltip */}
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Remove certification
                    </span>
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      {...register(`certifications.${index}.name`)}
                      placeholder="Certification Name"
                      className="w-full p-2 border border-gray-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <input
                      {...register(`certifications.${index}.year`)}
                      placeholder="Year"
                      className="w-full p-2 border border-gray-300 rounded-md bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
            {/* Add certification button */}
            <button
              type="button"
              onClick={() => appendCertification({ name: "", year: "" })}
              className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add More Certifications
            </button>
          </section>

          {/* Languages Section */}
          <section className="space-y-4 bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800">Languages</h2>
            <div>
              <input
                value={languagesValue}
                placeholder="Add languages separated by commas (e.g., English, Spanish)"
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
                onChange={handleLanguagesChange}
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-xl transition-all duration-300 shadow-lg backdrop-blur-sm flex items-center justify-center gap-2 ${
              isSubmitting
                ? "bg-gray-400/80 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105"
            } text-white font-medium`}
          >
            {isSubmitting && (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {isSubmitting ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileBuild;
