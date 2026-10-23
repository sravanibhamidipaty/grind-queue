import { useNavigate } from 'react-router-dom'
import { supabase } from '../client'
import PostForm from '../components/PostForm'
import { useSettings } from '../settings'

const CreatePost = () => {
  const navigate = useNavigate()
  const { userId } = useSettings()

  const createPost = async (values, { secretKey, repostId }) => {
    // Make sure the referenced post exists before linking to it
    if (repostId) {
      const { data: ref } = await supabase.from('posts').select('id').eq('id', repostId).maybeSingle()
      if (!ref) return `Post #${repostId} doesn't exist.`
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({ ...values, author_id: userId, secret_key: secretKey, repost_id: repostId })
      .select('id')
      .single()

    if (error) return error.message
    navigate(`/post/${data.id}`)
  }

  return (
    <section className="narrow">
      <h1>New post</h1>
      <PostForm mode="create" submitLabel="Add to queue" onSubmit={createPost} />
    </section>
  )
}

export default CreatePost
