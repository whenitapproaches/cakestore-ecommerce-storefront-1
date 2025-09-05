import Pagination from "@mui/material/Pagination"
import { useTranslation } from "react-i18next"
// GLOBAL CUSTOM COMPONENTS
import { Span } from "components/Typography"
import FlexBetween from "components/flex-box/flex-between"
import { ProductCard9 } from "components/product-cards/product-card-9"
// CUSTOM DATA MODEL
import Product from "models/Product.model"

// ==========================================================
type Props = { 
  products: Product[]
  total?: number
  page?: number
  limit?: number
  onPageChange?: (page: number) => void
}
// ==========================================================

export default function ProductsListView({ 
  products, 
  total = 0, 
  page = 1, 
  limit = 12,
  onPageChange 
}: Props) {
  const { t } = useTranslation()
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  return (
    <div>
      {products.map((item) => (
        <ProductCard9 product={item} key={item.id} />
      ))}

      <FlexBetween flexWrap="wrap" mt={4}>
        <Span color="grey.600">
          {t("Showing {{from}}-{{to}} of {{total}} Products", { from, to, total })}
        </Span>
        <Pagination 
          count={Math.ceil(total / limit)} 
          page={page}
          variant="outlined" 
          color="primary" 
          onChange={(_, newPage) => onPageChange?.(newPage)}
        />
      </FlexBetween>
    </div>
  )
}
