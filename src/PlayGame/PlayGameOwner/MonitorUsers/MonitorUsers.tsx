import { 
  collection, 
  getFirestore, 
  onSnapshot, 
  query, 
  Timestamp 
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HashLoader from "react-spinners/HashLoader";
import QRCode from 'qrcode';

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
  const [qrData, setQRData] = useState('');
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
  }, [gid]);

  useEffect(() => {
    QRCode.toDataURL(window.location.href, (err, url) => setQRData(url));
  }, []);
  
  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    startGame(players, gid!);
  }

  return (
    <div className="w-full flex flex-col p-3">
      <h1 className="text-3xl self-center mt-3">Game: {gid}</h1>
      <p className="text-xl text-gray-400 self-center mt-1 mb-3">(wait for all players to join before starting)</p>
      <div className="flex flex-row justify-around flex-wrap">
        {
          players.length === 0
            ? (<div className="flex w-full h-full justify-center">
              <div className="flex self-center">
                <HashLoader color={'white'} size={150} />
              </div>
            </div>)
          : players.map(player => <PlayerCard key={player.uid} player={player} />)
        }
      </div>
      <div className="flex flex-row justify-center items-center mt-4">
        <img alt="" src={qrData} />
      </div>
      {
        players.length >= 1 && (<div className="mt-4 flex flex-row justify-center">
          <button onClick={handleStart} className={styles.submit}>Start game!</button>
        </div>)
      }
    </div>
  );
}

export default MonitorUsers;
export type { Player };