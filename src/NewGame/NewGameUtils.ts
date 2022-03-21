import { doc, getDoc, getFirestore } from "firebase/firestore";

export function validateGCFlow(
  setGCFeedback: (feedback: string) => void
) {
  return async (newGameCode: string) => {
    setGCFeedback('');

    // Long enough
    if (newGameCode.length < 5) {
      setGCFeedback('Game code must be at least five characters');
      return false;
    }

    // Alphanumeric characters
    if (/[^A-Z0-9]/.test(newGameCode)) {
      setGCFeedback('Game code may only contain uppercase letters and numbers');
      return false;
    }

    // Already in use?
    const db = getFirestore();
    const docRef = await getDoc(doc(db, 'games', newGameCode));
    if (docRef.exists()) {
      setGCFeedback('Game code already in use');
      return false;
    }

    return true;
  }
}