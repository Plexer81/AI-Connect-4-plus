import { useState, useEffect } from 'react'
import Cell from './Cell.jsx'
import StartMenu from './StartMenu.jsx'
import PowerupBar from './PowerupBar.jsx'
import AIChat from './AIChat.jsx'
import { HUMAN, AI, dropDisc, checkWin, checkWinFull, checkDraw, removeDisk, placeDiscAt, getMaxLineAt } from './gameLogic.js'
import { getBestMove, getAIPowerupAction } from './ai.js'
import { SIZE_PRESETS, INITIAL_POWERUPS } from './constants.js'
import { pickLine } from './aiDialogue.js'

function makeBoard(sizeKey) {
  const { rows, cols } = SIZE_PRESETS[sizeKey]
  return Array.from({ length: rows }, () => Array(cols).fill(0))
}

export default function Game() {
  const [screen, setScreen] = useState('menu')
  const [boardSizeKey, setBoardSizeKey] = useState('standard')
  const [board, setBoard] = useState(() => makeBoard('standard'))
  const [currentPlayer, setCurrentPlayer] = useState(HUMAN)
  const [gameStatus, setGameStatus] = useState('idle')
  const [winner, setWinner] = useState(null)
  const [difficulty, setDifficulty] = useState('medium')
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [lastMove, setLastMove] = useState(null)
  const [powerupsEnabled, setPowerupsEnabled] = useState(true)
  const [humanPowerups, setHumanPowerups] = useState({ ...INITIAL_POWERUPS })
  const [aiPowerups, setAiPowerups] = useState({ ...INITIAL_POWERUPS })
  const [activePowerup, setActivePowerup] = useState(null)
  const [aiMessage, setAiMessage] = useState(null) // { text, key }

  // Auto-clear dialogue after 4.5s (matches CSS animation)
  useEffect(() => {
    if (!aiMessage) return
    const t = setTimeout(() => setAiMessage(null), 4500)
    return () => clearTimeout(t)
  }, [aiMessage?.key])

  // Greeting when the game screen first appears
  useEffect(() => {
    if (screen !== 'game') return
    const t = setTimeout(() => setAiMessage({ text: pickLine('greeting'), key: Date.now() }), 700)
    return () => clearTimeout(t)
  }, [screen])

  function showAIMessage(category) {
    setAiMessage({ text: pickLine(category), key: Date.now() })
  }

  useEffect(() => {
    if (currentPlayer !== AI || gameStatus !== 'playing') return

    setIsAIThinking(true)
    const timer = setTimeout(() => {
      // Try a powerup first if enabled
      if (powerupsEnabled) {
        const action = getAIPowerupAction(board, aiPowerups, difficulty)
        if (action) {
          setAiPowerups(p => ({ ...p, [action.type]: p[action.type] - 1 }))

          if (action.type === 'bomb') {
            showAIMessage('aiUsedBomb')
            const newBoard = removeDisk(board, action.row, action.col)
            setLastMove(null)
            endTurn(newBoard, true)
            return
          }

          if (action.type === 'snipe') {
            showAIMessage('aiUsedSnipe')
            const newBoard = placeDiscAt(board, action.row, action.col, AI)
            setLastMove({ row: action.row, col: action.col })
            if (checkWin(newBoard, action.row, action.col, AI)) {
              showAIMessage('aiWins')
              setBoard(newBoard); setGameStatus('win'); setWinner(AI)
              setIsAIThinking(false); return
            }
            endTurn(newBoard, false)
            return
          }

          if (action.type === 'strike') {
            showAIMessage('aiUsedStrike')
            const r1 = dropDisc(board, action.col, AI)
            if (r1) {
              if (checkWin(r1.newBoard, r1.row, action.col, AI)) {
                showAIMessage('aiWins')
                setLastMove({ row: r1.row, col: action.col })
                setBoard(r1.newBoard); setGameStatus('win'); setWinner(AI)
                setIsAIThinking(false); return
              }
              const r2 = dropDisc(r1.newBoard, action.col, AI)
              const finalBoard = r2 ? r2.newBoard : r1.newBoard
              setLastMove({ row: (r2 ?? r1).row, col: action.col })
              if (r2 && checkWin(finalBoard, r2.row, action.col, AI)) {
                showAIMessage('aiWins')
                setBoard(finalBoard); setGameStatus('win'); setWinner(AI)
                setIsAIThinking(false); return
              }
              endTurn(finalBoard, false)
              return
            }
          }
        }
      }

      // Regular move
      const bestCol = getBestMove(board, difficulty)
      const result = dropDisc(board, bestCol, AI)
      if (!result) { setIsAIThinking(false); return }
      setLastMove({ row: result.row, col: bestCol })

      if (checkWin(result.newBoard, result.row, bestCol, AI)) {
        showAIMessage('aiWins')
        setBoard(result.newBoard); setGameStatus('win'); setWinner(AI)
        setIsAIThinking(false); return
      }

      // Contextual post-move comment
      const lineLen = getMaxLineAt(result.newBoard, result.row, bestCol, AI)
      if (lineLen >= 3 && Math.random() < 0.65) {
        showAIMessage('aiWinning')
      } else if (Math.random() < 0.28) {
        showAIMessage('aiMoveTaunt')
      }

      endTurn(result.newBoard, false)
    }, 600)

    return () => clearTimeout(timer)
  }, [currentPlayer, gameStatus, board, difficulty, powerupsEnabled, aiPowerups])

  function endTurn(newBoard, needsFullWinCheck) {
    if (needsFullWinCheck) {
      if (checkWinFull(newBoard, HUMAN)) {
        showAIMessage('humanWins')
        setBoard(newBoard); setGameStatus('win'); setWinner(HUMAN)
        setIsAIThinking(false); return
      }
      if (checkWinFull(newBoard, AI)) {
        showAIMessage('aiWins')
        setBoard(newBoard); setGameStatus('win'); setWinner(AI)
        setIsAIThinking(false); return
      }
    }
    if (checkDraw(newBoard)) {
      showAIMessage('draw')
      setBoard(newBoard); setGameStatus('draw')
    } else {
      setBoard(newBoard); setCurrentPlayer(HUMAN)
    }
    setIsAIThinking(false)
  }

  function resetGame(sizeKey = boardSizeKey) {
    setBoard(makeBoard(sizeKey))
    setCurrentPlayer(HUMAN)
    setGameStatus('idle')
    setWinner(null)
    setIsAIThinking(false)
    setLastMove(null)
    setActivePowerup(null)
    setAiMessage(null)
    setHumanPowerups({ ...INITIAL_POWERUPS })
    setAiPowerups({ ...INITIAL_POWERUPS })
  }

  function handlePlay() { resetGame(); setScreen('game') }
  function handlePlayAgain() { resetGame() }
  function handleBackToMenu() { resetGame(); setScreen('menu') }
  function handleBoardSizeChange(key) { setBoardSizeKey(key); resetGame(key) }

  function handleColumnClick(col) {
    if (isAIThinking || gameStatus === 'win' || gameStatus === 'draw') return
    if (currentPlayer !== HUMAN) return
    if (activePowerup === 'bomb' || activePowerup === 'snipe') return

    if (activePowerup === 'strike') {
      const r1 = dropDisc(board, col, HUMAN)
      if (!r1) return
      setHumanPowerups(p => ({ ...p, strike: p.strike - 1 }))
      setActivePowerup(null)
      if (Math.random() < 0.6) showAIMessage('humanUsedPowerup')
      if (checkWin(r1.newBoard, r1.row, col, HUMAN)) {
        setLastMove({ row: r1.row, col })
        setBoard(r1.newBoard); setGameStatus('win'); setWinner(HUMAN); return
      }
      const r2 = dropDisc(r1.newBoard, col, HUMAN)
      const finalBoard = r2 ? r2.newBoard : r1.newBoard
      setLastMove({ row: (r2 ?? r1).row, col })
      if (r2 && checkWin(finalBoard, r2.row, col, HUMAN)) {
        showAIMessage('humanWins')
        setBoard(finalBoard); setGameStatus('win'); setWinner(HUMAN); return
      }
      if (checkDraw(finalBoard)) {
        showAIMessage('draw')
        setBoard(finalBoard); setGameStatus('draw')
      } else {
        setBoard(finalBoard); setGameStatus('playing'); setCurrentPlayer(AI)
      }
      return
    }

    // Normal drop
    const result = dropDisc(board, col, HUMAN)
    if (!result) return
    setLastMove({ row: result.row, col })

    if (checkWin(result.newBoard, result.row, col, HUMAN)) {
      showAIMessage('humanWins')
      setBoard(result.newBoard); setGameStatus('win'); setWinner(HUMAN)
    } else if (checkDraw(result.newBoard)) {
      showAIMessage('draw')
      setBoard(result.newBoard); setGameStatus('draw')
    } else {
      // React to a threatening human move
      const lineLen = getMaxLineAt(result.newBoard, result.row, col, HUMAN)
      if (lineLen >= 3 && Math.random() < 0.65) showAIMessage('humanThreat')
      setBoard(result.newBoard); setGameStatus('playing'); setCurrentPlayer(AI)
    }
  }

  function handleCellClick(row, col) {
    if (isAIThinking || gameStatus === 'win' || gameStatus === 'draw') return
    if (currentPlayer !== HUMAN) return

    if (activePowerup === 'bomb' && board[row][col] !== 0) {
      const newBoard = removeDisk(board, row, col)
      setHumanPowerups(p => ({ ...p, bomb: p.bomb - 1 }))
      setActivePowerup(null)
      setLastMove(null)
      if (Math.random() < 0.6) showAIMessage('humanUsedPowerup')
      if (checkWinFull(newBoard, HUMAN)) {
        showAIMessage('humanWins')
        setBoard(newBoard); setGameStatus('win'); setWinner(HUMAN); return
      }
      if (checkWinFull(newBoard, AI)) {
        showAIMessage('aiWins')
        setBoard(newBoard); setGameStatus('win'); setWinner(AI); return
      }
      if (checkDraw(newBoard)) {
        showAIMessage('draw')
        setBoard(newBoard); setGameStatus('draw')
      } else {
        setBoard(newBoard); setGameStatus('playing'); setCurrentPlayer(AI)
      }
      return
    }

    if (activePowerup === 'snipe' && board[row][col] === 0) {
      const newBoard = placeDiscAt(board, row, col, HUMAN)
      setHumanPowerups(p => ({ ...p, snipe: p.snipe - 1 }))
      setActivePowerup(null)
      setLastMove({ row, col })
      if (Math.random() < 0.6) showAIMessage('humanUsedPowerup')
      if (checkWin(newBoard, row, col, HUMAN)) {
        showAIMessage('humanWins')
        setBoard(newBoard); setGameStatus('win'); setWinner(HUMAN)
      } else if (checkDraw(newBoard)) {
        showAIMessage('draw')
        setBoard(newBoard); setGameStatus('draw')
      } else {
        setBoard(newBoard); setGameStatus('playing'); setCurrentPlayer(AI)
      }
      return
    }
  }

  if (screen === 'menu') {
    return (
      <StartMenu
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        boardSizeKey={boardSizeKey}
        onBoardSizeChange={handleBoardSizeChange}
        powerupsEnabled={powerupsEnabled}
        onPowerupsToggle={setPowerupsEnabled}
        onPlay={handlePlay}
      />
    )
  }

  const isOver = gameStatus === 'win' || gameStatus === 'draw'
  const boardInteractive = !isOver && !isAIThinking && currentPlayer === HUMAN
  const colClickable = boardInteractive && activePowerup !== 'bomb' && activePowerup !== 'snipe'

  const statusText =
    isOver
      ? gameStatus === 'draw' ? "It's a draw!" : winner === HUMAN ? 'You win!' : 'AI wins!'
      : isAIThinking
      ? 'AI is thinking…'
      : activePowerup === 'bomb'
      ? '💣 Click any disc to remove it'
      : activePowerup === 'snipe'
      ? '🎯 Click any empty cell to place your disc'
      : activePowerup === 'strike'
      ? '⚡ Click a column to drop twice'
      : gameStatus === 'idle'
      ? 'Your turn — click a column'
      : 'Your turn'

  const statusClass =
    gameStatus === 'win'
      ? winner === HUMAN ? 'status-bar status-bar--win-human' : 'status-bar status-bar--win-ai'
      : isAIThinking
      ? 'status-bar status-bar--thinking'
      : gameStatus === 'draw'
      ? 'status-bar status-bar--draw'
      : activePowerup
      ? 'status-bar status-bar--powerup'
      : 'status-bar'

  const playerColor = currentPlayer === HUMAN ? 'var(--human)' : 'var(--ai)'
  const numCols = board[0].length
  const numRows = board.length

  function getCellHighlight(row, col) {
    if (!boardInteractive) return null
    if (activePowerup === 'bomb' && board[row][col] !== 0) return 'bomb'
    if (activePowerup === 'snipe' && board[row][col] === 0) return 'snipe'
    return null
  }

  function getCellOnClick(row, col) {
    const hl = getCellHighlight(row, col)
    return hl ? () => handleCellClick(row, col) : undefined
  }

  return (
    <div className="game-wrapper">
      <div className="game-topbar">
        <button className="menu-btn" onClick={handleBackToMenu}>← Menu</button>
        <h1 className="game-title game-title--small">Connect 4</h1>
        <button className="reset-btn" onClick={handlePlayAgain}>New Game</button>
      </div>

      <div className={statusClass}>{statusText}</div>

      <div className="ai-chat-area">
        {aiMessage && <AIChat key={aiMessage.key} text={aiMessage.text} />}
      </div>

      {powerupsEnabled && !isOver && (
        <PowerupBar
          powerups={humanPowerups}
          activePowerup={activePowerup}
          onActivate={key => setActivePowerup(key)}
          disabled={!boardInteractive}
        />
      )}

      <div className="board-container">
        <div
          className={`board${activePowerup === 'bomb' ? ' board--bomb-mode' : activePowerup === 'snipe' ? ' board--snipe-mode' : ''}`}
          style={{ '--current-player-color': playerColor, '--board-cols': numCols }}
        >
          {Array.from({ length: numCols }, (_, col) => (
            <div
              key={col}
              className={`col${colClickable ? ' col--active' : ''}`}
              onClick={() => handleColumnClick(col)}
            >
              {Array.from({ length: numRows }, (_, row) => (
                <Cell
                  key={row}
                  value={board[row][col]}
                  isDropping={lastMove?.row === row && lastMove?.col === col}
                  dropRow={row}
                  highlight={getCellHighlight(row, col)}
                  onClick={getCellOnClick(row, col)}
                />
              ))}
            </div>
          ))}
        </div>

        {isOver && (
          <div className="result-overlay">
            <div className="result-card">
              <div className={`result-disc-row${winner === HUMAN ? ' result-disc-row--human' : winner === AI ? ' result-disc-row--ai' : ''}`}>
                <div className="result-disc" /><div className="result-disc" />
                <div className="result-disc" /><div className="result-disc" />
              </div>
              <p className="result-text">
                {gameStatus === 'draw' ? "It's a draw!" : winner === HUMAN ? 'You win!' : 'AI wins!'}
              </p>
              <p className="result-sub">
                {gameStatus === 'draw' ? 'Nobody wins this round.' : winner === HUMAN ? 'Nice move, human.' : 'The AI got you this time.'}
              </p>
              <div className="result-actions">
                <button className="play-btn play-btn--sm" onClick={handlePlayAgain}>Play Again</button>
                <button className="menu-btn-lg" onClick={handleBackToMenu}>Main Menu</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
