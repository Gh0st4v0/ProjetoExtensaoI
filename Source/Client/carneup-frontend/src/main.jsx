import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-toastify/dist/ReactToastify.css'
import { AttributesProvider } from './context/AttributesContext'

createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<AttributesProvider>
			<App />
		</AttributesProvider>
	</React.StrictMode>
)
