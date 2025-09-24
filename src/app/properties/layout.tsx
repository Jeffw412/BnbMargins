import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function PropertiesPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
