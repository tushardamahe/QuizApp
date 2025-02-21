import { useState, useEffect } from "react";
import { clearQuizHistory, getQuizHistory } from "../utils/indexedDB";
import { useNavigate } from "react-router-dom";

const QuizHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let isMounted = true; // Prevents state update after unmount.

    const fetchHistory = async () => {
      try {
        const data = await getQuizHistory(); // Fetch quiz history from IndexedDB.
        if (isMounted) setHistory(data); // Update state only if component is mounted.
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false; // Cleanup function to prevent memory leaks.
    };
  }, []); // Empty dependency array ensures it only runs once on mount.

  const handleClearHistory = async () => {
    try {
      await clearQuizHistory(); // Clear history from IndexedDB.
      setHistory([]); // Update state to reflect cleared history.
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  return (
    <section className="container">
      <h2>Quiz History</h2>
      {history.length === 0 ? (
        <p>No quiz history available.</p> // Message when history is empty.
      ) : (
        <>
          <ul className="history-list">
            {history.map((entry, index) => (
              <li key={index} className="history-item">
                <p>
                  <strong>Date:</strong> {new Date(entry.date).toLocaleString()}
                  {/* Convert timestamp to readable format */}
                </p>
                <p>
                  <strong>Score:</strong> {entry.score}
                  {/* Display quiz score */}
                </p>
                <p>
                  <strong>Answers:</strong>
                </p>
                <ul>
                  {entry.answers.map((answer, i) => (
                    <li key={i}>
                      {`Q${i + 1}: ${answer.question} - Your Answer: ${
                        answer.userAnswer || "No Answer"
                      } (${answer.isCorrect ? "✅ Correct" : "❌ Wrong"})`}
                      {/* Show user answers with correctness indicator */}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <button className="button" onClick={handleClearHistory}>
            {/* Clear history button */}
            Clear History
          </button>
        </>
      )}

      <button className="button" onClick={() => navigate("/")}>
        {/* Navigate back to home */}
        Home
      </button>
    </section>
  );
};

export default QuizHistory;
