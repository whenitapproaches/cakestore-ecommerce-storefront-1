"use client"
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
import IconButton from "@mui/material/IconButton"
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart"
import CircularProgress from "@mui/material/CircularProgress"
import FavoriteButton from "./components/favorite-button"
import Product from "models/Product.model"
import { useMemo, useState, useCallback } from "react"
import useCart from "hooks/useCart"
import VariantConfigDialog from "../variant-config-dialog"
import axios from "axios"

// STYLED COMPONENT
const Wrapper = styled(Card)({
  width: "100%",
  overflow: "hidden",
  position: "relative",
  marginBottom: "1.25rem",
})

const ContentWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",

  "& .img-wrapper": {
    width: 150,
    flexShrink: 0,
    position: "relative",
    backgroundColor: theme.palette.grey[200],
  },

  "& .content": {
    flex: 1,
    height: "100%",
    padding: "1rem",
    display: "flex",
    alignItems: "flex-start",
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

  const { isFavorite, toggleFavorite } = useProduct(slug)
  const { addToCart } = useCart()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [productDetail, setProductDetail] = useState<any>(null)
  const closeDialog = useCallback(() => setDialogOpen(false), [])
  const onConfirmVariant = useCallback(async (variantId: string) => {
    closeDialog()
    const variant = productDetail?.variants?.find((v: any) => String(v.id) === String(variantId))
    setIsAddingToCart(true)
    try {
      await addToCart({
        id: variantId,
        slug,
        price: variant?.priceWithTax ?? price,
        imgUrl: thumbnail,
        name: title,
        qty: 1,
      })
    } finally {
      setIsAddingToCart(false)
    }
  }, [addToCart, closeDialog, productDetail, slug, price, thumbnail, title])
  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true)
      const { data } = await axios.get(`/api/products/${slug}`)
      const product = data?.product
      const pv = product?.variants || []
      if (pv.length === 1) {
        await addToCart({ id: String(pv[0].id), slug, price: pv[0].priceWithTax ?? price, imgUrl: thumbnail, name: title, qty: 1 })
        setIsAddingToCart(false)
        return
      }
      if (pv.length > 1) {
        setProductDetail(product)
        setIsAddingToCart(false)
        setDialogOpen(true)
      }
    } catch (e) {
      // fallback: do nothing
    } finally {
      setIsAddingToCart(false)
    }
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

          <IconButton color="primary" onClick={handleAddToCart} disabled={isAddingToCart}>
            {isAddingToCart ? (
              <CircularProgress size={18} thickness={5} color="inherit" />
            ) : (
              <AddShoppingCartIcon fontSize="small" />
            )}
          </IconButton>
        </div>
      </ContentWrapper>
      <VariantConfigDialog open={dialogOpen} product={productDetail} onClose={closeDialog} onConfirm={onConfirmVariant} />
    </Wrapper>
  )
}
