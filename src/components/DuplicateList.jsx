import './DuplicateList.css'

function DuplicateList({ duplicates, activeHighlights, onToggleHighlight, duplicateColors }) {
  if (duplicates.length === 0) {
    return (
      <div className="duplicate-list">
        <h2 className="duplicate-list-title">Duplicate Words</h2>
        <div className="duplicate-list-empty">
          <p>No duplicate words found.</p>
          <p className="duplicate-list-empty-hint">
            Words will appear here when they appear multiple times in your text.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="duplicate-list">
      <h2 className="duplicate-list-title">
        Duplicate Words ({duplicates.length})
      </h2>
      <div className="duplicate-list-content">
        {duplicates.map((dup, index) => {
          // If activeHighlights is empty, all are active by default
          // Otherwise, check if this word is in the set
          const isActive = activeHighlights.size === 0 || activeHighlights.has(dup.word)
          const colorIndex = index % duplicateColors.length
          const highlightColor = duplicateColors[colorIndex]
          
          return (
            <button
              key={dup.word}
              className={`duplicate-item ${isActive ? 'active' : 'inactive'}`}
              onClick={() => onToggleHighlight(dup.word)}
              aria-label={`Toggle highlight for "${dup.word}" (${dup.count} occurrences)`}
              style={isActive ? {
                borderLeftColor: highlightColor,
                borderLeftWidth: '4px',
                borderLeftStyle: 'solid'
              } : {}}
            >
              <span 
                className="duplicate-word-color-indicator"
                style={{ backgroundColor: highlightColor }}
              />
              <span className="duplicate-word">{dup.word}</span>
              <span className="duplicate-count">{dup.count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default DuplicateList

