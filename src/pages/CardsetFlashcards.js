import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../apiClient";

const CardsetFlashcards = () => {
  const { cardsetId } = useParams();
  const navigate = useNavigate();
  const [cardset, setCardset] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftVisibility, setDraftVisibility] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [deletingSet, setDeletingSet] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  const loadCardset = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice(null);
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
      setDraftTitle(matchingSet.title);
      setDraftVisibility(matchingSet.visibility);
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

  const handleSaveSettings = async () => {
    if (!draftTitle.trim()) {
      setNotice({ type: "error", text: "Set name is required." });
      return;
    }

    setSavingSettings(true);
    setNotice(null);

    try {
      const updatedSet = await apiRequest(`/profile/cardsets/${cardsetId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: draftTitle.trim(),
          visibility: draftVisibility,
        }),
      });
      setCardset(updatedSet);
      setDraftTitle(updatedSet.title);
      setDraftVisibility(updatedSet.visibility);
      setSettingsOpen(false);
      setNotice({ type: "success", text: "Set settings updated." });
    } catch (requestError) {
      console.error("Error updating cardset:", requestError);
      setNotice({ type: "error", text: requestError.message });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteSet = async () => {
    const confirmed = window.confirm(
      `Delete "${cardset.title}" and all of its flashcards? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingSet(true);
    setNotice(null);

    try {
      await apiRequest(`/profile/cardsets/${cardsetId}`, {
        method: "DELETE",
      });
      navigate("/flashcards", { replace: true });
    } catch (requestError) {
      console.error("Error deleting cardset:", requestError);
      setNotice({ type: "error", text: requestError.message });
      setDeletingSet(false);
    }
  };

  const handleDeleteCard = async (card) => {
    const confirmed = window.confirm(
      `Delete the flashcard "${card.term}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingCardId(card.flashcard_id);
    setNotice(null);

    try {
      await apiRequest(
        `/profile/cardsets/${cardsetId}/flashcards/${card.flashcard_id}`,
        { method: "DELETE" }
      );
      const remainingCards = flashcards.filter(
        (flashcard) => flashcard.flashcard_id !== card.flashcard_id
      );
      setFlashcards(remainingCards);
      setCurrentIndex((index) =>
        Math.min(index, Math.max(remainingCards.length - 1, 0))
      );
      setShowDefinition(false);
      setNotice({ type: "success", text: "Flashcard deleted." });
    } catch (requestError) {
      console.error("Error deleting flashcard:", requestError);
      setNotice({ type: "error", text: requestError.message });
    } finally {
      setDeletingCardId(null);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/shared/cardsets/${cardsetId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setNotice({ type: "success", text: "Share link copied." });
    } catch {
      window.prompt("Copy this public share link:", shareUrl);
    }
  };

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

  const currentCard = flashcards[currentIndex];

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/flashcards"
        className="inline-block mb-6 text-blue-600 hover:text-blue-700"
      >
        ← Back to your sets
      </Link>

      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">
              {cardset.title}
            </h1>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                cardset.visibility
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {cardset.visibility ? "Public" : "Private"}
            </span>
          </div>
          <p className="mt-1 text-gray-600">
            {flashcards.length}{" "}
            {flashcards.length === 1 ? "flashcard" : "flashcards"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {cardset.visibility && (
            <button
              onClick={handleShare}
              className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
            >
              Copy Share Link
            </button>
          )}
          <button
            onClick={() => {
              setSettingsOpen((open) => !open);
              setNotice(null);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            {settingsOpen ? "Close Settings" : "Manage Set"}
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`mb-6 p-4 border rounded-md ${
            notice.type === "error"
              ? "bg-red-100 border-red-400 text-red-700"
              : "bg-green-100 border-green-400 text-green-700"
          }`}
          role="alert"
        >
          {notice.text}
        </div>
      )}

      {settingsOpen && (
        <section className="mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Set Settings
          </h2>
          <label
            htmlFor="set-title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Set name
          </label>
          <input
            id="set-title"
            value={draftTitle}
            maxLength={99}
            onChange={(event) => setDraftTitle(event.target.value)}
            disabled={savingSettings || deletingSet}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="flex items-start gap-3 mt-5">
            <input
              type="checkbox"
              checked={draftVisibility}
              onChange={(event) => setDraftVisibility(event.target.checked)}
              disabled={savingSettings || deletingSet}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className="block font-medium text-gray-800">
                Make this set public
              </span>
              <span className="block text-sm text-gray-600">
                Anyone with its share link can study a public set without
                signing in.
              </span>
            </span>
          </label>

          <div className="flex flex-col-reverse gap-3 mt-6 sm:flex-row sm:justify-between">
            <button
              onClick={handleDeleteSet}
              disabled={savingSettings || deletingSet}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              {deletingSet ? "Deleting Set..." : "Delete Entire Set"}
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={
                savingSettings || deletingSet || !draftTitle.trim()
              }
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {savingSettings ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </section>
      )}

      {flashcards.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            No flashcards in this set
          </h2>
          <p className="mt-3 text-gray-600">
            You can rename, change visibility, or delete the empty set above.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-gray-600">
            Card {currentIndex + 1} of {flashcards.length}
          </p>
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

            <div className="flex flex-col gap-3 justify-center mt-8 sm:flex-row sm:flex-wrap">
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
              <button
                onClick={() => handleDeleteCard(currentCard)}
                disabled={deletingCardId === currentCard.flashcard_id}
                className="border border-red-300 text-red-700 px-6 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                {deletingCardId === currentCard.flashcard_id
                  ? "Deleting..."
                  : "Delete Card"}
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
        </>
      )}
    </div>
  );
};

export default CardsetFlashcards;
