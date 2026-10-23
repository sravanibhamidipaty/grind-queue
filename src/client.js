import { createClient } from '@supabase/supabase-js'

// Values come from .env at the project root (see .env.example)
const URL = import.meta.env.VITE_SUPABASE_URL
const API_KEY = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(URL, API_KEY)

// Every column except secret_key, so keys aren't pulled into the feed/post views
export const POST_COLUMNS =
  'id, created_at, title, content, image_url, video_url, problem_url, difficulty, flag, upvotes, author_id, repost_id'
