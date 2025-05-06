import React, { useState, useRef } from "react";


const ResumeUploader = () => {
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF or DOC file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      return;
    }

    setFileName(file.name);
    setError("");
    setIsLoading(true);
    console.log(file);
    setIsLoading(false);

    // try {
    //   const formData = new FormData();
    //   formData.append('resume', file);

    //   // Send file to your backend for processing
    //   const response = await fetch('YOUR_BACKEND_URL/upload', {
    //     method: 'POST',
    //     body: formData
    //   });

    //   if (!response.ok) {
    //     throw new Error('Failed to upload file');
    //   }

    //   const data = await response.json();

      
    // } catch (err) {
    //   setError("Failed to process file. Please try again.");
    //   console.error('Upload error:', err);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const clearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileName("");
    setError("");
  };

  return (
    <>
      <div className="relative inline-flex items-center w-full gap-2 my-6 text-sm border rounded-full border-slate-200 text-slate-500">
        <input
          ref={fileInputRef}
          id="file-upload"
          name="file-upload"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="peer order-2 [&::file-selector-button]:hidden"
          disabled={isLoading}
        />
        <label
          htmlFor="file-upload"
          className={`inline-flex items-center justify-center h-8 gap-2 px-4 text-xs font-medium tracking-wide text-white transition duration-300 rounded-full cursor-pointer whitespace-nowrap ${
            isLoading 
              ? 'bg-emerald-300 cursor-not-allowed' 
              : 'bg-emerald-500 hover:bg-emerald-600 focus:bg-emerald-700'
          } focus-visible:outline-none`}
        >
          <span className="order-2">
            {isLoading ? 'Processing...' : 'Upload Resume'}
          </span>
          <span className="relative">
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-label="File input icon"
                role="graphics-symbol"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
            )}
          </span>
        </label>
      </div>

      {fileName && (
        <div className="flex items-center justify-between p-2 mt-2 text-sm bg-emerald-50 rounded-md">
          <span className="text-emerald-700">{fileName}</span>
          <button
            onClick={clearFile}
            className="text-emerald-600 hover:text-emerald-800"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </>
  );
};

export default ResumeUploader;
