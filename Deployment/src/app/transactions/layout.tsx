import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function TransactionsPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
