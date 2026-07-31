import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../apiClient";

const CardsetFlashcards = () => {
  const { cardsetId } = useParams();
  const [cardset, setCardset] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [error, setError] = useState("");

  const loadCardset = useCallback(async () => {
    setLoading(true);
    setError("");
    setCurrentIndex(0);
    setShowDefinition(false);

    try {
      const [sets, cards] = await Promise.all([
        apiRequest("/profile/cardsets"),
        apiRequest(`/profile/cardsets/${cardsetId}/flashcards`),
      ]);
      const matchingSet = sets.find(
        (set) => String(set.cardset_id) === String(cardsetId)
      );

      if (!matchingSet) {
        throw new Error("This flashcard set could not be found.");
      }

      setCardset(matchingSet);
      setFlashcards(cards);
    } catch (requestError) {
      console.error("Error loading cardset:", requestError);
      setCardset(null);
      setFlashcards([]);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [cardsetId]);

  useEffect(() => {
    loadCardset();
  }, [loadCardset]);

  const handleNext = () => {
    setCurrentIndex((previousIndex) =>
      previousIndex === flashcards.length - 1 ? 0 : previousIndex + 1
    );
    setShowDefinition(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((previousIndex) =>
      previousIndex === 0 ? flashcards.length - 1 : previousIndex - 1
    );
    setShowDefinition(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link
          to="/flashcards"
          className="inline-block mb-6 text-blue-600 hover:text-blue-700"
        >
          ← Back to your sets
        </Link>
        <div
          className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-md"
          role="alert"
        >
          <p>{error}</p>
          <button
            onClick={loadCardset}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link
          to="/flashcards"
          className="inline-block mb-6 text-blue-600 hover:text-blue-700"
        >
          ← Back to your sets
        </Link>
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <h1 className="text-3xl font-bold text-gray-800">{cardset.title}</h1>
          <p className="mt-3 text-gray-600">
            This set does not contain any flashcards.
          </p>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/flashcards"
        className="inline-block mb-6 text-blue-600 hover:text-blue-700"
      >
        ← Back to your sets
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{cardset.title}</h1>
        <p className="mt-1 text-gray-600">
          Card {currentIndex + 1} of {flashcards.length}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 min-h-96 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center w-full">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 mb-3">
              Term
            </p>
            <p className="text-2xl text-gray-800">{currentCard.term}</p>

            {showDefinition && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
                  Definition
                </p>
                <p className="text-xl text-gray-700">
                  {currentCard.definition}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 justify-center mt-8 sm:flex-row">
          <button
            onClick={handlePrevious}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            Previous
          </button>
          <button
            onClick={() => setShowDefinition((visible) => !visible)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {showDefinition ? "Hide Definition" : "Show Definition"}
          </button>
          <button
            onClick={handleNext}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Cards in This Set</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {flashcards.map((card, index) => (
            <button
              key={card.flashcard_id}
              onClick={() => {
                setCurrentIndex(index);
                setShowDefinition(false);
              }}
              className={`text-left p-4 border rounded-lg hover:bg-gray-50 ${
                index === currentIndex
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <span className="block font-medium text-gray-800">
                {card.term}
              </span>
              <span className="block mt-1 text-sm text-gray-600 truncate">
                {card.definition}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardsetFlashcards;
