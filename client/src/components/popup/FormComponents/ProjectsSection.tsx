import React from "react";
import { UseFormRegister, FieldErrors, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove } from "react-hook-form";
import { ProfileFormData } from "../../../schemas";

interface ProjectsSectionProps {
  register: UseFormRegister<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  fields: FieldArrayWithId<ProfileFormData, "projects", "id">[];
  append: UseFieldArrayAppend<ProfileFormData, "projects">;
  remove: UseFieldArrayRemove;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  register,
  errors,
  fields,
  append,
  remove,
}) => {
  const addProject = () => {
    append({
      name: "",
      description: "",
      link: "",
    });
  };

  return (
    <section className="space-y-4 bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Projects</h2>
        <button
          type="button"
          onClick={addProject}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Project
        </button>
      </div>
      
      {fields.map((field, index) => (
        <div key={field.id} className="bg-white/60 rounded-lg p-4 border border-gray-200 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-700">Project #{index + 1}</h3>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                aria-label={`Remove project ${index + 1}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              {...register(`projects.${index}.name`)}
              type="text"
              placeholder="e.g., E-commerce Website, Mobile App, etc."
              className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.projects?.[index]?.name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.projects[index]?.name?.message}
              </p>
            )}
          </div>

          {/* Project Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Link
            </label>
            <input
              {...register(`projects.${index}.link`)}
              type="url"
              placeholder="https://github.com/username/project or https://project-demo.com"
              className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.projects?.[index]?.link && (
              <p className="text-red-500 text-sm mt-1">
                {errors.projects[index]?.link?.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Optional: Add a link to your project (GitHub, live demo, portfolio, etc.)
            </p>
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Description *
            </label>
            <textarea
              {...register(`projects.${index}.description`)}
              rows={4}
              placeholder="Describe your project, technologies used, your role, key features, and impact..."
              className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
            {errors.projects?.[index]?.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.projects[index]?.description?.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Include technologies used, your role, key features, and any measurable impact
            </p>
          </div>
        </div>
      ))}
      
      {fields.length === 0 && (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">No projects added yet.</p>
          <p className="text-sm text-gray-400 mb-6">
            Showcase your personal projects, contributions, and side work to stand out to employers.
          </p>
          <button
            type="button"
            onClick={addProject}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
          >
            Add Your First Project
          </button>
        </div>
      )}
      
      {fields.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-800">Project Tips</h4>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• Include both personal and professional projects</li>
                <li>• Mention specific technologies and frameworks used</li>
                <li>• Quantify impact when possible (users, performance improvements, etc.)</li>
                <li>• Add links to GitHub repositories or live demos</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProjectsSection;