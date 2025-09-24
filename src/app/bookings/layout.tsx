import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function BookingsPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
