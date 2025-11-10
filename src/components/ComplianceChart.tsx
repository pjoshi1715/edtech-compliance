import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ComplianceChartProps {
  critical: number
  high: number
  medium: number
}

export function ComplianceChart({ critical, high, medium }: ComplianceChartProps) {
  const data = [
    { name: 'Critical Priority', value: critical, color: '#ef4444' },
    { name: 'High Priority', value: high, color: '#f59e0b' },
    { name: 'Medium Priority', value: medium, color: '#3b82f6' },
  ].filter((item) => item.value > 0)

  if (data.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Priority Distribution</CardTitle>
        <CardDescription>
          Breakdown of applicable regulations by priority level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
