"use client"

import Link from "next/link"
import { FC, useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import Grid from "@mui/material/Grid"
import Avatar from "@mui/material/Avatar"
import Button from "@mui/material/Button"
// MUI ICON COMPONENTS
import Add from "@mui/icons-material/Add"
import Remove from "@mui/icons-material/Remove"
// GLOBAL CUSTOM HOOK
import useCart from "hooks/useCart"
// GLOBAL CUSTOM COMPONENTS
import LazyImage from "components/LazyImage"
import { H1, H2, H3, H6, Paragraph } from "components/Typography"
import { FlexBox, FlexRowCenter } from "components/flex-box"
import DiscountChip from "components/product-cards/discount-chip"
import QuantityStepper from "components/QuantityStepper"
// CUSTOM UTILS LIBRARY FUNCTION
import { formatCurrency, calculateDiscount } from "lib"
// CUSTOM DATA MODEL
import Product from "models/Product.model"
// TRANSLATION
import { useTranslation } from "react-i18next"
// TOAST NOTIFICATION
import { useToast } from "contexts/ToastContext"

// ================================================================
type Props = { product: Product }
// ================================================================

export default function ProductIntro({ product }: Props) {
  const { t } = useTranslation()
  const { showToast } = useToast()

  // Extract data from the new GraphQL structure
  const {
    id,
    name,
    slug,
    description,
    featuredAsset,
    assets,
    variants,
    optionGroups,
  } = product || {}

  // Get the first variant for price and stock info
  const firstVariant = variants?.[0]
  const price = firstVariant?.priceWithTax || 0
  const listPrice = (product as any)?.listPrice || 0 // Use legacy listPrice from product
  const stockLevel = firstVariant?.stockLevel || "OUT_OF_STOCK"

  // Calculate discount
  const discount = useMemo(() => {
    if (!listPrice || listPrice <= price) return 0
    return Math.round(((listPrice - price) / listPrice) * 100)
  }, [price, listPrice])

  // Use assets for images, fallback to featuredAsset
  const images =
    assets?.length > 0
      ? assets.map((asset) => asset.preview)
      : featuredAsset
        ? [featuredAsset.preview]
        : []

  const thumbnail = featuredAsset?.preview || images[0] || ""

  const { state, dispatch, addToCart } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(firstVariant)
  const [selectVariants, setSelectVariants] = useState<Record<string, string>>(
    {}
  )
  const [quantity, setQuantity] = useState(1)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize default selections and load from URL
  useEffect(() => {
    if (optionGroups && optionGroups.length > 0) {
      const initialVariants: Record<string, string> = {}

      optionGroups.forEach((optionGroup) => {
        const optionGroupName = optionGroup.name.toLowerCase()
        const urlValue = searchParams.get(optionGroupName)

        if (
          urlValue &&
          optionGroup.options.some((opt) => opt.name === urlValue)
        ) {
          // Use value from URL if it exists and is valid
          initialVariants[optionGroupName] = urlValue
        } else if (optionGroup.options.length > 0) {
          // Default to first option if not in URL
          initialVariants[optionGroupName] = optionGroup.options[0].name
        }
      })

      setSelectVariants(initialVariants)

      // Find matching variant based on initial selections
      const matchingVariant = variants?.find((variant) => {
        return variant.options.every((option) => {
          const optionGroup = optionGroups?.find(
            (og) => og.id === option.groupId
          )
          const optionValue = optionGroup?.options.find(
            (o) => o.id === option.id
          )
          return (
            initialVariants[optionGroup?.name.toLowerCase() || ""] ===
            optionValue?.name
          )
        })
      })

      if (matchingVariant) {
        setSelectedVariant(matchingVariant)
      }
    }
  }, [optionGroups, variants, searchParams])

  // Update URL when selections change
  const updateURL = (newVariants: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(newVariants).forEach(([key, value]) => {
      params.set(key, value)
    })

    router.replace(`?${params.toString()}`, { scroll: false })
  }

  // HANDLE CHANGE TYPE AND OPTIONS
  const handleChangeVariant = (variantName: string, value: string) => () => {
    const newVariants = {
      ...selectVariants,
      [variantName.toLowerCase()]: value,
    }
    setSelectVariants(newVariants)
    updateURL(newVariants)

    // Find matching variant based on selected options
    const matchingVariant = variants?.find((variant) => {
      return variant.options.every((option) => {
        const optionGroup = optionGroups?.find((og) => og.id === option.groupId)
        const optionValue = optionGroup?.options.find((o) => o.id === option.id)
        return (
          newVariants[optionGroup?.name.toLowerCase() || ""] ===
          optionValue?.name
        )
      })
    })

    if (matchingVariant) {
      setSelectedVariant(matchingVariant)
    }
  }

  // CHECK PRODUCT EXIST OR NOT IN THE CART
  const cartItem = state.cart.find((item) => item.id === id)

  // HANDLE SELECT IMAGE
  const handleImageClick = (ind: number) => () => setSelectedImage(ind)

  // HANDLE CHANGE CART
  const handleCartAmountChange = (amount: number) => () => {
    const cartItem = {
      price: selectedVariant?.priceWithTax || price,
      qty: amount,
      name: name || "Product",
      imgUrl: thumbnail,
      id: selectedVariant?.id || id,
      slug,
    }

    dispatch({
      type: "CHANGE_CART_AMOUNT",
      payload: cartItem,
    })

    if (amount > 0) {
      showToast(`${t("Added to Cart")}: ${name || "Product"}`, 2500)
    }
  }

  // HANDLE ADD TO CART WITH QUANTITY
  const handleAddToCart = () => {
    addToCart({
      price: selectedVariant?.priceWithTax || price,
      qty: quantity,
      name: name || "Product",
      imgUrl: thumbnail,
      id: selectedVariant?.id || id,
      slug,
    })
  }

  // HANDLE BUY NOW - PROCEED TO CHECKOUT
  const handleBuyNow = () => {
    const cartItem = {
      price: selectedVariant?.priceWithTax || price,
      qty: quantity,
      name: name || "Product",
      imgUrl: thumbnail,
      id: selectedVariant?.id || id,
      slug,
    }

    // Add to cart first
    dispatch({
      type: "CHANGE_CART_AMOUNT",
      payload: cartItem,
    })

    // Then redirect to checkout
    router.push("/checkout")
  }

  return (
    <Box width="100%">
      <Grid container spacing={3} justifyContent="space-around">
        {/* IMAGE GALLERY AREA */}
        <Grid item md={4} xs={12} alignItems="center">
          <FlexBox
            position="relative"
            borderRadius={3}
            overflow="hidden"
            justifyContent="center"
            mb={6}
          >
            <LazyImage
              alt={name || "Product"}
              width={300}
              height={300}
              loading="eager"
              src={images[selectedImage] || ""}
              sx={{ objectFit: "contain" }}
            />
            {discount > 0 && (
              <Box position="absolute" top={16} left={16}>
                <DiscountChip discount={discount} />
              </Box>
            )}
          </FlexBox>

          <FlexBox overflow="auto">
            {images.map((url, ind) => (
              <FlexRowCenter
                key={ind}
                width={64}
                height={64}
                minWidth={64}
                bgcolor="white"
                border="1px solid"
                borderRadius="10px"
                ml={ind === 0 ? "auto" : 0}
                style={{ cursor: "pointer" }}
                onClick={handleImageClick(ind)}
                mr={ind === images.length - 1 ? "auto" : "10px"}
                borderColor={
                  selectedImage === ind ? "primary.main" : "grey.400"
                }
              >
                <Avatar
                  alt="product"
                  src={url}
                  variant="square"
                  sx={{ height: 40 }}
                />
              </FlexRowCenter>
            ))}
          </FlexBox>
        </Grid>

        {/* PRODUCT INFO AREA */}
        <Grid item md={6} xs={12} alignItems="center">
          {/* PRODUCT NAME */}
          <H1 mb={1}>{name || "Product"}</H1>

          {/* PRODUCT VARIANTS */}
          {optionGroups?.map((optionGroup) => (
            <Box key={optionGroup.id} mb={3}>
              <H6 mb={2} fontWeight={600}>
                {t(optionGroup.name)}
              </H6>

              <FlexBox flexWrap="wrap" gap={1}>
                {optionGroup.options.map((option) => (
                  <Chip
                    color="default"
                    key={option.id}
                    label={option.name}
                    onClick={handleChangeVariant(optionGroup.name, option.name)}
                    sx={{
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      height: "40px",
                      padding: "8px 16px",
                      border:
                        selectVariants[optionGroup.name.toLowerCase()] ===
                        option.name
                          ? "2px solid"
                          : "1px solid",
                      borderColor:
                        selectVariants[optionGroup.name.toLowerCase()] ===
                        option.name
                          ? "primary.main"
                          : "grey.300",
                      backgroundColor:
                        selectVariants[optionGroup.name.toLowerCase()] ===
                        option.name
                          ? "primary.main"
                          : "transparent",
                      color:
                        selectVariants[optionGroup.name.toLowerCase()] ===
                        option.name
                          ? "white"
                          : "text.primary",
                      fontWeight:
                        selectVariants[optionGroup.name.toLowerCase()] ===
                        option.name
                          ? 600
                          : 400,
                      "&:hover": {
                        backgroundColor:
                          selectVariants[optionGroup.name.toLowerCase()] ===
                          option.name
                            ? "primary.dark"
                            : "primary.light",
                      },
                    }}
                  />
                ))}
              </FlexBox>
            </Box>
          ))}

          {/* PRICE & STOCK */}
          <Box pt={1} mb={3}>
            <FlexBox alignItems="center" gap={1} mb={1}>
              <H2
                color={discount > 0 ? "success.main" : "primary.main"}
                lineHeight="1"
              >
                {formatCurrency(selectedVariant?.priceWithTax || price)}
              </H2>
              {discount > 0 && <DiscountChip discount={discount} />}
            </FlexBox>

            {discount > 0 && (
              <Box
                component="del"
                color="grey.600"
                fontSize="16px"
                fontWeight={600}
                mb={1}
              >
                {formatCurrency(listPrice)}
              </Box>
            )}

            <Box color="inherit" fontSize="14px">
              {stockLevel === "IN_STOCK"
                ? t("Stock Available")
                : t("Out of Stock")}
            </Box>
          </Box>

          {/* QUANTITY AND ACTION BUTTONS */}
          <Box mb={4.5}>
            {/* QUANTITY STEPPER */}
            <Box mb={3}>
              <H6 mb={2} fontWeight={600}>
                {t("Quantity")}
              </H6>
              <QuantityStepper
                quantity={quantity}
                onQuantityChange={setQuantity}
                min={1}
                max={99}
                disabled={stockLevel === "OUT_OF_STOCK"}
              />
            </Box>

            {/* ACTION BUTTONS */}

            <FlexBox gap={2} flexWrap="wrap">
              <Button
                color="primary"
                variant="contained"
                onClick={handleBuyNow}
                disabled={stockLevel === "OUT_OF_STOCK"}
                sx={{
                  px: "1.75rem",
                  height: 48,
                  fontSize: "16px",
                  fontWeight: 600,
                  flex: 1,
                  minWidth: 140,
                }}
              >
                {t("Buy Now")}
              </Button>

              <Button
                color="primary"
                variant="outlined"
                onClick={handleAddToCart}
                disabled={stockLevel === "OUT_OF_STOCK"}
                sx={{
                  px: "1.75rem",
                  height: 48,
                  fontSize: "16px",
                  fontWeight: 600,
                  flex: 1,
                  minWidth: 140,
                }}
              >
                {t("Add to Cart")}
              </Button>
            </FlexBox>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
