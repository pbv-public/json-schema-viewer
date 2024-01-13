import './global.sass'
import '@fontsource/roboto/400.css'
import CssBaseline from '@mui/material/CssBaseline'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import Home from './home.jsx'
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
            path: 'schema/:schemaId',
            element: <JSONSchemaViewer />
          },
          {
            path: '*',
            element: <Home />
          }
        ]
      }
    ])}
    />
  </React.StrictMode>
)
