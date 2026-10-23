import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useRoutes } from 'react-router-dom'
import Home from './pages/Home'
import CreatePost from './pages/CreatePost'
import PostPage from './pages/PostPage'
import EditPost from './pages/EditPost'
import { SettingsContext } from './settings'
import { getUserId } from './utils/helpers'
import './App.css'

const readPref = (key, fallback) => {
  const saved = localStorage.getItem(key)
  return saved === null ? fallback : JSON.parse(saved)
}

const App = () => {
  const [theme, setTheme] = useState(() => readPref('gq-theme', 'dark'))
  const [showDetails, setShowDetails] = useState(() => readPref('gq-show-details', false))
  const userId = useMemo(getUserId, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('gq-theme', JSON.stringify(theme))
  }, [theme])

  useEffect(() => {
    localStorage.setItem('gq-show-details', JSON.stringify(showDetails))
  }, [showDetails])

  const element = useRoutes([
    { path: '/', element: <Home /> },
    { path: '/new', element: <CreatePost /> },
    { path: '/post/:id', element: <PostPage /> },
    { path: '/edit/:id', element: <EditPost /> },
    { path: '*', element: <p className="empty">Page not found. <Link to="/">Back to the queue</Link></p> },
  ])

  return (
    <SettingsContext.Provider value={{ theme, setTheme, showDetails, setShowDetails, userId }}>
      <header className="navbar">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">▲</span> GrindQueue
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>Queue</NavLink>
          <NavLink to="/new">New Post</NavLink>
        </nav>
        <div className="nav-tools">
          <span className="user-chip" title="Your pseudo-anonymous ID">{userId}</span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      <main className="container">{element}</main>
    </SettingsContext.Provider>
  )
}

export default App
