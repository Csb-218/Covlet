import React from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove } from "react-hook-form";
import { ProfileFormData } from "../../../schemas";

interface WorkExperienceSectionProps {
  register: UseFormRegister<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  setValue: UseFormSetValue<ProfileFormData>;
  fields: FieldArrayWithId<ProfileFormData, "experience", "id">[];
  append: UseFieldArrayAppend<ProfileFormData, "experience">;
  remove: UseFieldArrayRemove;
}

const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({
  register,
  errors,
  setValue,
  fields,
  append,
  remove,
}) => {
  const addExperience = () => {
    append({
      title: "",
      company: "",
      startDate: new Date(),
      endDate: null,
      isPresent: false,
      responsibilities: "",
      achievements: "",
    });
  };

  const handlePresentToggle = (index: number, isPresent: boolean) => {
    setValue(`experience.${index}.isPresent`, isPresent);
    if (isPresent) {
      setValue(`experience.${index}.endDate`, null);
    }
  };

  return (
    <section className="space-y-4 bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Work Experience</h2>
        <button
          type="button"
          onClick={addExperience}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Experience
        </button>
      </div>
      
      {fields.map((field, index) => (
        <div key={field.id} className="bg-white/60 rounded-lg p-4 border border-gray-200 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-700">Experience #{index + 1}</h3>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                aria-label={`Remove experience ${index + 1}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Job Title and Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                {...register(`experience.${index}.title`)}
                type="text"
                placeholder="e.g., Software Engineer"
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.experience?.[index]?.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.experience[index]?.title?.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company *
              </label>
              <input
                {...register(`experience.${index}.company`)}
                type="text"
                placeholder="e.g., Google Inc."
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.experience?.[index]?.company && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.experience[index]?.company?.message}
                </p>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                {...register(`experience.${index}.startDate`)}
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <input
                {...register(`experience.${index}.endDate`)}
                type="date"
                disabled={field.isPresent}
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {errors.experience?.[index]?.endDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.experience[index]?.endDate?.message}
                </p>
              )}
            </div>
            <div className="flex items-center">
              <input
                {...register(`experience.${index}.isPresent`)}
                type="checkbox"
                id={`present-${index}`}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                onChange={(e) => handlePresentToggle(index, e.target.checked)}
              />
              <label htmlFor={`present-${index}`} className="text-sm font-medium text-gray-700">
                Currently working here
              </label>
            </div>
          </div>

          {/* Responsibilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key Responsibilities
            </label>
            <textarea
              {...register(`experience.${index}.responsibilities`)}
              rows={3}
              placeholder="Describe your main responsibilities and duties..."
              className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
            {errors.experience?.[index]?.responsibilities && (
              <p className="text-red-500 text-sm mt-1">
                {errors.experience[index]?.responsibilities?.message}
              </p>
            )}
          </div>

          {/* Achievements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key Achievements
            </label>
            <textarea
              {...register(`experience.${index}.achievements`)}
              rows={3}
              placeholder="Highlight your major achievements and accomplishments..."
              className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
            {errors.experience?.[index]?.achievements && (
              <p className="text-red-500 text-sm mt-1">
                {errors.experience[index]?.achievements?.message}
              </p>
            )}
          </div>
        </div>
      ))}
      
      {fields.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No work experience added yet.</p>
          <button
            type="button"
            onClick={addExperience}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
          >
            Add Your First Experience
          </button>
        </div>
      )}
    </section>
  );
};

export default WorkExperienceSection;