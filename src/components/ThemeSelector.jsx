import './ThemeSelector.css'

function ThemeSelector({ theme, setTheme }) {
  return (
    <div className="theme-selector">
      <label htmlFor="theme-select" className="theme-selector-label">
        Theme:
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="theme-selector-select"
        aria-label="Select theme"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  )
}

export default ThemeSelector

