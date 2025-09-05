import Container from "@mui/material/Container"
import Breadcrumbs from "@mui/material/Breadcrumbs"
import Link from "next/link"
import Typography from "@mui/material/Typography"
// Local CUSTOM COMPONENTS
import ProductTabs from "../product-tabs"
import ProductIntro from "../product-intro"
import AvailableShops from "../available-shops"
import RelatedProducts from "../related-products"
import FrequentlyBought from "../frequently-bought"
// CUSTOM DATA MODEL
import Product from "models/Product.model"
import ProductBreadcrumbs from "../product-breadcrumb"

// ==============================================================
interface Props {
  product: Product
  relatedProducts: Product[]
  frequentlyBought: Product[]
}
// ==============================================================

export default function ProductDetailsPageView(props: Props) {
  return (
    <Container className="mt-2 mb-2">
      <ProductBreadcrumbs product={props.product} />
      {/* PRODUCT DETAILS INFO AREA */}
      <ProductIntro product={props.product} />

      {/* PRODUCT DESCRIPTION AND REVIEW */}
      <ProductTabs description={props.product.description} />

      {/* FREQUENTLY BOUGHT PRODUCTS AREA */}
      {/* <FrequentlyBought products={props.frequentlyBought} /> */}

      {/* AVAILABLE SHOPS AREA */}
      {/* <AvailableShops /> */}

      {/* RELATED PRODUCTS AREA */}
      {/* <RelatedProducts products={props.relatedProducts} /> */}
    </Container>
  )
}
