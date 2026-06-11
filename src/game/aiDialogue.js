const DIALOGUE = {
  greeting: [
    "Let's see what you've got.",
    "I haven't lost yet. Statistically speaking.",
    "Interesting. A challenger.",
    "I'll give you the first move. Generously.",
    "I've analyzed every possible Connect 4 position. This should be quick.",
    "You seem optimistic. I respect that.",
  ],
  aiMoveTaunt: [
    "Hmm.",
    "Right where I planned.",
    "This is going well.",
    "Calculated.",
    "I can see the end from here.",
    "Patience.",
    "Interesting choice you made earlier.",
    "Straightforward.",
  ],
  aiWinning: [
    "I believe the technical term is 'inevitable.'",
    "You might want to start planning your next game.",
    "Do you see what I'm building here?",
    "I can count the moves remaining. Can you?",
    "This is going exactly as I predicted.",
    "The position speaks for itself.",
  ],
  humanThreat: [
    "Oh. You noticed that.",
    "Resourceful.",
    "That was... not expected.",
    "Fine. I'll allow it. For now.",
    "A real move.",
    "Hm. You're paying attention.",
    "Interesting. Recalculating.",
  ],
  aiUsedBomb: [
    "Boom. Problem solved.",
    "That disc? Gone.",
    "Removed. Efficiently.",
    "I prefer a cleaner board.",
    "You won't miss it.",
  ],
  aiUsedStrike: [
    "Two discs. Because one wasn't enough.",
    "Double drop. Efficiency is my strength.",
    "I placed twice. Try to keep up.",
    "Strike.",
  ],
  aiUsedSnipe: [
    "Gravity is a suggestion.",
    "Exactly where I wanted it.",
    "Precision placement.",
    "Any cell. Any time.",
    "I put it exactly there on purpose.",
  ],
  humanUsedPowerup: [
    "Bold move.",
    "Interesting.",
    "A power-up? Smart.",
    "Using resources early. Noted.",
    "Adaptive. I see.",
  ],
  aiWins: [
    "Calculated. Every move.",
    "I predicted this 6 turns ago.",
    "Game over. As expected.",
    "You played well. For a human.",
    "I win. Shocking, I know.",
    "Four in a row. Efficient.",
  ],
  humanWins: [
    "...I was testing you.",
    "Beginner's luck. Statistically.",
    "You caught me on a bad cycle.",
    "That shouldn't have happened.",
    "Well played. I'll remember this.",
    "Impressive. I'm not impressed, but impressive.",
    "Hm. Better than my model predicted.",
  ],
  draw: [
    "A draw. We are equally matched. Unsettling.",
    "Nobody wins. Curious outcome.",
    "A perfect stalemate. I accept this. Reluctantly.",
    "Hm. My calculations suggested otherwise.",
  ],
}

export function pickLine(category) {
  const lines = DIALOGUE[category]
  if (!lines?.length) return ''
  return lines[Math.floor(Math.random() * lines.length)]
}
