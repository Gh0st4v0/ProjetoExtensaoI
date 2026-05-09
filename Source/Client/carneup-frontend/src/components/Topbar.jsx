import React from 'react'
import styled from 'styled-components'

const TopbarContainer = styled.header`
	height: 64px;
	background-color: #ffffff;
	border-bottom: 1px solid #e7e5e4;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 24px;
	padding: 0 24px;
	position: sticky;
	top: 0;
	z-index: 40;

	.title-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-width: 0;

		.eyebrow {
			font-size: 10px;
			font-weight: 800;
			letter-spacing: 0.12em;
			text-transform: uppercase;
			color: #8a7a76;
		}

		.title {
			font-family: 'Epilogue', sans-serif;
			font-size: 16px;
			font-weight: 900;
			color: #610005;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}

	.action-container {
		display: flex;
		align-items: center;
		gap: 24px;
		flex-shrink: 0;

		.icon-group {
			display: flex;
			gap: 16px;
			border-right: 1px solid #e7e5e4;
			padding-right: 24px;

			button {
				background: none;
				border: none;
				color: #78716c;
				cursor: pointer;
				padding: 4px;
				display: inline-flex;
				align-items: center;
				justify-content: center;

				&:hover {
					color: #610005;
				}
			}
		}

		.brand-text {
			font-family: 'Epilogue', sans-serif;
			font-weight: 900;
			color: #610005;
			font-size: 14px;
		}
	}
`

export const Topbar = ({ title = 'Painel Operacional', children }) => {
	return (
		<TopbarContainer>
			<div className='title-container'>
				<span className='eyebrow'>CarneUp</span>
				<span className='title'>{title}</span>
			</div>
			<div className='action-container'>
				<div className='icon-group'>
					<button type='button'>
						<span className='material-symbols-outlined'>notifications</span>
					</button>
					<button type='button'>
						<span className='material-symbols-outlined'>
							account_balance_wallet
						</span>
					</button>
					<button type='button'>
						<span className='material-symbols-outlined'>help_outline</span>
					</button>
				</div>
				{children}
				<span className='brand-text'>CarneUp</span>
			</div>
		</TopbarContainer>
	)
}
