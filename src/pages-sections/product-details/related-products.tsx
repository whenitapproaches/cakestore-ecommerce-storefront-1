"use client";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
// GLOBAL CUSTOM COMPONENTS
import { H3 } from "components/Typography";
import ProductCard16 from "components/product-cards/product-card-16";
// CUSTOM DATA MODEL
import Product from "models/Product.model";

// ==============================================================
type Props = { products: Product[] };
// ==============================================================

export default function RelatedProducts({ products }: Props) {
  return (
    <Box mb={7.5}>
      <H3 mb={3}>Related Products</H3>

      <Grid container spacing={3}>
        {products.map((item, ind) => (
          <Grid item lg={3} md={4} sm={6} xs={12} key={ind}>
            <ProductCard16
              product={item}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
