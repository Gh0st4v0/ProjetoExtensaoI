import React, { useRef, useLayoutEffect } from 'react'
import styled from 'styled-components'

const Field = styled.label`
	display: block;

	.label {
		display: block;
		margin-bottom: 8px;
		font-size: 10px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #5a403c;
	}

	.input-wrap {
		position: relative;
	}

	input {
		width: 100%;
		border-radius: 10px;
		padding: 12px 14px;
		padding-left: ${(props) => props.$prefix ? '44px' : '14px'};
		padding-right: ${(props) => props.$suffix ? '58px' : '14px'};
		border: 1px solid #e7e5e4;
		background: #ffffff;
		color: #1a1c1c;
		font-size: 14px;
		outline: none;
		display: block;
		transition: border 0.18s, box-shadow 0.18s;

		&::placeholder {
			color: #a8a29e;
		}

		&:focus {
			box-shadow: 0 6px 18px rgba(97, 0, 5, 0.06);
			border-color: #610005;
		}
	}

	.affix {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		color: #78716c;
		font-size: 12px;
		font-weight: 800;
		pointer-events: none;
	}

	.prefix {
		left: 14px;
	}

	.suffix {
		right: 14px;
	}
`

export const parseLocaleNumber = (value) => {
	const normalized = String(value ?? '').trim().replace(/\./g, '').replace(',', '.')
	if (normalized === '') return null
	const parsed = Number(normalized)
	return Number.isFinite(parsed) ? parsed : null
}

export const formatLocaleNumber = (value, { decimals = 2, integer = false, fixedDecimals = false } = {}) => {
	const parsed = parseLocaleNumber(value)
	if (parsed === null) return ''

	if (integer) return String(Math.trunc(parsed))

	return parsed.toLocaleString('pt-BR', {
		minimumFractionDigits: fixedDecimals ? decimals : 0,
		maximumFractionDigits: decimals,
	})
}

const normalizeDecimalInput = (value, { decimals = 2, integer = false } = {}) => {
	const raw = String(value || '')

	if (integer) return raw.replace(/\D/g, '')

	const hasComma = raw.includes(',')
	const hasDot = raw.includes('.')
	const separator = hasComma ? ',' : (hasDot ? '.' : null)

	if (!separator) return raw.replace(/\D/g, '')

	const separatorIndex = raw.indexOf(separator)
	const integerPart = raw.slice(0, separatorIndex).replace(/\D/g, '')
	const decimalPart = raw.slice(separatorIndex + 1).replace(/\D/g, '').slice(0, decimals)

	return `${integerPart || '0'},${decimalPart}`
}

export const NumberField = ({
	label,
	value,
	onChange,
	onBlur,
	prefix,
	suffix,
	placeholder = '0,00',
	decimals = 2,
	integer = false,
	required = false,
	name,
	style,
	className,
	currencyMask = false,
	fixedDecimals,
	...props
}) => {
	const inputRef = useRef(null)
	const caretRef = useRef(null)

	useLayoutEffect(() => {
		if (caretRef.current != null && inputRef.current) {
			try {
				const pos = Math.min(caretRef.current, (inputRef.current.value || '').length)
				inputRef.current.setSelectionRange(pos, pos)
			} catch (e) {
				// ignore
			}
			caretRef.current = null
		}
	})
	const handleBlur = (event) => {
		const shouldUseFixedDecimals = fixedDecimals ?? currencyMask
		const formatted = formatLocaleNumber(event.target.value, {
			decimals,
			integer,
			fixedDecimals: shouldUseFixedDecimals,
		})
		onChange({ target: { name, value: formatted } })
		onBlur?.(event)
	}

	const handleFocus = (event) => {
		if (currencyMask) return

		const parsed = parseLocaleNumber(event.target.value)
		if (parsed === null) {
			onChange({ target: { name, value: '' } })
			return
		}
		if (integer) {
			onChange({ target: { name, value: String(Math.trunc(parsed)) } })
			return
		}
		const text = (parsed % 1 === 0) ? String(Math.trunc(parsed)) : String(parsed).replace('.', ',')
		onChange({ target: { name, value: text } })
	}

	const handleChangeLocal = (event) => {
		const raw = String(event.target.value || '')

		if (currencyMask) {
			const digits = raw.replace(/\D/g, '')
			if (!digits) {
				onChange({ target: { name, value: '' } })
				caretRef.current = 0
				return
			}

			const formatted = (Number(digits) / 100).toLocaleString('pt-BR', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})

			onChange({ target: { name, value: formatted } })
			caretRef.current = formatted.length
			return
		}

		const cleaned = normalizeDecimalInput(raw, { decimals, integer })
		if (!cleaned) {
			onChange({ target: { name, value: '' } })
			caretRef.current = 0
			return
		}

		onChange({ target: { name, value: cleaned } })
		caretRef.current = cleaned.length
	}

	return (
		<Field $prefix={prefix} $suffix={suffix} style={style} className={className}>
			{label && <span className='label'>{label}</span>}
			<div className='input-wrap'>
				{prefix && <span className='affix prefix'>{prefix}</span>}
				<input
					name={name}
					value={value}
					onChange={handleChangeLocal}
					ref={inputRef}
					onFocus={handleFocus}
					onBlur={handleBlur}
					inputMode={integer ? 'numeric' : 'decimal'}
					placeholder={placeholder}
					required={required}
					{...props}
				/>
				{suffix && <span className='affix suffix'>{suffix}</span>}
			</div>
		</Field>
	)
}

export default NumberField
