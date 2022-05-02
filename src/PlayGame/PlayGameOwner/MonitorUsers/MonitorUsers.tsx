import { 
  collection, 
  getFirestore, 
  onSnapshot, 
  query, 
  Timestamp 
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlayerCard from "./PlayerCard";
import styles from '../../../App/Form.module.css';
import startGame from './StartGame';

interface Player {
  uid: string,
  signedInAt: Timestamp,
  name: string,
  img: string,
}

const MonitorUsers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const { gid } = useParams();

  useEffect(() => {
    if (!gid) return;

    const db = getFirestore();
    const unsub = onSnapshot(
      query(collection(db, 'games', gid, 'players')),
      q => {
        let docs: Player[] = [];
        q.forEach(doc => docs.push(
          {...doc.data(), uid: doc.id} as Player
        ));
        setPlayers(docs);
      }
    )

    return unsub;
  }, [gid])

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    startGame(players, gid!);
  }

  return (
    <div className="w-full flex flex-col p-3">
      <h1 className="text-3xl self-center mt-3 mb-3">Players</h1>
      <div className="flex flex-row justify-around flex-wrap">
        {
          players.map(player => <PlayerCard key={player.uid} player={player} />)
        }
      </div>
      <div className="mt-4 flex flex-row justify-center">
        <button onClick={handleStart} className={styles.submit}>Start game!</button>
      </div>
    </div>
  );
}

export default MonitorUsers;
export type { Player };