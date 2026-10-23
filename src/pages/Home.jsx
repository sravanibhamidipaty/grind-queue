import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../client'
import PostCard from '../components/PostCard'
import Loader from '../components/Loader'
import { FLAGS } from '../utils/helpers'
import { useSettings } from '../settings'

const Home = () => {
  const { showDetails, setShowDetails } = useSettings()
  const [posts, setPosts] = useState([])
  const [orderBy, setOrderBy] = useState('upvotes') // upvotes = priority queue
  const [flag, setFlag] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false // drop stale responses if filters change mid-request

    const fetchPosts = async () => {
      setLoading(true)
      // Feed only needs these columns (content/image only for the "show details" setting)
      let query = supabase
        .from('posts')
        .select('id, created_at, title, upvotes, flag, difficulty, content, image_url')
        .order(orderBy, { ascending: false })
      if (orderBy === 'upvotes') query = query.order('created_at', { ascending: false })
      if (flag !== 'All') query = query.eq('flag', flag)

      const { data, error } = await query
      if (ignore) return
      if (error) setError(error.message)
      else {
        setError('')
        setPosts(data)
      }
      setLoading(false)
    }

    fetchPosts()
    return () => {
      ignore = true
    }
  }, [orderBy, flag])

  const term = search.trim().toLowerCase()
  const visible = term ? posts.filter((p) => p.title.toLowerCase().includes(term)) : posts

  return (
    <section>
      <div className="hero">
        <h1>What should we grind next?</h1>
        <p>Post problems, questions, and resources. Upvote what deserves to be tackled first.</p>
      </div>

      <div className="toolbar card">
        <label className="search">
          <span className="sr-only">Search posts by title</span>
          <input type="search" placeholder="🔍 Search by title…" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </label>

        <div className="segmented" role="group" aria-label="Sort posts">
          <button type="button" aria-pressed={orderBy === 'upvotes'}
            onClick={() => setOrderBy('upvotes')}>Most upvoted</button>
          <button type="button" aria-pressed={orderBy === 'created_at'}
            onClick={() => setOrderBy('created_at')}>Newest</button>
        </div>

        <label className="inline-field">
          Type
          <select value={flag} onChange={(e) => setFlag(e.target.value)}>
            <option>All</option>
            {FLAGS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </label>

        <label className="inline-field checkbox">
          <input type="checkbox" checked={showDetails} onChange={(e) => setShowDetails(e.target.checked)} />
          Show content in feed
        </label>
      </div>

      {loading ? (
        <Loader label="Fetching the queue…" />
      ) : error ? (
        <p className="error" role="alert">Couldn't load posts: {error}</p>
      ) : visible.length === 0 ? (
        <p className="empty">
          {term ? `No posts match "${search}".` : 'Nothing in the queue yet.'}{' '}
          <Link to="/new">Create the first post</Link>
        </p>
      ) : (
        <ol className="feed">
          {visible.map((post, i) => (
            <li key={post.id}>
              <PostCard post={post} showDetails={showDetails} rank={orderBy === 'upvotes' ? i + 1 : undefined} />
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default Home
