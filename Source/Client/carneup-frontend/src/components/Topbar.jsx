import React from 'react'
import styled from 'styled-components'

const TopbarContainer = styled.header`
	height: 64px;
	background-color: #ffffff;
	border-bottom: 1px solid #e7e5e4;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 24px;
	position: sticky;
	top: 0;
	z-index: 40;

	.search-container {
		display: flex;
		align-items: center;
		gap: 16px;
		flex: 1;
		max-width: 600px;
		span.icon {
			color: #a8a29e;
		}
		input {
			border: none;
			background: transparent;
			outline: none;
			font-size: 12px;
			font-family: 'Work Sans', sans-serif;
			text-transform: uppercase;
			letter-spacing: 0.1em;
			width: 100%;
		}
	}

	.action-container {
		display: flex;
		align-items: center;
		gap: 24px;
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
				&:hover {
					color: #dc2626;
				}
			}
		}
		/* hide any avatar images passed as children to keep Topbar standardized */
		img {
			display: none;
		}
		.brand-text {
			font-family: 'Epilogue', sans-serif;
			font-weight: 900;
			color: #610005;
			font-size: 14px;
		}
	}

			img {
				width: 32px;
				height: 32px;
				border-radius: 50%;
				border: 1px solid #e7e5e4;
				object-fit: cover;
			}
		}
`

export const Topbar = ({ searchQuery, onSearchChange }) => {
	return (
		<TopbarContainer>
			<div className='search-container'>
				<span className='material-symbols-outlined icon'>search</span>
				<input
					type='text'
					placeholder='PESQUISAR POR NOME, CÓDIGO, MARCA OU CATEGORIA...'
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</div>
			<div className='action-container'>
				<div className='icon-group'>
					<button>
						<span className='material-symbols-outlined'>notifications</span>
					</button>
					<button>
						<span className='material-symbols-outlined'>
							account_balance_wallet
						</span>
					</button>
					<button>
						<span className='material-symbols-outlined'>help_outline</span>
					</button>
				</div>
				
				<span className='brand-text'>CarneUp</span>
			</div>
		</TopbarContainer>
	)
}
