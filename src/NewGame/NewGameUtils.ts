import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { GameTemplate } from "./Template";
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
  const { gameCode, fields } = template;

  // 1. Change user's active game
  const db = getFirestore();
  try {
    await setDoc(
      doc(db, 'users', uid),
      { activeGame: gameCode },
      { merge: true }
    )
  }
  catch (err) {
    return error('You already have an active game');
  }

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
    doc(db, 'games', gameCode, 'private', 'fields'),
    fields
  )

  return true;
}