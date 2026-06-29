import AdminSidebar from '@/components/admin/AdminSidebar'
import styles from './layout.module.css'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.adminWrapper}>
      <AdminSidebar />
      <main className={styles.mainContent}>{children}</main>
    </div>
  )
}
