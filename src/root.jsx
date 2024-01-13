import { Outlet } from 'react-router-dom'

import { TableOfContents } from './table-of-contents.jsx'

export function Root () {
  return (
    <div className="root-frame">
      <TableOfContents />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
