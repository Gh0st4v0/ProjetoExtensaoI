import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { AuthShell } from '../components/AuthShell'
import { requestPasswordRecovery, validateRecoveryCode } from '../services/authApi'

const COOL_DOWN_SECONDS = 5 * 60

const Form = styled.form`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 18px;
`

const PinContainer = styled.div`
	display: flex;
	justify-content: center;
	gap: 10px;
`

const PinInput = styled.input`
	width: 50px;
	height: 56px;
	background-color: #f3f3f3;
	border: none;
	border-bottom: 2px solid #e3beb8;
	text-align: center;
	color: #1a1c1c;
	font-size: 22px;
	font-weight: 700;
	outline: none;
`

const Info = styled.p`
	text-align: center;
	font-size: 14px;
	color: #5a403c;
`

const ErrorMessage = styled.p`
	color: #ba1a1a;
	font-size: 14px;
	font-weight: 600;
	text-align: center;
`

const PrimaryButton = styled.button`
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

const SecondaryButton = styled.button`
	width: 100%;
	height: 44px;
	border-radius: 4px;
	background: transparent;
	color: #610005;
	border: 1px solid #610005;
	font-family: 'Epilogue', sans-serif;
	font-weight: 700;
	font-size: 14px;
	cursor: pointer;
	opacity: ${(props) => (props.disabled ? 0.6 : 1)};
`

export const RecoveryCodeView = ({
	navigate,
	recoveryEmail,
	setRecoveryCode
}) => {
	const [code, setCode] = useState(['', '', '', '', '', ''])
	const [cooldown, setCooldown] = useState(COOL_DOWN_SECONDS)
	const [error, setError] = useState('')
	const [resending, setResending] = useState(false)
	const [validating, setValidating] = useState(false)
	const inputRefs = useRef([])

	useEffect(() => {
		const timer = setInterval(() => {
			setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
		}, 1000)

		return () => clearInterval(timer)
	}, [])

	const handleChange = (index, value) => {
		if (value !== '' && !/^[a-zA-Z0-9]+$/.test(value)) return
		const upperValue = value.toUpperCase()
		const newCode = [...code]
		newCode[index] = upperValue
		setCode(newCode)
		if (upperValue !== '' && index < 5) inputRefs.current[index + 1]?.focus()
	}

	const handleKeyDown = (index, e) => {
		if (e.key === 'Backspace' && code[index] === '' && index > 0) {
			inputRefs.current[index - 1]?.focus()
		}
	}

	const handleConfirm = (e) => {
		e.preventDefault()
		setError('')
		const finalCode = code.join('')
		if (finalCode.length !== 6) {
			setError('Informe os 6 caracteres do codigo.')
			return
		}
		setValidating(true)
		validateRecoveryCode(finalCode)
			.then(() => {
				setRecoveryCode(finalCode)
				navigate('reset')
			})
			.catch((err) => {
				const message =
					err?.response?.data?.message || 'Codigo invalido ou expirado.'
				setError(message)
			})
			.finally(() => setValidating(false))
	}

	const handleResend = async () => {
		if (cooldown > 0 || !recoveryEmail) return
		setError('')
		setResending(true)
		try {
			await requestPasswordRecovery(recoveryEmail)
			setCooldown(COOL_DOWN_SECONDS)
		} catch (err) {
			setError(
				err?.response?.data?.message ||
					'Nao foi possivel reenviar o codigo agora.'
			)
		} finally {
			setResending(false)
		}
	}

	const minutes = String(Math.floor(cooldown / 60)).padStart(2, '0')
	const seconds = String(cooldown % 60).padStart(2, '0')

	return (
		<AuthShell sectionTitle='Digite o codigo recebido'>
			<Form onSubmit={handleConfirm}>
				<PinContainer>
					{code.map((digit, index) => (
						<PinInput
							key={index}
							type='text'
							maxLength='1'
							value={digit}
							ref={(el) => (inputRefs.current[index] = el)}
							onChange={(e) => handleChange(index, e.target.value)}
							onKeyDown={(e) => handleKeyDown(index, e)}
						/>
					))}
				</PinContainer>

				<Info>
					{cooldown > 0
						? `Reenviar disponivel em ${minutes}:${seconds}`
						: 'Voce ja pode reenviar o codigo'}
				</Info>

				{error && <ErrorMessage>{error}</ErrorMessage>}

				<PrimaryButton type='submit' disabled={validating}>
					{validating ? 'Validando...' : 'Confirmar codigo'}
				</PrimaryButton>
				<SecondaryButton
					type='button'
					onClick={handleResend}
					disabled={cooldown > 0 || resending}
				>
					{resending ? 'Reenviando...' : 'Reenviar codigo'}
				</SecondaryButton>
			</Form>
		</AuthShell>
	)
}

