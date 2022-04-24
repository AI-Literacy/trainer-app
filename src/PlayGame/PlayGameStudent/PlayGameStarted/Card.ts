interface GameField {
  name: string;
  value: number;
}

export interface Card {
  id: string;
  fields: { [x: string]: GameField };
  rating: boolean | null;
}