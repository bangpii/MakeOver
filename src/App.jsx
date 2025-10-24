import './css/index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import User from './pages/User'
import AnalisisFace from './components/AnalisisFace'
import CameraLive from './components/CameraLive'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<User />} />
        <Route path="/analisis-face" element={<AnalisisFace />} />
        <Route path="/camera-live" element={<CameraLive />} />
      </Routes>
    </Router>
  )
}

export default App
