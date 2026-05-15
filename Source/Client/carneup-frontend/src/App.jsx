import { useState, useEffect } from 'react'
import { getToken, isTokenValid } from './services/cookieUtils'
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
import { ConfiguracaoView } from './views/ConfiguracaoView'

const ADMIN_ONLY_VIEWS = new Set(['discard', 'attributes', 'reports', 'configuracoes', 'settings', 'config-loja'])

export default function App() {
	const [currentView, setCurrentView] = useState('login')
	const [recoveryEmail, setRecoveryEmail] = useState('')
	const [recoveryCode, setRecoveryCode] = useState('')
	const [selectedClientId, setSelectedClientId] = useState(null)

	useEffect(() => {
		const token = getToken()
		if (token && isTokenValid(token)) {
			setCurrentView('dashboard')
		}
	}, [])

	const isAdmin = () => localStorage.getItem('accessLevel') === 'ADM'

	const navigate = (view, params = {}) => {
		if (ADMIN_ONLY_VIEWS.has(view) && !isAdmin()) return
		if (params.clientId) setSelectedClientId(params.clientId)
		setCurrentView(view)
	}

	const renderView = () => {
		// Bloqueia acesso direto a rotas admin por operadores
		if (ADMIN_ONLY_VIEWS.has(currentView) && !isAdmin()) {
			return <DashboardView navigate={navigate} />
		}

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
			case 'config-loja':
				return <ConfiguracaoView navigate={navigate} />
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
