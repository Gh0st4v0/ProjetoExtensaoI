import React, { useState } from 'react'
import styled from 'styled-components'
import { login as loginRequest } from '../services/authApi'
import { AuthShell } from '../components/AuthShell'

const Form = styled.form`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 24px;
`

const InputGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`

const Label = styled.label`
	font-weight: 600;
	font-size: 14px;
	color: #1a1c1c;
	text-transform: uppercase;
	letter-spacing: 0.05em;
`

const InputWrapper = styled.div`
	position: relative;

	.icon {
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		color: #5a403c;
	}
`

const StyledInput = styled.input`
	width: 100%;
	height: 56px;
	background-color: #f3f3f3;
	border: none;
	border-bottom: 2px solid
		${(props) => (props.$hasError ? '#ba1a1a' : '#e3beb8')};
	padding: 0 16px 0 48px;
	font-family: 'Work Sans', sans-serif;
	font-size: 16px;
	color: #1a1c1c;
	outline: none;
	transition: border-color 0.2s;

	&::placeholder {
		color: rgba(90, 64, 60, 0.5);
	}
	&:focus {
		border-color: ${(props) => (props.$hasError ? '#ba1a1a' : '#b32925')};
	}
`

const ErrorMessage = styled.span`
	color: #ba1a1a; /* Cor de erro oficial da sua paleta */
	font-size: 14px;
	font-weight: 600;
	text-align: center;
	margin-top: -8px;
`

const ForgotPasswordLink = styled.button`
	background: none;
	border: none;
	font-size: 14px;
	color: #610005;
	font-weight: 500;
	text-align: right;
	margin-top: -16px;
	cursor: pointer;
	transition: color 0.2s;

	&:hover {
		color: #8a040d;
		text-decoration: underline;
	}
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
	letter-spacing: 0.025em;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	margin-top: 8px;
	transition: all 0.2s;

	&:hover {
		opacity: 0.9;
	}
	&:active {
		transform: scale(0.98);
	}
`

export const LoginView = ({ navigate }) => {
	const [login, setLogin] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(false)

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError(false)

		if (login.trim() === '' || password.trim() === '') {
			setError(true)
			return
		}

		setLoading(true)
		try {
			const data = await loginRequest(login.trim(), password)
			if (data?.token) {
				localStorage.setItem('authToken', data.token)
				localStorage.setItem('userName', data.userName || '')
				localStorage.setItem('userId', String(data.userId || ''))
				localStorage.setItem('accessLevel', data.accessLevel || '')
			}
			navigate('dashboard')
		} catch {
			setError(true)
		} finally {
			setLoading(false)
		}
	}

	return (
		<AuthShell>
			<Form onSubmit={handleSubmit}>
				<InputGroup>
					<Label htmlFor='login'>Usuário ou E-mail</Label>
					<InputWrapper>
						<span className='material-symbols-outlined icon'>person</span>
						<StyledInput
							id='login'
							type='text'
							placeholder='Digite seu e-mail ou usuário'
							value={login}
							onChange={(e) => setLogin(e.target.value)}
							$hasError={error}
						/>
					</InputWrapper>
				</InputGroup>

				<InputGroup>
					<Label htmlFor='password'>Senha</Label>
					<InputWrapper>
						<span className='material-symbols-outlined icon'>lock</span>
						<StyledInput
							id='password'
							type='password'
							placeholder='••••••••'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							$hasError={error}
						/>
					</InputWrapper>
				</InputGroup>

				{error && <ErrorMessage>Usuario/e-mail ou senha incorretos</ErrorMessage>}

				<ForgotPasswordLink type='button' onClick={() => navigate('forgot')}>
					Esqueceu a senha?
				</ForgotPasswordLink>

				<SubmitButton type='submit'>
					<span>{loading ? 'Entrando...' : 'Entrar'}</span>
					<span className='material-symbols-outlined'>arrow_forward</span>
				</SubmitButton>
			</Form>
		</AuthShell>
	)
}
