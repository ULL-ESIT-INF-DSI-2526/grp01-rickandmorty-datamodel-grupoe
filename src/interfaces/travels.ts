import { Character } from "./character.js";
import { Dimension } from "./dimension.js";

export interface Travel {
  id: string;
  origin: Dimension;
  destination: Dimension;
  traveler: Character;
  date: Date;
  motive: string;
}
