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

export default function App() {
	const [currentView, setCurrentView] = useState('login')
	const [recoveryEmail, setRecoveryEmail] = useState('')
	const [recoveryCode, setRecoveryCode] = useState('')

	useEffect(() => {
		// Verificar se há token no localStorage ao carregar a página
		const token = localStorage.getItem('authToken')
		if (token) {
			setCurrentView('dashboard')
		}
	}, [])

	const renderView = () => {
		switch (currentView) {
			case 'login':
				return <LoginView navigate={setCurrentView} />
			case 'dashboard':
				return <DashboardView navigate={setCurrentView} />
			case 'sales':
				return <SalesView navigate={setCurrentView} />
			case 'forgot':
				return (
					<ForgotPasswordView
						navigate={setCurrentView}
						setRecoveryEmail={setRecoveryEmail}
					/>
				)
			case 'code':
				return (
					<RecoveryCodeView
						navigate={setCurrentView}
						recoveryEmail={recoveryEmail}
						setRecoveryCode={setRecoveryCode}
					/>
				)
			case 'reset':
				return (
					<ResetPasswordView
						navigate={setCurrentView}
						recoveryCode={recoveryCode}
					/>
				)
			case 'success':
				return <SuccessView navigate={setCurrentView} />
			case 'stock':
				return <StockView navigate={setCurrentView} />
			case 'discard':
				return <DiscardView navigate={setCurrentView} />
			case 'purchases':
				return <PurchaseView navigate={setCurrentView} />
			case 'attributes':
				return <AttributesView navigate={setCurrentView} />
			case 'configuracoes':
				return <SettingsView navigate={setCurrentView} />
		case 'settings':
				return <SettingsView navigate={setCurrentView} />
		case 'reports':
				return <ReportsView navigate={setCurrentView} />
		default:
				return <LoginView navigate={setCurrentView} />
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
