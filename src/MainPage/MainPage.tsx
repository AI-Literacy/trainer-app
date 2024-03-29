import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserContext from "../App/UserContext";
import styles from './MainPage.module.css';

const MainPage = () => {
  const user = useContext(UserContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user?.activeGame) navigate(`/game/${user.activeGame}`)
  }, [user, navigate]);
  if (!user) return null;

  return (
    <div className="app flex flex-col justify-around h-5/6 align-middle mt-8">
      <Link to="/new-game" className={`${styles['btn-wrapper']}`}>
        <div className={styles["btn"]}>
          <img className="w-1/2 mb-6" style={{ maxHeight: '60%' }} src="/img/new-game.svg" alt="" />
          <h1 className="text-3xl text-center md:text-4xl">Start a new game</h1>
        </div>
      </Link>
      <Link to="/join-game" className={`${styles['btn-wrapper']}`}>
        <div className={styles["btn"]}>
          <img className="w-1/2 mb-6" style={{ maxHeight: '60%' }} src="/img/join-game.svg" alt="" />
          <h1 className="text-3xl text-center md:text-4xl">Join an existing game</h1>
        </div>
      </Link>
      <Link to="/visualize" className={styles["btn-wrapper"]}>
        <div className={styles["btn"]}>
          <img className="w-1/2 mb-6" style={{ maxHeight: '60%' }} src="/img/visualize.svg" alt="" />
          <h1 className="text-3xl text-center md:text-4xl">Visualize a game</h1>
        </div>
      </Link>
    </div>
  );
}

export default MainPage;