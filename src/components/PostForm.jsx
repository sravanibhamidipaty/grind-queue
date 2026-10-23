import { useState } from 'react'
import SecretInput from './SecretInput'
import { DIFFICULTIES, FLAGS, cleanPostForm } from '../utils/helpers'

const EMPTY_POST = {
  title: '',
  content: '',
  image_url: '',
  video_url: '',
  problem_url: '',
  difficulty: '',
  flag: 'Problem',
}

// Shared by Create and Edit.
// mode="create": secret key is chosen + optional repost ID
// mode="edit":   secret key must be entered to save
const PostForm = ({ initial = EMPTY_POST, mode = 'create', submitLabel, onSubmit }) => {
  const [form, setForm] = useState({ ...EMPTY_POST, ...initial })
  const [secretKey, setSecretKey] = useState('')
  const [repostId, setRepostId] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const { error: validationError, values } = cleanPostForm(form)
    if (validationError) return setError(validationError)
    if (!secretKey.trim()) return setError('A secret key is required.')
    if (repostId && !/^\d+$/.test(repostId.trim())) return setError('Repost ID must be a number.')

    setError('')
    setSubmitting(true)
    const result = await onSubmit(values, {
      secretKey: secretKey.trim(),
      repostId: repostId.trim() ? Number(repostId.trim()) : null,
    })
    // onSubmit returns an error string on failure, nothing on success (it navigates away)
    if (result) {
      setError(result)
      setSubmitting(false)
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="title">
        Title <span className="required">*</span>
      </label>
      <input id="title" name="title" value={form.title} onChange={handleChange} required
        placeholder="e.g. Trapping Rain Water — two pointers clicked for me" />

      <div className="form-row">
        <div>
          <label htmlFor="flag">Type</label>
          <select id="flag" name="flag" value={form.flag} onChange={handleChange}>
            {FLAGS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="difficulty">Difficulty</label>
          <select id="difficulty" name="difficulty" value={form.difficulty} onChange={handleChange}>
            <option value="">None</option>
            {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <label htmlFor="problem_url">Problem link (optional)</label>
      <input id="problem_url" name="problem_url" type="url" value={form.problem_url} onChange={handleChange}
        placeholder="https://leetcode.com/problems/..." />

      <label htmlFor="content">Content (optional)</label>
      <textarea id="content" name="content" rows="6" value={form.content} onChange={handleChange}
        placeholder="Your approach, complexity, where you got stuck..." />

      <label htmlFor="image_url">Image URL (optional)</label>
      <input id="image_url" name="image_url" type="url" value={form.image_url} onChange={handleChange}
        placeholder="https://..." />

      <label htmlFor="video_url">Video URL (optional, YouTube links embed)</label>
      <input id="video_url" name="video_url" type="url" value={form.video_url} onChange={handleChange}
        placeholder="https://www.youtube.com/watch?v=..." />

      {mode === 'create' && (
        <>
          <label htmlFor="repost_id">Repost / reply to post ID (optional)</label>
          <input id="repost_id" inputMode="numeric" value={repostId}
            onChange={(e) => setRepostId(e.target.value)} placeholder="e.g. 3" />
        </>
      )}

      <label htmlFor="secret_key">
        {mode === 'create' ? 'Secret key (needed later to edit or delete)' : 'Secret key'}{' '}
        <span className="required">*</span>
      </label>
      <SecretInput id="secret_key" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} />

      {error && <p className="error" role="alert">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}

export default PostForm
