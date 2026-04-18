export type Series = 'original' | 'nocturne';

export interface Character {
  id: string;
  name: string;
  faction: string;
  description: string;
  wikiUrl: string;
  imageUrl: string;
  objectPosition?: string;
  thirstCount: number;
  series: Series;
}

export type CharacterInput = Omit<Character, 'id'>;
