import './global.sass'
import '@fontsource/roboto/latin-400.css'
import CssBaseline from '@mui/material/CssBaseline'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import { basename } from './basename.js'
import { Root } from './root.jsx'
import { JSONSchemaViewer } from './schema.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssBaseline />
    <RouterProvider router={createBrowserRouter([
      {
        path: '/',
        element: <Root />,
        children: [
          {
            path: '',
            element: <JSONSchemaViewer />
          },
          {
            path: '*',
            element: <JSONSchemaViewer />
          }
        ]
      }
    ], { basename })}
    />
  </React.StrictMode>
)
