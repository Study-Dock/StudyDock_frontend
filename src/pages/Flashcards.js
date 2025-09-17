import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const Flashcards = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setFlashcards(data || []);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === flashcards.length - 1 ? 0 : prevIndex + 1
    );
    setShowAnswer(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1
    );
    setShowAnswer(false);
  };

  const handleToggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Your Flashcards
        </h1>
        <p className="text-gray-600 mb-8">
          No flashcards yet. Upload some notes to get started!
        </p>
        <a
          href="/upload"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
        >
          Upload Notes
        </a>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Your Flashcards
      </h1>
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 min-h-96 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center w-full">
            <h2 className="text-2xl font-semibold mb-6">Question</h2>
            <p className="text-xl text-gray-700 mb-8">{currentCard.question}</p>

            {showAnswer && (
              <div className="mt-6">
                <h2 className="text-2xl font-semibold mb-4">Answer</h2>
                <p className="text-xl text-gray-700">{currentCard.answer}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={handlePrevious}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            Previous
          </button>

          <button
            onClick={handleToggleAnswer}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </button>

          <button
            onClick={handleNext}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>

      <div className="text-center text-gray-600">
        Card {currentIndex + 1} of {flashcards.length}
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">All Flashcards</h3>
        <div className="space-y-4">
          {flashcards.map((card, index) => (
            <div
              key={card.id}
              className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                index === currentIndex
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
              onClick={() => {
                setCurrentIndex(index);
                setShowAnswer(false);
              }}
            >
              <p className="font-medium">{card.question}</p>
              <p className="text-sm text-gray-600 truncate">{card.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Flashcards;
