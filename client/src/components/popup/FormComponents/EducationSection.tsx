import React from "react";
import { UseFormRegister, FieldErrors, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove } from "react-hook-form";
import { ProfileFormData } from "../../../schemas";

interface EducationSectionProps {
  register: UseFormRegister<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  fields: FieldArrayWithId<ProfileFormData, "education", "id">[];
  append: UseFieldArrayAppend<ProfileFormData, "education">;
  remove: UseFieldArrayRemove;
}

const EducationSection: React.FC<EducationSectionProps> = ({
  register,
  errors,
  fields,
  append,
  remove,
}) => {
  const addEducation = () => {
    append({
      degree: "",
      institution: "",
      startDate: new Date(),
      endDate: null,
      coursework: "",
    });
  };

  return (
    <section className="space-y-4 bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Education</h2>
        <button
          type="button"
          onClick={addEducation}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Education
        </button>
      </div>
      
      {fields.map((field, index) => (
        <div key={field.id} className="bg-white/60 rounded-lg p-4 border border-gray-200 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-700">Education #{index + 1}</h3>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                aria-label={`Remove education ${index + 1}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Degree and Institution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Degree *
              </label>
              <input
                {...register(`education.${index}.degree`)}
                type="text"
                placeholder="e.g., Bachelor of Computer Science, MBA, High School Diploma"
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.education?.[index]?.degree && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.education[index]?.degree?.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution *
              </label>
              <input
                {...register(`education.${index}.institution`)}
                type="text"
                placeholder="e.g., MIT, Harvard University, XYZ High School"
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.education?.[index]?.institution && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.education[index]?.institution?.message}
                </p>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                {...register(`education.${index}.startDate`)}
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.education?.[index]?.startDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.education[index]?.startDate?.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date / Expected Graduation
              </label>
              <input
                {...register(`education.${index}.endDate`)}
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.education?.[index]?.endDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.education[index]?.endDate?.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if currently enrolled or prefer not to specify
              </p>
            </div>
          </div>

          {/* Relevant Coursework */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relevant Coursework / Achievements
            </label>
            <textarea
              {...register(`education.${index}.coursework`)}
              rows={3}
              placeholder="List relevant courses, academic achievements, GPA (if notable), honors, projects, etc."
              className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
            {errors.education?.[index]?.coursework && (
              <p className="text-red-500 text-sm mt-1">
                {errors.education[index]?.coursework?.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Include courses relevant to your career goals, academic honors, notable GPA, thesis topics, etc.
            </p>
          </div>
        </div>
      ))}
      
      {fields.length === 0 && (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">No education history added yet.</p>
          <p className="text-sm text-gray-400 mb-6">
            Add your educational background including degrees, certifications, and relevant coursework.
          </p>
          <button
            type="button"
            onClick={addEducation}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
          >
            Add Your First Education
          </button>
        </div>
      )}
      
      {fields.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-green-800">Education Tips</h4>
              <ul className="text-sm text-green-700 mt-1 space-y-1">
                <li>• List education in reverse chronological order (most recent first)</li>
                <li>• Include GPA only if it's 3.5 or higher</li>
                <li>• Mention relevant coursework that aligns with your career goals</li>
                <li>• Include academic honors, scholarships, or special recognitions</li>
                <li>• For recent graduates, education can be placed before experience</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EducationSection;