import { GameField } from "../Template";

export default interface TemplatePartial {
  name: string,
  question: string,
  fields: { [x: string]: GameField }
}