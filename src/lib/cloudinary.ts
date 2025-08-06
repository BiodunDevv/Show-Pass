import { toast } from "react-toastify";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export const validateFile = (file: File): boolean => {
  if (file.size > MAX_FILE_SIZE) {
    toast.error("File size exceeds 10MB");
    return false;
  }

  if (!["image/jpeg", "image/png"].includes(file.type)) {
    toast.error("Only JPG and PNG files are allowed");
    return false;
  }

  return true;
};

export const uploadToCloudinary = async (file: File): Promise<string> => {
  if (!validateFile(file)) {
    throw new Error("Invalid file. Please upload a valid image file");
  }

  // Log environment variables (without revealing sensitive info)
  console.log("Cloudinary config:", {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      ? "✓ Set"
      : "✗ Missing",
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      ? "✓ Set"
      : "✗ Missing",
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  );

  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error("Cloudinary cloud name is not defined");
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    console.log("Uploading to:", uploadUrl);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Cloudinary error response:", errorData);
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Upload successful, image URL:", data.secure_url);
    toast.success("Image uploaded successfully!");
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    toast.error(
      error instanceof Error ? error.message : "Failed to upload image"
    );
    throw error;
  }
};
