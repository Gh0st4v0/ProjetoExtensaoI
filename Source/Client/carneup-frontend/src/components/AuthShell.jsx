import styled from 'styled-components'

const Wrapper = styled.div`
	background-color: #eeeeee;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	font-family: 'Work Sans', sans-serif;
	color: #1a1c1c;
`

const Header = styled.header`
	width: 100%;
	padding: 24px;
	display: flex;
	justify-content: flex-end;
`

const HelpButton = styled.button`
	display: flex;
	align-items: center;
	gap: 8px;
	background: transparent;
	border: none;
	color: #5a403c;
	cursor: pointer;

	span:first-child {
		font-weight: 500;
		font-size: 14px;
	}
`

const Main = styled.main`
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24px;
`

const Card = styled.div`
	width: 100%;
	max-width: 480px;
	background-color: #ffffff;
	border-radius: 4px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	overflow: hidden;
	display: flex;
	flex-direction: column;
`

const HeroImage = styled.div`
	width: 100%;
	height: 160px;
	background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCyu5khZZOK69PnDwJDilUi261VWwxEbGMLZiPd9eNhwQH15Jqt7pOPc4T-Q_uGTS2cl7RykRMc3TrEokgT7n6nCHDOUqdJ09heX-37UZdFUNPCejCEJZOBeec7joOWmFDdJv13-AKKlYryYUcEX7zE9kiyhumIzJregf1Xhx4lGgNMZDhVwZ7BaRiPL2nzAUxZx7QbgDawhxJ73MQVbN03E9z-4xIJhUyKtYqcrFNI1bLC_E_aNLH1FWvS_kStvsK31a2fLuFANOY');
	background-position: center;
	background-size: cover;
	background-repeat: no-repeat;
	position: relative;

	&::after {
		content: '';
		position: absolute;
		inset: 0;
		background-color: rgba(249, 249, 249, 0.2);
	}
`

const ContentContainer = styled.div`
	padding: 0 32px 40px;
	display: flex;
	flex-direction: column;
	align-items: center;
`

const LogoBox = styled.div`
	width: 96px;
	height: 96px;
	border-radius: 50%;
	border: 4px solid #ffffff;
	margin-top: -48px;
	background-color: #f9f9f9;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	z-index: 10;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuApmaDLSHGHO5fognudTS_Uxh00Y8IRppqxSqR9owIO7Ly-O1DA_5PtVR4eUL34GOuy5qJ8lgdgQh1Z8o3Aqqo3gvQUPRUjvV6CGOLIuT4FCTCo8RGrk8hyVZnWtIssIpIMF77a_gTWdgcx8F8zBTjcXWhzwV-0XjC0Z7cRAVdXj7N-au1JueuGJQKfykBQF2GzhB96tO4DWdLmDjKIYsaurYIECJt2ybcuZc4LNzefh8gJP83jbJ3pS112rTA--eJXDLx8wfW_jr8');
	background-position: center;
	background-size: cover;
`

const BrandTitle = styled.h1`
	font-family: 'Epilogue', sans-serif;
	font-size: 30px;
	font-weight: 700;
	color: #1a1c1c;
	letter-spacing: -0.025em;
	margin-top: 24px;
	margin-bottom: 8px;
	text-align: center;
`

const SectionTitle = styled.h2`
	font-family: 'Work Sans', sans-serif;
	font-size: 20px;
	font-weight: 600;
	color: #1a1c1c;
	margin-bottom: 24px;
	text-align: center;
`

const Footer = styled.footer`
	width: 100%;
	padding: 16px 0;
	text-align: center;
	font-size: 12px;
	color: #5a403c;
`

export const AuthShell = ({ sectionTitle, children }) => {
	return (
		<Wrapper>
			<Header>
				<HelpButton>
					<span>Precisa de ajuda?</span>
					<span className='material-symbols-outlined'>help</span>
				</HelpButton>
			</Header>

			<Main>
				<Card>
					<HeroImage />
					<ContentContainer>
						<LogoBox />
						<BrandTitle>CarneUp</BrandTitle>
						{sectionTitle ? <SectionTitle>{sectionTitle}</SectionTitle> : null}
						{children}
					</ContentContainer>
				</Card>
			</Main>

			<Footer>CarneUp System v1.0.0 © 2026</Footer>
		</Wrapper>
	)
}

