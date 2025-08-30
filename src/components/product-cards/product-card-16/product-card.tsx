import Link from "next/link"
import Rating from "@mui/material/Rating"
// GLOBAL CUSTOM COMPONENTS
import { H6 } from "components/Typography"
import LazyImage from "components/LazyImage"
import { FlexBetween, FlexBox } from "components/flex-box"
// CUSTOM UTILS LIBRARY FUNCTIONS
import { formatCurrency } from "lib"
// STYLED COMPONENTS
import { PriceText } from "./styles"
// CUSTOM DATA MODEL
import Product from "models/Product.model"

import DiscountChip from "../discount-chip"
import QuantityButtons from "./components/quantity-buttons"
// LOCAL CUSTOM HOOKS
import useProduct from "../use-product"
import { useMemo } from "react"
import clsx from "clsx"

// ==============================================================
type Props = { product: Product }
// ==============================================================

export default function ProductCard16({ product }: Props) {
  const {
    slug,
    name: title,
    asset: { preview: thumbnail },
    price,
    description,
    listPrice,
    id,
  } = product || {}

  const { cartItem, handleCartAmountChange } = useProduct(slug)

  const handleIncrementQuantity = () => {
    const product = {
      id,
      slug,
      price,
      name: title,
      imgUrl: thumbnail,
      qty: (cartItem?.qty || 0) + 1,
    }
    handleCartAmountChange(product)
  }

  const handleDecrementQuantity = () => {
    const product = {
      id,
      slug,
      price,
      name: title,
      imgUrl: thumbnail,
      qty: (cartItem?.qty || 0) - 1,
    }
    handleCartAmountChange(product, "remove")
  }

  const discount = useMemo(() => {
    if (!listPrice) return null

    return Math.round(((listPrice - price) / listPrice) * 100)
  }, [price, listPrice])

  return (
    <FlexBox height="100%" flexDirection="column">
      <Link href={`/products/${slug}`}>
        <FlexBox position="relative" bgcolor="grey.50" borderRadius={3} mb={2}>
          <LazyImage alt={title} width={380} height={379} src={thumbnail} />
        </FlexBox>
      </Link>

      <FlexBox height="100%" justifyContent="space-between">
        <FlexBox
          height="100%"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Link href={`/products/${slug}`}>
            <H6 fontWeight={700} mb={1}>
              {title}
            </H6>
          </Link>

          <PriceText>
            {discount ? (
              <span className="price-container">
                <span className="base-price">{formatCurrency(listPrice)}</span>
                {discount ? (
                  <DiscountChip
                    discount={discount}
                    sx={{ left: 20, top: 20 }}
                  />
                ) : null}
              </span>
            ) : null}
            <span className={clsx({ price: discount })}>
              {formatCurrency(price)}
            </span>
          </PriceText>
        </FlexBox>

        {/* PRODUCT QUANTITY HANDLER BUTTONS */}
        <QuantityButtons
          quantity={cartItem?.qty || 0}
          handleIncrement={handleIncrementQuantity}
          handleDecrement={handleDecrementQuantity}
        />
      </FlexBox>
    </FlexBox>
  )
}
