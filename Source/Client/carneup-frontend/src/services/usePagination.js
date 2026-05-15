import { useState, useMemo, useEffect } from 'react'

const PAGE_SIZE = 10

export function usePagination(items, resetKey) {
  const [page, setPage] = useState(1)

  // Volta para página 1 quando o conjunto de dados muda (ex: troca de aba, novo filtro)
  useEffect(() => { setPage(1) }, [resetKey])

  const total = items?.length || 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const currentItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return (items || []).slice(start, start + PAGE_SIZE)
  }, [items, safePage])

  return {
    page: safePage,
    setPage,
    totalPages,
    totalItems: total,
    currentItems,
  }
}
