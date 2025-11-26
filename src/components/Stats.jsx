import './Stats.css'

function Stats({ wordCount, charCount }) {
  return (
    <div className="stats">
      <span className="stat-item">
        <span className="stat-label">Words:</span>
        <span className="stat-value">{wordCount}</span>
      </span>
      <span className="stat-item">
        <span className="stat-label">Characters:</span>
        <span className="stat-value">{charCount}</span>
      </span>
    </div>
  )
}

export default Stats

