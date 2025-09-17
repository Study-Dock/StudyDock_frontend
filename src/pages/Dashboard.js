import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch user's notes
      const { data: notesData } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });
      // Fetch user's flashcards
      const { data: flashcardsData } = await supabase
        .from("flashcards")
        .select("*")
        .order("created_at", { ascending: false });

      setNotes(notesData || []);
      setFlashcards(flashcardsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Notes</h2>
          <p className="text-3xl font-bold text-blue-600 mb-4">
            {notes.length}
          </p>
          <Link
            to="/upload"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Upload New Notes →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Flashcards</h2>
          <p className="text-3xl font-bold text-blue-600 mb-4">
            {flashcards.length}
          </p>
          <Link
            to="/flashcards"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Flashcards →
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {notes.length === 0 && flashcards.length === 0 ? (
          <p className="text-gray-600">
            No activity yet. Upload your first notes to get started!
          </p>
        ) : (
          <div className="space-y-4">
            {notes.slice(0, 5).map((note) => (
              <div
                key={note.id}
                className="border-b border-gray-200 pb-4 last:border-b-0"
              >
                <p className="font-medium">
                  Uploaded note: {note.original_filename}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {flashcards.slice(0, 5).map((flashcard) => (
              <div
                key={flashcard.id}
                className="border-b border-gray-200 pb-4 last:border-b-0"
              >
                <p className="font-medium">
                  Generated flashcard from: {flashcard.source_note}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(flashcard.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
