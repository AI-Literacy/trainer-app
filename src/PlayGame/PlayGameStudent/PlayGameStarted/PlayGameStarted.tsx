import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { UserContext } from "../../../App";
import LoadingOverlay from "../../../LoadingOverlay";
import InvalidGame from "../../InvalidGame";
import { removeSelfFromGame } from "../PlayGameLoading/StudentLoadingUtils";
import { Card } from "./Card";

const MySwal = withReactContent(Swal);

const PlayGameStarted = () => {
  const [invalid, setInvalid] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);

  const { gid } = useParams();
  const user = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!gid || !user) return;

    (async () => {
      const db = getFirestore();
      const d = await getDoc(doc(db, 'games', gid, 'players', user.uid));
      const data = d.data();

      console.log(data);

      if (!data) {
        setInvalid(true);
        return;
      }

      if ('cards' in data) setCards(data.cards);
      else {
        MySwal
          .fire({
            title: 'Something went wrong',
            icon: 'error',
            text: "You haven't been assigned any cards to evaluate."
          })
          .then(() => removeSelfFromGame(gid, user))
          .then(() => navigate('/join-game'));
      };
    })()
  }, [gid, user, navigate])

  const loading = cards.length === 0;
  
  if (invalid) return <InvalidGame />;
  if (loading) return <LoadingOverlay />;
  return (<p>Cards: {cards}</p>);
};

export default PlayGameStarted;