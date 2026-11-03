export type SuggestionDescriptionPart =
  | { kind: 'text'; text: string }
  | { kind: 'link'; label: string; href: string }

export const CHANGE_SIZE_COLORS = {
  easy: '#14866d',
  medium: '#a66200',
  hard: '#bf3c2c',
} as const
