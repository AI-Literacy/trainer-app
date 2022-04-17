export interface GameField {
  name: string;
  min: number;
  max: number;
}

export interface GameTemplate {
  started: boolean;
  
  gameCode: string;
  question: string;
  viewsPerCard: number;
  cardsPerPlayer: number;

  fields: { [x: string]: GameField };
}