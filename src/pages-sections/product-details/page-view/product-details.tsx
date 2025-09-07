import Container from "@mui/material/Container"
import Breadcrumbs from "@mui/material/Breadcrumbs"
import Link from "next/link"
import Typography from "@mui/material/Typography"
// Local CUSTOM COMPONENTS
import ProductTabs from "../product-tabs"
import ProductIntro from "../product-intro"
// CUSTOM DATA MODEL
import ProductBreadcrumbs from "../product-breadcrumb"

// ==============================================================
interface Props {
  product: any
}
// ==============================================================

export default function ProductDetailsPageView(props: Props) {
  return (
    <Container className="mt-2 mb-2">
      <ProductBreadcrumbs product={props.product} />
      <ProductIntro product={props.product} />

      <ProductTabs description={props.product.description} />
    </Container>
  )
}
