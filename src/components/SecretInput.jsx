import { useState } from 'react'

// Password-style input with a Show/Hide toggle.
// autoComplete="new-password" stops browsers from autofilling a saved password.
const SecretInput = ({ id, value, onChange }) => {
  const [visible, setVisible] = useState(false)
  return (
    <span className="secret-input">
      <input id={id} type={visible ? 'text' : 'password'} autoComplete="new-password"
        autoCapitalize="none" spellCheck="false" value={value} onChange={onChange} required />
      <button type="button" className="btn" onClick={() => setVisible((v) => !v)}
        aria-pressed={visible} aria-controls={id}>
        {visible ? 'Hide' : 'Show'}
      </button>
    </span>
  )
}

export default SecretInput
