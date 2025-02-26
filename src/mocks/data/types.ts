export type Category = 'ONE_COLOR' | 'FRENCH' | 'GRADIENT' | 'ART';
export type Color =
  | 'WHITE'
  | 'BLACK'
  | 'BEIGE'
  | 'PINK'
  | 'YELLOW'
  | 'GREEN'
  | 'BLUE'
  | 'SILVER';
export type Shape = 'SQUARE' | 'ROUND' | 'ALMOND' | 'BALLERINA' | 'STILETTO';

export interface INailPreference {
  id: number;
  imageUrl: string;
  color: Color;
  shape: Shape;
  category: Category;
}

export interface IUser {
  onboardingProgress: number;
  refreshToken?: string;
  id: number;
  nickname?: string;
  profileImage?: string;
  preferredStyles: INailPreference[];
}

export interface INail {
  id: number;
  imageUrl: string;
  category: Category;
  color: Color;
  shape: Shape;
}

export interface INailSet {
  id: number;
  user?: IUser;
  thumb: INail;
  index: INail;
  middle: INail;
  ring: INail;
  pinky: INail;
  style: string[];
}

export interface IBanner {
  id: number;
  imageUrl: string;
  link: string;
}
