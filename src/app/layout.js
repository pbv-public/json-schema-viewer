import CssBaseline from '@mui/material/CssBaseline'
import '@fontsource/roboto/400.css'
import './global.sass'

import { TableOfContents } from './table-of-contents.js'

export const metadata = { title: 'JSON Schema Viewer' }

export default function RootLayout ({ children }) {
  return (
    <html lang="en">
      <body>
        <CssBaseline />
        <div className="root-frame">
          <TableOfContents />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

export const Metadata = {
  viewport: 'initial-scale=1, width=device-width'
}
