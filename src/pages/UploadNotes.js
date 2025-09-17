import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const UploadNotes = () => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        setMessage("Please select an image file");
        return;
      }
      setSelectedFile(file);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file first");
      return;
    }
    setUploading(true);
    setMessage("");

    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("notes")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Insert note record into database
      const { error: dbError } = await supabase.from("notes").insert([
        {
          original_filename: selectedFile.name,
          storage_path: filePath,
          status: "processing",
        },
      ]);

      if (dbError) throw dbError;

      setMessage("Note uploaded successfully! Processing will begin shortly.");
      setSelectedFile(null);
      // Reset file input
      document.getElementById("file-input").value = "";
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload Notes</h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select an image of your notes
          </label>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            Supported formats: JPG, PNG, GIF, etc.
          </p>
        </div>

        {selectedFile && (
          <div className="mb-6 p-4 border border-gray-200 rounded-md">
            <p className="font-medium">Selected file: {selectedFile.name}</p>
            <p className="text-sm text-gray-600">
              Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.includes("Error")
                ? "bg-red-100 border border-red-400 text-red-700"
                : "bg-green-100 border border-green-400 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Upload Notes"}
        </button>

        <div className="mt-8 p-4 bg-blue-50 rounded-md">
          <h3 className="font-semibold text-blue-800 mb-2">
            Tips for best results:
          </h3>
          <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
            <li>Ensure good lighting when taking photos</li>
            <li>Capture notes from a straight angle</li>
            <li>Use clear, legible handwriting</li>
            <li>Avoid shadows and glares</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadNotes;
