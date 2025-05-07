import React, { useState, useEffect } from 'react';
import { useLocation,useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addResumeDataToDB } from "@/services/server";
import { z } from 'zod';
import { sample_resume_json } from "@/assets";
import { IProfileSchema } from '@/types';
import { formatDateForInput } from "@/utils/helpers"

// Form validation schema
const profileSchema = z.object({
  personal: z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Invalid phone number"),
    linkedin: z.string().url("Invalid LinkedIn URL")
  }),
  summary: z.string().min(50, "Summary should be at least 50 characters"),
  experience: z.array(z.object({
    title: z.string().min(2, "Job title is required"),
    company: z.string().min(2, "Company name is required"),
    startDate: z.coerce.date()
      .refine(date => !date || date <= new Date(), {
        message: "Start date cannot be in the future"
      }),
    endDate: z.coerce.date()
      .nullable()
      .refine(date => !date || date <= new Date(), {
        message: "End date cannot be in the future"
      }),
    isPresent: z.boolean().optional(), // Add this
    responsibilities: z.string(),
    achievements: z.string()
  })).refine(experience => {
    return experience.every(exp => {
      if (exp.startDate && exp.endDate) {
        return exp.startDate <= exp.endDate;
      }
      return true;
    });
  }, {
    message: "End date must be after start date"
  }),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    startDate: z.coerce.date()
      .refine(date => !date || date <= new Date(), {
        message: "Start date cannot be in the future"
      }),
    endDate: z.coerce.date()
      .nullable()
      .refine(date => !date || date <= new Date(), {
        message: "End date cannot be in the future"
      }),
    coursework: z.string()
  })).refine(education => {
    return education.every(edu => {
      if (edu.startDate && edu.endDate) {
        return edu.startDate <= edu.endDate;
      }
      return true;
    });
  }, {
    message: "End date must be after start date"
  }),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string())
  }),
  certifications: z.array(z.object({
    name: z.string(),
    year: z.string()
  })),
  languages: z.array(z.string()),
  projects: z.array(z.object({
    name: z.string().min(2, "Project name is required"),
    description: z.string().min(10, "Description should be at least 10 characters"),
    link: z.string().url("Invalid project URL").optional(),
  }))
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileBuild: React.FC = () => {
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const resumeData:IProfileSchema = location.state?.resumeData;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch, // Add this
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      personal: { name: '', email: '', phone: '', linkedin: '' },
      experience: [{ 
        title: '', 
        company: '', 
        startDate: new Date(), 
        endDate: null, 
        isPresent: false, // Add this
        responsibilities: '', 
        achievements: '' 
      }],
      education: [{ 
        degree: '', 
        institution: '', 
        startDate: new Date(), 
        endDate: null, 
        coursework: '' 
      }],
      skills: { technical: [], soft: [] },
      certifications: [{ name: '', year: '' }],
      languages: [],
      projects: [{ name: '', description: '', link: '' }]
    }
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: "experience"
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: "education"
  });

  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control,
    name: "certifications"
  });

  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: "projects"
  });

  const loadSampleResume = () => {
    setIsLoadingSample(true);
    try {
      // Convert dates from string to Date objects if needed
      const formattedSample = {
        ...sample_resume_json,
        experience: sample_resume_json.experience.map(exp => ({
          ...exp,
          startDate:  new Date(exp.startDate),
          endDate: exp.endDate ? new Date(exp.endDate) : null,
        })),
        education: sample_resume_json.education.map(edu => ({
          ...edu,
          startDate:  new Date(edu.startDate),
          endDate: edu.endDate ? new Date(edu.endDate) : null,
        }))
      };

      console.log('date', formatDateForInput(formattedSample.experience[0].startDate));
      console.log("Sample Resume Data:", formattedSample);
      reset(formattedSample);
    } catch (error) {
      console.error('Error loading sample resume:', error);
    } finally {
      setIsLoadingSample(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const formattedData = {
        ...data,
        experience: data.experience.map(exp => ({
          ...exp,
          startDate: exp.startDate,
          endDate: exp.isPresent ? null : exp.endDate ,
        })),
        education: data.education.map(edu => ({
          ...edu,
          startDate: edu.startDate,
          endDate: edu.endDate,
        }))
      };
      console.log("Formatted Data:", formattedData);
      const response = await addResumeDataToDB(formattedData);
    } catch (error) {
      console.error(error);
    } finally {
      navigate("/")
    }
  };

  useEffect(() => {
    if (resumeData) {
      console.log("Resume Data:", resumeData);
      try {
        // Format dates from string to Date objects
        const formattedData = {
        ...resumeData,
        experience: resumeData.experience.map(exp => ({
          ...exp,
          startDate: formatDateForInput(exp.startDate),
          endDate:  formatDateForInput(exp.endDate) ,
        })),
        education: resumeData.education.map(edu => ({
          ...edu,
          startDate: formatDateForInput(edu.startDate),
          endDate: formatDateForInput(edu.endDate),
        }))
      };

        // Reset form with formatted data
        reset({
          ...formattedData,
          experience: formattedData.experience.map(exp => ({
            ...exp,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
          })),
          education: formattedData.education.map(edu => ({
            ...edu,
            startDate: new Date(edu.startDate),
            endDate: edu.endDate ? new Date(edu.endDate) : null,
          })),
        });

        // Handle arrays separately if needed
        if (resumeData.skills?.technical) {
          setValue('skills.technical', resumeData.skills.technical);
        }
        if (resumeData.skills?.soft) {
          setValue('skills.soft', resumeData.skills.soft);
        }
        if (resumeData.languages) {
          setValue('languages', resumeData.languages);
        }

      } catch (error) {
        console.error('Error prefilling form:', error);
      }
    }
  }, [resumeData, reset, setValue]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Build Your Profile</h1>
        <button
          type="button"
          onClick={loadSampleResume}
          disabled={isLoadingSample || isSubmitting}
          className={`px-4 py-2 rounded-md text-sm transition-colors ${
            isLoadingSample || isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isLoadingSample ? 'Loading...' : 'Load Sample Resume'}
        </button>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                {...register("personal.name")}
                type="text"
                placeholder="Full Name"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {errors.personal?.name && (
                <p className="text-red-500 text-sm mt-1">{errors.personal.name.message}</p>
              )}
            </div>
            <div>
              <input
                {...register("personal.email")}
                type="email"
                placeholder="Email"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {errors.personal?.email && (
                <p className="text-red-500 text-sm mt-1">{errors.personal.email.message}</p>
              )}
            </div>
            <div>
              <input
                {...register("personal.phone")}
                type="tel"
                placeholder="Phone Number"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {errors.personal?.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.personal.phone.message}</p>
              )}
            </div>
            <div>
              <input
                {...register("personal.linkedin")}
                type="url"
                placeholder="LinkedIn URL"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {errors.personal?.linkedin && (
                <p className="text-red-500 text-sm mt-1">{errors.personal.linkedin.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* Summary Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Professional Summary</h2>
          <div>
            <textarea
              {...register("summary")}
              placeholder="Brief statement about your experience and skills..."
              className="w-full p-2 border border-gray-300 rounded-md h-32 focus:ring-2 focus:ring-blue-500"
            />
            {errors.summary && (
              <p className="text-red-500 text-sm mt-1">{errors.summary.message}</p>
            )}
          </div>
        </section>

        {/* Work Experience */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Work Experience</h2>
          {experienceFields.map((field, index) => (
            <div key={field.id} className="space-y-4 p-4 border border-gray-200 rounded-md relative">
              <button
                type="button"
                onClick={() => removeExperience(index)}
                className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                aria-label="Delete experience"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    {...register(`experience.${index}.title`)}
                    placeholder="Job Title"
                    className="w-full p-2 border border-gray-300 rounded-md"
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
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formatDateForInput(watch(`experience.${index}.startDate`))}
                      {...register(`experience.${index}.startDate`)}
                      // max={new Date().toISOString()}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    {errors.experience?.[index]?.startDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.experience[index]?.startDate?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <div className="space-y-2">
                      <input
                        type="date"
                        {...register(`experience.${index}.endDate`)}
                        // min={watch(`experience.${index}.startDate`) ? (watch(`experience.${index}.startDate`) as Date).toISOString().split('T')[0] : ''}
                        // max={new Date().toISOString().split('T')[0]}
                        disabled={watch(`experience.${index}.isPresent`)}
                        className={`w-full p-2 border border-gray-300 rounded-md ${
                          watch(`experience.${index}.isPresent`) ? 'bg-gray-100' : ''
                        }`}
                      />
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          {...register(`experience.${index}.isPresent`)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setValue(`experience.${index}.endDate`, null);
                            }
                          }}
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
                    className="w-full p-2 border border-gray-300 rounded-md h-24"
                  />
                </div>
                <div>
                  <textarea
                    {...register(`experience.${index}.achievements`)}
                    placeholder="Achievements"
                    className="w-full p-2 border border-gray-300 rounded-md h-24"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendExperience({ 
              title: '', 
              company: '', 
              startDate: new Date(), 
              endDate: null,
              isPresent: false, // Add this
              responsibilities: '', 
              achievements: '' 
            })}
            className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + Add More Experience
          </button>
        </section>
        
        {/* Projects Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Projects</h2>
          {projectFields.map((field, index) => (
            <div key={field.id} className="space-y-4 p-4 border border-gray-200 rounded-md relative">
              <button
                type="button"
                onClick={() => removeProject(index)}
                className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                aria-label="Delete project"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <input
                    {...register(`projects.${index}.name`)}
                    placeholder="Project Name"
                    className="w-full p-2 border border-gray-300 rounded-md"
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
                    className="w-full p-2 border border-gray-300 rounded-md h-24"
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
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {errors.projects?.[index]?.link && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.projects[index]?.link?.message}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeProject(index)}
                className="mt-2 px-4 py-2 text-sm text-red-600 hover:text-red-800"
              >
                - Remove Project
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendProject({ name: '', description: '', link: '' })}
            className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + Add More Projects
          </button>
        </section>

        {/* Education Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Education</h2>
          {educationFields.map((field, index) => (
            <div key={field.id} className="space-y-4 p-4 border border-gray-200 rounded-md relative">
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                aria-label="Delete education"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    {...register(`education.${index}.degree`)}
                    placeholder="Degree"
                    className="w-full p-2 border border-gray-300 rounded-md"
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
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      {...register(`education.${index}.startDate`)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      {...register(`education.${index}.endDate`)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <input
                    {...register(`education.${index}.coursework`)}
                    placeholder="Relevant Coursework"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendEducation({ 
              degree: '', 
              institution: '', 
              startDate: new Date(), 
              endDate: null, 
              coursework: '' 
            })}
            className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + Add More Education
          </button>
        </section>

        {/* Skills Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technical Skills
              </label>
              <input
                {...register("skills.technical")}
                placeholder="Add skills separated by commas"
                className="w-full p-2 border border-gray-300 rounded-md"
                onChange={(e) => {
                  const skills = e.target.value.split(',').map(skill => skill.trim());
                  setValue("skills.technical", skills);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Soft Skills
              </label>
              <input
                {...register("skills.soft")}
                placeholder="Add skills separated by commas"
                className="w-full p-2 border border-gray-300 rounded-md"
                onChange={(e) => {
                  const skills = e.target.value.split(',').map(skill => skill.trim());
                  setValue("skills.soft", skills);
                }}
              />
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Certifications</h2>
          {certificationFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  {...register(`certifications.${index}.name`)}
                  placeholder="Certification Name"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <input
                  {...register(`certifications.${index}.year`)}
                  placeholder="Year"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                type="button"
                onClick={() => removeCertification(index)}
                className="mt-2 px-4 py-2 text-sm text-red-600 hover:text-red-800"
              >
                - Remove Certification
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendCertification({ name: '', year: '' })}
            className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + Add More Certifications
          </button>
        </section>

        {/* Languages Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Languages</h2>
          <div>
            <input
              {...register("languages")}
              placeholder="Add languages separated by commas (e.g., English, Spanish)"
              className="w-full p-2 border border-gray-300 rounded-md"
              onChange={(e) => {
                const languages = e.target.value.split(',').map(lang => lang.trim());
                setValue("languages", languages);
              }}
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md transition-colors ${
            isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfileBuild;