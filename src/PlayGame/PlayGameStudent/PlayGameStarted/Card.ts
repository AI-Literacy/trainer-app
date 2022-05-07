interface GameField {
  name: string;
  value: number;
  max: number;
}

export interface Card {
  id: string;
  fields: { [x: string]: GameField };
  rating: boolean | null;
}