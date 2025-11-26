import './Toolbar.css'

function Toolbar({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  minWordLength,
  setMinWordLength,
  minRepeats,
  setMinRepeats,
  caseSensitive,
  setCaseSensitive,
  onCopyAll
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo last change"
          title="Undo"
        >
          ↶ Undo
        </button>
        <button
          className="toolbar-button"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Redo last change"
          title="Redo"
        >
          ↷ Redo
        </button>
      </div>

      <div className="toolbar-group toolbar-sliders">
        <div className="toolbar-slider-group">
          <label htmlFor="min-length" className="toolbar-label">
            Min Length: {minWordLength}
          </label>
          <input
            id="min-length"
            type="range"
            min="1"
            max="20"
            value={minWordLength}
            onChange={(e) => setMinWordLength(Number(e.target.value))}
            className="toolbar-slider"
            aria-label="Minimum word length"
          />
        </div>

        <div className="toolbar-slider-group">
          <label htmlFor="min-repeats" className="toolbar-label">
            Min Repeats: {minRepeats}
          </label>
          <input
            id="min-repeats"
            type="range"
            min="2"
            max="20"
            value={minRepeats}
            onChange={(e) => setMinRepeats(Number(e.target.value))}
            className="toolbar-slider"
            aria-label="Minimum number of repeats"
          />
        </div>
      </div>

      <div className="toolbar-group">
        <button
          className={`toolbar-button ${caseSensitive ? 'active' : ''}`}
          onClick={() => setCaseSensitive(!caseSensitive)}
          aria-label={`Case sensitivity: ${caseSensitive ? 'on' : 'off'}`}
          title={`Case sensitivity: ${caseSensitive ? 'on' : 'off'}`}
        >
          Aa
        </button>
        <button
          className="toolbar-button toolbar-button-primary"
          onClick={onCopyAll}
          aria-label="Copy all text to clipboard"
          title="Copy All"
        >
          📋 Copy All
        </button>
      </div>
    </div>
  )
}

export default Toolbar

