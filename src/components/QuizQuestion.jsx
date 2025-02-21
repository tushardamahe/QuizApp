import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import quizData from "../data/QuizData";
import { saveQuizHistory } from "../utils/indexedDB";

const QuizQuestion = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [isCorrect, setIsCorrect] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [answers, setAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const navigate = useNavigate();

  const currentQuestion = quizData[currentQuestionIndex] || {};
  const finalScore = answers.filter((ans) => ans.isCorrect).length;

  // Timer effect: Counts down from 30 seconds per question. Stops if quiz is completed or time runs out.
  useEffect(() => {
    if (quizCompleted || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizCompleted]);

  // Reset state for the next question. Had a bug here earlier where the timer didn't reset properly.
  useEffect(() => {
    setTimeLeft(30);
    setSelectedOption(null);
    setUserAnswer("");
    setIsCorrect(null);
    setFeedback("");
  }, [currentQuestionIndex]);

  const handleOptionClick = (option) => {
    if (selectedOption) return; // Prevent re-selection after an answer is chosen.
    setSelectedOption(option);

    const correctAnswer = String(currentQuestion.answer).trim();
    const isAnswerCorrect = String(option).trim() === correctAnswer;

    setIsCorrect(isAnswerCorrect);
    setFeedback(isAnswerCorrect ? "✅ Correct!" : "❌ Wrong Answer!");
  };

  const handleCheckAnswer = () => {
    if (isCorrect !== null) return; // Prevent multiple checks (users can't keep guessing!)

    const correctAnswer = String(currentQuestion.answer).trim();
    const userResponse = String(userAnswer).trim();
    const isAnswerCorrect = userResponse === correctAnswer;

    setIsCorrect(isAnswerCorrect);
    setFeedback(
      isAnswerCorrect ? "✅ Correct!" : `❌ Wrong! Correct: ${correctAnswer}`
    );
  };

  const handleNextQuestion = () => {
    if (quizCompleted) return;

    // Determine user's response based on MCQ selection or integer input.
    const userResponse =
      selectedOption !== null
        ? selectedOption
        : userAnswer.trim() !== ""
        ? userAnswer
        : "No Answer";

    const correctAnswer = String(currentQuestion.answer || "").trim();
    const isAnswerCorrect = String(userResponse).trim() === correctAnswer;

    const newAnswer = {
      question: currentQuestion.question || "Unknown Question",
      userAnswer: userResponse,
      correctAnswer,
      isCorrect: isAnswerCorrect,
    };

    setAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers, newAnswer];

      // Check if it's the last question and save history.
      if (currentQuestionIndex === quizData.length - 1 && !quizCompleted) {
        setQuizCompleted(true);
        setTimeout(() => {
          saveQuizHistory(finalScore, updatedAnswers);
        }, 0);
      }

      return updatedAnswers;
    });

    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setQuizCompleted(false);
    setTimeLeft(30);
  };

  if (quizCompleted) {
    return (
      <section className="container">
        <h2>Quiz Completed!</h2>
        <p className="score">
          Your Score: {finalScore} / {quizData.length}
        </p>

        <h3>Quiz Review:</h3>
        <ul className="history-list">
          {answers.map((answer, index) => (
            <li key={index}>
              <strong>
                Q{index + 1}: {answer.question}
              </strong>
              <br />
              Your Answer: {answer.userAnswer} {answer.isCorrect ? "✅" : "❌"}
              <br />
              Correct Answer: {answer.correctAnswer}
            </li>
          ))}
        </ul>
        <button className="restart" onClick={handleRestart}>
          Restart
        </button>
        <button className="home" onClick={() => navigate("/")}>
          Home
        </button>
      </section>
    );
  }

  return (
    <section className="container">
      <h2>{currentQuestion.question || "Loading..."}</h2>
      <p className="timer">Time Left: {timeLeft}s</p>

      {currentQuestion.type === "mcq" ? (
        <div className="options">
          {currentQuestion.options?.map((option, index) => (
            <button
              key={index}
              className={`option ${
                selectedOption === option
                  ? isCorrect
                    ? "correct"
                    : "wrong"
                  : ""
              }`}
              onClick={() => handleOptionClick(option)}
              disabled={selectedOption !== null} // Disable after selection.
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <div className="integer-input">
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Enter your answer"
          />
          <button
            className="check"
            onClick={handleCheckAnswer}
            disabled={isCorrect !== null}
          >
            Check
          </button>
        </div>
      )}

      {feedback && (
        <p className={isCorrect ? "correct-text" : "wrong-text"}>{feedback}</p>
      )}

      <button className="next" onClick={handleNextQuestion}>
        Next
      </button>
    </section>
  );
};

export default QuizQuestion;
