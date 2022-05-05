import { createContext } from 'react';
import { User } from '@firebase/auth-types';

interface GameUser extends User {
  activeGame: string;
}

const UserContext = createContext<GameUser | null>(null);

export default UserContext;
export type { GameUser };