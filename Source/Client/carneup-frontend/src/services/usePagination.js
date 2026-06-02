import { useState, useMemo, useEffect } from 'react'

const PAGE_SIZE = 10

export function usePagination(items, resetKey) {
  const [page, setPage] = useState(1)

  // Volta para página 1 quando o conjunto de dados muda (ex: troca de aba, novo filtro)
  useEffect(() => { setPage(1) }, [resetKey])

  const itemsArray = Array.isArray(items) ? items : (items && Array.isArray(items.content) ? items.content : [])
  const total = itemsArray.length || 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
n  const currentItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return itemsArray.slice(start, start + PAGE_SIZE)
  }, [itemsArray, safePage])
n  return {
    page: safePage,
    setPage,
    totalPages,
    totalItems: total,
    currentItems,
  }
}
