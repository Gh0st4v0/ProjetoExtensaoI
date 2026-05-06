import { useState } from 'react'
import styled from 'styled-components'
import { AuthShell } from '../components/AuthShell'
import { resetPassword } from '../services/authApi'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

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

const Hint = styled.p`
	font-size: 13px;
	color: #5a403c;
	text-align: center;
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

export const ResetPasswordView = ({ navigate, recoveryCode }) => {
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError('')

		if (!recoveryCode || recoveryCode.length !== 6) {
			setError('Codigo invalido. Solicite um novo codigo.')
			return
		}

		if (!passwordRegex.test(password)) {
			setError(
				'A senha deve ter no minimo 8 caracteres, com 1 maiuscula, 1 minuscula, 1 numero e 1 simbolo.'
			)
			return
		}

		if (password !== confirmPassword) {
			setError('As senhas nao coincidem.')
			return
		}

		setLoading(true)
		try {
			await resetPassword(recoveryCode, password)
			navigate('success')
		} catch (err) {
			setError(
				err?.response?.data?.message || 'Nao foi possivel redefinir a senha.'
			)
		} finally {
			setLoading(false)
		}
	}

	return (
		<AuthShell sectionTitle='Crie sua nova senha'>
			<Form onSubmit={handleSubmit}>
				<div>
					<Label htmlFor='new-password'>Nova senha</Label>
					<Input
						id='new-password'
						type='password'
						placeholder='Digite sua nova senha'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						$hasError={Boolean(error)}
					/>
				</div>
				<div>
					<Label htmlFor='confirm-password'>Confirmar senha</Label>
					<Input
						id='confirm-password'
						type='password'
						placeholder='Repita a nova senha'
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						$hasError={Boolean(error)}
					/>
				</div>
				<Hint>
					Minimo 8 caracteres, com letra maiuscula, minuscula, numero e
					simbolo.
				</Hint>
				{error && <ErrorMessage>{error}</ErrorMessage>}
				<SubmitButton type='submit' disabled={loading}>
					{loading ? 'Salvando...' : 'Salvar senha'}
				</SubmitButton>
			</Form>
		</AuthShell>
	)
}

