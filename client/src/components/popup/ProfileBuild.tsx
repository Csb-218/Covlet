import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateResumeDataInDB, deleteResumeDataFromDB } from "@/services/server";
import { updateLocal } from "@/utils/helpers";
import { IProfileSchema, user } from "@/types";
import { formatDateForInput } from "@/utils/helpers";

// Import modular components
import PersonalInformationSection from "./FormComponents/PersonalInformationSection";
import ProfessionalSummarySection from "./FormComponents/ProfessionalSummarySection";
import WorkExperienceSection from "./FormComponents/WorkExperienceSection";
import ProjectsSection from "./FormComponents/ProjectsSection";
import EducationSection from "./FormComponents/EducationSection";
import SkillsSection from "./FormComponents/SkillsSection";
import CertificationsSection from "./FormComponents/CertificationsSection";
import LanguagesSection from "./FormComponents/LanguagesSection";
import { profileSchema, ProfileFormData } from "../../schemas";

const ProfileBuild = ({
  setUser,
  user,
}: {
  setUser: React.Dispatch<React.SetStateAction<user | null>>;
  user: user;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [resumeData, setResumeData] = useState<IProfileSchema | null>(null);
  
  // Local state for display values
  const [technicalSkillsDisplay, setTechnicalSkillsDisplay] = useState("");
  const [softSkillsDisplay, setSoftSkillsDisplay] = useState("");
  const [languagesDisplay, setLanguagesDisplay] = useState("");

  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      personal: { name: "", email: "", phone: "", linkedin: "" },
      experience: [{
        title: "",
        company: "",
        startDate: new Date(),
        endDate: null,
        isPresent: false,
        responsibilities: "",
        achievements: "",
      }],
      education: [{
        degree: "",
        institution: "",
        startDate: new Date(),
        endDate: null,
        coursework: "",
      }],
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
  } = useFieldArray({ control, name: "experience" });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({ control, name: "education" });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({ control, name: "certifications" });

  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({ control, name: "projects" });

  // Skills handlers
  const skillsHandlers = {
    technical: {
      onChange: useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTechnicalSkillsDisplay(e.target.value);
      }, []),
      onBlur: useCallback(() => {
        const skills = technicalSkillsDisplay.split(",").map(skill => skill.trim()).filter(Boolean);
        setValue("skills.technical", skills, { shouldValidate: true, shouldDirty: true });
      }, [technicalSkillsDisplay, setValue])
    },
    soft: {
      onChange: useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSoftSkillsDisplay(e.target.value);
      }, []),
      onBlur: useCallback(() => {
        const skills = softSkillsDisplay.split(",").map(skill => skill.trim()).filter(Boolean);
        setValue("skills.soft", skills, { shouldValidate: true, shouldDirty: true });
      }, [softSkillsDisplay, setValue])
    }
  };

  const languagesHandlers = {
    onChange: useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setLanguagesDisplay(e.target.value);
    }, []),
    onBlur: useCallback(() => {
      const languages = languagesDisplay.split(",").map(lang => lang.trim()).filter(Boolean);
      setValue("languages", languages, { shouldValidate: true, shouldDirty: true });
    }, [languagesDisplay, setValue])
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const formattedData = {
        ...data,
        experience: data.experience.map((exp) => ({
          ...exp,
          startDate: typeof exp.startDate === "string" ? new Date(exp.startDate) : exp.startDate,
          endDate: exp.isPresent ? null : typeof exp.endDate === "string" ? new Date(exp.endDate) : exp.endDate,
        })),
        education: data.education.map((edu) => ({
          ...edu,
          startDate: typeof edu.startDate === "string" ? new Date(edu.startDate) : edu.startDate,
          endDate: typeof edu.endDate === "string" ? new Date(edu.endDate) : edu.endDate,
        })),
      };
      
      const response = await updateResumeDataInDB(formattedData, user.email);
      updateLocal(response);
    } catch (error) {
      console.error(error);
    }
  };

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteResumeDataFromDB(user.email);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
      navigate("/");
    }
  };

  // Data fetching and form filling effects
  useEffect(() => {
    chrome.storage.local.get("user", (result) => {
      if (result.user) {
        setResumeData(result.user.resume);
      }
    });
  }, [user.email]);

  useEffect(() => {
    if (resumeData) {
      try {
        const formattedData = {
          ...resumeData,
          experience: resumeData.experience.map((exp) => ({
            ...exp,
            startDate: formatDateForInput(new Date(exp.startDate)),
            endDate: exp.endDate ? formatDateForInput(new Date(exp.endDate)) : null,
          })),
          education: resumeData.education.map((edu) => ({
            ...edu,
            startDate: formatDateForInput(new Date(edu.startDate)),
            endDate: edu.endDate ? formatDateForInput(new Date(edu.endDate)) : null,
          })),
        };

        reset(formattedData);

        if (resumeData.skills?.technical) {
          setValue("skills.technical", resumeData.skills.technical);
          setTechnicalSkillsDisplay(resumeData.skills.technical.join(", "));
        }
        if (resumeData.skills?.soft) {
          setValue("skills.soft", resumeData.skills.soft);
          setSoftSkillsDisplay(resumeData.skills.soft.join(", "));
        }
        if (resumeData.languages) {
          setValue("languages", resumeData.languages);
          setLanguagesDisplay(resumeData.languages.join(", "));
        }
      } catch (error) {
        console.error("Error prefilling form:", error);
      }
    }
  }, [resumeData, reset, setValue]);

  return (
    <div className="h-full relative container">
      <div className="p-4 space-y-6 relative z-10">
        {/* Header */}
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
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z">
                  <animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/>
                </path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            )}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <PersonalInformationSection register={register} errors={errors} />
          
          <ProfessionalSummarySection register={register} errors={errors} />
          
          <WorkExperienceSection
            register={register}
            errors={errors}
            setValue={setValue}
            fields={experienceFields}
            append={appendExperience}
            remove={removeExperience}
          />
          
          <ProjectsSection
            register={register}
            errors={errors}
            fields={projectFields}
            append={appendProject}
            remove={removeProject}
          />
          
          <EducationSection
            register={register}
            errors={errors}
            fields={educationFields}
            append={appendEducation}
            remove={removeEducation}
          />
          
          <SkillsSection
            technicalSkillsDisplay={technicalSkillsDisplay}
            softSkillsDisplay={softSkillsDisplay}
            skillsHandlers={skillsHandlers}
          />
          
          <CertificationsSection
            register={register}
            errors={errors}
            fields={certificationFields}
            append={appendCertification}
            remove={removeCertification}
          />
          
          <LanguagesSection
            languagesDisplay={languagesDisplay}
            handlers={languagesHandlers}
          />

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
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isDirty ? "Save Changes" : isSubmitting ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileBuild;
