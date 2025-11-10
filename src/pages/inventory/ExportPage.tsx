import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInventory } from '@/contexts/InventoryContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, FileText, FileSpreadsheet, Download, Loader2 } from 'lucide-react'
import { analyzeComplianceGaps } from '@/utils/inventory/gapAnalysis'
import Papa from 'papaparse'
import jsPDF from 'jspdf'
import {
  DATA_CATEGORY_LABELS,
  DATA_SOURCE_LABELS,
  COLLECTION_PURPOSE_LABELS,
  STORAGE_LOCATION_LABELS,
  ACCESS_ROLE_LABELS,
  RETENTION_PERIOD_LABELS,
} from '@/data/inventory/constants'
import { getRiskLabel } from '@/utils/inventory/riskScoring'

export function ExportPage() {
  const navigate = useNavigate()
  const { inventory } = useInventory()
  const [isExporting, setIsExporting] = useState(false)
  const [includeGaps, setIncludeGaps] = useState(true)
  const [includeStats, setIncludeStats] = useState(true)

  if (!inventory) return null

  const handleExportCSV = () => {
    setIsExporting(true)
    try {
      // Prepare data for CSV
      const csvData = inventory.dataElements.map((element) => ({
        Name: element.name,
        Category: DATA_CATEGORY_LABELS[element.category],
        Source: DATA_SOURCE_LABELS[element.source],
        Purposes: element.purposes.map((p) => COLLECTION_PURPOSE_LABELS[p]).join('; '),
        'Storage Location': STORAGE_LOCATION_LABELS[element.storageLocation],
        'Encryption at Rest': element.encryptionAtRest,
        'Encryption in Transit': element.encryptionInTransit,
        'Backup Strategy': element.backupStrategy.replace(/_/g, ' '),
        'Access Roles': element.accessRoles.map((r) => ACCESS_ROLE_LABELS[r]).join('; '),
        'Access Control Method': element.accessControlMethod.replace(/_/g, ' '),
        'Logging Enabled': element.loggingEnabled,
        'MFA Required': element.mfaRequired,
        'Retention Period': RETENTION_PERIOD_LABELS[element.retentionPeriod],
        'Custom Retention': element.customRetentionPeriod || '',
        'Deletion Policy': element.deletionPolicy.replace(/_/g, ' '),
        'User Deletion Rights': element.userDeletionRights.replace(/_/g, ' '),
        'Archival Process': element.archivalProcess || '',
        'Shared with Third Parties': element.sharedWithThirdParties ? 'Yes' : 'No',
        'Third Party Recipients': element.thirdPartyRecipients
          .map((r) => r.name)
          .join('; '),
        'Third Party Purposes': element.thirdPartyRecipients
          .map((r) => r.purpose)
          .join('; '),
        'Risk Level': getRiskLabel(element.riskLevel),
        'Risk Score': element.riskScore.toFixed(1),
        Notes: element.notes || '',
        'Created At': new Date(element.createdAt).toLocaleDateString(),
        'Updated At': new Date(element.updatedAt).toLocaleDateString(),
      }))

      // Convert to CSV using papaparse
      const csv = Papa.unparse(csvData)

      // Create download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `${inventory.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
      )
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Failed to export CSV. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPDF = () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      let yPos = margin

      // Helper to add new page if needed
      const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          doc.addPage()
          yPos = margin
          return true
        }
        return false
      }

      // Title
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Data Inventory Report', margin, yPos)
      yPos += 10

      // Inventory name and date
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(inventory.name, margin, yPos)
      yPos += 6
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPos)
      doc.setTextColor(0)
      yPos += 15

      // Stats section
      if (includeStats) {
        checkPageBreak(40)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Inventory Statistics', margin, yPos)
        yPos += 8

        const stats = {
          total: inventory.dataElements.length,
          highRisk: inventory.dataElements.filter((el) => el.riskLevel === 'high').length,
          mediumRisk: inventory.dataElements.filter((el) => el.riskLevel === 'medium').length,
          lowRisk: inventory.dataElements.filter((el) => el.riskLevel === 'low').length,
          withThirdParties: inventory.dataElements.filter((el) => el.sharedWithThirdParties)
            .length,
        }

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(`Total Data Elements: ${stats.total}`, margin + 5, yPos)
        yPos += 6
        doc.text(`High Risk Elements: ${stats.highRisk}`, margin + 5, yPos)
        yPos += 6
        doc.text(`Medium Risk Elements: ${stats.mediumRisk}`, margin + 5, yPos)
        yPos += 6
        doc.text(`Low Risk Elements: ${stats.lowRisk}`, margin + 5, yPos)
        yPos += 6
        doc.text(`Shared with Third Parties: ${stats.withThirdParties}`, margin + 5, yPos)
        yPos += 12
      }

      // Compliance gaps section
      if (includeGaps) {
        const gaps = analyzeComplianceGaps(inventory.dataElements, inventory.setup.ageGroups)
        const criticalGaps = gaps.filter((g) => g.severity === 'critical')
        const importantGaps = gaps.filter((g) => g.severity === 'important')

        checkPageBreak(40)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Compliance Gap Summary', margin, yPos)
        yPos += 8

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(`Total Gaps Identified: ${gaps.length}`, margin + 5, yPos)
        yPos += 6
        doc.text(`Critical: ${criticalGaps.length}`, margin + 5, yPos)
        yPos += 6
        doc.text(`Important: ${importantGaps.length}`, margin + 5, yPos)
        yPos += 6
        doc.text(
          `Recommendations: ${gaps.filter((g) => g.severity === 'recommendation').length}`,
          margin + 5,
          yPos
        )
        yPos += 12

        // List critical gaps
        if (criticalGaps.length > 0) {
          checkPageBreak(20)
          doc.setFont('helvetica', 'bold')
          doc.text('Critical Gaps (Immediate Attention Required):', margin, yPos)
          yPos += 6

          doc.setFont('helvetica', 'normal')
          criticalGaps.forEach((gap, idx) => {
            checkPageBreak(12)
            const text = `${idx + 1}. ${gap.title}`
            doc.text(text, margin + 5, yPos)
            yPos += 6
          })
          yPos += 6
        }
      }

      // Data elements section
      checkPageBreak(20)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Data Elements', margin, yPos)
      yPos += 8

      inventory.dataElements.forEach((element, idx) => {
        checkPageBreak(30)

        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text(`${idx + 1}. ${element.name}`, margin, yPos)
        yPos += 6

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text(`Category: ${DATA_CATEGORY_LABELS[element.category]}`, margin + 5, yPos)
        yPos += 5
        doc.text(`Risk: ${getRiskLabel(element.riskLevel)} (${element.riskScore.toFixed(1)}/10)`, margin + 5, yPos)
        yPos += 5
        doc.text(
          `Storage: ${STORAGE_LOCATION_LABELS[element.storageLocation]}`,
          margin + 5,
          yPos
        )
        yPos += 5
        doc.text(
          `Encryption: At Rest - ${element.encryptionAtRest}, In Transit - ${element.encryptionInTransit}`,
          margin + 5,
          yPos
        )
        yPos += 5

        if (element.sharedWithThirdParties) {
          doc.text(
            `Third Parties: ${element.thirdPartyRecipients.map((r) => r.name).join(', ')}`,
            margin + 5,
            yPos
          )
          yPos += 5
        }

        yPos += 3
      })

      // Footer on last page
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )
        doc.setTextColor(0)
      }

      // Save PDF
      doc.save(
        `${inventory.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      )
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const stats = {
    total: inventory.dataElements.length,
    highRisk: inventory.dataElements.filter((el) => el.riskLevel === 'high').length,
    mediumRisk: inventory.dataElements.filter((el) => el.riskLevel === 'medium').length,
    lowRisk: inventory.dataElements.filter((el) => el.riskLevel === 'low').length,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/inventory')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Export Data Inventory</h1>
          <p className="text-muted-foreground">
            Download your inventory data in CSV or PDF format for sharing, auditing, or backup
            purposes
          </p>
        </div>

        {/* Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Inventory Summary</CardTitle>
            <CardDescription>Current inventory: {inventory.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Elements</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
                <div className="text-sm text-muted-foreground">High Risk</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.mediumRisk}</div>
                <div className="text-sm text-muted-foreground">Medium Risk</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.lowRisk}</div>
                <div className="text-sm text-muted-foreground">Low Risk</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* CSV Export */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div>
                  <CardTitle>Export to CSV</CardTitle>
                  <CardDescription>Spreadsheet format for analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Includes:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>All data elements with complete details</li>
                  <li>Risk scores and security measures</li>
                  <li>Third-party sharing information</li>
                  <li>Timestamps and metadata</li>
                </ul>
              </div>
              <Button
                onClick={handleExportCSV}
                disabled={isExporting || inventory.dataElements.length === 0}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* PDF Export */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-red-600" />
                <div>
                  <CardTitle>Export to PDF</CardTitle>
                  <CardDescription>Professional report format</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Includes:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Executive summary with statistics</li>
                  <li>Compliance gap analysis</li>
                  <li>Complete data element listing</li>
                  <li>Risk levels and key details</li>
                </ul>
              </div>
              <div className="space-y-3">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setIncludeStats(!includeStats)}
                >
                  <Checkbox checked={includeStats} label="Include statistics" />
                </div>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setIncludeGaps(!includeGaps)}
                >
                  <Checkbox checked={includeGaps} label="Include compliance gaps" />
                </div>
              </div>
              <Button
                onClick={handleExportPDF}
                disabled={isExporting || inventory.dataElements.length === 0}
                className="w-full"
                variant="outline"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Help text */}
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle className="text-base">Export Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              <strong>CSV exports</strong> are ideal for further data analysis in Excel, Google
              Sheets, or other tools. All fields are included in tabular format.
            </p>
            <p>
              <strong>PDF exports</strong> create professional reports suitable for sharing with
              stakeholders, auditors, or legal counsel.
            </p>
            <p>
              Consider exporting regularly to maintain backups of your data inventory and track
              changes over time.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
