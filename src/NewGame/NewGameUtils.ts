import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { GameTemplate } from "./Template";

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
  template: GameTemplate,
  uid: string
): Promise<boolean> {
  const { gameCode, started, viewsPerCard, cardsPerPlayer, fields } = template;

  // Validate parameters
  const gameCodeError = await validateGameCode(gameCode);
  if (gameCodeError) return false;
  if (!(1 <= viewsPerCard && viewsPerCard <= 100)) return false;
  if (!(1 <= cardsPerPlayer && cardsPerPlayer <= 10)) return false;
  
  const minMaxValid = Object.values(fields)
    .map(field => field.min < field.max)
    .reduce((a, b) => a && b, true);
  if (!minMaxValid) return false;

  if (started) return false;

  // Push the game to the database
  const db = getFirestore();
  await setDoc(
    doc(db, 'users', uid),
    { activeGame: gameCode },
    { merge: true }
  )

  await setDoc(
    doc(db, 'games', gameCode),
    {
      owner: uid,
      createdAt: serverTimestamp(),
      viewsPerCard,
      cardsPerPlayer,
      started
    }
  );

  await setDoc(
    doc(db, 'games', gameCode, 'private', 'objectTemplates'),
    fields
  )

  return true;
}