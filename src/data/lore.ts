/**
 * Lore snippets shown on the loading screen.
 *
 * Kept as data so they can be reordered, localised, or extended without
 * touching presentation code. A few are surfaced by the codex later.
 */

export interface LoreTip {
  id: string;
  text: string;
  /** Optional unlock gate — tips with an `after` id only appear once the
   *  player has seen the earlier one (keeps the beta's cold open mysterious). */
  after?: string;
}

export const LORE_TIPS: LoreTip[] = [
  {
    id: 'warden',
    text: 'The Warden who trusts the flame forgets the snow.',
  },
  {
    id: 'stone',
    text: 'A Waystone does not carry you. It asks. Only the answered may pass.',
  },
  {
    id: 'shattering',
    text: 'Two hundred years ago a king broke the Crownstone to keep himself from dying. The land has been falling ever since.',
  },
  {
    id: 'emberlight',
    text: 'Emberlight is not fire. Fire goes out.',
  },
  {
    id: 'order',
    text: 'The Order of Waywardens numbered four hundred. Their last roll call was signed by a man who no longer had a hand.',
  },
  {
    id: 'veil',
    text: 'The Shattering did not split the world. It folded it.',
  },
  {
    id: 'lantern',
    text: "Grandmother's lantern has never once been allowed to go out. She said that was the only rule of the Order.",
  },
  {
    id: 'goblin',
    text: 'Goblins are not born cruel. They are born hungry, and the Shattering took away the seasons that used to say no.',
  },
  {
    id: 'sigils',
    text: 'Thorn, Ember, Tide. Three sigils bind what the king broke. No warden alive remembers the fourth.',
  },
  {
    id: 'mire',
    text: 'Mirevale drowned on a single day. The water did not rise. It simply decided.',
  },
  {
    id: 'blue',
    text: 'Some stones answer in blue. Nobody in the Order wrote down what that means.',
  },
  {
    id: 'hollow',
    text: 'Vaughn the Hollow asked for nothing, in the end. That was always the frightening part.',
  },
  {
    id: 'fresh',
    text: 'If a new warden survives the winter, write it down. Someone should know we are still here.',
  },
  {
    id: 'emberwake',
    text: 'A promise kept past its own usefulness is no longer a promise. It is a habit.',
  },
];

/** Pick `count` tips without immediate repeats, biased toward early entries. */
export function pickTips(count: number, rng: () => number = Math.random): LoreTip[] {
  const pool = [...LORE_TIPS];
  const out: LoreTip[] = [];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}
