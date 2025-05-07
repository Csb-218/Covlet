 
 const cloud_name = import.meta.env.WXT_CLOUDINARY_CLOUD_NAME;

export const uploadResume = async (file: File, uploadPreset: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset); // e.g., 'resume_upload'
  formData.append('resource_type', 'raw'); // Important for PDFs

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud_name}/raw/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );
  if (!response.ok) throw new Error('Upload failed');
  const data = await response.json();
  return data.secure_url; // URL to access the uploaded PDF
};