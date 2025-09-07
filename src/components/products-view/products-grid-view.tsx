import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import Pagination from "@mui/material/Pagination";
// GLOBAL CUSTOM COMPONENTS
import { Span } from "components/Typography";
import { FlexBetween } from "components/flex-box";
import ProductCard16 from "components/product-cards/product-card-16";
// CUSTOM DATA MODEL

// ========================================================
type Props = { 
  products: any[]
  total?: number
  page?: number
  limit?: number
  onPageChange?: (page: number) => void
};
// ========================================================

export default function ProductsGridView({ 
  products, 
  total = 0, 
  page = 1, 
  limit = 12,
  onPageChange 
}: Props) {
  const { t } = useTranslation();
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <Fragment>
      <Grid container spacing={8}>
        {products.map((item: any) => (
          <Grid item lg={4} sm={6} xs={12} key={item.slug}>
            <ProductCard16 product={item} />
          </Grid>
        ))}
      </Grid>

      <FlexBetween flexWrap="wrap" mt={6}>
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
    </Fragment>
  );
}
