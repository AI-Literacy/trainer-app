import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { 
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

import './App.css';

import Nav from '../Nav';
import UserContext, { GameUser } from './UserContext';
import LoadingOverlay from '../LoadingOverlay';
import MainPage from '../MainPage';
import NewGame from '../NewGame';
import JoinGame from '../JoinGame';
import PlayGame from '../PlayGame';
import Visualize from '../Visualize';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    auth.onAuthStateChanged(async newUser => {
      if (newUser) {
        if (user === null) {
          const db = getFirestore();
          const userData = await getDoc(doc(db, 'users', newUser.uid));

          let updatedUser;
          if (userData.exists()) {
            // Update the user with the information from the database
            updatedUser = {...newUser, ...userData.data()} as GameUser;
          } else {
            // Create a new document in the database
            setDoc(
              doc(db, 'users', newUser.uid),
              {
                'displayName': newUser.displayName,
                'img': newUser.photoURL,
                'activeGame': ''
              }
            )
            updatedUser = {...newUser, activeGame: ''} as GameUser;
          }
            
          setUser(updatedUser);
          setLoading(false);
        }
      } else {
        signInWithRedirect(auth, provider);
      }
    });
  })

  return (
    <UserContext.Provider value={user}>
      { loading ? <LoadingOverlay /> : null }
      <Router>
        { user ? <Nav /> : null }
        <Routes>
          <Route path='/' element={<MainPage />} />
          <Route path='/new-game' element={<NewGame />} />
          <Route path='/join-game' element={<JoinGame />} />
          <Route path='/game/:gid' element={<PlayGame />} />
          <Route path='/visualize' element={<Visualize />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
export { UserContext };