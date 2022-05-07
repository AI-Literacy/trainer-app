import { getFirestore, doc, onSnapshot, setDoc, arrayUnion } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../../App";
import LoadingOverlay from "../../LoadingOverlay";
import PlayGameLoading from "./PlayGameLoading";
import { removeActiveGame } from "./PlayGameLoading/StudentLoadingUtils";
import PlayGameStarted from "./PlayGameStarted";

const PlayGameStudent = () => {
  const [started, setStarted] = useState<boolean | null>(null);
  const { gid } = useParams();
  const navigate = useNavigate();
  const user = useContext(UserContext);

  useEffect(() => {
    if (!gid || !user) return;

    const db = getFirestore();
    const unsub = onSnapshot(
      doc(db, 'games', gid),
      d => {
        const data = d.data();
        
        if (!data) return;
        if (data.complete) {
          removeActiveGame(user);
          // TODO: Eventually, this all needs to be done with a Firebase function
          setDoc(
            doc(db, 'users', user.uid),
            { gameHistory: arrayUnion(gid) },
            { merge: true }
          )
          navigate(`/visualize/${gid}`);
        }
        
        setStarted(data.started);
      }
    )

    return () => unsub();
  }, [gid, navigate, user]);

  if (started == null) return <LoadingOverlay />;

  if (started) return <PlayGameStarted />;
  return <PlayGameLoading />;
};

export default PlayGameStudent;