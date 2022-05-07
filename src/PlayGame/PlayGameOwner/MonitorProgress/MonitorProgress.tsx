import { collection, doc, getFirestore, onSnapshot, query, setDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ProgressCard from "./ProgressCard";
import styles from '../../../App/Form.module.css';
import aggregateResults from "./AggregateResults";
import { UserContext } from "../../../App";

interface UserProgress {
  name: string,
  img: string,
  cardsRated: number,
  cardsTotal: number,
  ratings: {[cid: string]: boolean | null}
}

const MonitorProgress = () => {
  const [userProgress, setUserProgress] = useState<{[x: string]: UserProgress}>({});

  const { gid } = useParams();
  const user = useContext(UserContext);

  // Update player ids
  useEffect(() => {
    if (!gid) return;

    console.log('Setting doc listener');
    
    const db = getFirestore();
    const unsub = onSnapshot(
      query(collection(db, 'games', gid, 'players')),
      q => {
        q.forEach(d => {
          const data = d.data();
          if (!data) return;

          const cardsRated = data.cards
            .map((card: any) => card.rating != null)
            .map((rated: boolean) => rated ? 1 : 0)
            .reduce((a: number, b: number) => a + b);

          const cardsTotal = data.cards.length;

          let ratings: {[cid: string]: boolean | null} = {};
          data.cards.forEach((card: any) => ratings[card.id] = card.rating);

          setUserProgress(u => ({
            ...u,
            [d.id]: { name: data.name, img: data.img, cardsRated, cardsTotal, ratings }
          }))
        });
      }
    )
    
    return unsub;
  }, [gid]);

  const handleEndGame = async () => {
    if (!gid || !user) return;

    const results = aggregateResults(gid, userProgress);
    const players = [...Object.keys(userProgress), user?.uid];
    setDoc(
      doc(getFirestore(), 'games', gid),
      { results, complete: true, players },
      { merge: true }
    )
    setDoc(
      doc(getFirestore(), 'users', user.uid),
      { activeGame: '' },
      { merge: true }
    )
  }

  return (
    <div className="w-4/5 flex flex-col p-3 mx-auto">
      <h1 className="text-3xl self-center mt-3 mb-3">Player Progress</h1>
      <div className="self-center mt-3 mb-3">
        <button className={styles.submit} onClick={handleEndGame}>End game</button>
      </div>
      <div>
        {
          Object.keys(userProgress).map(
            pid => <ProgressCard key={pid} data={userProgress[pid]} />
          )
        }
      </div>
    </div>
  )
};

export default MonitorProgress;
export type { UserProgress };