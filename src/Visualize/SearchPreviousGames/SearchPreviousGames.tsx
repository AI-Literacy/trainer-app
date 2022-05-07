import { doc, getDoc, getFirestore, Timestamp } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { debounceTime, map, Subject } from "rxjs";
import { UserContext } from "../../App";
import match from "./SearchUtils";
import styles from '../Visualize.module.css';

interface GameSearch {
  code: string,
  time: Date
}

const search$ = new Subject<string>();

const SearchPreviousGames = () => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allGames, setAllGames] = useState<GameSearch[]>([]);
  const [suggestions, setSuggestions] = useState<GameSearch[]>([]);

  const user = useContext(UserContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) return;

    (async () => {
      const userQuery = await getDoc(doc(getFirestore(), 'users', user.uid));
      const userData = userQuery.data();
      const previousGames: string[] = userData ? userData.gameHistory : [];

      let newGames: GameSearch[] = [];
      for (const gid of previousGames) {
        const gameData = await getDoc(doc(getFirestore(), 'games', gid));
        const time: Timestamp = gameData.data()?.createdAt;

        newGames.push({ code: gid, time: time.toDate() });
      }


      setAllGames(newGames);
      setSuggestions(newGames);
    })();
  }, [user]);

  useEffect(() => {
    const s1 = search$.subscribe(setQuery);
    const s2 = search$
                .pipe(
                  debounceTime(500),
                  map((query: string) => allGames.filter(g => match(query, g)))
                )
                .subscribe(setSuggestions);

    return () => {
      s1.unsubscribe();
      s2.unsubscribe();
    }
  }, [allGames]);

  return (
    <div className="flex flex-row items-start justify-start w-4/5 relative">
      <input 
        type="text" 
        className={styles.input}
        placeholder="Search for a game you've played"
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setShowSuggestions(false)}
        value={query}
        onChange={(e) => search$.next(e.target.value)}
      />
      <div
        className={`${showSuggestions ? 'absolute' : 'hidden'} ${styles.dropdown}`}
      >
        <ul aria-label="options">
          {
            suggestions.map(
              g => (
                <li key={g.code}>
                  <button onMouseDown={() => navigate(`/visualize/${g.code}`)}>
                    <p className="inline-block">{g.code}</p>
                    <p className="inline-block text-xl">{g.time.toLocaleDateString('en-US')}</p>
                  </button>
                </li>
              )
            )
          }
        </ul>
      </div>
    </div>
  );
}

export default SearchPreviousGames;
export type { GameSearch };