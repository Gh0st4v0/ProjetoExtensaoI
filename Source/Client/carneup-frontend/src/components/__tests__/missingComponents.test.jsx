import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DespesaModal from '../DespesaModal'
import DiscardModal from '../DiscardModal'
import { ProductForm } from '../ProductForm'
import ProductFormV2 from '../ProductFormV2'
import QuickCreateModal from '../QuickCreateModal'
import { StockForm } from '../StockForm'
import { getStockLots } from '../../services/discardApi'

vi.mock('../../services/discardApi', () => ({
  getStockLots: vi.fn(),
}))

const byName = (container, name) => container.querySelector(`[name="${name}"]`)

describe('missing component coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('DespesaModal', () => {
    it('does not render while closed', () => {
      const { container } = render(
        <DespesaModal open={false} onClose={vi.fn()} onSubmit={vi.fn()} />,
      )

      expect(container).toBeEmptyDOMElement()
    })

    it('requires description and value before submitting', () => {
      const onSubmit = vi.fn()

      const { container } = render(
        <DespesaModal open onClose={vi.fn()} onSubmit={onSubmit} />,
      )

      fireEvent.submit(container.querySelector('form'))

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('submits a normalized expense and closes', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      const onClose = vi.fn()

      const { container } = render(
        <DespesaModal open onClose={onClose} onSubmit={onSubmit} />,
      )

      const inputs = container.querySelectorAll('input')
      fireEvent.change(inputs[0], { target: { value: 'Energia' } })
      fireEvent.change(inputs[1], { target: { value: 'Operacional' } })
      fireEvent.change(inputs[2], { target: { value: '123.45' } })
      fireEvent.change(inputs[3], { target: { value: '2026-06-10' } })
      fireEvent.click(screen.getByRole('button', { name: /Salvar Despesa/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          descricao: 'Energia',
          categoria: 'Operacional',
          valor: 123.45,
          dataDespesa: '2026-06-10',
        })
      })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('keeps the modal open when submission fails', async () => {
      const onSubmit = vi.fn().mockRejectedValue(new Error('fail'))
      const onClose = vi.fn()

      const { container } = render(
        <DespesaModal open onClose={onClose} onSubmit={onSubmit} />,
      )

      const inputs = container.querySelectorAll('input')
      fireEvent.change(inputs[0], { target: { value: 'Agua' } })
      fireEvent.change(inputs[2], { target: { value: '50' } })
      fireEvent.click(screen.getByRole('button', { name: /Salvar Despesa/i }))

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('DiscardModal', () => {
    const lots = [
      {
        id: 10,
        product_name: 'Picanha',
        code: 'PIC123',
        unitMeasurement: 'KG',
        purchases: [
          {
            purchase_id: 99,
            quantity: 12.5,
            expiring_date: '2026-07-01',
            purchase_date: '2026-06-01',
          },
        ],
      },
    ]

    it('loads stock lots when opened', async () => {
      getStockLots.mockResolvedValue(lots)

      render(<DiscardModal open onClose={vi.fn()} onSubmit={vi.fn()} />)

      expect(screen.getByText('Carregando...')).toBeInTheDocument()
      expect(await screen.findByText('Picanha (PIC123)')).toBeInTheDocument()
      expect(getStockLots).toHaveBeenCalledTimes(1)
    })

    it('falls back to an empty product list when loading fails', async () => {
      getStockLots.mockRejectedValue(new Error('network'))

      render(<DiscardModal open onClose={vi.fn()} onSubmit={vi.fn()} />)

      await waitFor(() => {
        expect(screen.queryByText('Carregando...')).not.toBeInTheDocument()
      })
      expect(screen.getByText('Selecione o produto...')).toBeInTheDocument()
    })

    it('requires product, lot and quantity before registering discard', async () => {
      getStockLots.mockResolvedValue(lots)
      const onSubmit = vi.fn()

      const { container } = render(
        <DiscardModal open onClose={vi.fn()} onSubmit={onSubmit} />,
      )

      await screen.findByText('Picanha (PIC123)')
      fireEvent.submit(container.querySelector('form'))

      expect(onSubmit).not.toHaveBeenCalled()
      expect(screen.getByText(/campos obrigat/)).toBeInTheDocument()
    })

    it('submits the selected lot and closes', async () => {
      getStockLots.mockResolvedValue(lots)
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      const onClose = vi.fn()

      const { container } = render(
        <DiscardModal open onClose={onClose} onSubmit={onSubmit} />,
      )

      await screen.findByText('Picanha (PIC123)')
      const selects = container.querySelectorAll('select')
      const inputs = container.querySelectorAll('input')

      fireEvent.change(selects[0], { target: { value: '10' } })
      fireEvent.change(selects[1], { target: { value: '99' } })
      fireEvent.change(inputs[0], { target: { value: '2.5' } })
      fireEvent.change(selects[2], { target: { value: 'DANO' } })
      fireEvent.change(inputs[1], { target: { value: '2026-06-10' } })
      fireEvent.click(screen.getByRole('button', { name: /Registrar Descarte/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          date: '2026-06-10',
          type: 'DANO',
          items: [{ purchaseId: 99, productId: 10, quantity: 2.5 }],
        })
      })
      expect(onClose).toHaveBeenCalledTimes(1)
      expect(screen.getByText(/Dispon/)).toBeInTheDocument()
      expect(screen.getByText('12.5 KG')).toBeInTheDocument()
    })

    it('shows the submission error returned by the API', async () => {
      getStockLots.mockResolvedValue(lots)
      const onSubmit = vi.fn().mockRejectedValue({
        response: { data: { message: 'Quantidade indisponivel.' } },
      })

      const { container } = render(
        <DiscardModal open onClose={vi.fn()} onSubmit={onSubmit} />,
      )

      await screen.findByText('Picanha (PIC123)')
      const selects = container.querySelectorAll('select')
      const inputs = container.querySelectorAll('input')
      fireEvent.change(selects[0], { target: { value: '10' } })
      fireEvent.change(selects[1], { target: { value: '99' } })
      fireEvent.change(inputs[0], { target: { value: '2.5' } })
      fireEvent.submit(container.querySelector('form'))

      expect(await screen.findByText('Quantidade indisponivel.')).toBeInTheDocument()
    })
  })

  describe('ProductForm', () => {
    it('validates required product fields', () => {
      const onSubmit = vi.fn()

      const { container } = render(<ProductForm onSubmit={onSubmit} />)

      fireEvent.submit(container.querySelector('form'))

      expect(onSubmit).not.toHaveBeenCalled()
      expect(screen.getByText(/Nome/)).toBeInTheDocument()
      expect(screen.getByText(/alfanum/)).toBeInTheDocument()
    })

    it('submits valid product data and resets the form', () => {
      const onSubmit = vi.fn()

      const { container } = render(
        <ProductForm
          onSubmit={onSubmit}
          brands={['Marca A']}
          categories={['Categoria A']}
        />,
      )

      fireEvent.change(byName(container, 'name'), { target: { value: 'Acem' } })
      fireEvent.change(byName(container, 'code'), { target: { value: 'ACEM01' } })
      fireEvent.change(byName(container, 'brand'), { target: { value: 'Marca A' } })
      fireEvent.change(byName(container, 'category'), {
        target: { value: 'Categoria A' },
      })
      fireEvent.click(container.querySelector('input[value="UN"]'))
      fireEvent.change(byName(container, 'price'), { target: { value: '32.9' } })
      fireEvent.submit(container.querySelector('form'))

      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Acem',
        code: 'ACEM01',
        brand: 'Marca A',
        category: 'Categoria A',
        unit: 'UN',
        price: '32.9',
      })
      expect(byName(container, 'name')).toHaveValue('')
      expect(container.querySelector('input[name="unit"][value="KG"]')).toBeChecked()
    })

    it('creates a local brand through the quick create modal', () => {
      const { container } = render(<ProductForm onSubmit={vi.fn()} />)

      fireEvent.click(screen.getAllByRole('button', { name: '+' })[0])
      fireEvent.change(screen.getByPlaceholderText('Ex: PrimeCuts'), {
        target: { value: 'marca nova' },
      })
      fireEvent.click(screen.getByRole('button', { name: /Criar/i }))

      return waitFor(() => {
        expect(byName(container, 'brand')).toHaveValue('Marca Nova')
        expect(screen.queryByText('Nova Marca')).not.toBeInTheDocument()
      })
    })
  })

  describe('ProductFormV2', () => {
    it('normalizes object options and submits valid product data', () => {
      const onSubmit = vi.fn()

      const { container } = render(
        <ProductFormV2
          onSubmit={onSubmit}
          brands={[{ brandId: 4, brandName: 'Marca B' }]}
          categories={[{ categoryId: 8, categoryName: 'Categoria B' }]}
        />,
      )

      fireEvent.change(byName(container, 'name'), { target: { value: 'Bife' } })
      fireEvent.change(byName(container, 'code'), { target: { value: 'BIFE01' } })
      fireEvent.change(byName(container, 'brandId'), { target: { value: '4' } })
      fireEvent.change(byName(container, 'categoryId'), { target: { value: '8' } })
      fireEvent.click(container.querySelector('input[value="UN"]'))
      fireEvent.click(byName(container, 'perecivel'))
      fireEvent.change(byName(container, 'price'), { target: { value: '44.5' } })
      fireEvent.submit(container.querySelector('form'))

      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Bife',
        code: 'BIFE01',
        brandId: '4',
        categoryId: '8',
        unit: 'UN',
        price: '44.5',
        perecivel: false,
      })
    })

    it('validates price and required ids', () => {
      const onSubmit = vi.fn()

      const { container } = render(<ProductFormV2 onSubmit={onSubmit} />)

      fireEvent.change(byName(container, 'name'), { target: { value: 'A' } })
      fireEvent.change(byName(container, 'code'), { target: { value: 'BAD' } })
      fireEvent.change(byName(container, 'price'), { target: { value: '-1' } })
      fireEvent.submit(container.querySelector('form'))

      expect(onSubmit).not.toHaveBeenCalled()
      expect(screen.getByText(/venda/)).toBeInTheDocument()
      expect(screen.getByText(/Escolha uma marca/)).toBeInTheDocument()
    })

    it('selects the id returned by quick create callback', async () => {
      const onQuickCreate = vi.fn().mockResolvedValue({ id: 77 })

      const { container } = render(
        <ProductFormV2 onSubmit={vi.fn()} onQuickCreate={onQuickCreate} />,
      )

      fireEvent.click(screen.getAllByRole('button', { name: '+' })[0])
      fireEvent.change(screen.getByPlaceholderText('Ex: PrimeCuts'), {
        target: { value: 'marca api' },
      })
      fireEvent.click(screen.getByRole('button', { name: /Criar/i }))

      await waitFor(() => {
        expect(onQuickCreate).toHaveBeenCalledWith('brand', 'Marca Api')
      })
      expect(screen.queryByText('Nova Marca')).not.toBeInTheDocument()
    })

    it('uses the typed value when quick create does not return an id', async () => {
      const onQuickCreate = vi.fn().mockResolvedValue({})

      const { container } = render(
        <ProductFormV2 onSubmit={vi.fn()} onQuickCreate={onQuickCreate} />,
      )

      fireEvent.click(screen.getAllByRole('button', { name: '+' })[1])
      fireEvent.change(screen.getByPlaceholderText('Ex: Seafood'), {
        target: { value: 'frios' },
      })
      fireEvent.click(screen.getByRole('button', { name: /Criar/i }))

      await waitFor(() => {
        expect(onQuickCreate).toHaveBeenCalledWith('category', 'Frios')
      })
      expect(screen.queryByText('Nova Categoria')).not.toBeInTheDocument()
    })
  })

  describe('QuickCreateModal', () => {
    it('does not render while closed', () => {
      const { container } = render(
        <QuickCreateModal
          open={false}
          type="brand"
          onClose={vi.fn()}
          onCreate={vi.fn()}
        />,
      )

      expect(container).toBeEmptyDOMElement()
    })

    it('creates a title-cased value with the Enter key', async () => {
      const onCreate = vi.fn().mockResolvedValue(undefined)

      render(
        <QuickCreateModal
          open
          type="category"
          onClose={vi.fn()}
          onCreate={onCreate}
        />,
      )

      fireEvent.change(screen.getByPlaceholderText('Ex: Seafood'), {
        target: { value: 'carnes especiais' },
      })
      fireEvent.keyDown(screen.getByPlaceholderText('Ex: Seafood'), {
        key: 'Enter',
      })

      await waitFor(() => {
        expect(onCreate).toHaveBeenCalledWith('Carnes Especiais')
      })
    })

    it('asks for confirmation before editing and allows going back', async () => {
      const onCreate = vi.fn().mockResolvedValue(undefined)

      render(
        <QuickCreateModal
          open
          type="brand"
          initialValue="marca antiga"
          onClose={vi.fn()}
          onCreate={onCreate}
        />,
      )

      expect(screen.getByPlaceholderText('Ex: PrimeCuts')).toHaveValue('Marca Antiga')
      fireEvent.change(screen.getByPlaceholderText('Ex: PrimeCuts'), {
        target: { value: 'marca nova' },
      })
      fireEvent.click(screen.getByRole('button', { name: /Editar/i }))

      expect(screen.getByText(/hist/)).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /Voltar/i }))
      expect(screen.queryByText(/hist/)).not.toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /Editar/i }))
      fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }))

      await waitFor(() => {
        expect(onCreate).toHaveBeenCalledWith('Marca Nova')
      })
    })

    it('shows errors thrown by the create callback', async () => {
      const onCreate = vi.fn().mockRejectedValue(new Error('Nome duplicado'))

      render(
        <QuickCreateModal
          open
          type="brand"
          onClose={vi.fn()}
          onCreate={onCreate}
        />,
      )

      fireEvent.change(screen.getByPlaceholderText('Ex: PrimeCuts'), {
        target: { value: 'marca' },
      })
      fireEvent.click(screen.getByRole('button', { name: /Criar/i }))

      expect(await screen.findByText('Nome duplicado')).toBeInTheDocument()
    })
  })

  describe('StockForm', () => {
    const products = [
      { id: 1, name: 'Picanha', code: 'PIC001', unitMeasurement: 'KG' },
      { id: 2, name: 'Espeto', code: 'ESP001', unitMeasurement: 'UN' },
    ]

    it('calculates margin and submits stock data', () => {
      const onSubmit = vi.fn()
      const { container } = render(
        <StockForm products={products} onSubmit={onSubmit} />,
      )

      fireEvent.change(byName(container, 'productId'), { target: { value: '1' } })
      fireEvent.change(byName(container, 'quantity'), { target: { value: '2.5' } })
      fireEvent.change(byName(container, 'expiryDate'), {
        target: { value: '2026-07-20' },
      })
      fireEvent.change(byName(container, 'costPrice'), { target: { value: '20' } })
      fireEvent.change(byName(container, 'salePrice'), { target: { value: '30' } })

      expect(screen.getByText('50.0%')).toBeInTheDocument()

      fireEvent.submit(container.querySelector('form'))

      expect(onSubmit).toHaveBeenCalledWith({
        productId: '1',
        quantity: '2.5',
        expiryDate: '2026-07-20',
        costPrice: '20',
        salePrice: '30',
      })
    })

    it('keeps only digits for unit products and shows empty margin', () => {
      const { container } = render(
        <StockForm products={products} onSubmit={vi.fn()} />,
      )

      fireEvent.change(byName(container, 'productId'), { target: { value: '2' } })
      fireEvent.change(byName(container, 'quantity'), { target: { value: '12.5' } })

      expect(byName(container, 'quantity')).toHaveValue(125)
      expect(screen.getByText('--%')).toBeInTheDocument()
    })
  })
})
