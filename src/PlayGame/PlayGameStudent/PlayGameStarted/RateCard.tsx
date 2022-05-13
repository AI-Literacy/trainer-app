import { faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from './Card';
import styles from './PlayGameStarted.module.css';

interface RateCardProps {
  card: Card,
  rateCard: (rating: boolean) => void,
}

const RateCard = ({ card, rateCard }: RateCardProps) => {
  let fieldKeys = Object.keys(card.fields);
  fieldKeys.sort((a, b) => a < b ? -1 : 1);

  let yesStyle = styles.yes;
  let noStyle = styles.no;
  if (card.rating != null) {
    if (card.rating) yesStyle = styles.yes_selected;
    else noStyle = styles.no_selected;
  }

  return (
    <div className="flex flex-col mb-6 border rounded p-5">
      {
        fieldKeys.map((key) => (
          <div className="flex flex-col md:flex-row mt-2" key={key}>
            <div className="flex flex-col md:w-1/5 justify-center items-start">
              <p className="text-lg">{card.fields[key].name}</p>
            </div>
            <div className="flex flex-col flex-1 justify-center items-center">
              <div className="w-full bg-gray-300 rounded h-4">
                <div
                  className="bg-emerald-500 text-md font-medium h-full text-black p-0.5 leading-none rounded"
                  style={{ width: `${card.fields[key].value / card.fields[key].max * 100}%` }}>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-right md:w-32 items-end">
              <p className="text-right text-lg">{card.fields[key].value} / {card.fields[key].max}</p>
            </div>
          </div>
        ))
      }
      <div className="flex flex-row justify-around mt-6">
        <button className={yesStyle} onClick={() => rateCard(true)}>
          <FontAwesomeIcon icon={faThumbsUp} size={'lg'} />
        </button>
        <button className={noStyle} onClick={() => rateCard(false)}>
          <FontAwesomeIcon icon={faThumbsDown} size={'lg'} />
        </button>
      </div>
    </div>
  );
}

export default RateCard;