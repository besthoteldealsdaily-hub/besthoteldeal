// Root admin layout — minimal shell.
// The sidebar lives in admin/(panel)/layout.tsx so it only wraps dashboard pages.
// Login page at admin/login/ stays sidebar-free.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
