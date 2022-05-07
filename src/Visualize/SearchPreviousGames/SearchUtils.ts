import { GameSearch } from "./SearchPreviousGames";

export default function match(query: string, game: GameSearch) {
  const code = game.code.toUpperCase()
  query = query.toUpperCase();
  const re = new RegExp(`.*${query.split('').join(".*")}.*`);
  
  return code.match(re);
}