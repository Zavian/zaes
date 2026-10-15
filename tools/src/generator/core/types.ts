// A card exactly as it is stored in a save file. Unknown keys are preserved on round-trip
// so files written by the original generator (or newer versions) are never lossy.
export interface Card {
  count: number;
  title: string;
  title_size?: string;
  color?: string;
  color_front?: string;
  color_back?: string;
  icon?: string;
  icon_front?: string;
  icon_back?: string;
  background_image?: string;
  contents: string[];
  back_contents: string[];
  tags: string[];
  background_text_toggle?: boolean;
  [extra: string]: unknown;
}

export type CardSize = '225x35' | '25x35' | '30x50' | '35x50' | '75x50' | '29x29' | 'custom';

// Deck-wide settings. These live in local storage, not in the save file (the save file is a plain card array).
export interface DeckOptions {
  card_size: CardSize;
  custom_width: number; // inches, used when card_size === 'custom'
  custom_height: number;
  rounded_corners: boolean;
  icon_inline: boolean;
  default_color: string;
  default_icon: string;
  default_title_size: string;
  foreground_color: string;
  background_color: string;
}

export const DEFAULT_OPTIONS: DeckOptions = {
  card_size: '35x50',
  custom_width: 2.5,
  custom_height: 3.5,
  rounded_corners: true,
  icon_inline: true,
  default_color: 'black',
  default_icon: 'ace',
  default_title_size: '13',
  foreground_color: 'white',
  background_color: 'white',
};

export const CARD_SIZES: { value: CardSize; label: string }[] = [
  { value: '225x35', label: '2.25" × 3.5" (Bridge)' },
  { value: '25x35', label: '2.5" × 3.5" (Poker)' },
  { value: '30x50', label: '3.0" × 5.0"' },
  { value: '35x50', label: '3.5" × 5.0" (Default)' },
  { value: '75x50', label: '7.5" × 5.0"' },
  { value: '29x29', label: '2.9" × 2.9"' },
  { value: 'custom', label: 'Custom size' },
];

export const TITLE_SIZES = ['16', '15', '14', '13', '12', '11', '10'];
