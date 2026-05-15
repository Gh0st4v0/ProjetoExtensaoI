import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { login as loginRequest } from '../services/authApi'
import { AuthShell } from '../components/AuthShell'
import { useAttributes } from '../context/AttributesContext'
import { setToken } from '../services/cookieUtils'

const WelcomeText = styled.p`
	font-size: 14px;
	color: #78716c;
	margin: 0 0 8px;
	text-align: center;
`

const Form = styled.form`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 18px;
`

const InputGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: 6px;
`

const Label = styled.label`
	font-weight: 700;
	font-size: 11px;
	color: #5a403c;
	text-transform: uppercase;
	letter-spacing: 0.1em;
`

const InputWrapper = styled.div`
	position: relative;

	.icon {
		position: absolute;
		left: 14px;
		top: 50%;
		transform: translateY(-50%);
		color: #a8a29e;
		font-size: 20px;
	}
`

const StyledInput = styled.input`
	width: 100%;
	height: 52px;
	background-color: #fafaf9;
	border: 1.5px solid ${p => p.$hasError ? '#ba1a1a' : '#e5e7eb'};
	border-radius: 10px;
	padding: 0 44px 0 44px;
	font-family: 'Work Sans', sans-serif;
	font-size: 15px;
	color: #1a1c1c;
	outline: none;
	transition: border-color 0.15s, box-shadow 0.15s;
	box-sizing: border-box;

	&::placeholder { color: #c4bcb8; }

	&:focus {
		border-color: ${p => p.$hasError ? '#ba1a1a' : '#610005'};
		box-shadow: 0 0 0 3px ${p => p.$hasError ? 'rgba(186,26,26,0.12)' : 'rgba(97,0,5,0.1)'};
		background: #fff;
	}
`

const ErrorBox = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	background: #fef2f2;
	border: 1px solid #fecaca;
	border-radius: 8px;
	padding: 10px 14px;
	color: #ba1a1a;
	font-size: 13px;
	font-weight: 600;
`

const ForgotPasswordLink = styled.button`
	background: none;
	border: none;
	font-size: 13px;
	color: #610005;
	font-weight: 600;
	text-align: right;
	cursor: pointer;
	transition: color 0.15s;
	padding: 0;
	align-self: flex-end;
	margin-top: -6px;

	&:hover { color: #8a040d; text-decoration: underline; }
`

const SubmitButton = styled.button`
	width: 100%;
	height: 52px;
	border-radius: 10px;
	background: linear-gradient(135deg, #610005 0%, #8a040d 100%);
	color: #ffffff;
	border: none;
	font-family: 'Epilogue', sans-serif;
	font-weight: 900;
	font-size: 15px;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	margin-top: 6px;
	transition: all 0.15s;
	box-shadow: 0 4px 16px rgba(97,0,5,0.35);

	&:hover {
		background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
		box-shadow: 0 6px 20px rgba(97,0,5,0.45);
		transform: translateY(-1px);
	}
	&:active { transform: translateY(0); box-shadow: 0 2px 8px rgba(97,0,5,0.3); }
	&:disabled { opacity: 0.65; cursor: not-allowed; transform: none; box-shadow: none; }
`

export const LoginView = ({ navigate }) => {
	const { reload } = useAttributes()
	const [login, setLogin] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [loading, setLoading] = useState(false)
	const [errorMsg, setErrorMsg] = useState('')
	const loginRef = useRef(null)

	useEffect(() => { loginRef.current?.focus() }, [])

	const handleSubmit = async (e) => {
		e.preventDefault()
		setErrorMsg('')

		if (login.trim() === '' || password.trim() === '') {
			setErrorMsg('Preencha usuário e senha.')
			return
		}

		setLoading(true)
		try {
			const data = await loginRequest(login.trim(), password)
			if (data?.token) {
				setToken(data.token)
				localStorage.setItem('userName', data.userName || '')
				localStorage.setItem('userId', String(data.userId || ''))
				localStorage.setItem('accessLevel', data.accessLevel || '')
			}
			await reload()
			navigate('dashboard')
		} catch (err) {
			const status = err?.response?.status
			if (status === 404 || status === 401) {
				setErrorMsg('Usuário ou senha incorretos.')
			} else if (status >= 500) {
				setErrorMsg('Erro no servidor. Tente novamente em alguns instantes.')
			} else {
				setErrorMsg('Não foi possível conectar. Verifique sua conexão.')
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<AuthShell>
			<WelcomeText>Faça login para continuar</WelcomeText>
			<Form onSubmit={handleSubmit}>
				<InputGroup>
					<Label htmlFor='login'>Usuário ou E-mail</Label>
					<InputWrapper>
						<span className='material-symbols-outlined icon'>person</span>
						<StyledInput
							id='login'
							ref={loginRef}
							type='text'
							placeholder='seu usuário ou e-mail'
							value={login}
							onChange={(e) => setLogin(e.target.value)}
							$hasError={!!errorMsg}
							autoComplete='username'
						/>
					</InputWrapper>
				</InputGroup>

				<InputGroup>
					<Label htmlFor='password'>Senha</Label>
					<InputWrapper>
						<span className='material-symbols-outlined icon'>lock</span>
						<StyledInput
							id='password'
							type={showPassword ? 'text' : 'password'}
							placeholder='sua senha'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							$hasError={!!errorMsg}
							autoComplete='current-password'
						/>
						<button
							type='button'
							onClick={() => setShowPassword(v => !v)}
							style={{
								position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
								background: 'none', border: 'none', cursor: 'pointer',
								color: '#a8a29e', padding: 0, display: 'flex', alignItems: 'center',
							}}
							tabIndex={-1}
							title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
						>
							<span className='material-symbols-outlined' style={{ fontSize: 20 }}>
								{showPassword ? 'visibility_off' : 'visibility'}
							</span>
						</button>
					</InputWrapper>
				</InputGroup>

				{errorMsg && (
					<ErrorBox>
						<span className='material-symbols-outlined' style={{ fontSize: 18, flexShrink: 0 }}>error</span>
						{errorMsg}
					</ErrorBox>
				)}

				<ForgotPasswordLink type='button' onClick={() => navigate('forgot')}>
					Esqueceu a senha?
				</ForgotPasswordLink>

				<SubmitButton type='submit' disabled={loading}>
					{loading
						? <><span className='material-symbols-outlined' style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}>progress_activity</span> Entrando...</>
						: <><span>Entrar</span><span className='material-symbols-outlined' style={{ fontSize: 18 }}>arrow_forward</span></>
					}
				</SubmitButton>
			</Form>
		</AuthShell>
	)
}
