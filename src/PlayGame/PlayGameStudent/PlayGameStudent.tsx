import { getFirestore, doc, onSnapshot } from "firebase/firestore";
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
    if (!gid) return;

    const db = getFirestore();
    const unsub = onSnapshot(
      doc(db, 'games', gid),
      doc => {
        const data = doc.data();
        
        if (!data) return;
        if (data.complete) {
          removeActiveGame(user);
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