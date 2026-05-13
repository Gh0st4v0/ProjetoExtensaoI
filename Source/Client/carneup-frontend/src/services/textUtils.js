// Capitaliza a primeira letra de cada palavra
export const toTitleCase = (str) => {
	if (!str) return ''
	return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

// Capitaliza apenas a primeira letra da frase
export const toSentenceCase = (str) => {
	if (!str) return ''
	return str.charAt(0).toUpperCase() + str.slice(1)
}

// Handler para input que capitaliza ao digitar
export const titleCaseHandler = (setter) => (e) => {
	const val = e.target.value
	const cursor = e.target.selectionStart
	const formatted = toTitleCase(val)
	setter(formatted)
	// Restaura posição do cursor após setState
	requestAnimationFrame(() => {
		e.target.setSelectionRange(cursor, cursor)
	})
}
