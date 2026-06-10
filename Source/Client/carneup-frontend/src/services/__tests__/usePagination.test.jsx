import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePagination } from '../usePagination'

const makeItems = (total) => Array.from({ length: total }, (_, index) => ({ id: index + 1 }))

describe('usePagination', () => {
  it('returns the first page with ten items by default', () => {
    const { result } = renderHook(() => usePagination(makeItems(25), 'all'))

    expect(result.current.page).toBe(1)
    expect(result.current.totalPages).toBe(3)
    expect(result.current.totalItems).toBe(25)
    expect(result.current.currentItems).toHaveLength(10)
    expect(result.current.currentItems[0]).toEqual({ id: 1 })
  })

  it('changes pages and clamps values above the last page', () => {
    const { result } = renderHook(() => usePagination(makeItems(12), 'all'))

    act(() => result.current.setPage(2))
    expect(result.current.page).toBe(2)
    expect(result.current.currentItems).toEqual([{ id: 11 }, { id: 12 }])

    act(() => result.current.setPage(99))
    expect(result.current.page).toBe(2)
  })

  it('accepts paged API responses and resets when the reset key changes', () => {
    const response = { content: makeItems(11) }
    const { result, rerender } = renderHook(
      ({ resetKey }) => usePagination(response, resetKey),
      { initialProps: { resetKey: 'initial' } },
    )

    act(() => result.current.setPage(2))
    expect(result.current.page).toBe(2)

    rerender({ resetKey: 'changed' })
    expect(result.current.page).toBe(1)
  })

  it('handles non-array input as an empty list', () => {
    const { result } = renderHook(() => usePagination(null, 'empty'))

    expect(result.current.totalItems).toBe(0)
    expect(result.current.totalPages).toBe(1)
    expect(result.current.currentItems).toEqual([])
  })
})

