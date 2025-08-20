// app/course/layout.tsx
export default function CourseLayout({ children }: { children: React.ReactNode }) {
  // ✅ No <html> or <body> here
  return <div className="min-h-screen">{children}</div>;
}
