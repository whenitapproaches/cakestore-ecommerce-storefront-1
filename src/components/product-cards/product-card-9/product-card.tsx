import Link from "next/link"
import Card from "@mui/material/Card"
import Rating from "@mui/material/Rating"
import styled from "@mui/material/styles/styled"
// GLOBAL CUSTOM COMPONENTS
import { H5 } from "components/Typography"
import LazyImage from "components/LazyImage"
// LOCAL CUSTOM HOOK
import useProduct from "../use-product"
// LOCAL CUSTOM COMPONENTS
import DiscountChip from "../discount-chip"
import ProductPrice from "../product-price"
import ProductTags from "./components/tags"
import AddToCartButton from "./components/add-to-cart"
import FavoriteButton from "./components/favorite-button"
import Product from "models/Product.model"
import { useMemo } from "react"

// STYLED COMPONENT
const Wrapper = styled(Card)({
  width: "100%",
  overflow: "hidden",
  position: "relative",
  marginBottom: "1.25rem",
})

const ContentWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexDirection: "row",

  "& .img-wrapper": {
    width: 150,
    flexShrink: 0,
    position: "relative",
    backgroundColor: theme.palette.grey[200],
  },

  "& .content": {
    flex: 1,
    padding: "1rem",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "flex-start",
    "& .img-wrapper": { width: "100%" },
    "& .content": { width: "100%" },
  },
}))

// ===========================================================
type Props = {
  product: Product
}
// ===========================================================

export default function ProductCard9({ product }: Props) {
  const {
    slug,
    name: title,
    asset: { preview: thumbnail },
    price,
    description,
    listPrice,
    id,
  } = product || {}

  const { cartItem, handleCartAmountChange, isFavorite, toggleFavorite } =
    useProduct(slug)

  const handleIncrementQuantity = () => {
    const product = {
      id,
      slug,
      price,
      imgUrl: thumbnail,
      name: title,
      qty: (cartItem?.qty || 0) + 1,
    }
    handleCartAmountChange(product)
  }

  const handleDecrementQuantity = () => {
    const product = {
      id,
      slug,
      price,
      imgUrl: thumbnail,
      name: title,
      qty: (cartItem?.qty || 0) - 1,
    }
    handleCartAmountChange(product, "remove")
  }

  const discount = useMemo(() => {
    if (!listPrice) return null

    return Math.round(((listPrice - price) / listPrice) * 100)
  }, [price, listPrice])

  return (
    <Wrapper>
      <ContentWrapper>
        <div className="img-wrapper">
          <Link href={`/products/${slug}`}>
            <LazyImage src={thumbnail} alt={title} width={500} height={500} />
          </Link>
        </div>

        <div className="content">
          <div>
            {/* PRODUCT TITLE / NAME */}
            <Link href={`/products/${slug}`}>
              <H5 fontWeight="700" mt={1} mb={2}>
                {title}
              </H5>
            </Link>

            {/* PRODUCT PRICE */}
            <ProductPrice price={price} listPrice={listPrice} />
            <DiscountChip discount={discount} />
          </div>

          {/* PRODUCT ADD TO CART BUTTON */}
          <AddToCartButton
            quantity={cartItem?.qty}
            handleDecrement={handleDecrementQuantity}
            handleIncrement={handleIncrementQuantity}
          />
        </div>
      </ContentWrapper>
    </Wrapper>
  )
}
