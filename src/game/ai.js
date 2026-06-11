import {
  EMPTY, HUMAN, AI,
  getAvailableCols, dropDisc, checkWin, checkDraw,
  placeDiscAt, removeDisk, getMaxLineAt,
} from './gameLogic.js'

const DIFFICULTY = {
  easy:   { depth: 2, noise: 0.4 },
  medium: { depth: 4, noise: 0.0 },
}

function getMoveOrder(cols) {
  const center = Math.floor(cols / 2)
  const order = [center]
  for (let i = 1; i <= Math.max(center, cols - 1 - center); i++) {
    if (center - i >= 0) order.push(center - i)
    if (center + i < cols) order.push(center + i)
  }
  return order
}

function scoreWindow(window, player) {
  const opponent = player === AI ? HUMAN : AI
  const playerCount = window.filter(c => c === player).length
  const opponentCount = window.filter(c => c === opponent).length
  const emptyCount = window.filter(c => c === EMPTY).length

  if (playerCount === 4) return 1000
  if (playerCount === 3 && emptyCount === 1) return 50
  if (playerCount === 2 && emptyCount === 2) return 10
  if (opponentCount === 3 && emptyCount === 1) return -80
  return 0
}

function scoreBoard(board, player) {
  const rows = board.length
  const cols = board[0].length
  const center = Math.floor(cols / 2)
  let score = 0

  for (let row = 0; row < rows; row++) {
    if (board[row][center] === player) score += 6
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col <= cols - 4; col++) {
      const w = [board[row][col], board[row][col+1], board[row][col+2], board[row][col+3]]
      score += scoreWindow(w, player)
    }
  }

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row <= rows - 4; row++) {
      const w = [board[row][col], board[row+1][col], board[row+2][col], board[row+3][col]]
      score += scoreWindow(w, player)
    }
  }

  for (let row = 0; row <= rows - 4; row++) {
    for (let col = 0; col <= cols - 4; col++) {
      const w = [board[row][col], board[row+1][col+1], board[row+2][col+2], board[row+3][col+3]]
      score += scoreWindow(w, player)
    }
  }

  for (let row = 0; row <= rows - 4; row++) {
    for (let col = 3; col < cols; col++) {
      const w = [board[row][col], board[row+1][col-1], board[row+2][col-2], board[row+3][col-3]]
      score += scoreWindow(w, player)
    }
  }

  return score
}

function minimax(board, depth, alpha, beta, isMaximizing, lastRow, lastCol) {
  if (lastRow !== null) {
    if (checkWin(board, lastRow, lastCol, AI))    return 10000 + depth
    if (checkWin(board, lastRow, lastCol, HUMAN)) return -10000 - depth
  }
  if (checkDraw(board)) return 0
  if (depth === 0) return scoreBoard(board, AI)

  const moveOrder = getMoveOrder(board[0].length)
  const available = getAvailableCols(board)
  const orderedCols = moveOrder.filter(col => available.includes(col))

  if (isMaximizing) {
    let best = -Infinity
    for (const col of orderedCols) {
      const result = dropDisc(board, col, AI)
      if (!result) continue
      const val = minimax(result.newBoard, depth - 1, alpha, beta, false, result.row, col)
      best = Math.max(best, val)
      alpha = Math.max(alpha, val)
      if (alpha >= beta) break
    }
    return best
  } else {
    let best = Infinity
    for (const col of orderedCols) {
      const result = dropDisc(board, col, HUMAN)
      if (!result) continue
      const val = minimax(result.newBoard, depth - 1, alpha, beta, true, result.row, col)
      best = Math.min(best, val)
      beta = Math.min(beta, val)
      if (alpha >= beta) break
    }
    return best
  }
}

export function getBestMove(board, difficulty) {
  const { depth, noise } = DIFFICULTY[difficulty]
  const availableCols = getAvailableCols(board)

  if (noise > 0 && Math.random() < noise) {
    return availableCols[Math.floor(Math.random() * availableCols.length)]
  }

  const orderedCols = getMoveOrder(board[0].length).filter(col => availableCols.includes(col))
  let bestScore = -Infinity
  let bestCol = orderedCols[0]

  for (const col of orderedCols) {
    const result = dropDisc(board, col, AI)
    if (!result) continue
    const score = minimax(result.newBoard, depth - 1, -Infinity, Infinity, false, result.row, col)
    if (score > bestScore) {
      bestScore = score
      bestCol = col
    }
  }

  return bestCol
}

// Returns a powerup action for the AI or null if none should be used
export function getAIPowerupAction(board, aiPowerups, difficulty) {
  // Snipe: instant win anywhere on the board
  if (aiPowerups.snipe > 0) {
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[0].length; col++) {
        if (board[row][col] === EMPTY) {
          const testBoard = placeDiscAt(board, row, col, AI)
          if (checkWin(testBoard, row, col, AI)) {
            return { type: 'snipe', row, col }
          }
        }
      }
    }
  }

  // Bomb: remove most dangerous human disc (line length >= 3)
  if (aiPowerups.bomb > 0) {
    let bestTarget = null
    let bestThreat = 0
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[0].length; col++) {
        if (board[row][col] === HUMAN) {
          const threat = getMaxLineAt(board, row, col, HUMAN)
          if (threat > bestThreat) {
            bestThreat = threat
            bestTarget = { row, col }
          }
        }
      }
    }
    if (bestThreat >= 3 && bestTarget) {
      return { type: 'bomb', ...bestTarget }
    }
  }

  // Strike: use if AI has >= 2 discs in its best column
  if (aiPowerups.strike > 0) {
    const available = getAvailableCols(board)
    if (available.length > 0) {
      const bestCol = getBestMove(board, difficulty)
      let aiInCol = 0
      for (let row = 0; row < board.length; row++) {
        if (board[row][bestCol] === AI) aiInCol++
      }
      if (aiInCol >= 2) {
        return { type: 'strike', col: bestCol }
      }
    }
  }

  return null
}
