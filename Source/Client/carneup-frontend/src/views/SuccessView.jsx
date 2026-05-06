import styled from 'styled-components'
import { AuthShell } from '../components/AuthShell'

const Message = styled.p`
	font-size: 18px;
	color: #1a1c1c;
	text-align: center;
	margin-bottom: 20px;
`

const Button = styled.button`
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
`

export const SuccessView = ({ navigate }) => {
	return (
		<AuthShell sectionTitle='Senha alterada com sucesso'>
			<Message>Agora voce ja pode fazer login com a nova senha.</Message>
			<Button onClick={() => navigate('login')}>Voltar para login</Button>
		</AuthShell>
	)
}

