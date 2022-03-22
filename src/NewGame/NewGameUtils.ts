import { doc, getDoc, getFirestore } from "firebase/firestore";

export async function validateGameCode(newGameCode: string) {
  // Long enough
  if (newGameCode.length < 5) {
    return 'Game code must be at least five characters';
  }

  // Alphanumeric characters
  if (/[^A-Z0-9]/.test(newGameCode)) {
    return 'Game code may only contain uppercase letters and numbers';
  }

  // Already in use?
  const db = getFirestore();
  const docRef = await getDoc(doc(db, 'games', newGameCode));
  if (docRef.exists()) {
    return 'Game code already in use';
  }

  return '';
}