import React from "react";

interface LanguagesSectionProps {
  languagesDisplay: string;
  handlers: {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
  };
}

const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  languagesDisplay,
  handlers,
}) => {
  return (
    <section className="space-y-4 bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800">Languages</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Languages You Speak
          </label>
          <input
            value={languagesDisplay}
            placeholder="Add languages separated by commas (e.g., English, Spanish, French, Mandarin)"
            className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            onChange={handlers.onChange}
            onBlur={handlers.onBlur}
          />
          <p className="text-xs text-gray-500 mt-2">
            Include all languages you can communicate in, both native and learned languages
          </p>
        </div>

        {/* Visual preview of entered languages */}
        {languagesDisplay && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Language Preview:</h4>
            <div className="flex flex-wrap gap-2">
              {languagesDisplay.split(",").map((lang, index) => {
                const trimmedLang = lang.trim();
                return trimmedLang ? (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-300"
                  >
                    {trimmedLang}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Empty state when no languages are entered */}
      {!languagesDisplay && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="mb-3">
            <svg className="w-10 h-10 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm mb-2">No languages added yet</p>
          <p className="text-gray-400 text-xs">
            Multilingual skills are highly valued by employers
          </p>
        </div>
      )}

      {/* Tips section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-green-800">Language Tips</h4>
            <ul className="text-sm text-green-700 mt-1 space-y-1">
              <li>• List languages in order of proficiency (strongest first)</li>
              <li>• Include both spoken and written languages</li>
              <li>• Consider adding proficiency levels in your resume (e.g., "Spanish (Fluent)", "French (Conversational)")</li>
              <li>• Include sign languages if applicable</li>
              <li>• Regional dialects can be valuable for specific roles</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Common languages suggestion */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Languages:</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            "English", "Spanish", "French", "German", "Italian", "Portuguese", 
            "Mandarin", "Japanese", "Korean", "Arabic", "Russian", "Hindi",
            "Dutch", "Swedish", "Norwegian", "Polish", "Turkish"
          ].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => {
                const currentLangs = languagesDisplay ? languagesDisplay.split(",").map(l => l.trim()) : [];
                if (!currentLangs.includes(lang)) {
                  const newValue = currentLangs.length > 0 ? `${languagesDisplay}, ${lang}` : lang;
                  handlers.onChange({ target: { value: newValue } } as React.ChangeEvent<HTMLInputElement>);
                }
              }}
              className="px-2 py-1 bg-white border border-gray-300 text-gray-600 rounded-full hover:bg-gray-100 hover:border-gray-400 transition-colors duration-200"
            >
              + {lang}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Click to add common languages quickly</p>
      </div>
    </section>
  );
};

export default LanguagesSection;