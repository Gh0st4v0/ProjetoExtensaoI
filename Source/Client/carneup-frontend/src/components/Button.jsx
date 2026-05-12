import styled, { css } from 'styled-components'
import { forwardRef } from 'react'

const variants = {
	primary: css`
		background-color: #610005;
		color: #ffffff;
		border: none;
		box-shadow: 0 10px 30px rgba(97, 0, 5, 0.18);
	`,
	secondary: css`
		background-color: #ffffff;
		color: #5a403c;
		border: 1px solid #e7e5e4;
	`,
}

const StyledButton = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	width: ${(p) => (p.$full ? '100%' : 'auto')};
	padding: ${(p) => (p.$small ? '8px 12px' : '12px 18px')};
	border-radius: 8px;
	font-family: 'Epilogue', sans-serif;
	font-weight: 900;
	text-transform: uppercase;
	letter-spacing: 0.12em;
	font-size: ${(p) => (p.$small ? '12px' : '14px')};
	cursor: pointer;
	transition: all 0.12s;
	opacity: ${(props) => (props.disabled ? 0.6 : 1)};
	pointer-events: ${(props) => (props.disabled ? 'none' : 'auto')};
	${(p) => variants[p.$variant] || variants.primary}

	&:hover {
		filter: brightness(1.03);
	}
`

export const Button = forwardRef(({
	children,
	onClick,
	disabled = false,
	variant = 'primary',
	small = false,
	full = true,
	type = 'button',
	style,
	...props
}, ref) => {
	return (
		<StyledButton
			ref={ref}
			onClick={onClick}
			disabled={disabled}
			$variant={variant}
			$small={small}
			$full={full}
			type={type}
			style={style}
			{...props}
		>
			{children}
		</StyledButton>
	)
})

Button.displayName = 'Button'
