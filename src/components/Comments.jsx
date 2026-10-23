import { useEffect, useState } from 'react'
import { supabase } from '../client'
import Loader from './Loader'
import { timeAgo } from '../utils/helpers'
import { useSettings } from '../settings'

const Comments = ({ postId }) => {
  const { userId } = useSettings()
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select()
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      if (error) setError(error.message)
      else setComments(data)
      setLoading(false)
    }
    fetchComments()
  }, [postId])

  const addComment = async (event) => {
    event.preventDefault()
    const content = text.trim()
    if (!content) return
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, content, author_id: userId })
      .select()
      .single()
    if (error) return setError(error.message)
    setComments((prev) => [...prev, data])
    setText('')
    setError('')
  }

  // Only the author (same browser user ID) sees the delete button
  const deleteComment = async (commentId) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId).eq('author_id', userId)
    if (error) return setError(error.message)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  return (
    <section className="card comments" aria-labelledby="comments-heading">
      <h2 id="comments-heading">Discussion ({comments.length})</h2>

      {loading ? (
        <Loader label="Loading comments…" />
      ) : comments.length === 0 ? (
        <p className="muted">No comments yet. Share your approach.</p>
      ) : (
        <ul className="comment-list">
          {comments.map((c) => (
            <li key={c.id} className="comment">
              <p className="meta">
                <span className="user-chip">{c.author_id}</span> · {timeAgo(c.created_at)}
                {c.author_id === userId && (
                  <button type="button" className="link-btn" onClick={() => deleteComment(c.id)}
                    aria-label="Delete your comment">
                    Delete
                  </button>
                )}
              </p>
              <p className="comment-body">{c.content}</p>
            </li>
          ))}
        </ul>
      )}

      <form className="inline-form" onSubmit={addComment}>
        <label htmlFor="new-comment" className="sr-only">Leave a comment</label>
        <input id="new-comment" placeholder="Leave a comment…" value={text}
          onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="btn btn-primary" disabled={!text.trim()}>Comment</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  )
}

export default Comments
