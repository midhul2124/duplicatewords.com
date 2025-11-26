import { useState, useMemo } from 'react'
import './WordFrequencyChart.css'

function WordFrequencyChart({ duplicates, activeHighlights, onToggleHighlight, onSelectAll, onDeselectAll }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('count') // 'count', 'alphabetical', 'length'
  const [groupByCount, setGroupByCount] = useState(true)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false) // Mobile toggle
  const compactMode = true // Always compact mode

  // Filter duplicates based on search query
  const filteredDuplicates = useMemo(() => {
    if (!searchQuery.trim()) return duplicates
    
    const query = searchQuery.toLowerCase()
    return duplicates.filter(dup => 
      dup.word.toLowerCase().includes(query)
    )
  }, [duplicates, searchQuery])

  // Sort filtered duplicates
  const sortedDuplicates = useMemo(() => {
    const sorted = [...filteredDuplicates]
    
    if (sortBy === 'count') {
      // Already sorted by count (descending), then alphabetically
      return sorted
    } else if (sortBy === 'alphabetical') {
      return sorted.sort((a, b) => a.word.localeCompare(b.word))
    } else if (sortBy === 'length') {
      return sorted.sort((a, b) => {
        if (b.word.length !== a.word.length) return b.word.length - a.word.length
        return a.word.localeCompare(b.word)
      })
    }
    
    return sorted
  }, [filteredDuplicates, sortBy])

  // Group by count if enabled
  const groupedDuplicates = useMemo(() => {
    if (!groupByCount) {
      return [{ count: null, words: sortedDuplicates }]
    }

    const groups = new Map()
    sortedDuplicates.forEach(dup => {
      if (!groups.has(dup.count)) {
        groups.set(dup.count, [])
      }
      groups.get(dup.count).push(dup)
    })

    // Convert to array and sort by count (descending)
    return Array.from(groups.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([count, words]) => ({ count, words }))
  }, [sortedDuplicates, groupByCount])


  if (!duplicates || duplicates.length === 0) {
    return (
      <div className="word-frequency-chart">
        <h2 className="chart-title">Duplicate Words</h2>
        <div className="chart-empty">
          <p>No duplicate words found.</p>
          <p className="chart-empty-hint">
            Words will appear here when they appear multiple times in your text.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`word-frequency-chart ${compactMode ? 'compact' : ''}`}>
      <div className="chart-header">
        <h2 className="chart-title">
          Duplicate Words ({filteredDuplicates.length})
        </h2>
        
        {/* Settings gear - mobile only, top right */}
        <button
          className="chart-mobile-settings-toggle"
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          aria-label="Toggle advanced options"
          title="Advanced options"
        >
          {showAdvancedOptions ? '▼' : '⚙️'}
        </button>
        
        <div className="chart-controls">

          <div className={`chart-advanced-options ${showAdvancedOptions ? 'visible' : ''}`}>
            <div className="chart-search">
              <input
                type="text"
                placeholder="Search words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="chart-search-input"
              />
            </div>
            
            <div className="chart-actions">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="chart-sort-select"
                aria-label="Sort by"
              >
                <option value="count">Sort: Count</option>
                <option value="alphabetical">Sort: A-Z</option>
                <option value="length">Sort: Length</option>
              </select>
              
              <button
                onClick={() => setGroupByCount(!groupByCount)}
                className={`chart-toggle-btn ${groupByCount ? 'active' : ''}`}
                title="Group by count"
                aria-label="Toggle group by count"
              >
                📊
              </button>
            </div>
          </div>

          {duplicates.length > 0 && (
            <div className={`chart-quick-actions ${showAdvancedOptions ? 'visible' : ''}`}>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (onSelectAll) {
                    onSelectAll()
                  }
                }}
                className="chart-quick-action-btn"
                disabled={activeHighlights.size === 0}
                title="Show all highlights"
                type="button"
              >
                Select All
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (onDeselectAll) {
                    onDeselectAll()
                  }
                }}
                className="chart-quick-action-btn"
                disabled={activeHighlights.size === duplicates.length}
                title="Hide all highlights"
                type="button"
              >
                Deselect All
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="chart-content">
        {filteredDuplicates.length === 0 ? (
          <div className="chart-empty">
            <p>No words match "{searchQuery}"</p>
          </div>
        ) : (
          groupedDuplicates.map((group, groupIndex) => (
            <div key={groupIndex} className="chart-group">
              {groupByCount && group.count !== null && (
                <div className="chart-group-header">
                  {group.count} {group.count === 1 ? 'occurrence' : 'occurrences'}
                </div>
              )}
              {group.words.map((dup) => {
                // activeHighlights Set contains words that should be HIDDEN
                // Empty set = all shown, words in set = hidden
                const isActive = activeHighlights.size === 0 || !activeHighlights.has(dup.word)
                
                return (
                  <button
                    key={dup.word}
                    className={`chart-bar-container ${isActive ? 'active' : 'inactive'}`}
                    onClick={() => onToggleHighlight(dup.word)}
                    aria-label={`Toggle highlight for "${dup.word}" (${dup.count} occurrences)`}
                    style={isActive ? {
                      borderLeftColor: dup.color || '#4a9eff',
                      borderLeftWidth: '4px',
                      borderLeftStyle: 'solid'
                    } : {}}
                  >
                    <div className="chart-bar-label">
                      <span 
                        className="chart-word-color-indicator"
                        style={{ backgroundColor: dup.color || '#4a9eff' }}
                      />
                      <span className="chart-word">{dup.word}</span>
                    </div>
                    {!groupByCount && <span className="chart-count">{dup.count}</span>}
                  </button>
                )
              })}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default WordFrequencyChart
