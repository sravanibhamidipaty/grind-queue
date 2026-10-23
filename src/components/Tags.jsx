// Flag + difficulty pills shown on cards and post pages
const Tags = ({ flag, difficulty }) => (
  <span className="tags">
    {flag && <span className={`tag flag-${flag.toLowerCase()}`}>{flag}</span>}
    {difficulty && <span className={`tag diff-${difficulty.toLowerCase()}`}>{difficulty}</span>}
  </span>
)

export default Tags
