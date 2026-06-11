import { POWERUP_DEFS } from './constants.js'

export default function PowerupBar({ powerups, activePowerup, onActivate, disabled }) {
  return (
    <div className="powerup-bar">
      <span className="powerup-bar-label">Your power-ups</span>
      <div className="powerup-buttons">
        {Object.entries(POWERUP_DEFS).map(([key, def]) => {
          const count = powerups[key]
          const isActive = activePowerup === key
          const isEmpty = count === 0
          return (
            <button
              key={key}
              className={`powerup-btn${isActive ? ' powerup-btn--active' : ''}${isEmpty ? ' powerup-btn--spent' : ''}`}
              onClick={() => !disabled && !isEmpty && onActivate(isActive ? null : key)}
              disabled={disabled || isEmpty}
              title={def.desc}
            >
              <span className="powerup-icon">{def.icon}</span>
              <span className="powerup-name">{def.label}</span>
              <span className="powerup-count">{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
