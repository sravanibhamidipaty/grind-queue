import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { POST_COLUMNS, supabase } from '../client'
import Loader from '../components/Loader'
import Tags from '../components/Tags'
import Comments from '../components/Comments'
import SecretInput from '../components/SecretInput'
import { isHttpUrl, timeAgo, toYouTubeEmbed } from '../utils/helpers'

const PostPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [referenced, setReferenced] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteKey, setDeleteKey] = useState('')
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    let ignore = false
    const fetchPost = async () => {
      setLoading(true)
      const { data } = await supabase.from('posts').select(POST_COLUMNS).eq('id', id).maybeSingle()
      let ref = null
      if (data?.repost_id) {
        const res = await supabase
          .from('posts')
          .select('id, title, created_at, upvotes, flag, difficulty')
          .eq('id', data.repost_id)
          .maybeSingle()
        ref = res.data
      }
      if (ignore) return
      setPost(data)
      setReferenced(ref)
      setLoading(false)
    }
    fetchPost()
    return () => {
      ignore = true
    }
  }, [id])

  const upvote = async () => {
    const next = post.upvotes + 1
    setPost((p) => ({ ...p, upvotes: next })) // optimistic
    const { data } = await supabase.from('posts').update({ upvotes: next }).eq('id', id).select('upvotes').single()
    if (data) setPost((p) => ({ ...p, upvotes: Math.max(p.upvotes, data.upvotes) }))
  }

  const deletePost = async (event) => {
    event.preventDefault()
    const { data, error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('secret_key', deleteKey.trim())
      .select('id')
    if (error) return setDeleteError(error.message)
    if (data.length === 0) return setDeleteError('Wrong secret key. Only the original author can delete this post.')
    navigate('/')
  }

  if (loading) return <Loader label="Loading post…" />
  if (!post) return <p className="empty">Post not found. <Link to="/">Back to the queue</Link></p>

  const embed = toYouTubeEmbed(post.video_url)

  return (
    <article className="narrow">
      <Link to="/" className="back">← Back to the queue</Link>

      <div className="card post-detail">
        <p className="meta">
          Posted {timeAgo(post.created_at)} by <span className="user-chip">{post.author_id}</span>{' '}
          <Tags flag={post.flag} difficulty={post.difficulty} /> <span className="muted">· Post #{post.id}</span>
        </p>
        <h1>{post.title}</h1>

        {post.repost_id && (
          <div className="thread-ref">
            <span className="muted">↪ In reply to</span>{' '}
            {referenced ? (
              <Link to={`/post/${referenced.id}`}>
                #{referenced.id} · {referenced.title} <span className="muted">(▲ {referenced.upvotes})</span>
              </Link>
            ) : (
              <span className="muted">a deleted post</span>
            )}
          </div>
        )}

        {isHttpUrl(post.problem_url) && (
          <a className="problem-link" href={post.problem_url} target="_blank" rel="noopener noreferrer">
            Open problem ↗
          </a>
        )}
        {post.content && <p className="content">{post.content}</p>}
        {isHttpUrl(post.image_url) && <img className="detail-image" src={post.image_url} alt={`Image for ${post.title}`} />}
        {embed ? (
          <div className="video">
            <iframe src={embed} title={`Video for ${post.title}`} allowFullScreen
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          </div>
        ) : (
          isHttpUrl(post.video_url) && (
            <a href={post.video_url} target="_blank" rel="noopener noreferrer">Watch video ↗</a>
          )
        )}

        <div className="actions">
          <button type="button" className="btn btn-upvote" onClick={upvote} aria-label="Upvote this post">
            ▲ {post.upvotes}
          </button>
          <span className="spacer" />
          <Link to={`/edit/${post.id}`} className="btn">Edit</Link>
          <button type="button" className="btn btn-danger" onClick={() => setShowDelete((s) => !s)}>
            Delete
          </button>
        </div>

        {showDelete && (
          <form className="delete-confirm" onSubmit={deletePost}>
            <label htmlFor="delete-key">Enter this post's secret key to delete it:</label>
            <div className="inline-form">
              <SecretInput id="delete-key" value={deleteKey} onChange={(e) => setDeleteKey(e.target.value)} />
              <button type="submit" className="btn btn-danger">Confirm delete</button>
            </div>
            {deleteError && <p className="error" role="alert">{deleteError}</p>}
          </form>
        )}
      </div>

      <Comments postId={post.id} />
    </article>
  )
}

export default PostPage
