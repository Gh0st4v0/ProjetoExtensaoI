import React from 'react'
import styled from 'styled-components'

const FooterContainer = styled.footer`
	padding: 24px;
	background-color: #ffffff;
	border-top: 1px solid #e7e5e4;
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 10px;
	font-family: 'Work Sans', sans-serif;
	text-transform: uppercase;
	letter-spacing: 0.1em;
	color: #78716c;

	.footer-links {
		display: flex;
		gap: 16px;
		a {
			color: #78716c;
			text-decoration: none;
			transition: color 0.2s;
			&:hover {
				color: #610005;
			}
		}
	}
`

export const Footer = () => {
	return (
		<FooterContainer>
			<p>© 2026 CarneUp System. All Rights Reserved.</p>
			<div className='footer-links'>
				<a href='#'>Registros de Segurança</a>
				<a href='#'>Portal do Fornecedor</a>
				<a href='#'>Saúde do Sistema</a>
			</div>
		</FooterContainer>
	)
}