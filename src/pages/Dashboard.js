import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../apiClient";

const Dashboard = () => {
  const [flashcardCount, setFlashcardCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const dashboard = await apiRequest("/dashboard");
      setFlashcardCount(dashboard.flashcard_count);
    } catch (requestError) {
      console.error("Error loading dashboard:", requestError);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {error && (
        <div
          className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md"
          role="alert"
        >
          <p>{error}</p>
          <button
            onClick={loadDashboard}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="bg-white p-7 rounded-xl shadow-md">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Total Flashcards
          </p>
          <p className="mt-3 text-5xl font-bold text-blue-600">
            {flashcardCount}
          </p>
          <p className="mt-2 text-gray-600">
            Across all of your flashcard sets
          </p>
          <Link
            to="/flashcards"
            className="inline-block mt-6 text-blue-600 hover:text-blue-700 font-semibold"
          >
            View Your Sets →
          </Link>
        </section>

        <section className="bg-blue-600 text-white p-7 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold">Create more flashcards</h2>
          <p className="mt-3 text-blue-100">
            Upload an image of your notes, review the generated cards, and add
            them to your library.
          </p>
          <Link
            to="/upload"
            className="inline-block mt-6 bg-white text-blue-700 px-5 py-3 rounded-lg font-semibold hover:bg-blue-50"
          >
            Upload Notes
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
