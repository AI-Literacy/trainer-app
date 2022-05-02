import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { v4 as uuid } from 'uuid';

import { GameField } from '../../../NewGame/Template';
import { Card } from '../../PlayGameStudent/PlayGameStarted/Card';
import { Player } from './MonitorUsers';

interface GameDoc {
  cardsPerPlayer: number;
  viewsPerCard: number;
  [x: string]: any;
}

export default async function startGame(
  players: Player[],
  gid: string
) {
  // 1. Get the game template and parameters
  const db = getFirestore();
  const fieldsDoc = await getDoc(doc(db, 'games', gid, 'private', 'fields'));
  const fields = fieldsDoc.data();
  if (!fields) return;

  const gameDoc = await getDoc(doc(db, 'games', gid));
  const game = gameDoc.data() as GameDoc;
  let { cardsPerPlayer, viewsPerCard } = game;
  
  const numStudents = players.length;
  
  console.log({ fields, cardsPerPlayer, viewsPerCard, numStudents });

  // 2. Compute numCards
  if (numStudents < viewsPerCard) {
    viewsPerCard = numStudents;
  }
  const numCards = Math.ceil((cardsPerPlayer * numStudents) / viewsPerCard);

  // 3. Make the cards
  const cards = makeCardsArray(fields, numCards);
  const ids = cards.map(card => uuid());
  console.log(cards, ids);

  // 4. Assign the cards
  let assignments = {} as {[x: string]: Card[]};
  
  for (const player of players) {
    assignments[player.uid] = [];
  }

  for (let i = 0; i < numCards; i++) {
    let numPlayersForCard = 0;

    for (const player of players) {
      if (numPlayersForCard === viewsPerCard) break;
      if (assignments[player.uid].length === cardsPerPlayer) continue;

      assignments[player.uid].push({ id: ids[i], fields: cards[i], rating: null });
      numPlayersForCard++;
    }
  }

  console.log(assignments);

  // 5. Save the assignments to the database
  for (const player of players) {
    await setDoc(
      doc(db, 'games', gid, 'players', player.uid),
      { cards: assignments[player.uid] },
      { merge: true }
    );
  }

  // 6. Start the game
  await setDoc(doc(db, 'games', gid), { started: true }, { merge: true });
}


function makeCardsArray(fields: {[x: string]: GameField }, numCards: number) {
  let cards = new Array(numCards);
  for (let c = 0; c < numCards; c++) {
    cards[c] = Object.create(null)
  }

  let fieldNum = 0; // track field # being added

  for (const field of Object.keys(fields)) {
    let cardNum = 0; // track card # being edited

    for (let c = 0; c < numCards; c++) {
      // repeate until a unique number is found 
      let unique = false;
      while (!unique) {
        // pick random value
        cards[c][field] = {
          name: fields[field].name,
          value: getRandomInt(fields[field]['min'], fields[field]['max'])
        };
        unique = true;

        // goes through each field that field could pair with
        for (let i = 0; i < fieldNum; i++) {
          // looks at all pairs of previous cards and checks if equal
          if (pairEqual(cards[c], cards, cardNum, i, fieldNum, fields)) {
            unique = false; // if the pair is equal, try a new value
          }
        }
      }

      cardNum++;
    }

    fieldNum++;
  }

  return cards;
}


function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max) + 1;
  return Math.floor(Math.random() * (max - min) + min);
}


function pairEqual(card: any, cards: any, cardNum: number,
  pastField: number, curField: number, fields: any) {

  let pastFieldId = Object.keys(fields)[pastField];
  let curFieldId = Object.keys(fields)[curField];

  for (let i = 0; i < cardNum; i++) {
    if ((card[pastFieldId] === cards[i][pastFieldId])
      && (card[curFieldId] === cards[i][curFieldId])) {
      return true;
    }
  }
  return false;
}