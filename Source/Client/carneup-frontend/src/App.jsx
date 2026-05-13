import { useState, useEffect } from 'react'
import { ToastContainer } from 'react-toastify'

import { GlobalStyle } from './GlobalStyle'

import { LoginView } from './views/LoginView'
import { DashboardView } from './views/DashboardView'
import { SalesView } from './views/SalesView'
import { StockView } from './views/StockViewV2'
import { SettingsView } from './views/SettingsView'
import { ForgotPasswordView } from './views/ForgotPasswordView'
import { RecoveryCodeView } from './views/RecoveryCodeView'
import { ResetPasswordView } from './views/ResetPasswordView'
import { SuccessView } from './views/SuccessView'
import { DiscardView } from './views/DiscardView'
import { PurchaseView } from './views/PurchaseView'
import AttributesView from './views/AttributesView'
import { ReportsView } from './views/ReportsView'
import { ClienteHistoricoView } from './views/ClienteHistoricoView'

export default function App() {
	const [currentView, setCurrentView] = useState('login')
	const [recoveryEmail, setRecoveryEmail] = useState('')
	const [recoveryCode, setRecoveryCode] = useState('')
	const [selectedClientId, setSelectedClientId] = useState(null)

	useEffect(() => {
		const token = localStorage.getItem('authToken')
		if (token) setCurrentView('dashboard')
	}, [])

	// navigate pode ser chamado como navigate('view') ou navigate('view', { clientId: 1 })
	const navigate = (view, params = {}) => {
		if (params.clientId) setSelectedClientId(params.clientId)
		setCurrentView(view)
	}

	const renderView = () => {
		switch (currentView) {
			case 'login':
				return <LoginView navigate={navigate} />
			case 'dashboard':
				return <DashboardView navigate={navigate} />
			case 'sales':
				return <SalesView navigate={navigate} />
			case 'forgot':
				return <ForgotPasswordView navigate={navigate} setRecoveryEmail={setRecoveryEmail} />
			case 'code':
				return <RecoveryCodeView navigate={navigate} recoveryEmail={recoveryEmail} setRecoveryCode={setRecoveryCode} />
			case 'reset':
				return <ResetPasswordView navigate={navigate} recoveryCode={recoveryCode} />
			case 'success':
				return <SuccessView navigate={navigate} />
			case 'stock':
				return <StockView navigate={navigate} />
			case 'discard':
				return <DiscardView navigate={navigate} />
			case 'purchases':
				return <PurchaseView navigate={navigate} />
			case 'attributes':
				return <AttributesView navigate={navigate} />
			case 'configuracoes':
			case 'settings':
				return <SettingsView navigate={navigate} />
			case 'reports':
				return <ReportsView navigate={navigate} />
			case 'cliente-historico':
				return <ClienteHistoricoView navigate={navigate} clientId={selectedClientId} />
			default:
				return <LoginView navigate={navigate} />
		}
	}

	return (
		<>
			<GlobalStyle />
			{renderView()}
			<ToastContainer
				position='top-right'
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				pauseOnHover
				draggable
			/>
		</>
	)
}
