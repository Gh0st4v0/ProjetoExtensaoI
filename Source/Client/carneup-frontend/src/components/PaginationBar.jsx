import React from 'react'
import styled from 'styled-components'

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  padding: 10px 4px 2px;
`
const Btn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: ${p => p.$active ? '#610005' : '#fff'};
  color: ${p => p.$active ? '#fff' : '#5a403c'};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  &:hover:not(:disabled) { background: ${p => p.$active ? '#7f1d1d' : '#fef2f2'}; border-color: #610005; }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
`
const Info = styled.span`
  font-size: 11px;
  color: #78716c;
  margin: 0 4px;
`

export default function PaginationBar({ page, totalPages, onPageChange, totalItems }) {
  if (totalPages <= 1) return null

  const pages = []
  const range = 2
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - range && i <= page + range)) {
      pages.push(i)
    }
  }

  const withEllipsis = []
  let prev = null
  for (const p of pages) {
    if (prev !== null && p - prev > 1) withEllipsis.push('…')
    withEllipsis.push(p)
    prev = p
  }

  return (
    <Row>
      <Info>{totalItems} itens · pág. {page}/{totalPages}</Info>
      <Btn disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <span className='material-symbols-outlined' style={{ fontSize: 16 }}>chevron_left</span>
      </Btn>
      {withEllipsis.map((p, i) =>
        p === '…'
          ? <Info key={`e${i}`}>…</Info>
          : <Btn key={p} $active={p === page} onClick={() => onPageChange(p)}>{p}</Btn>
      )}
      <Btn disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        <span className='material-symbols-outlined' style={{ fontSize: 16 }}>chevron_right</span>
      </Btn>
    </Row>
  )
}
