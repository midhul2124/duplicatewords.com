import { useState, useEffect, useCallback, useRef } from 'react'
import TextEditor from './components/TextEditor'
import Toolbar from './components/Toolbar'
import Stats from './components/Stats'
import WordFrequencyChart from './components/WordFrequencyChart'
import './App.css'

function App() {
  const [text, setText] = useState('')
  const [duplicates, setDuplicates] = useState([])
  const [minWordLength, setMinWordLength] = useState(4)
  const [minRepeats, setMinRepeats] = useState(2)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [activeHighlights, setActiveHighlights] = useState(new Set())
  const [history, setHistory] = useState([''])
  const [historyIndex, setHistoryIndex] = useState(0)
  const textRef = useRef('')

  // Force dark mode always
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', 'dark')
  }, [])

  // History management for undo/redo
  const saveToHistory = useCallback((newText) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(newText)
      return newHistory.slice(-50) // Keep last 50 states
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [historyIndex])

  const handleTextChange = useCallback((newText) => {
    setText(newText)
    textRef.current = newText
    saveToHistory(newText)
  }, [saveToHistory])

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      const newText = history[newIndex]
      setText(newText)
      textRef.current = newText
    }
  }, [history, historyIndex])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      const newText = history[newIndex]
      setText(newText)
      textRef.current = newText
    }
  }, [history, historyIndex])

  // Color palette for duplicate words - darker colors for better contrast with white text
  // No yellow - white text is not visible on yellow
  // Each color is unique - no duplicates
  const duplicateColors = [
    '#4a9eff', // Bright Blue
    '#ff6b6b', // Coral Red
    '#51cf66', // Bright Green
    '#ff922b', // Orange
    '#ae3ec9', // Purple
    '#f06595', // Pink
    '#20c997', // Teal
    '#ff8787', // Light Red
    '#69db7c', // Light Green
    '#ffa94d', // Light Orange
    '#b197fc', // Light Purple
    '#ff8cc8', // Light Pink
    '#3bc9db', // Cyan
    '#cc5de8', // Magenta
    '#ff6b9d', // Rose Pink
    '#74c0fc', // Sky Blue
    '#5c7cfa', // Indigo
    '#38d9a9', // Mint Green
    '#fa5252', // Deep Red
    '#845ef7', // Violet
    '#339af0', // Royal Blue
    '#ffd43b', // Gold (works with white text)
    '#fd7e14', // Dark Orange
    '#e83e8c', // Hot Pink
    '#6f42c1', // Deep Purple
    '#17a2b8', // Info Blue
    '#28a745', // Success Green
    '#dc3545', // Danger Red
    '#6610f2', // Indigo Purple
    '#0d6efd', // Primary Blue
    '#198754', // Success Green 2
    '#6c757d', // Gray
    '#0dcaf0', // Info Cyan
    '#d63384', // Pink 2
    '#ffc107', // Amber
    '#0b5ed7', // Dark Blue
    '#157347', // Dark Green
    '#bb2d3b', // Dark Red
    '#712cf9', // Dark Purple
    '#1e88e5', // Material Blue
    '#43a047', // Material Green
    '#e53935', // Material Red
  ]

  // Duplicate detection
  useEffect(() => {
    const detectDuplicates = () => {
      if (!text.trim()) {
        setDuplicates([])
        return
      }

      // Tokenize text - split by whitespace and punctuation
      // Use the same regex pattern that will be used for highlighting
      const words = text.match(/\b\w+\b/g) || []
      
      // Count word frequencies
      const wordCounts = new Map()
      const wordPositions = new Map()

      words.forEach((word) => {
        const normalized = caseSensitive ? word : word.toLowerCase()
        
        if (!wordCounts.has(normalized)) {
          wordCounts.set(normalized, 0)
          wordPositions.set(normalized, [])
        }
        wordCounts.set(normalized, wordCounts.get(normalized) + 1)
        wordPositions.get(normalized).push(word)
      })

      // Filter duplicates based on criteria
      const duplicateList = []
      wordCounts.forEach((count, normalizedWord) => {
        if (normalizedWord.length >= minWordLength && count >= minRepeats) {
          duplicateList.push({
            word: normalizedWord, // This is the normalized key for matching
            count,
            positions: wordPositions.get(normalizedWord),
            original: wordPositions.get(normalizedWord)[0] // First occurrence for display
          })
        }
      })

      // Sort by count (descending), then alphabetically
      duplicateList.sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count
        return a.word.localeCompare(b.word)
      })

      // Assign colors to duplicates for chart
      // Use a hash-based approach to ensure same word always gets same color
      // This prevents different words from getting the same color
      const wordColorMap = new Map()
      let colorIndex = 0
      
      const duplicatesWithColors = duplicateList.map((dup) => {
        // If word already has a color assigned, reuse it
        if (wordColorMap.has(dup.word)) {
          return {
            ...dup,
            color: wordColorMap.get(dup.word)
          }
        }
        
        // Assign next available color
        const color = duplicateColors[colorIndex % duplicateColors.length]
        wordColorMap.set(dup.word, color)
        colorIndex++
        
        return {
          ...dup,
          color
        }
      })

      setDuplicates(duplicatesWithColors)
    }

    // Debounce duplicate detection
    const timeoutId = setTimeout(detectDuplicates, 150)
    return () => clearTimeout(timeoutId)
  }, [text, minWordLength, minRepeats, caseSensitive])

  // Clean up activeHighlights when duplicates change (remove words that are no longer duplicates)
  useEffect(() => {
    setActiveHighlights(prev => {
      if (prev.size === 0) return prev
      
      const duplicateWords = new Set(duplicates.map(d => d.word))
      let hasChanges = false
      const newSet = new Set()
      prev.forEach(word => {
        if (duplicateWords.has(word)) {
          newSet.add(word)
        } else {
          hasChanges = true
        }
      })
      return hasChanges ? newSet : prev
    })
  }, [duplicates])

  const toggleHighlight = useCallback((word) => {
    setActiveHighlights(prev => {
      const newSet = new Set(prev)
      // If empty set (all shown), clicking a word should hide only that word
      // So we need to add all other words to the set
      if (prev.size === 0) {
        // Add all duplicate words except the one being toggled
        duplicates.forEach(dup => {
          if (dup.word !== word) {
            newSet.add(dup.word)
          }
        })
      } else {
        // Normal toggle: if word is in set, remove it; otherwise add it
        if (newSet.has(word)) {
          newSet.delete(word)
        } else {
          newSet.add(word)
        }
      }
      return newSet
    })
  }, [duplicates])

  const handleSelectAll = useCallback(() => {
    // Select all = show all highlights (empty set means all shown)
    setActiveHighlights(new Set())
  }, [])

  const handleDeselectAll = useCallback(() => {
    // Deselect all = hide all highlights (add all words to set)
    const allWords = new Set(duplicates.map(d => d.word))
    setActiveHighlights(allWords)
  }, [duplicates])

  const handleCopyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      // Show toast notification
      const toast = document.createElement('div')
      toast.textContent = 'Text copied to clipboard!'
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--button-bg);
        color: var(--button-text);
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px var(--shadow);
        z-index: 1000;
        animation: slideIn 0.3s ease;
      `
      document.body.appendChild(toast)
      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease'
        setTimeout(() => toast.remove(), 300)
      }, 2000)
    } catch (err) {
      alert('Failed to copy text. Please try again.')
    }
  }, [text])

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(w => w).length : 0
  const charCount = text.length

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-logo-container">
          <img src="/logo.png" alt="Logo" className="header-logo" />
          <h1>Duplicate Word Finder</h1>
        </div>
      </header>
      
      <div className="app-content">
        <div className="editor-section">
          <Toolbar
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            minWordLength={minWordLength}
            setMinWordLength={setMinWordLength}
            minRepeats={minRepeats}
            setMinRepeats={setMinRepeats}
            caseSensitive={caseSensitive}
            setCaseSensitive={setCaseSensitive}
            onCopyAll={handleCopyAll}
          />
          
          <Stats wordCount={wordCount} charCount={charCount} />
          
          <TextEditor
            text={text}
            onChange={handleTextChange}
            duplicates={duplicates}
            activeHighlights={activeHighlights}
            caseSensitive={caseSensitive}
            duplicateColors={duplicateColors}
          />
        </div>
        
        <div className="sidebar-section">
          <WordFrequencyChart 
            duplicates={duplicates}
            activeHighlights={activeHighlights}
            onToggleHighlight={toggleHighlight}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />
        </div>
      </div>

      {/* Mobile bottom toolbar */}
      <div className="mobile-bottom-toolbar">
        <div className="mobile-toolbar-group">
          <button
            className="mobile-toolbar-btn mobile-toolbar-btn-icon"
            onClick={handleUndo}
            disabled={historyIndex === 0}
            title="Undo"
            aria-label="Undo"
          >
            <span className="mobile-toolbar-icon">↶</span>
          </button>
          <button
            className="mobile-toolbar-btn mobile-toolbar-btn-icon"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
            aria-label="Redo"
          >
            <span className="mobile-toolbar-icon">↷</span>
          </button>
        </div>

        <div className="mobile-toolbar-group mobile-toolbar-value-controls">
          <div className="mobile-toolbar-value-btn">
            <button
              className="mobile-toolbar-value-decrease"
              onClick={() => setMinWordLength(Math.max(1, minWordLength - 1))}
              aria-label="Decrease min length"
            >
              −
            </button>
            <div className="mobile-toolbar-value-display">
              <span className="mobile-toolbar-value-label">Min</span>
              <span className="mobile-toolbar-value-number">{minWordLength}</span>
            </div>
            <button
              className="mobile-toolbar-value-increase"
              onClick={() => setMinWordLength(Math.min(20, minWordLength + 1))}
              aria-label="Increase min length"
            >
              +
            </button>
          </div>

          <div className="mobile-toolbar-value-btn">
            <button
              className="mobile-toolbar-value-decrease"
              onClick={() => setMinRepeats(Math.max(2, minRepeats - 1))}
              aria-label="Decrease min repeats"
            >
              −
            </button>
            <div className="mobile-toolbar-value-display">
              <span className="mobile-toolbar-value-label">Rep</span>
              <span className="mobile-toolbar-value-number">{minRepeats}</span>
            </div>
            <button
              className="mobile-toolbar-value-increase"
              onClick={() => setMinRepeats(Math.min(20, minRepeats + 1))}
              aria-label="Increase min repeats"
            >
              +
            </button>
          </div>
        </div>

        <div className="mobile-toolbar-group">
          <button
            className={`mobile-toolbar-btn mobile-toolbar-btn-icon ${caseSensitive ? 'active' : ''}`}
            onClick={() => setCaseSensitive(!caseSensitive)}
            title={`Case: ${caseSensitive ? 'On' : 'Off'}`}
            aria-label="Toggle case sensitivity"
          >
            <span className="mobile-toolbar-icon">Aa</span>
          </button>
          <button
            className="mobile-toolbar-btn mobile-toolbar-btn-primary mobile-toolbar-btn-icon"
            onClick={handleCopyAll}
            title="Copy All"
            aria-label="Copy all text"
          >
            <span className="mobile-toolbar-icon">📋</span>
          </button>
        </div>
      </div>

    </div>
  )
}

export default App

