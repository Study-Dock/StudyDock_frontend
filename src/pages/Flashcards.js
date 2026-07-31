import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../apiClient";

const Flashcards = () => {
  const [cardsets, setCardsets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCardsets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const sets = await apiRequest("/profile/cardsets");
      setCardsets(sets);
    } catch (requestError) {
      console.error("Error loading cardsets:", requestError);
      setCardsets([]);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCardsets();
  }, [loadCardsets]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-3 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Your Flashcard Sets
          </h1>
          <p className="mt-1 text-gray-600">
            Select a set to open its flashcards.
          </p>
        </div>
        <Link
          to="/upload"
          className="inline-flex justify-center bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700"
        >
          Create New Set
        </Link>
      </div>

      {error && (
        <div
          className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md"
          role="alert"
        >
          <p>{error}</p>
          <button
            onClick={loadCardsets}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {!error && cardsets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            No flashcard sets yet
          </h2>
          <p className="mt-3 mb-7 text-gray-600">
            Upload an image of your notes to generate your first set.
          </p>
          <Link
            to="/upload"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Upload Notes
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cardsets.map((cardset) => (
            <Link
              key={cardset.cardset_id}
              to={`/profile/cardsets/${cardset.cardset_id}/flashcards`}
              className="group bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:border-blue-400 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-gray-800 truncate group-hover:text-blue-700">
                    {cardset.title}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Created{" "}
                    {new Date(cardset.creation_date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className="text-2xl text-blue-600 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
              <p className="mt-8 text-sm font-semibold text-blue-600">
                Open set
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Flashcards;
