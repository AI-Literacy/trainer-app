import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserContext from '../App/UserContext';
import { getAuth } from 'firebase/auth';
import styles from './Nav.module.css';

const Nav = () => {
  const [dropShowing, setDropShowing] = useState<boolean>(false);
  const user = useContext(UserContext);

  useEffect(() => {
    if (!dropShowing) return;

    const closeDrop = () => setDropShowing(false);
    window.addEventListener('click', closeDrop, false);
    return () => window.removeEventListener('click', closeDrop);
  }, [dropShowing]);

  if (!user) {
    return null;
  }

  function signOutFn(){
    const auth = getAuth();
    auth.signOut();
  }

  return (
    <nav className="flex justify-between flex-wrap bg-purple-600 p-4">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <Link to="/">
          <span className="font-semibold text-xl tracking-tight">Trainer</span>
        </Link>
      </div>
      <div className="w-auto flex-grow flex items-center">
        <div className="flex-grow">
          {/* Eventually, put some links here */}
        </div>
        <button 
          className="flex flex-row items-center hover:cursor-pointer"
          onClick={() => setDropShowing(true)}
        >
          <img
            src={user.photoURL!}
            alt=""
            className="rounded-full h-8 w-8 mr-2"
          />
          {user.displayName}
        </button>
        <div className={`${styles.dropdown} ${dropShowing ? '' : 'hidden'}`}>
          <ul aria-label="options">
            <li><button onClick={signOutFn}>Logout</button></li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Nav;