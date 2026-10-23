import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { POST_COLUMNS, supabase } from '../client'
import PostForm from '../components/PostForm'
import Loader from '../components/Loader'

// null -> "" so controlled inputs stay controlled
const toFormValues = (post) =>
  Object.fromEntries(Object.entries(post).map(([k, v]) => [k, v ?? '']))

const EditPost = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase.from('posts').select(POST_COLUMNS).eq('id', id).maybeSingle()
      setPost(data)
      setLoading(false)
    }
    fetchPost()
  }, [id])

  const updatePost = async (values, { secretKey }) => {
    // Only update the row if the secret key matches; zero rows back = wrong key
    const { data, error } = await supabase
      .from('posts')
      .update(values)
      .eq('id', id)
      .eq('secret_key', secretKey)
      .select('id')

    if (error) return error.message
    if (data.length === 0) return 'Wrong secret key. Only the original author can edit this post.'
    navigate(`/post/${id}`)
  }

  if (loading) return <Loader />
  if (!post) return <p className="empty">Post not found. <Link to="/">Back to the queue</Link></p>

  return (
    <section className="narrow">
      <Link to={`/post/${id}`} className="back">← Back to post</Link>
      <h1>Edit post</h1>
      <PostForm mode="edit" initial={toFormValues(post)} submitLabel="Save changes" onSubmit={updatePost} />
    </section>
  )
}

export default EditPost
