// Simple error translator: map backend messages (in English) to Portuguese user-facing messages
export default function translateError(err) {
  const msg = (err && err.response && err.response.data && err.response.data.message) ? err.response.data.message : (err && err.message) ? err.message : '';
  const lower = String(msg).toLowerCase();

  // Brand / Categoria / Product linked -> user-friendly Portuguese messages
  if ((lower.includes('brand') && lower.includes('linked')) || (lower.includes('marca') && lower.includes('vincul'))) {
    return 'Não é possível excluir esta marca porque existem produtos vinculados.';
  }
  if ((lower.includes('category') && lower.includes('linked')) || (lower.includes('categoria') && lower.includes('vincul'))) {
    return 'Não é possível excluir esta categoria porque existem produtos vinculados.';
  }
  if ((lower.includes('product') && lower.includes('linked')) || lower.includes('moviment')) {
    return 'Não é possível excluir este produto porque existem movimentações associadas.';
  }

  // Common HTTP-status based fallbacks
  const status = err && err.response && err.response.status;
  if (status === 404) return 'Recurso não encontrado.';
  if (status === 409) return 'Conflito: recurso já existe.';
  if (status === 422) return 'Operação não permitida.';

  // Common English patterns
  if (lower.includes('already exists') || lower.includes('already exist')) return 'Já existe um recurso com esse nome.';
  if (lower.includes('not found')) return 'Recurso não encontrado.';

  // Generic fallback (do NOT expose backend message)
  return 'Falha ao processar a solicitação. Tente novamente.';
}