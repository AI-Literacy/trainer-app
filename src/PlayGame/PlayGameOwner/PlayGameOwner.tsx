import { getFirestore, onSnapshot, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingOverlay from "../../LoadingOverlay";
import MonitorProgress from "./MonitorProgress";
import MonitorUsers from "./MonitorUsers";

const PlayGameOwner = () => {
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
  if (started) return <MonitorProgress />;
  else return <MonitorUsers />;
};

export default PlayGameOwner;