import { useState } from 'react'
import styled from 'styled-components'
import { AuthShell } from '../components/AuthShell'
import { requestPasswordRecovery } from '../services/authApi'

const Form = styled.form`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
`

const Label = styled.label`
	font-weight: 600;
	font-size: 14px;
	color: #1a1c1c;
	text-transform: uppercase;
	letter-spacing: 0.05em;
`

const Input = styled.input`
	width: 100%;
	height: 56px;
	background-color: #f3f3f3;
	border: none;
	border-bottom: 2px solid ${(props) => (props.$hasError ? '#ba1a1a' : '#e3beb8')};
	padding: 0 16px;
	font-family: 'Work Sans', sans-serif;
	font-size: 16px;
	color: #1a1c1c;
	outline: none;
`

const ErrorMessage = styled.p`
	color: #ba1a1a;
	font-size: 14px;
	font-weight: 600;
	text-align: center;
`

const SubmitButton = styled.button`
	width: 100%;
	height: 56px;
	border-radius: 4px;
	background: linear-gradient(to right, #610005, #8a040d);
	color: #ffffff;
	border: none;
	font-family: 'Epilogue', sans-serif;
	font-weight: 700;
	font-size: 18px;
	cursor: pointer;
	opacity: ${(props) => (props.disabled ? 0.7 : 1)};
`

export const ForgotPasswordView = ({ navigate, setRecoveryEmail }) => {
	const [email, setEmail] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handleSendCode = async (e) => {
		e.preventDefault()
		setError('')

		if (!email.trim()) {
			setError('Informe seu e-mail.')
			return
		}

		setLoading(true)
		try {
			await requestPasswordRecovery(email.trim())
			setRecoveryEmail(email.trim())
			navigate('code')
		} catch (err) {
			const message =
				err?.response?.data?.message ||
				'Nao foi possivel solicitar o codigo. Tente novamente.'
			setError(message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<AuthShell sectionTitle='Esqueci minha senha'>
			<Form onSubmit={handleSendCode}>
				<div>
					<Label htmlFor='email'>E-mail</Label>
					<Input
						id='email'
						type='email'
						placeholder='Digite seu e-mail'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						$hasError={Boolean(error)}
					/>
				</div>
				{error && <ErrorMessage>{error}</ErrorMessage>}
				<SubmitButton type='submit' disabled={loading}>
					{loading ? 'Enviando...' : 'Enviar codigo'}
				</SubmitButton>
			</Form>
		</AuthShell>
	)
}

