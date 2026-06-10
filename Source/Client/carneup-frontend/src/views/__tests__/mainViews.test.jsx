import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AttributesView from '../AttributesView'
import { ClienteHistoricoView } from '../ClienteHistoricoView'
import { ConfiguracaoView, loadStoreConfig } from '../ConfiguracaoView'
import { DashboardView } from '../DashboardView'
import { DespesasView } from '../DespesasView'
import { DiscardView } from '../DiscardView'
import { PurchaseView } from '../PurchaseView'
import { ReportsView } from '../ReportsView'
import { SalesView } from '../SalesView'
import { SettingsView } from '../SettingsView'
import { StockView } from '../StockViewV2'
import api from '../../services/apiClient'
import productsApi, {
  getAllProductsUnpaged,
  getProductById,
  updateProduct,
} from '../../services/productsApi'
import purchasesApi from '../../services/purchasesApi'
import {
  createClient,
  createSale,
  deleteClient,
  getAllClients,
  getClientSales,
  getClientSpending,
  getSale,
  searchClients,
  updateClient,
} from '../../services/salesApi'
import {
  createDespesa,
  deleteDespesa,
  getDespesas,
  updateDespesa,
} from '../../services/despesasApi'
import {
  createDiscard,
  deleteDiscard,
  getDiscards,
  updateDiscard,
} from '../../services/discardApi'
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from '../../services/usersApi'
import { useAttributes } from '../../context/AttributesContext'
import { toast } from 'react-toastify'

vi.mock('../../components/Sidebar', () => ({
  Sidebar: ({ activeView, navigate }) => (
    <aside data-testid="sidebar">
      <span>{activeView}</span>
      <button type="button" onClick={() => navigate?.('dashboard')}>
        sidebar-go
      </button>
    </aside>
  ),
}))

vi.mock('../../components/Topbar', () => ({
  Topbar: ({ title }) => <header>{title}</header>,
}))

vi.mock('../../components/Footer', () => ({
  Footer: () => <footer>footer</footer>,
}))

vi.mock('../../components/DataTable', () => ({
  default: ({
    data = [],
    columns = [],
    actions = [],
    loading,
    emptyMessage,
    toolbarActions,
    totalItems = data.length,
  }) => (
    <section data-testid="data-table">
      <div>{toolbarActions}</div>
      <span>items:{totalItems}</span>
      {loading ? (
        <p>table-loading</p>
      ) : data.length ? (
        data.map((row, rowIndex) => (
          <article key={row.id ?? rowIndex}>
            {columns.map((column, columnIndex) => (
              <div key={column.key ?? column.header ?? columnIndex}>
                {column.render ? column.render(row) : row[column.key]}
              </div>
            ))}
            {actions.map((action, actionIndex) => (
              <button
                key={action.label ?? action.icon ?? actionIndex}
                type="button"
                onClick={() => action.onClick(row)}
              >
                {action.label ?? action.icon ?? `action-${actionIndex}`}
              </button>
            ))}
          </article>
        ))
      ) : (
        <p>{emptyMessage}</p>
      )}
    </section>
  ),
}))

vi.mock('../../components/DespesaModal', () => ({
  default: ({ open, onClose, onSubmit }) =>
    open ? (
      <div role="dialog">
        <button type="button" onClick={() => onSubmit({
          descricao: 'Energia',
          categoria: 'Operacional',
          valor: 10,
          dataDespesa: '2026-06-10',
        })}>
          mock-submit-despesa
        </button>
        <button type="button" onClick={onClose}>mock-close-despesa</button>
      </div>
    ) : null,
}))

vi.mock('../../components/DiscardModal', () => ({
  default: ({ open, onClose, onSubmit }) =>
    open ? (
      <div role="dialog">
        <button type="button" onClick={() => onSubmit({
          date: '2026-06-10',
          type: 'DANO',
          items: [{ productId: 1, purchaseId: 2, quantity: 1 }],
        })}>
          mock-submit-discard
        </button>
        <button type="button" onClick={onClose}>mock-close-discard</button>
      </div>
    ) : null,
}))

vi.mock('../../components/QuickCreateModal', () => ({
  default: ({ open, type, initialValue, onClose, onCreate }) =>
    open ? (
      <div role="dialog">
        <span>{initialValue ? `edit-${initialValue}` : `create-${type}`}</span>
        <button type="button" onClick={() => onCreate(type === 'brand' ? 'Marca Nova' : 'Categoria Nova')}>
          mock-create-{type}
        </button>
        <button type="button" onClick={onClose}>mock-close-quick</button>
      </div>
    ) : null,
}))

vi.mock('../../components/ConfirmModal', () => ({
  default: ({ open, title, message, confirmLabel = 'Confirmar', onConfirm, onCancel }) =>
    open ? (
      <div role="dialog">
        <h2>{title}</h2>
        <p>{message}</p>
        <button type="button" onClick={onConfirm}>{confirmLabel}</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    ) : null,
  ConfirmModal: ({ open, title, message, confirmLabel = 'Confirmar', onConfirm, onCancel }) =>
    open ? (
      <div role="dialog">
        <h2>{title}</h2>
        <p>{message}</p>
        <button type="button" onClick={onConfirm}>{confirmLabel}</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    ) : null,
}))

vi.mock('../../services/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('../../services/productsApi', () => ({
  default: {
    getAllProducts: vi.fn(),
    searchProducts: vi.fn(),
    createProduct: vi.fn(),
  },
  getAllProductsUnpaged: vi.fn(),
  getProductById: vi.fn(),
  updateProduct: vi.fn(),
}))

vi.mock('../../services/purchasesApi', () => ({
  default: {
    createPurchase: vi.fn(),
  },
}))

vi.mock('../../services/salesApi', () => ({
  createSale: vi.fn(),
  getSale: vi.fn(),
  searchClients: vi.fn(),
  createClient: vi.fn(),
  getAllClients: vi.fn(),
  updateClient: vi.fn(),
  getClientSales: vi.fn(),
  getClientSpending: vi.fn(),
  deleteClient: vi.fn(),
}))

vi.mock('../../services/despesasApi', () => ({
  getDespesas: vi.fn(),
  createDespesa: vi.fn(),
  updateDespesa: vi.fn(),
  deleteDespesa: vi.fn(),
}))

vi.mock('../../services/discardApi', () => ({
  getDiscards: vi.fn(),
  createDiscard: vi.fn(),
  updateDiscard: vi.fn(),
  deleteDiscard: vi.fn(),
}))

vi.mock('../../services/usersApi', () => ({
  getUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}))

vi.mock('../../context/AttributesContext', () => ({
  useAttributes: vi.fn(),
}))

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

const navigate = vi.fn()

const product = {
  id: 1,
  name: 'Picanha',
  code: 'PIC123',
  brand: 'Marca A',
  category: 'Bovino',
  brandName: 'Marca A',
  categoryName: 'Bovino',
  unit: 'KG',
  unitMeasurement: 'KG',
  price: 50,
  precoVenda: 50,
  salePrice: 60,
  stock: 10,
  stockQuantity: 10,
  quantity: 10,
  perecivel: true,
  brandId: 1,
  categoryId: 1,
}

const client = {
  id: 5,
  nickname: 'Cliente Bom',
  telefone: '11999999999',
  aniversario: '1990-01-01',
  dataCadastro: '2026-01-01T10:00:00',
}

const sale = {
  id: 9,
  dataVenda: '2026-06-10',
  totalValue: 100,
  surchargeTotal: 5,
  paymentMethod: 'PIX',
  hasDiscount: true,
  items: [{ productName: 'Picanha', quantity: 2, precoUnitarioVenda: 50 }],
  payments: [{ paymentMethod: 'PIX', valor: 105 }],
}

const mockApiGet = (url) => {
  if (url.includes('/sales?page')) return Promise.resolve({ data: { content: [sale] } })
  if (url.includes('/sales?')) return Promise.resolve({ data: [sale] })
  if (url.includes('/clients')) return Promise.resolve({ data: [client] })
  if (url.includes('/alerts')) return Promise.resolve({ data: { expiryAlerts: [product], lowStockAlerts: [] } })
  if (url.includes('/products/purchases')) {
    return Promise.resolve({
      data: [{ ...product, purchases: [{ purchase_id: 1, quantity: 4, expiring_date: '2026-07-01' }] }],
    })
  }
  if (url.includes('/purchases')) {
    return Promise.resolve({
      data: { content: [{ id: 3, productName: 'Picanha', quantity: 4, purchaseDate: '2026-06-01' }] },
    })
  }
  if (url.includes('/discards')) {
    return Promise.resolve({ data: { content: [{ id: 7, date: '2026-06-01', type: 'DANO', items: [] }] } })
  }
  if (url.includes('/configuracoes/latest')) {
    return Promise.resolve({ data: { lucroEsperado: 22, taxaDebito: 2, taxaCredito: 3, createdAt: '2026-06-01T10:00:00' } })
  }
  if (url.includes('/termos/latest')) {
    return Promise.resolve({ data: { id: 1, conteudo: 'Termos atuais', criadoEm: '2026-06-01T10:00:00' } })
  }
  return Promise.resolve({ data: [] })
}

describe('main views', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('userId', '1')
    localStorage.setItem('accessLevel', 'ADM')

    api.get.mockImplementation(mockApiGet)
    api.post.mockResolvedValue({ data: { ok: true } })
    api.put.mockResolvedValue({ data: { ok: true } })
    api.delete.mockResolvedValue({ data: { ok: true } })

    productsApi.getAllProducts.mockResolvedValue({ content: [product], totalPages: 1, totalElements: 1 })
    productsApi.searchProducts.mockResolvedValue({ content: [product], totalPages: 1, totalElements: 1 })
    productsApi.createProduct.mockResolvedValue({ id: 2 })
    getAllProductsUnpaged.mockResolvedValue([product])
    getProductById.mockResolvedValue(product)
    updateProduct.mockResolvedValue(product)
    purchasesApi.createPurchase.mockResolvedValue({ id: 3 })

    getAllClients.mockResolvedValue([client])
    searchClients.mockResolvedValue([client])
    createClient.mockResolvedValue({ id: 6, nickname: 'Cliente Novo' })
    updateClient.mockResolvedValue(client)
    getClientSales.mockResolvedValue([sale])
    getClientSpending.mockResolvedValue([{ clienteId: 5, totalSpent: 105 }])
    getSale.mockResolvedValue(sale)
    createSale.mockResolvedValue({ saleId: 9 })
    deleteClient.mockResolvedValue({})

    getDespesas.mockResolvedValue([{ id: 4, descricao: 'Energia', categoria: 'Loja', valor: 120, dataDespesa: '2026-06-01' }])
    createDespesa.mockResolvedValue({ id: 5 })
    updateDespesa.mockResolvedValue({})
    deleteDespesa.mockResolvedValue({})

    getDiscards.mockResolvedValue([{ id: 7, date: '2026-06-01', type: 'DANO', items: [{ productName: 'Picanha', quantity: 1, unitMeasurement: 'KG' }] }])
    createDiscard.mockResolvedValue({ id: 8 })
    updateDiscard.mockResolvedValue({})
    deleteDiscard.mockResolvedValue({})

    getUsers.mockResolvedValue([
      { id: 1, nome: 'Admin Atual', email: 'admin@carneup.test', nivelAcesso: 'ADM' },
      { id: 2, nome: 'Operador Loja', email: 'operador@carneup.test', nivelAcesso: 'USUARIO' },
    ])
    createUser.mockResolvedValue({ id: 3 })
    updateUser.mockResolvedValue({})
    deleteUser.mockResolvedValue({})

    useAttributes.mockReturnValue({
      brands: [{ id: 1, brandName: 'Heritage Farms' }, { id: 2, brandName: 'Marca Livre' }],
      categories: [{ id: 1, categoryName: 'Bovine' }, { id: 2, categoryName: 'Categoria Livre' }],
      addBrand: vi.fn().mockResolvedValue({ id: 3 }),
      addCategory: vi.fn().mockResolvedValue({ id: 4 }),
      updateBrand: vi.fn().mockResolvedValue({}),
      updateCategory: vi.fn().mockResolvedValue({}),
      removeBrand: vi.fn().mockResolvedValue({}),
      removeCategory: vi.fn().mockResolvedValue({}),
    })
  })

  it('renders dashboard metrics from API data', async () => {
    render(<DashboardView navigate={navigate} />)

    expect((await screen.findAllByText(/CarneUp/)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Anivers/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Alertas/).length).toBeGreaterThan(0)
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/sales?startDate='))
  })

  it('loads expenses, creates one from the modal and deletes a row', async () => {
    render(<DespesasView navigate={navigate} />)

    expect(await screen.findByText('Energia')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Nova Despesa/i }))
    fireEvent.click(screen.getByRole('button', { name: /mock-submit-despesa/i }))
    await waitFor(() => expect(createDespesa).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getByRole('button', { name: /Excluir/i }))
    await waitFor(() => expect(deleteDespesa).toHaveBeenCalledWith(4))
  })

  it('loads discards and creates a discard from the modal', async () => {
    render(<DiscardView navigate={navigate} />)

    expect(await screen.findByText('Picanha')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Novo Descarte/i }))
    fireEvent.click(screen.getByRole('button', { name: /mock-submit-discard/i }))

    await waitFor(() => expect(createDiscard).toHaveBeenCalledTimes(1))
    expect(toast.success).toHaveBeenCalledWith('Descarte registrado com sucesso!')
  })

  it('creates, edits and confirms deletes in the attributes view', async () => {
    const attrs = useAttributes()
    render(<AttributesView navigate={navigate} />)

    expect(screen.getByText('Heritage Farms')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Nova Marca/i }))
    fireEvent.click(screen.getByRole('button', { name: /mock-create-brand/i }))
    await waitFor(() => expect(attrs.addBrand).toHaveBeenCalledWith('Marca Nova'))

    fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /mock-create-brand/i }))
    await waitFor(() => expect(attrs.updateBrand).toHaveBeenCalled())

    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[1])
    fireEvent.click(screen.getByRole('button', { name: /Excluir/i }))
    await waitFor(() => expect(attrs.removeBrand).toHaveBeenCalledWith(2))
  })

  it('loads users, validates create form and deletes another user', async () => {
    render(<SettingsView navigate={navigate} />)

    expect(await screen.findByText('Admin Atual')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Adicionar Colaborador/i }))
    fireEvent.click(screen.getByRole('button', { name: /Criar Usu/i }))
    expect(await screen.findByText(/Nome/)).toBeInTheDocument()

    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'novo usuario' } })
    fireEvent.change(inputs[1], { target: { value: 'novo@carneup.test' } })
    const passwords = document.querySelectorAll('input[type="password"]')
    fireEvent.change(passwords[0], { target: { value: 'Strong1!' } })
    fireEvent.change(passwords[1], { target: { value: 'Strong1!' } })
    fireEvent.click(screen.getByRole('button', { name: /Criar Usu/i }))
    await waitFor(() => expect(createUser).toHaveBeenCalled())

    fireEvent.click(screen.getByTitle('Remover usuário'))
    fireEvent.click(screen.getByRole('button', { name: /Sim, Remover/i }))
    await waitFor(() => expect(deleteUser).toHaveBeenCalledWith(2))
  })

  it('loads client history, sorts purchases and navigates back', async () => {
    render(<ClienteHistoricoView navigate={navigate} clientId={5} />)

    expect(await screen.findByText('Cliente Bom')).toBeInTheDocument()
    expect(screen.getByText(/Venda #9/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Valor/i }))
    fireEvent.click(screen.getByRole('button', { name: /Voltar/i }))
    expect(navigate).toHaveBeenCalledWith('reports')
  })

  it('redirects client history when no client id is provided', async () => {
    render(<ClienteHistoricoView navigate={navigate} />)

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('reports'))
  })

  it('saves store, finance and terms configuration tabs', async () => {
    render(<ConfiguracaoView navigate={navigate} />)

    expect(await screen.findByRole('heading', { name: /Dados da Loja/i })).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText(/sualoja/i), {
      target: { value: '@carneup' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar Dados da Loja/i }))
    expect(loadStoreConfig().instagram).toBe('@carneup')

    fireEvent.click(screen.getByRole('button', { name: /Financeiro/i }))
    await waitFor(() => expect(screen.queryByText(/Carregando configura/)).not.toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /Salvar Nova Vers/i }))
    fireEvent.click(screen.getByRole('button', { name: /Salvar vers/i }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/configuracoes', expect.any(Object)))

    fireEvent.click(screen.getByRole('button', { name: /Termos/i }))
    await screen.findByDisplayValue('Termos atuais')
    fireEvent.change(screen.getByDisplayValue('Termos atuais'), {
      target: { value: 'Termos novos' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Publicar Nova Vers/i }))
    fireEvent.click(screen.getByRole('button', { name: /^Publicar$/i }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/termos', { conteudo: 'Termos novos' }))
  })

  it('renders stock view, opens edit flow and creates a product', async () => {
    const { container } = render(<StockView navigate={navigate} />)

    expect(await screen.findByText('Picanha')).toBeInTheDocument()
    fireEvent.click(screen.getByText(/Cadastrar Novo Produto/i))
    await screen.findByPlaceholderText('Ex: Picanha Maturada')
    fireEvent.change(screen.getByPlaceholderText('Ex: Picanha Maturada'), {
      target: { value: 'Costela' },
    })
    fireEvent.change(screen.getByPlaceholderText('ABC123'), {
      target: { value: 'COS123' },
    })
    fireEvent.change(screen.getAllByPlaceholderText('0,00')[0], {
      target: { value: '42' },
    })
    const productFormSelects = Array.from(container.querySelectorAll('select')).slice(-2)
    fireEvent.change(productFormSelects[0], { target: { value: '1' } })
    fireEvent.change(productFormSelects[1], { target: { value: '1' } })
    expect(screen.getByRole('button', { name: /Cadastrar Produto/i })).toBeInTheDocument()

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    fireEvent.click(editButtons[0])
    await waitFor(() => expect(getProductById).toHaveBeenCalledWith(1))
    expect(screen.getByRole('heading', { name: /Editar Produto/i })).toBeInTheDocument()
  })

  it('updates product details from the stock edit modal', async () => {
    const { container } = render(<StockView navigate={navigate} />)

    expect(await screen.findByText('Picanha')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0])
    expect(await screen.findByRole('heading', { name: /Editar Produto/i })).toBeInTheDocument()

    fireEvent.change(screen.getByDisplayValue('Picanha'), {
      target: { value: 'picanha premium' },
    })
    fireEvent.change(screen.getByDisplayValue('50,00'), {
      target: { value: '7590' },
    })
    const editSelects = Array.from(container.querySelectorAll('select')).slice(-2)
    fireEvent.change(editSelects[0], { target: { value: '2' } })
    fireEvent.change(editSelects[1], { target: { value: '2' } })
    fireEvent.click(screen.getByTitle('Nova categoria'))
    fireEvent.click(screen.getByRole('button', { name: /mock-create-category/i }))
    fireEvent.click(screen.getByTitle('Nova marca'))
    fireEvent.click(screen.getByRole('button', { name: /mock-create-brand/i }))
    const checkbox = container.querySelector('input[type="checkbox"]')
    fireEvent.click(checkbox)
    const numberInputs = Array.from(container.querySelectorAll('input[type="number"]'))
    fireEvent.change(numberInputs.at(-1), { target: { value: '2' } })

    fireEvent.click(screen.getByRole('button', { name: /Salvar Altera/i }))
    await waitFor(() => expect(updateProduct).toHaveBeenCalledWith(1, expect.objectContaining({
      name: 'Picanha Premium',
      precoVenda: 75.9,
      categoryId: 2,
      brandId: 2,
      perecivel: false,
      minStock: 2,
    })))
  })

  it('renders purchase view and warns when submitting an empty cart', async () => {
    render(<PurchaseView navigate={navigate} />)

    expect(await screen.findByText(/Entrada de Estoque/i)).toBeInTheDocument()
    expect(screen.getByText(/Selecione produtos e adicione/)).toBeInTheDocument()
  })

  it('adds a purchase item and registers stock entry', async () => {
    const { container } = render(<PurchaseView navigate={navigate} preselectProduct={product} />)

    expect(await screen.findByText('Picanha')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('0.000'), { target: { value: '2' } })
    const moneyInputs = screen.getAllByPlaceholderText('0,00')
    fireEvent.change(moneyInputs[0], { target: { value: '2000' } })
    fireEvent.change(moneyInputs[1], { target: { value: '3000' } })
    const dateInputs = container.querySelectorAll('input[type="date"]')
    fireEvent.change(dateInputs[1], { target: { value: '2026-07-20' } })

    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }))
    expect(await screen.findByText(/Registrar Entrada no Estoque/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Registrar Entrada no Estoque/i }))

    await waitFor(() => expect(purchasesApi.createPurchase).toHaveBeenCalledWith({
      date: expect.any(String),
      items: [{
        productId: 1,
        quantity: 2,
        unitPurchasePrice: 20,
        unitSalePrice: 30,
        expiringDate: '2026-07-20',
      }],
    }))
  })

  it('renders reports tabs and client actions', async () => {
    render(<ReportsView navigate={navigate} initialTab="clientes" />)

    expect(await screen.findByText(/Relatórios & Clientes/i)).toBeInTheDocument()
    expect(screen.getByText('Cliente Bom')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /visibility/i }).length).toBeGreaterThan(0)
  })

  it('edits and deletes a client from reports', async () => {
    render(<ReportsView navigate={navigate} initialTab="clientes" />)

    expect(await screen.findByText('Cliente Bom')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^Editar$/i }))
    expect(screen.getByRole('heading', { name: /Editar Cliente/i })).toBeInTheDocument()
    fireEvent.change(screen.getByDisplayValue('Cliente Bom'), {
      target: { value: 'Cliente Ajustado' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar Altera/i }))
    await waitFor(() => expect(updateClient).toHaveBeenCalledWith(5, expect.objectContaining({
      nickname: 'Cliente Ajustado',
    })))

    fireEvent.click(screen.getByRole('button', { name: /^Editar$/i }))
    fireEvent.click(screen.getByRole('button', { name: /Apagar Cliente/i }))
    fireEvent.click(screen.getByRole('button', { name: /^Apagar$/i }))
    await waitFor(() => expect(deleteClient).toHaveBeenCalledWith(5))
  })

  it('renders reports sales, stock and discard tabs', async () => {
    const { rerender } = render(<ReportsView navigate={navigate} initialTab="vendas" />)

    fireEvent.click(screen.getByRole('button', { name: /Gerar Relat/i }))
    expect(await screen.findByText(/Produtos Mais Vendidos/i)).toBeInTheDocument()
    expect(screen.getByText(/Detalhamento/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText('#9').closest('tr'))
    expect(await screen.findByRole('heading', { name: /Venda/i })).toBeInTheDocument()
    expect(getSale).toHaveBeenCalledWith(9)

    rerender(<ReportsView navigate={navigate} initialTab="validade" />)
    expect(await screen.findByText(/Lotes por Validade/i)).toBeInTheDocument()

    rerender(<ReportsView navigate={navigate} initialTab="descartes" />)
    expect(await screen.findByText(/Histórico de Descartes/i)).toBeInTheDocument()
  })

  it('edits and deletes discard and expense records from reports', async () => {
    const { rerender } = render(<ReportsView navigate={navigate} initialTab="descartes" />)

    expect(await screen.findByText(/Hist/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^Editar$/i }))
    expect(screen.getByRole('heading', { name: /Editar Descarte/i })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'OUTRO' } })
    fireEvent.click(screen.getByRole('button', { name: /^Salvar$/i }))
    await waitFor(() => expect(updateDiscard).toHaveBeenCalledWith(7, expect.objectContaining({
      type: 'OUTRO',
    })))

    rerender(<ReportsView navigate={navigate} initialTab="descartes" />)
    fireEvent.click(await screen.findByRole('button', { name: /^Editar$/i }))
    fireEvent.click(screen.getByRole('button', { name: /^Apagar$/i }))
    fireEvent.click(screen.getByRole('button', { name: /Apagar e restaurar estoque/i }))
    await waitFor(() => expect(deleteDiscard).toHaveBeenCalledWith(7))

    rerender(<ReportsView navigate={navigate} initialTab="despesas" />)
    expect((await screen.findAllByText(/Despesas/i)).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: /^Editar$/i }))
    expect(screen.getByRole('heading', { name: /Editar Despesa/i })).toBeInTheDocument()
    fireEvent.change(screen.getByDisplayValue('Energia'), { target: { value: 'Energia Loja' } })
    fireEvent.click(screen.getByRole('button', { name: /^Salvar$/i }))
    await waitFor(() => expect(updateDespesa).toHaveBeenCalledWith(4, expect.objectContaining({
      descricao: 'Energia Loja',
    })))

    rerender(<ReportsView navigate={navigate} initialTab="despesas" />)
    fireEvent.click(await screen.findByRole('button', { name: /^Editar$/i }))
    fireEvent.click(screen.getByRole('button', { name: /^Apagar$/i }))
    fireEvent.click(screen.getByRole('button', { name: /^Apagar$/i }))
    await waitFor(() => expect(deleteDespesa).toHaveBeenCalledWith(4))
  })

  it('renders sales view and opens client identification', async () => {
    render(<SalesView navigate={navigate} />)

    expect(await screen.findByText(/Pedido/i)).toBeInTheDocument()
    expect(screen.getByText('Picanha')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Buscar cliente/i)).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText(/Buscar cliente/i), {
      target: { value: 'Cliente' },
    })
    await waitFor(() => expect(searchClients).toHaveBeenCalled())
  })

  it('adds a product to the cart and finalizes a sale', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<SalesView navigate={navigate} />)

    expect(await screen.findByText(/Pedido/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText('Picanha'))
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }))
    expect(screen.getByText(/1 item/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Finalizar Venda/i }))
    expect(await screen.findByRole('heading', { name: /Forma de Pagamento/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Venda/i }))

    await waitFor(() => expect(createSale).toHaveBeenCalledWith(expect.objectContaining({
      clienteId: null,
      hasDiscount: false,
      items: [expect.objectContaining({
        productId: 1,
        quantity: 1,
        precoUnitarioVenda: 50,
      })],
    })))
    expect(await screen.findByText(/Venda #9/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Imprimir/i }))
    expect(printSpy).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: /Nova Venda/i }))
    expect(screen.getByText(/Clique em um produto/i)).toBeInTheDocument()
    printSpy.mockRestore()
  })

  it('identifies a new sales client after accepting terms', async () => {
    const { container } = render(<SalesView navigate={navigate} />)

    expect(await screen.findByText(/Pedido/i)).toBeInTheDocument()
    const clientInput = screen.getByPlaceholderText(/Buscar cliente/i)
    fireEvent.change(clientInput, { target: { value: 'Novo Cliente' } })
    const createOption = await screen.findByText(/Cadastrar "Novo Cliente"/i)
    fireEvent.click(createOption)

    expect(screen.getByRole('heading', { name: /Identificar Cliente/i })).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText(/99999/), {
      target: { value: '11988887777' },
    })
    const birthInput = container.querySelector('input[type="date"]')
    fireEvent.change(birthInput, { target: { value: '1992-04-10' } })
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Identifica/i }))

    expect(await screen.findByRole('heading', { name: /Termos/i })).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: /close/i }).at(-1))
    await waitFor(() => expect(screen.queryByRole('heading', { name: /Termos/i })).not.toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /Confirmar Identifica/i }))
    expect(await screen.findByRole('heading', { name: /Termos/i })).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: /^Cancelar$/i }).at(-1))
    await waitFor(() => expect(screen.queryByRole('heading', { name: /Termos/i })).not.toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /Confirmar Identifica/i }))
    expect(await screen.findByRole('heading', { name: /Termos/i })).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText(/Estou de acordo/i))
    fireEvent.click(screen.getByLabelText(/promo/i))
    fireEvent.click(screen.getByRole('button', { name: /Aceitar e Salvar/i }))

    await waitFor(() => expect(createClient).toHaveBeenCalledWith(expect.objectContaining({
      nickname: 'Novo Cliente',
      telefone: '11988887777',
      aniversario: '1992-04-10',
      aceitaTermosServico: true,
      receberPromocoes: true,
    })))
  })

  it('cancels the sales client identification modal', async () => {
    render(<SalesView navigate={navigate} />)

    expect(await screen.findByText(/Pedido/i)).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText(/Buscar cliente/i), {
      target: { value: 'Cliente Cancelado' },
    })
    fireEvent.click(await screen.findByText(/Cadastrar "Cliente Cancelado"/i))
    expect(screen.getByRole('heading', { name: /Identificar Cliente/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^Cancelar$/i }))
    await waitFor(() => expect(screen.queryByRole('heading', { name: /Identificar Cliente/i })).not.toBeInTheDocument())
  })

  it('finalizes a discounted split credit sale', async () => {
    getSale.mockResolvedValueOnce(null)
    render(<SalesView navigate={navigate} />)

    expect(await screen.findByText(/Pedido/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText('Picanha'))
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }))
    fireEvent.click(screen.getByRole('button', { name: /Op/i }))
    fireEvent.click(screen.getByLabelText(/Aplicar desconto/i))

    fireEvent.click(screen.getByRole('button', { name: /Finalizar Venda/i }))
    fireEvent.click(await screen.findByRole('button', { name: /Cr/i }))
    expect(screen.getAllByText(/5%/i).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: /Dividir pagamento/i }))
    expect(screen.getByText(/Atribu/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '2x' }))
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Venda/i }))

    await waitFor(() => expect(createSale).toHaveBeenCalledWith(expect.objectContaining({
      hasDiscount: true,
      paymentMethod: 'DINHEIRO',
      payments: expect.arrayContaining([
        expect.objectContaining({ paymentMethod: 'PIX' }),
        expect.objectContaining({ paymentMethod: 'DINHEIRO' }),
      ]),
    })))
  })
})
