import React, { useState, useRef } from "react";
import { uploadResume} from "@/services/server";
import Spinner from "@/components/common/AsyncSpinner";
import { useNavigate } from "react-router-dom";

interface ResumeUploaderProps {
  onUploadSuccess?: (text: string) => void;
  onUploadError?: (error: string) => void;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = () => {
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();


  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {


    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      return;
    }

    setIsLoading(true);
    setError("");
    

    uploadResume(file)
      .then((response) => {
        console.log("File uploaded successfully:", response);
        setFileName(file.name);
        navigate("/profile",{state:{ resumeData: response }})
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
        setError("File upload failed. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      fileInputRef.current.files = event.dataTransfer.files;
      handleFileChange({ target: fileInputRef.current } as any);
    }
  };

  return (
    <div
      className="p-5 w-full max-w-md"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center transition-all duration-300 hover:border-gray-600">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
          id="resume-input"
          className="hidden"
        />
        <label
          htmlFor="resume-input"
          className="flex flex-col items-center gap-3 cursor-pointer text-gray-600"
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Spinner />
              <span className="text-sm">Uploading...</span>
            </div>
          ) : (
            <>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
              </svg>
              <span className="text-sm">
                {fileName || "Click or drag PDF to upload"}
              </span>
            </>
          )}
        </label>
        {error && <div className="mt-3 text-sm text-red-500">{error}</div>}
      </div>
    </div>
  );
};

export default ResumeUploader;
