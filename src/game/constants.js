export const SIZE_PRESETS = {
  small:    { rows: 5, cols: 6, label: 'Small',    desc: '5 × 6' },
  standard: { rows: 6, cols: 7, label: 'Standard', desc: '6 × 7 (classic)' },
  large:    { rows: 7, cols: 8, label: 'Large',     desc: '7 × 8' },
}

export const POWERUP_DEFS = {
  bomb:   { label: 'Bomb',   icon: '💣', desc: 'Remove any disc — discs above fall down' },
  strike: { label: 'Strike', icon: '⚡', desc: 'Drop two discs in one column' },
  snipe:  { label: 'Snipe',  icon: '🎯', desc: 'Place your disc anywhere on the board' },
}

export const INITIAL_POWERUPS = { bomb: 1, strike: 1, snipe: 1 }
