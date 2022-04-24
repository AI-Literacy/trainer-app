import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingOverlay from "../../LoadingOverlay";
import PlayGameLoading from "./PlayGameLoading";
import PlayGameStarted from "./PlayGameStarted";

const PlayGameStudent = () => {
  const [started, setStarted] = useState<boolean | null>(null);
  const { gid } = useParams();

  useEffect(() => {
    if (!gid) return;

    const db = getFirestore();
    const unsub = onSnapshot(
      doc(db, 'games', gid),
      doc => {
        const data = doc.data();
        
        if (!data) return;
        setStarted(data.started)
      }
    )

    return () => unsub();
  }, [gid]);

  if (started == null) return <LoadingOverlay />;

  if (started) return <PlayGameStarted />;
  return <PlayGameLoading />;
};

export default PlayGameStudent;