import { Inter } from "next/font/google"
import "normalize.css/normalize.css"

import { StorageProvider } from "@/utils/storage"

const inter = Inter({ subsets: ["latin"] })

export const metadata = { title: "JSON Schema Viewer" }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <StorageProvider>
          <div className="root-frame">{children}</div>
        </StorageProvider>
      </body>
    </html>
  )
}
