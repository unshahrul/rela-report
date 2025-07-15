// app/layout.tsx
export const metadata = {
  title: "Laporan RELA",
  description: "Borang laporan bergambar untuk RELA",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
