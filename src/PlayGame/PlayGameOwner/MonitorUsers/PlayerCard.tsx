import { faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { deleteDoc, doc, getFirestore, setDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { Player } from './MonitorUsers';
import styles from './PlayerCard.module.css';

const PlayerCard = ({ player }: { player: Player }) => {
  const { name, img, uid } = player;
  const { gid } = useParams();

  const handleRemove = () => {
    if (!gid) return;
    
    (async () => {
      const db = getFirestore();
      await deleteDoc(doc(db, 'games', gid, 'players', uid));
      await setDoc(
        doc(db, 'users', uid),
        { activeGame: '' },
        { merge: true }
      );
    })();
  }

  return (
    <div className="w-1/4 p-3 m-2 rounded border border-white relative">
      <div className="w-full h-full flex flex-row">
        <div className="flex flex-col w-1/4 justify-center align-middle">
          <img src={img} alt="" className="max-w-lg rounded-full" />
        </div>
        <div className="flex flex-col w-3/4 justify-center align-middle">
          <p className="text-xl self-center">{name}</p>
        </div>
      </div>
      <button
        className={`absolute top-0 right-0 ${styles.close}`}
        onClick={handleRemove}
        aria-label={`remove player ${name}`}
        type='button'
      >
        <FontAwesomeIcon size={'lg'} icon={faXmarkCircle} />
      </button>
    </div>
  )
}

export default PlayerCard;