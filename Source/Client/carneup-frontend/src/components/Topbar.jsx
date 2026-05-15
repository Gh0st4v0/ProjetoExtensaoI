import React from 'react'
import styled from 'styled-components'

const TopbarContainer = styled.header`
	height: 56px;
	background: var(--sidebar-bg);
	display: flex;
	align-items: center;
	padding: 0 28px;
	border-bottom: 1px solid rgba(255,255,255,0.06);
	flex-shrink: 0;
`

const Title = styled.h1`
	font-family: 'Epilogue', sans-serif;
	font-size: 16px;
	font-weight: 900;
	color: #ffffff;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	margin: 0;
`

export const Topbar = ({ title }) => {
	return (
		<TopbarContainer>
			<Title>{title}</Title>
		</TopbarContainer>
	)
}
