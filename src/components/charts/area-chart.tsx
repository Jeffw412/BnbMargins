"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface AreaChartProps {
  title: string
  description?: string
  data: Array<{
    name: string
    income?: number
    expenses?: number
    profit?: number
    [key: string]: string | number
  }>
  height?: number
}

export function CustomAreaChart({ 
  title, 
  description, 
  data, 
  height = 300 
}: AreaChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                color: "hsl(var(--card-foreground))"
              }}
              formatter={(value, name) => [`$${value}`, name]}
            />
            {data[0]?.income !== undefined && (
              <Area 
                type="monotone" 
                dataKey="income" 
                stackId="1"
                stroke="hsl(var(--chart-2))" 
                fillOpacity={1} 
                fill="url(#colorIncome)" 
              />
            )}
            {data[0]?.expenses !== undefined && (
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stackId="2"
                stroke="hsl(var(--chart-4))" 
                fillOpacity={1} 
                fill="url(#colorExpenses)" 
              />
            )}
            {data[0]?.profit !== undefined && (
              <Area 
                type="monotone" 
                dataKey="profit" 
                stackId="3"
                stroke="hsl(var(--chart-1))" 
                fillOpacity={1} 
                fill="url(#colorProfit)" 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
