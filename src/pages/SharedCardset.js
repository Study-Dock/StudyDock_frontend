import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { publicApiRequest } from "../apiClient";

const SharedCardset = () => {
  const { cardsetId } = useParams();
  const [cardset, setCardset] = useState(null);
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
      const sharedSet = await publicApiRequest(
        `/shared/cardsets/${cardsetId}`
      );
      setCardset(sharedSet);
    } catch (requestError) {
      console.error("Error loading shared cardset:", requestError);
      setCardset(null);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [cardsetId]);

  useEffect(() => {
    loadCardset();
  }, [loadCardset]);

  const handleNext = () => {
    setCurrentIndex((index) =>
      index === cardset.cards.length - 1 ? 0 : index + 1
    );
    setShowDefinition(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((index) =>
      index === 0 ? cardset.cards.length - 1 : index - 1
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
      <div className="max-w-2xl mx-auto text-center">
        <div
          className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-md"
          role="alert"
        >
          <h1 className="text-xl font-semibold">
            This set is unavailable
          </h1>
          <p className="mt-2">{error}</p>
        </div>
        <Link
          to="/"
          className="inline-block mt-6 text-blue-600 hover:text-blue-700"
        >
          Go to StudyDock
        </Link>
      </div>
    );
  }

  if (cardset.cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            Public set
          </span>
          <h1 className="mt-3 text-3xl font-bold text-gray-800">
            {cardset.title}
          </h1>
          <p className="mt-3 text-gray-600">
            This public set does not contain any flashcards.
          </p>
        </div>
      </div>
    );
  }

  const currentCard = cardset.cards[currentIndex];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
          Public set
        </span>
        <h1 className="mt-3 text-3xl font-bold text-gray-800">
          {cardset.title}
        </h1>
        <p className="mt-1 text-gray-600">
          Card {currentIndex + 1} of {cardset.cards.length}
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
          {cardset.cards.map((card, index) => (
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

export default SharedCardset;
