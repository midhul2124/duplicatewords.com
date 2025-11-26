import { useRef, useEffect, useState } from 'react'
import './TextEditor.css'

const PLACEHOLDER_TEXT = `Welcome to Duplicate Word Finder : your personal repetition radar.

Drop in your text and watch the magic. 

The moment you type or paste, the tool instantly scans your writing, spots every repeated word, and highlights each one in its own unique color. Patterns pop out, clutter becomes visible, and your writing gets cleaner in seconds.

✨ FEATURES

📊 Duplicate Words Panel

See every repeated word along with how often it appears. Search, filter, sort by count or alphabetically, or group words by how many times they show up.

Click any word to toggle its highlight on or off.

Hit Select All to light everything up or Deselect All to give your eyes a break.

🛠️ Smart Toolbar Controls

Undo and Redo let you move freely through your editing history.

Use Minimum Word Length (default: 4) to ignore tiny fillers.

Use Minimum Repeats to focus only on words that truly overstay their welcome.

Turn Case Sensitivity on or off depending on whether "The" and "the" should be treated as twins or strangers.

Real-time word and character counts sit neatly on the right.

📋 One-Click Copy

Hit Copy All to instantly grab your full text — ready to paste anywhere.

💡 Pro Tip

Every duplicate word gets its own color. The more you write, the more the patterns reveal themselves. Try pasting something messy, "it's oddly satisfying."`

function TextEditor({ text, onChange, duplicates, activeHighlights, caseSensitive, duplicateColors }) {
  const editorRef = useRef(null)
  const [isComposing, setIsComposing] = useState(false)
  const isUpdatingRef = useRef(false)
  const hasInteractedRef = useRef(false)

  // Create color map for duplicate words
  // activeHighlights Set contains words that should be HIDDEN
  // Empty set = all shown, words in set = hidden
  // Use the color from duplicates array (already assigned in App.jsx) to ensure consistency
  const wordColorMap = new Map()
  duplicates.forEach((dup) => {
    // Show highlight if: set is empty (all shown) OR word is NOT in the set (not hidden)
    const shouldHighlight = activeHighlights.size === 0 || !activeHighlights.has(dup.word)
    if (shouldHighlight) {
      // Use the color already assigned to this duplicate word in App.jsx
      // This ensures each word gets a unique color and colors match between chart and text
      wordColorMap.set(dup.word, dup.color || duplicateColors[0])
    }
  })

  // Render text with highlights as HTML string
  const renderHighlightedHTML = () => {
    if (!text) return ''

    let html = ''
    const wordRegex = /\b\w+\b/g
    let lastIndex = 0
    let match

    wordRegex.lastIndex = 0
    
    while ((match = wordRegex.exec(text)) !== null) {
      // Add text before the word
      if (match.index > lastIndex) {
        html += escapeHtml(text.slice(lastIndex, match.index))
      }

      // Add the word
      const word = match[0]
      const normalized = caseSensitive ? word : word.toLowerCase()
      const highlightColor = wordColorMap.get(normalized)
      
      if (highlightColor) {
        html += `<mark style="background-color: ${highlightColor}; color: #ffffff; padding: 2px 1px; border-radius: 3px; display: inline;">${escapeHtml(word)}</mark>`
      } else {
        html += escapeHtml(word)
      }

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      html += escapeHtml(text.slice(lastIndex))
    }

    return html
  }

  // Helper to escape HTML
  const escapeHtml = (text) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  // Handle click/focus - clear placeholder text on first interaction
  const handleFocus = (e) => {
    if (!hasInteractedRef.current && editorRef.current) {
      const currentText = editorRef.current.textContent || ''
      const placeholderText = PLACEHOLDER_TEXT.trim()
      const currentTextTrimmed = currentText.trim()
      
      // Check if current text matches placeholder (with some tolerance for whitespace)
      const isPlaceholder = currentTextTrimmed === placeholderText || 
                           currentText === PLACEHOLDER_TEXT ||
                           currentTextTrimmed.startsWith('Welcome to the Duplicate Word Finder') ||
                           (currentText.length > 100 && currentText.includes('Duplicate Word Finder'))
      
      if (isPlaceholder) {
        hasInteractedRef.current = true
        isUpdatingRef.current = true // Prevent highlight update during clear
        
        // Clear the content immediately - use both methods to be sure
        if (editorRef.current) {
          editorRef.current.textContent = ''
          editorRef.current.innerHTML = ''
        }
        onChange('')
        
        // Move cursor to start
        requestAnimationFrame(() => {
          if (editorRef.current) {
            const range = document.createRange()
            const sel = window.getSelection()
            range.setStart(editorRef.current, 0)
            range.collapse(true)
            sel.removeAllRanges()
            sel.addRange(range)
          }
          isUpdatingRef.current = false
        })
      }
    }
  }

  // Handle input from contentEditable
  const handleInput = (e) => {
    if (isComposing || isUpdatingRef.current) return
    
    const newText = e.currentTarget.textContent || ''
    
    // If user starts typing and text is still placeholder, clear it first
    if (!hasInteractedRef.current && (newText === PLACEHOLDER_TEXT || newText.trim() === PLACEHOLDER_TEXT.trim())) {
      hasInteractedRef.current = true
      e.currentTarget.textContent = ''
      onChange('')
      return
    }
    
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true
    }
    onChange(newText)
  }

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault()
    const paste = (e.clipboardData || window.clipboardData).getData('text')
    const selection = window.getSelection()
    if (!selection.rangeCount) return

    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(document.createTextNode(paste))
    range.collapse(false)

    const newText = editorRef.current?.textContent || ''
    onChange(newText)
  }

  // Initialize content with placeholder text on mount
  useEffect(() => {
    // Always reset interaction flag on mount
    hasInteractedRef.current = false
    
    // Use a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      if (!editorRef.current) return
      
      // Only set placeholder if text is truly empty (initial load)
      if (!text || text.trim() === '') {
        // Set placeholder text initially so duplicates show up
        isUpdatingRef.current = true
        editorRef.current.textContent = PLACEHOLDER_TEXT
        editorRef.current.innerHTML = PLACEHOLDER_TEXT
        onChange(PLACEHOLDER_TEXT)
        isUpdatingRef.current = false
      } else if (text === PLACEHOLDER_TEXT) {
        // If text is already placeholder, ensure it's displayed
        isUpdatingRef.current = true
        editorRef.current.textContent = PLACEHOLDER_TEXT
        editorRef.current.innerHTML = PLACEHOLDER_TEXT
        isUpdatingRef.current = false
      }
    }, 0)
    
    return () => clearTimeout(timeoutId)
  }, []) // Only run on mount

  // Update highlights when text or duplicates change (but not during user typing)
  useEffect(() => {
    if (!editorRef.current || isUpdatingRef.current) return
    
    // Don't restore placeholder if user has interacted
    if (hasInteractedRef.current && (text === PLACEHOLDER_TEXT || text === '')) {
      return
    }
    
    const currentText = editorRef.current.textContent || ''
    
    // Only update if text changed externally (undo/redo) or if we need to update highlights
    if (currentText !== text) {
      // External change (undo/redo) - update content
      isUpdatingRef.current = true
      const html = renderHighlightedHTML()
      if (html || text === '') {
        editorRef.current.innerHTML = html
      }
      
      // Place cursor at end if text exists
      if (text) {
        setTimeout(() => {
          const range = document.createRange()
          range.selectNodeContents(editorRef.current)
          range.collapse(false)
          const selection = window.getSelection()
          selection.removeAllRanges()
          selection.addRange(range)
        }, 0)
      }
      
      isUpdatingRef.current = false
    } else if (currentText === text && text.length > 0) {
      // Same text, but highlights might have changed - update highlights
      // Use a small delay to avoid interfering with typing
      const timeoutId = setTimeout(() => {
        if (isUpdatingRef.current) return
        
        isUpdatingRef.current = true
        
        // Save cursor position
        const selection = window.getSelection()
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null
        let cursorOffset = 0
        
        if (range) {
          const preRange = range.cloneRange()
          preRange.selectNodeContents(editorRef.current)
          preRange.setEnd(range.startContainer, range.startOffset)
          cursorOffset = preRange.toString().length
        }
        
        // Update with highlights
        const html = renderHighlightedHTML()
        editorRef.current.innerHTML = html
        
        // Restore cursor
        if (range && cursorOffset >= 0) {
          try {
            const textNodes = []
            const walker = document.createTreeWalker(
              editorRef.current,
              NodeFilter.SHOW_TEXT,
              null
            )
            let node
            while (node = walker.nextNode()) {
              textNodes.push(node)
            }
            
            let offset = 0
            for (const textNode of textNodes) {
              const nodeLength = textNode.textContent.length
              if (cursorOffset <= offset + nodeLength) {
                const newRange = document.createRange()
                newRange.setStart(textNode, cursorOffset - offset)
                newRange.collapse(true)
                selection.removeAllRanges()
                selection.addRange(newRange)
                break
              }
              offset += nodeLength
            }
          } catch (e) {
            // Ignore cursor errors
          }
        }
        
        isUpdatingRef.current = false
      }, 100) // Small delay to avoid interfering with typing
      
      return () => clearTimeout(timeoutId)
    }
  }, [text, duplicates, activeHighlights, caseSensitive])

  const showPlaceholder = !text.trim()

  return (
    <div className="text-editor-wrapper">
      <div 
        ref={editorRef}
        className="text-editor-contenteditable"
        contentEditable
        suppressContentEditableWarning
        onClick={handleFocus}
        onFocus={handleFocus}
        onInput={handleInput}
        onPaste={handlePaste}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        data-placeholder={showPlaceholder ? PLACEHOLDER_TEXT : ''}
        aria-label="Text editor for duplicate word detection"
      />
    </div>
  )
}

export default TextEditor
