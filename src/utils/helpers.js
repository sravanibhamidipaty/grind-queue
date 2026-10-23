export const FLAGS = ['Problem', 'Question', 'Resource', 'Opinion']
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

// Pseudo-auth: each browser gets a random, persistent user ID
export const getUserId = () => {
  let id = localStorage.getItem('gq-user-id')
  if (!id) {
    id = `user-${crypto.randomUUID().slice(0, 8)}`
    localStorage.setItem('gq-user-id', id)
  }
  return id
}

// "5 minutes ago", "3 days ago", etc.
export const timeAgo = (iso) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [name, size] of units) {
    const n = Math.floor(seconds / size)
    if (n >= 1) return `${n} ${name}${n > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

// Only allow http(s) links to be rendered as src/href
export const isHttpUrl = (value) => {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// Turn a YouTube watch/short link into an embeddable URL (null if not YouTube)
export const toYouTubeEmbed = (value) => {
  if (!isHttpUrl(value)) return null
  const url = new URL(value)
  let id = null
  if (url.hostname.includes('youtu.be')) id = url.pathname.slice(1)
  else if (url.hostname.includes('youtube.com')) {
    id = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop()
  }
  return id && /^[\w-]{6,}$/.test(id) ? `https://www.youtube.com/embed/${id}` : null
}

// Validates and trims the create/edit form; returns { error } or { values }
export const cleanPostForm = (form) => {
  const title = form.title.trim()
  if (!title) return { error: 'A title is required.' }
  for (const field of ['image_url', 'video_url', 'problem_url']) {
    if (form[field].trim() && !isHttpUrl(form[field].trim())) {
      return { error: `${field.replace('_url', '')} link must start with http:// or https://` }
    }
  }
  return {
    values: {
      title,
      content: form.content.trim() || null,
      image_url: form.image_url.trim() || null,
      video_url: form.video_url.trim() || null,
      problem_url: form.problem_url.trim() || null,
      difficulty: form.difficulty || null,
      flag: form.flag,
    },
  }
}
