import { SIZE_PRESETS } from './constants.js'

export default function StartMenu({
  difficulty, onDifficultyChange,
  boardSizeKey, onBoardSizeChange,
  powerupsEnabled, onPowerupsToggle,
  onPlay,
}) {
  return (
    <div className="menu-wrapper">
      <div className="menu-discs">
        <div className="menu-disc menu-disc--human" />
        <div className="menu-disc menu-disc--ai" />
        <div className="menu-disc menu-disc--human" />
        <div className="menu-disc menu-disc--ai" />
      </div>

      <h1 className="game-title">Connect 4</h1>
      <p className="menu-subtitle">Drop your discs. Outsmart the AI.</p>

      <div className="menu-section">
        <p className="menu-section-label">Difficulty</p>
        <div className="diff-cards diff-cards--wrap">
          <button
            className={`diff-card${difficulty === 'beginner' ? ' diff-card--active' : ''}`}
            onClick={() => onDifficultyChange('beginner')}
          >
            <span className="diff-card-name">Beginner</span>
            <span className="diff-card-desc">Mostly random</span>
          </button>
          <button
            className={`diff-card${difficulty === 'easy' ? ' diff-card--active' : ''}`}
            onClick={() => onDifficultyChange('easy')}
          >
            <span className="diff-card-name">Easy</span>
            <span className="diff-card-desc">AI makes mistakes</span>
          </button>
          <button
            className={`diff-card${difficulty === 'medium' ? ' diff-card--active' : ''}`}
            onClick={() => onDifficultyChange('medium')}
          >
            <span className="diff-card-name">Medium</span>
            <span className="diff-card-desc">Solid opponent</span>
          </button>
          <button
            className={`diff-card${difficulty === 'hard' ? ' diff-card--active' : ''}`}
            onClick={() => onDifficultyChange('hard')}
          >
            <span className="diff-card-name">Hard</span>
            <span className="diff-card-desc">Plays near-perfect</span>
          </button>
          <button
            className={`diff-card diff-card--impossible${difficulty === 'impossible' ? ' diff-card--active' : ''}`}
            onClick={() => onDifficultyChange('impossible')}
          >
            <span className="diff-card-name">Impossible</span>
            <span className="diff-card-desc">You will not win</span>
          </button>
        </div>
      </div>

      <div className="menu-section">
        <p className="menu-section-label">Board Size</p>
        <div className="diff-cards diff-cards--wrap">
          {Object.entries(SIZE_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              className={`diff-card${boardSizeKey === key ? ' diff-card--active' : ''}`}
              onClick={() => onBoardSizeChange(key)}
            >
              <span className="diff-card-name">{preset.label}</span>
              <span className="diff-card-desc">{preset.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="menu-section">
        <p className="menu-section-label">Power-ups</p>
        <button
          className={`toggle-btn${powerupsEnabled ? ' toggle-btn--on' : ''}`}
          onClick={() => onPowerupsToggle(!powerupsEnabled)}
        >
          <span className="toggle-track"><span className="toggle-thumb" /></span>
          <span className="toggle-label">
            {powerupsEnabled ? 'Enabled — 💣 ⚡ 🎯 each player gets 1 of each' : 'Disabled — classic mode'}
          </span>
        </button>
      </div>

      <button className="play-btn" onClick={onPlay}>Play</button>
    </div>
  )
}
