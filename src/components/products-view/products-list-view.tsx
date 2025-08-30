import Pagination from "@mui/material/Pagination"
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
  return (
    <div>
      {products.map((item) => (
        <ProductCard9 product={item} key={item.id} />
      ))}

      <FlexBetween flexWrap="wrap" mt={4}>
        <Span color="grey.600">
          Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} Products
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
