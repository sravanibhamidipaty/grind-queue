import { Link } from 'react-router-dom'
import Tags from './Tags'
import { isHttpUrl, timeAgo } from '../utils/helpers'

// Feed card. By default: creation time, title, upvotes only.
// `showDetails` (user setting) also reveals tags, content + image.
const PostCard = ({ post, rank, showDetails }) => (
  <Link to={`/post/${post.id}`} className="card post-card">
    {rank !== undefined && <span className="rank">#{rank}</span>}
    <div className="post-card-body">
      <p className="meta">
        Posted {timeAgo(post.created_at)}
        {showDetails && <Tags flag={post.flag} difficulty={post.difficulty} />}
      </p>
      <h2 className="post-card-title">{post.title}</h2>
      {showDetails && post.content && <p className="excerpt">{post.content}</p>}
      {showDetails && isHttpUrl(post.image_url) && (
        <img className="card-image" src={post.image_url} alt="" loading="lazy" />
      )}
      <p className="upvotes">▲ {post.upvotes} {post.upvotes === 1 ? 'upvote' : 'upvotes'}</p>
    </div>
  </Link>
)

export default PostCard
