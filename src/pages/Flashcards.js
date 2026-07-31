import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const API_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

const apiRequest = async (path) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session?.access_token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || "The request could not be completed.");
  }

  return data;
};

const Flashcards = () => {
  const [cardsets, setCardsets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loadingSets, setLoadingSets] = useState(true);
  const [loadingCards, setLoadingCards] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [error, setError] = useState("");

  const loadCards = useCallback(async (cardsetId) => {
    setLoadingCards(true);
    setError("");
    setCurrentIndex(0);
    setShowAnswer(false);

    try {
      const cards = await apiRequest(
        `/profile/cardsets/${cardsetId}/flashcards`
      );
      setFlashcards(cards);
    } catch (requestError) {
      console.error("Error loading flashcards:", requestError);
      setFlashcards([]);
      setError(requestError.message);
    } finally {
      setLoadingCards(false);
    }
  }, []);

  const loadCardsets = useCallback(async () => {
    setLoadingSets(true);
    setError("");

    try {
      const sets = await apiRequest("/profile/cardsets");
      setCardsets(sets);

      if (sets.length > 0) {
        setSelectedSetId(sets[0].cardset_id);
        await loadCards(sets[0].cardset_id);
      } else {
        setSelectedSetId(null);
        setFlashcards([]);
      }
    } catch (requestError) {
      console.error("Error loading cardsets:", requestError);
      setCardsets([]);
      setFlashcards([]);
      setError(requestError.message);
    } finally {
      setLoadingSets(false);
    }
  }, [loadCards]);

  useEffect(() => {
    loadCardsets();
  }, [loadCardsets]);

  const handleSetSelect = (cardsetId) => {
    if (cardsetId === selectedSetId) return;
    setSelectedSetId(cardsetId);
    loadCards(cardsetId);
  };

  const handleNext = () => {
    setCurrentIndex((previousIndex) =>
      previousIndex === flashcards.length - 1 ? 0 : previousIndex + 1
    );
    setShowAnswer(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((previousIndex) =>
      previousIndex === 0 ? flashcards.length - 1 : previousIndex - 1
    );
    setShowAnswer(false);
  };

  if (loadingSets) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cardsets.length === 0 && !error) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Your Flashcard Sets
        </h1>
        <p className="text-gray-600 mb-8">
          You do not have any flashcard sets yet.
        </p>
        <Link
          to="/upload"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
        >
          Upload Notes
        </Link>
      </div>
    );
  }

  const selectedSet = cardsets.find(
    (cardset) => cardset.cardset_id === selectedSetId
  );
  const currentCard = flashcards[currentIndex];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-3 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Your Flashcard Sets
          </h1>
          <p className="mt-1 text-gray-600">
            Choose a set, then reveal each definition as you study.
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

      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="font-semibold text-gray-800 mb-3">Your Sets</h2>
            <div className="space-y-2">
              {cardsets.map((cardset) => (
                <button
                  key={cardset.cardset_id}
                  onClick={() => handleSetSelect(cardset.cardset_id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    cardset.cardset_id === selectedSetId
                      ? "border-blue-500 bg-blue-50 text-blue-800"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span className="block font-medium">{cardset.title}</span>
                  <span className="block mt-1 text-xs text-gray-500">
                    Created{" "}
                    {new Date(cardset.creation_date).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="lg:col-span-3">
          {loadingCards ? (
            <div className="bg-white rounded-xl shadow-md h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : flashcards.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-800">
                {selectedSet?.title}
              </h2>
              <p className="mt-3 text-gray-600">
                This set does not contain any flashcards.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {selectedSet?.title}
                </h2>
                <p className="text-sm text-gray-600">
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

                    {showAnswer && (
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
                    onClick={() => setShowAnswer((visible) => !visible)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {showAnswer ? "Hide Definition" : "Show Definition"}
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
                <h3 className="text-xl font-semibold mb-4">
                  Cards in This Set
                </h3>
                <div className="space-y-3">
                  {flashcards.map((card, index) => (
                    <button
                      key={card.flashcard_id}
                      onClick={() => {
                        setCurrentIndex(index);
                        setShowAnswer(false);
                      }}
                      className={`block w-full text-left p-4 border rounded-lg hover:bg-gray-50 ${
                        index === currentIndex
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      <span className="block font-medium text-gray-800">
                        {card.term}
                      </span>
                      <span className="block text-sm text-gray-600 truncate">
                        {card.definition}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Flashcards;
