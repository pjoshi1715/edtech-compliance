import { Routes, Route, Navigate } from 'react-router-dom'
import { InventoryProvider, useInventory } from '@/contexts/InventoryContext'
import { WelcomeScreen } from './WelcomeScreen'
import { SetupWizard } from './SetupWizard'
import { InventoryDashboard } from './InventoryDashboard'
import { AddDataElement } from './AddDataElement'
import { DataFlowDiagram } from './DataFlowDiagram'
import { GapAnalysis } from './GapAnalysis'
import { ComplianceInsights } from './ComplianceInsights'
import { ExportPage } from './ExportPage'

function InventoryRoutes() {
  const { inventory } = useInventory()

  // If no inventory exists, show welcome/setup flow
  if (!inventory) {
    return (
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/setup" element={<SetupWizard />} />
        <Route path="*" element={<Navigate to="/inventory" replace />} />
      </Routes>
    )
  }

  // If inventory exists, show full app
  return (
    <Routes>
      <Route path="/" element={<InventoryDashboard />} />
      <Route path="/add" element={<AddDataElement />} />
      <Route path="/edit/:id" element={<AddDataElement />} />
      <Route path="/flow" element={<DataFlowDiagram />} />
      <Route path="/gaps" element={<GapAnalysis />} />
      <Route path="/insights" element={<ComplianceInsights />} />
      <Route path="/export" element={<ExportPage />} />
      <Route path="*" element={<Navigate to="/inventory" replace />} />
    </Routes>
  )
}

export function DataInventoryTool() {
  return (
    <InventoryProvider>
      <InventoryRoutes />
    </InventoryProvider>
  )
}
