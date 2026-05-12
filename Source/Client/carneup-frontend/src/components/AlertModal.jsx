import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Button } from './Button'

const Backdrop = styled.div`
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.42);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 80;
	padding: 20px;
`

const Card = styled.div`
	width: min(440px, 100%);
	background: #ffffff;
	border-radius: 8px;
	box-shadow: 0 20px 48px rgba(0, 0, 0, 0.18);
	border: 1px solid #eeeeee;
	overflow: hidden;
`

const Header = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 20px 20px 0;

	.icon {
		width: 40px;
		height: 40px;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: ${(props) => props.$tone === 'success' ? '#e8f5e9' : '#ffdad6'};
		color: ${(props) => props.$tone === 'success' ? '#1b7f3a' : '#610005'};
		flex-shrink: 0;
	}

	h3 {
		margin: 0;
		font-family: 'Epilogue', sans-serif;
		font-size: 18px;
		font-weight: 900;
		color: #1a1c1c;
	}
`

const Body = styled.div`
	padding: 14px 20px 20px;

	p {
		margin: 0;
		color: #5a403c;
		font-size: 14px;
		line-height: 1.5;
		white-space: pre-line;
	}
`

const Footer = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	padding: 16px 20px;
	background: #f9f9f9;
	border-top: 1px solid #eeeeee;
`

export const AlertModal = ({
	open,
	title = 'Aviso',
	message,
	tone = 'info',
	onClose,
	closeLabel = 'Entendi',
}) => {
	const closeButtonRef = useRef(null)

	useEffect(() => {
		if (!open) return undefined

		const handleKeyDown = (event) => {
			if (event.key === 'Enter' || event.key === 'Escape') {
				event.preventDefault()
				onClose?.()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		closeButtonRef.current?.focus()

		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [open, onClose])

	if (!open) return null

	const icon = tone === 'success' ? 'check_circle' : 'error'

	return (
		<Backdrop onClick={onClose}>
			<Card onClick={(event) => event.stopPropagation()}>
				<Header $tone={tone}>
					<div className='icon'>
						<span className='material-symbols-outlined'>{icon}</span>
					</div>
					<h3>{title}</h3>
				</Header>
				<Body>
					<p>{message}</p>
				</Body>
				<Footer>
					<Button ref={closeButtonRef} full={false} small onClick={onClose}>
						{closeLabel}
					</Button>
				</Footer>
			</Card>
		</Backdrop>
	)
}

export default AlertModal
