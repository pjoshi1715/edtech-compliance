import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { AssessmentTool } from './pages/assessment/AssessmentTool'
import { DataInventoryTool } from './pages/inventory/DataInventoryTool'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/assessment" element={<AssessmentTool />} />
        <Route path="/inventory/*" element={<DataInventoryTool />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
