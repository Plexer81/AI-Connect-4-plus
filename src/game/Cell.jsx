export default function Cell({ value, isDropping, dropRow, highlight, onClick }) {
  const cls = value === 1 ? 'cell--human' : value === 2 ? 'cell--ai' : 'cell--empty'
  const highlightCls = highlight ? ` cell--hl-${highlight}` : ''
  return (
    <div
      className={`cell ${cls}${isDropping ? ' cell--dropping' : ''}${highlightCls}`}
      style={isDropping ? { '--drop-row': dropRow } : undefined}
      onClick={onClick}
    />
  )
}
