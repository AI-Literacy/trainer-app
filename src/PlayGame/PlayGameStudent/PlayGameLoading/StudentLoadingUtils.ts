import { doc, getFirestore, serverTimestamp, setDoc, deleteDoc } from "firebase/firestore";
import { GameUser } from "../../../App/UserContext";

export function addSelfToGame(gid: string, user: GameUser) {
  const db = getFirestore();
  setDoc(
    doc(db, 'games', gid, 'players', user.uid),
    { signedInAt: serverTimestamp(), name: user.displayName, img: user.photoURL }
  )

  setDoc(
    doc(db, 'users', user.uid), { activeGame: gid }, { merge: true }
  )
}

export function removeActiveGame(user: GameUser | null) {
  if (!user) return;
  
  const db = getFirestore();
  setDoc(
    doc(db, 'users', user.uid), { activeGame: '' }, { merge: true }
  )
}

export function removeSelfFromGame(gid: string, user: GameUser) {
  const db = getFirestore();
  
  deleteDoc(doc(db, 'games', gid, 'players', user.uid));
  removeActiveGame(user);
}