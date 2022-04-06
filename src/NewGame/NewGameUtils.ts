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
  numObjects: number,
  objectTemplates: { [x: string]: Field },
  uid: string
): Promise<boolean> {
  // Validate parameters
  const gameCodeError = await validateGameCode(code);
  if (gameCodeError) return false;

  if (!(10 <= numObjects && numObjects <= 100)) return false;
  
  const minMaxValid = Object.values(objectTemplates)
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

  const totalPoints = Object.values(objectTemplates)
    .map(template => (template.min + template.max) / 2)
    .reduce((a, b) => a + b);

  await setDoc(
    doc(db, 'games', code),
    {
      owner: uid,
      createdAt: serverTimestamp(),
      numObjects,
      totalPoints
    }
  );

  await setDoc(
    doc(db, 'games', code, 'private', 'objectTemplates'),
    objectTemplates
  )

  return true;
}