import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <>
      <section className="container">
        <div className="header">Quiz App</div>
        <button className="button" onClick={() => navigate("/quiz")}>
          Start Quiz
        </button>
        <button className="button" onClick={() => navigate("/history")}>
          History
        </button>
      </section>
    </>
  );
};

export default Home;
