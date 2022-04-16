import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { Field } from "./GameField";

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


export async function makeNewGame(
  code: string,
  viewsPerCard: number,
  cardsPerPlayer: number,
  cardTemplates: { [x: string]: Field },
  uid: string
): Promise<boolean> {
  // Validate parameters
  const gameCodeError = await validateGameCode(code);
  if (gameCodeError) return false;

  if (!(1 <= viewsPerCard && viewsPerCard <= 100)) return false;
  if (!(1 <= cardsPerPlayer && cardsPerPlayer <= 10)) return false;

  // Calculate number of cards - assuming there are 25 students
  const numStudents = 25;

  if (viewsPerCard > numStudents) return false;
  let numCards = Math.floor((cardsPerPlayer * numStudents)/viewsPerCard);
  
  const minMaxValid = Object.values(cardTemplates)
    .map(field => field.min < field.max)
    .reduce((a, b) => a && b, true);
  if (!minMaxValid) return false;

  // Push the game to the database
  const db = getFirestore();
  await setDoc(
    doc(db, 'users', uid),
    { activeGame: code },
    { merge: true }
  )

  const totalPoints = Object.values(cardTemplates)
    .map(template => (template.min + template.max) / 2)
    .reduce((a, b) => a + b);

  await setDoc(
    doc(db, 'games', code),
    {
      owner: uid,
      createdAt: serverTimestamp(),
      numCards,
      totalPoints
    }
  );

  await setDoc(
    doc(db, 'games', code, 'private', 'objectTemplates'),
    cardTemplates
  )

  return true;
}