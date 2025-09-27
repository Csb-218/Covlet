import React from "react";

interface SkillsSectionProps {
  technicalSkillsDisplay: string;
  softSkillsDisplay: string;
  skillsHandlers: {
    technical: {
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onBlur: () => void;
    };
    soft: {
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onBlur: () => void;
    };
  };
}

const SkillsSection: React.FC<SkillsSectionProps> = ({
  technicalSkillsDisplay,
  softSkillsDisplay,
  skillsHandlers,
}) => {
  return (
    <section className="space-y-4 bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800">Skills</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Technical Skills
          </label>
          <input
            value={technicalSkillsDisplay}
            placeholder="Add skills separated by commas"
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            onChange={skillsHandlers.technical.onChange}
            onBlur={skillsHandlers.technical.onBlur}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Soft Skills
          </label>
          <input
            value={softSkillsDisplay}
            placeholder="Add skills separated by commas"
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            onChange={skillsHandlers.soft.onChange}
            onBlur={skillsHandlers.soft.onBlur}
          />
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;