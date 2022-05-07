import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { UserContext } from "../../../App";
import LoadingOverlay from "../../../LoadingOverlay";
import InvalidGame from "../../InvalidGame";
import { removeSelfFromGame } from "../PlayGameLoading/StudentLoadingUtils";
import { Card } from "./Card";
import RateCard from "./RateCard";

const MySwal = withReactContent(Swal);

const PlayGameStarted = () => {
  const [invalid, setInvalid] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [question, setQuestion] = useState('');

  const { gid } = useParams();
  const user = useContext(UserContext);
  const navigate = useNavigate();

  // Get cards
  useEffect(() => {
    if (!gid || !user) return;

    (async () => {
      const db = getFirestore();
      const d = await getDoc(doc(db, 'games', gid, 'players', user.uid));
      const data = d.data();

      if (!data) {
        setInvalid(true);
        return;
      }

      if ('cards' in data) {
        console.log(data.cards);
        setCards(data.cards);
      }
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
  }, [gid, user, navigate]);

  // Get the question
  useEffect(() => {
    if (!gid) return;
    
    (async () => {
      const docRef = await getDoc(doc(getFirestore(), 'games', gid));
      const data: any = docRef.data();
      setQuestion(data.question);
    })()
  }, [gid]);

  // Generic function to rate the card
  const handleRateCard = (idx: number) => (rating: boolean) => {
    let newCards = [...cards];
    newCards[idx].rating = rating;
    setCards(newCards);

    if (!user || !gid) return;
    setDoc(
      doc(getFirestore(), 'games', gid, 'players', user.uid),
      { cards: newCards },
      { merge: true }
    )
  }


  const loading = (cards.length === 0) || (question === '');
  
  if (invalid) return <InvalidGame />;
  if (loading) return <LoadingOverlay />;
  
  return (
    <div className="w-4/5 flex flex-col p-3 mx-auto">
      <h1 className="text-3xl self-center mt-3 mb-1">{question}</h1>
      <p className="text-lg self-center mb-3">(your ratings are saved automatically)</p>
      <div className="flex flex-col">
        {
          cards.map(
            (card, idx) => <RateCard key={card.id} card={card} rateCard={handleRateCard(idx)} />
          )
        }
      </div>
    </div>
  );
};

export default PlayGameStarted;