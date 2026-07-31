import React, { useRef, useState } from "react";
import { supabase } from "../supabaseClient";

const API_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

const UploadNotes = () => {
  const fileInputRef = useRef(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [setName, setSetName] = useState("");
  const [generatedCards, setGeneratedCards] = useState([]);
  const [message, setMessage] = useState(null);

  const getAccessToken = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;
    if (!session?.access_token) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    return session.access_token;
  };

  const parseResponse = async (response) => {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.detail || "The request could not be completed.");
    }

    return data;
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setSetName("");
    setGeneratedCards([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setGeneratedCards([]);
    setMessage(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSelectedFile(null);
      event.target.value = "";
      setMessage({ type: "error", text: "Please select an image file." });
      return;
    }

    setSelectedFile(file);
    setSetName(file.name.replace(/\.[^/.]+$/, ""));
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      setMessage({ type: "error", text: "Please select an image first." });
      return;
    }

    setProcessing(true);
    setMessage(null);

    try {
      const accessToken = await getAccessToken();
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });
      const cards = await parseResponse(response);

      if (!Array.isArray(cards) || cards.length === 0) {
        throw new Error("No flashcards could be generated from this image.");
      }

      setGeneratedCards(cards);
    } catch (error) {
      console.error("Error processing image:", error);
      setMessage({ type: "error", text: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!setName.trim()) {
      setMessage({ type: "error", text: "Please enter a name for this set." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const accessToken = await getAccessToken();
      const response = await fetch(`${API_URL}/create_set`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          set_name: setName.trim(),
          cards: generatedCards,
        }),
      });
      const createdSet = await parseResponse(response);

      resetUpload();
      setMessage({
        type: "success",
        text: `"${createdSet.title}" was created with ${createdSet.card_count} flashcards.`,
      });
    } catch (error) {
      console.error("Error creating flashcard set:", error);
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    resetUpload();
    setMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload Notes</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-md border ${
            message.type === "error"
              ? "bg-red-100 border-red-400 text-red-700"
              : "bg-green-100 border-green-400 text-green-700"
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {generatedCards.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="mb-6">
            <label
              htmlFor="file-input"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select an image of your notes
            </label>
            <input
              ref={fileInputRef}
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={processing}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 disabled:opacity-50"
            />
            <p className="mt-1 text-sm text-gray-500">
              The image is processed directly and is not saved to storage.
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

          <button
            onClick={handleProcess}
            disabled={processing || !selectedFile}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? "Generating Flashcards..." : "Generate Flashcards"}
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
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Preview Flashcard Set
            </h2>
            <p className="mt-1 text-gray-600">
              Review all {generatedCards.length} generated flashcards before
              saving.
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="set-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Set name
            </label>
            <input
              id="set-name"
              type="text"
              value={setName}
              onChange={(event) => setSetName(event.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-4 mb-8">
            {generatedCards.map((card, index) => (
              <article
                key={`${card.term}-${index}`}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="px-4 py-2 bg-blue-50 text-sm font-semibold text-blue-700">
                  Flashcard {index + 1}
                </div>
                <div className="grid gap-4 p-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Term
                    </p>
                    <p className="mt-1 text-gray-900">{card.term}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Definition
                    </p>
                    <p className="mt-1 text-gray-700">{card.definition}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={saving || !setName.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Creating Set..." : "Confirm and Create Set"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadNotes;
