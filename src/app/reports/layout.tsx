import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function ReportsPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
