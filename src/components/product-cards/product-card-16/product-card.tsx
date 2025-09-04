import Link from "next/link"
import Rating from "@mui/material/Rating"
import IconButton from "@mui/material/IconButton"
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart"
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
// CART CONTAINER
import useCart from "hooks/useCart"
import { useMemo, useState, useCallback } from "react"
import clsx from "clsx"
import VariantConfigDialog from "../variant-config-dialog"
import axios from "axios"

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

  const { addToCart } = useCart()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [productDetail, setProductDetail] = useState<any>(null)
  const closeDialog = useCallback(() => setDialogOpen(false), [])
  const onConfirmVariant = useCallback((variantId: string) => {
    closeDialog()
    const variant = productDetail?.variants?.find((v: any) => String(v.id) === String(variantId))
    addToCart({ id: String(variantId), slug, price: variant?.priceWithTax ?? price, name: title, imgUrl: thumbnail, qty: 1 })
  }, [addToCart, closeDialog, productDetail, slug, price, title, thumbnail])
  const handleAddToCart = async () => {
    try {
      const { data } = await axios.get(`/api/products/${slug}`)
      const product = data?.product
      const pv = product?.variants || []
      if (pv.length === 1) {
        addToCart({ id: String(pv[0].id), slug, price: pv[0].priceWithTax ?? price, name: title, imgUrl: thumbnail, qty: 1 })
        return
      }
      if (pv.length > 1) {
        setProductDetail(product)
        setDialogOpen(true)
      }
    } catch (e) {
      // ignore
    }
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

      <FlexBox height="100%" justifyContent="space-between" alignItems="end">
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

        <IconButton color="primary" onClick={handleAddToCart}>
          <AddShoppingCartIcon fontSize="small" />
        </IconButton>
      </FlexBox>
      <VariantConfigDialog open={dialogOpen} product={productDetail} onClose={closeDialog} onConfirm={onConfirmVariant} />
    </FlexBox>
  )
}
