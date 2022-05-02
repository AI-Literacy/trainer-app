import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { GameField, GameTemplate } from "./Template";
import swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(swal);

export function validateGameCodeStructure(newGameCode: string) {
  // Long enough
  if (newGameCode.length < 5) {
    return 'Game code must be at least five characters';
  }

  // Alphanumeric characters
  if (/[^A-Z0-9]/.test(newGameCode)) {
    return 'Game code may only contain uppercase letters and numbers';
  }

  return '';
}

export async function validateGameCode(newGameCode: string) {
  const fb = validateGameCodeStructure(newGameCode);
  if (fb) return fb;

  // Already in use?
  const db = getFirestore();
  const docRef = await getDoc(doc(db, 'games', newGameCode));
  if (docRef.exists()) {
    return 'Game code already in use';
  }

  return '';
}


function error(msg: string) {
  MySwal.fire({
    title: 'Error',
    text: msg,
    icon: 'error',
  })
  return false;
}


async function validateTemplate(template: GameTemplate) {
  const { gameCode, started, viewsPerCard, cardsPerPlayer, fields, question } = template;

  // Validate parameters
  const gameCodeError = await validateGameCode(gameCode);
  if (gameCodeError) return error(gameCodeError);
  if (!(1 <= viewsPerCard && viewsPerCard <= 100)) return error("Number of views per card must be between 1 and 100.");
  if (!(1 <= cardsPerPlayer && cardsPerPlayer <= 10)) return error("Number of cards per player must be between 1 and 10.");
  const minMaxValid = Object.values(fields)
    .map(field => field.min < field.max)
    .reduce((a, b) => a && b, true);
  if (!minMaxValid) return error("Min value must be less than max value.");
  if (started) return error("Game already started.");
  if (!question) return error("Please enter a question.");

  return true;
}


export async function makeNewGame(
  template: GameTemplate,
  uid: string
): Promise<boolean> {
  const valid = await validateTemplate(template);
  if (!valid) return false;

  // Push the game to the database
  const { gameCode, question, viewsPerCard, 
    cardsPerPlayer, fields, started} = template;
  console.log(fields);

  // generateCards
  const cards = generateCards(25, viewsPerCard, cardsPerPlayer, fields)

  // split cards per user
  // get collection of users
  let users = new Array('25')
  assignCards(users, cards, cardsPerPlayer);

  // calculate number of cards
  // 1. Change user's active game
  const db = getFirestore();
  await setDoc(
    doc(db, 'users', uid),
    { activeGame: gameCode },
    { merge: true }
  )

  // 2. Push the game metadata to the database
  let docVal: any = {
    owner: uid,
    createdAt: serverTimestamp(),
    ...template
  };
  delete docVal['gameCode'];
  delete docVal['fields'];

  await setDoc(doc(db, 'games', gameCode), docVal);

  // 3. Push the game fields to the database
  await setDoc(
    doc(db, 'games', gameCode, 'private', 'objectTemplates'),
    fields
  )

  return true;
}

function generateCards(numStudents: number, viewsPerCard: number, cardsPerPlayer: number, fields: any){
  if (numStudents < viewsPerCard){
    viewsPerCard = numStudents;
  }
  let numCards = Math.floor((cardsPerPlayer * numStudents)/ viewsPerCard);

  // METHOD 2:
  // * give each card random value for field 1
  // * go to next field
  // * for each card:
  //  * check for each pair with previous fields that 
  //    the value pair is different from past cards
  //  * if the value pair is the same, redo value for that field 
  //  * repeat last 2 steps for all fields

  let cards = new Array(numCards);
  for (let c = 0; c <numCards; c++){
    cards[c] = Object.create(null)
  } 

  let fieldNum = 0; // track field # being added

  for(const field of Object.keys(fields)){
    let cardNum = 0; // track card # being edited
    console.log(field);
    for (let c = 0; c <numCards; c++){

      // repeate until a unique number is found 
      let unique = false;
      while(!unique){
        // pick random value
        cards[c][field] = getRandomInt(fields[field]['min'], fields[field]['max']);
        unique = true;

        // goes through each field that field could pair with
        for(let i = 0; i < fieldNum; i++){
          // looks at all pairs of previous cards and checks if equal
          if(pairEqual(cards[c], cards, cardNum, i, fieldNum, fields)){
            unique = false; // if the pair is equal, try a new value
          }
        }        
      }

      cardNum ++;
    }

    fieldNum ++;
  }
  
  return cards;
}

// rough code
function assignCards(users: Array<any>, cards: Array<any>, cardsPerPlayer: number){
  let numCards = cards.length;
  users.forEach((element, index) => { 
    for(let i = 0; i < cardsPerPlayer; i++){
      let cardIndex = ((index*cardsPerPlayer)+i) % numCards;

      // assing the card to the user
      cards[cardIndex].user = element;

      // assign the user to the card
      element.card = cards[cardIndex]
    }
   })
  

}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max)+1;
  return Math.floor(Math.random() * (max - min) + min);
}

function cardsEqual(newCard: any, card: any, fields: any){
  for (const field of Object.keys(fields)){
    if (newCard[field] != card[field]){
      return false;
    }
  }
  console.log("MATCH")
  console.log(newCard, card)
  return true;
}

function pairEqual(card: any, cards: any, cardNum: number, 
  pastField: number, curField: number, fields: any){
  
  let pastFieldId = Object.keys(fields)[pastField];
  let curFieldId = Object.keys(fields)[curField];

  for(let i = 0; i < cardNum; i++){
    if ((card[pastFieldId] === cards[i][pastFieldId]) 
      && (card[curFieldId] === cards[i][curFieldId])){
      console.log("MATCH");
      console.log(card, cards[i])
      return true;
    }
  }
  return false;
}