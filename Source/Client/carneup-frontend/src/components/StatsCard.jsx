import React from 'react'
import styled from 'styled-components'

const StatCardContainer = styled.div`
	background-color: #f3f3f3;
	padding: 24px;
	border-radius: 4px;
	border-left: 4px solid ${(props) => props.borderColor || '#610005'};
	p.stat-label {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #5a403c;
		margin-bottom: 8px;
	}
	h3.stat-value {
		font-family: 'Epilogue', sans-serif;
		font-size: 24px;
		font-weight: 900;
		color: ${(props) => props.valueColor || '#1a1c1c'};
	}
`

export const StatsCard = ({ label, value, borderColor, valueColor }) => {
	return (
		<StatCardContainer borderColor={borderColor} valueColor={valueColor}>
			<p className='stat-label'>{label}</p>
			<h3 className='stat-value'>{value}</h3>
		</StatCardContainer>
	)
}