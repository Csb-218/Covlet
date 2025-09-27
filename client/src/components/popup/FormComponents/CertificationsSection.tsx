import React from "react";
import { UseFormRegister, FieldErrors, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove } from "react-hook-form";
import { ProfileFormData } from "../../../schemas";

interface CertificationsSectionProps {
  register: UseFormRegister<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  fields: FieldArrayWithId<ProfileFormData, "certifications", "id">[];
  append: UseFieldArrayAppend<ProfileFormData, "certifications">;
  remove: UseFieldArrayRemove;
}

const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  register,
  errors,
  fields,
  append,
  remove,
}) => {
  const addCertification = () => {
    append({
      name: "",
      year: "",
    });
  };

  return (
    <section className="space-y-4 bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Certifications</h2>
        <button
          type="button"
          onClick={addCertification}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Certification
        </button>
      </div>
      
      {fields.map((field, index) => (
        <div key={field.id} className="bg-white/60 rounded-lg p-4 border border-gray-200 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-700">Certification #{index + 1}</h3>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                aria-label={`Remove certification ${index + 1}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Certification Name and Year */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certification Name *
              </label>
              <input
                {...register(`certifications.${index}.name`)}
                type="text"
                placeholder="e.g., AWS Solutions Architect, PMP, Google Cloud Professional"
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.certifications?.[index]?.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.certifications[index]?.name?.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Obtained *
              </label>
              <input
                {...register(`certifications.${index}.year`)}
                type="text"
                placeholder="2024"
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={4}
              />
              {errors.certifications?.[index]?.year && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.certifications[index]?.year?.message}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {fields.length === 0 && (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">No certifications added yet.</p>
          <p className="text-sm text-gray-400 mb-6">
            Add professional certifications to showcase your expertise and commitment to continuous learning.
          </p>
          <button
            type="button"
            onClick={addCertification}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
          >
            Add Your First Certification
          </button>
        </div>
      )}
      
      {fields.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Certification Tips</h4>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                <li>• Include both technical and professional certifications</li>
                <li>• List certifications relevant to your career goals</li>
                <li>• Include renewal dates for time-sensitive certifications</li>
                <li>• Order by relevance or recency</li>
                <li>• Include certification numbers if they add credibility</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CertificationsSection;