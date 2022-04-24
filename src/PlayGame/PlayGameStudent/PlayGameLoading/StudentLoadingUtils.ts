import { doc, getFirestore, serverTimestamp, setDoc, deleteDoc } from "firebase/firestore";
import { User } from '@firebase/auth-types';

export function addSelfToGame(gid: string, user: User) {
  const db = getFirestore();
  setDoc(
    doc(db, 'games', gid, 'players', user.uid),
    { signedInAt: serverTimestamp(), name: user.displayName, img: user.photoURL }
  )
}

export function removeSelfFromGame(gid: string, user: User) {
  const db = getFirestore();
  deleteDoc(doc(db, 'games', gid, 'players', user.uid));
}