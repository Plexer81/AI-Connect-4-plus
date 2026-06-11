export const EMPTY = 0
export const HUMAN = 1
export const AI = 2

export function getAvailableRow(board, col) {
  for (let row = board.length - 1; row >= 0; row--) {
    if (board[row][col] === EMPTY) return row
  }
  return null
}

export function dropDisc(board, col, player) {
  const row = getAvailableRow(board, col)
  if (row === null) return null
  const newBoard = board.map(r => [...r])
  newBoard[row][col] = player
  return { newBoard, row }
}

export function getAvailableCols(board) {
  const cols = []
  for (let col = 0; col < board[0].length; col++) {
    if (getAvailableRow(board, col) !== null) cols.push(col)
  }
  return cols
}

function countDirection(board, row, col, dRow, dCol, player) {
  const rows = board.length
  const cols = board[0].length
  let count = 0
  let r = row + dRow
  let c = col + dCol
  while (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === player) {
    count++
    r += dRow
    c += dCol
  }
  return count
}

export function checkWin(board, lastRow, lastCol, player) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (const [dRow, dCol] of directions) {
    const count =
      1 +
      countDirection(board, lastRow, lastCol, dRow, dCol, player) +
      countDirection(board, lastRow, lastCol, -dRow, -dCol, player)
    if (count >= 4) return true
  }
  return false
}

export function checkWinFull(board, player) {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (board[row][col] === player && checkWin(board, row, col, player)) return true
    }
  }
  return false
}

export function checkDraw(board) {
  return board[0].every(cell => cell !== EMPTY)
}

// Power-up: remove disc at (row, col) and apply gravity (discs above fall down)
export function removeDisk(board, row, col) {
  const newBoard = board.map(r => [...r])
  for (let r = row; r > 0; r--) {
    newBoard[r][col] = newBoard[r - 1][col]
  }
  newBoard[0][col] = EMPTY
  return newBoard
}

// Power-up: place disc at exact (row, col), ignoring gravity
export function placeDiscAt(board, row, col, player) {
  const newBoard = board.map(r => [...r])
  newBoard[row][col] = player
  return newBoard
}

// Returns the length of the longest line through a given cell
export function getMaxLineAt(board, row, col, player) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]
  let max = 0
  for (const [dRow, dCol] of directions) {
    const count = 1 + countDirection(board, row, col, dRow, dCol, player) + countDirection(board, row, col, -dRow, -dCol, player)
    max = Math.max(max, count)
  }
  return max
}
