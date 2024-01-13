import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Home () {
  const loc = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (loc.pathname !== '/') {
      navigate('/')
    }
  }, [loc])
  return <div style={{ margin: '0.5rem 1rem' }}>Pick a schema to explore!</div>
}
