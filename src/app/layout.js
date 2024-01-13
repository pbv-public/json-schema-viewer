import { Inter } from 'next/font/google'
import 'normalize.css/normalize.css'
import './global.sass'

import { StorageProvider } from '../utils/storage.js'

import { TableOfContents } from './table-of-contents.js'

const inter = Inter({ subsets: ['latin'] })

export const metadata = { title: 'JSON Schema Viewer' }

export default function RootLayout ({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <StorageProvider>
          <div className="root-frame">
            <TableOfContents />
            <main className="main-content">
              {children}
            </main>
          </div>
        </StorageProvider>
      </body>
    </html>
  )
}
