import { openDB } from "idb";

// Open the IndexedDB database
const openDatabase = async () => {
  return await openDB("QuizAppDB", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("history")) {
        db.createObjectStore("history", { keyPath: "id", autoIncrement: true });
      }
    },
  });
};

// Save quiz history
export const saveQuizHistory = async (score, answers) => {
  try {
    if (!answers || answers.length === 0) {
      console.error("No answers to save.");
      return;
    }

    const db = await openDatabase();
    const tx = db.transaction("history", "readwrite");
    const store = tx.objectStore("history");

    // Check if an entry with the same timestamp already exists
    const existingHistory = await store.getAll();
    const latestEntry = existingHistory.find(
      (entry) => entry.date === new Date().toISOString()
    );

    if (latestEntry) {
      console.warn("Duplicate history entry detected. Skipping save.");
      return; // Avoid saving duplicate entries
    }

    await store.add({
      date: new Date().toISOString(),
      score: score !== undefined ? score : 0,
      answers: answers,
    });

    await tx.done;
  } catch (error) {
    console.error("Error saving quiz history:", error);
  }
};

// Get all quiz history
export const getQuizHistory = async () => {
  try {
    const db = await openDatabase();
    const history = await db.getAll("history");
    return history;
  } catch (error) {
    console.error("Error fetching quiz history:", error);
    return [];
  }
};

// Clear quiz history
export const clearQuizHistory = async () => {
  try {
    const db = await openDatabase();
    const tx = db.transaction("history", "readwrite");
    await tx.objectStore("history").clear();
    await tx.done;
  } catch (error) {
    console.error("Error clearing quiz history:", error);
  }
};
