"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
// GLOBAL CUSTOM COMPONENTS
import LazyImage from "components/LazyImage";
import { Span } from "components/Typography";
import ProductViewDialog from "components/products-view/product-view-dialog";
// LOCAL CUSTOM HOOK
import useProduct from "../use-product";
// LOCAL CUSTOM COMPONENTS
import HoverActions from "./components/hover-actions";
import ProductPrice from "../product-price";
import ProductTitle from "../product-title";
import DiscountChip from "../discount-chip";
import IconButton from "@mui/material/IconButton";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import useCart from "hooks/useCart";
import VariantConfigDialog from "../variant-config-dialog";
import axios from "axios";
import { useCallback, useState } from "react";
// STYLED COMPONENTS
import { ImageWrapper, ContentWrapper, StyledBazaarCard } from "./styles";

// ========================================================
type Props = {
  title: string;
  slug: string;
  price: number;
  imgUrl: string;
  rating?: number;
  discount?: number;
  id: string | number;
  hideRating?: boolean;
  hoverEffect?: boolean;
  showProductSize?: boolean;
};
// ========================================================

export default function ProductCard1({
  id,
  slug,
  title,
  price,
  imgUrl,
  rating = 5,
  hideRating,
  hoverEffect,
  discount = 5,
  showProductSize
}: Props) {
  const { isFavorite, openModal, toggleDialog, toggleFavorite } = useProduct(slug);
  const { addToCart } = useCart();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [productDetail, setProductDetail] = useState<any>(null);
  const closeDialog = useCallback(() => setDialogOpen(false), []);
  const onConfirmVariant = useCallback((variantId: string) => {
    closeDialog();
    const variant = productDetail?.variants?.find((v: any) => String(v.id) === String(variantId));
    addToCart({ id: String(variantId), slug, price: variant?.priceWithTax ?? price, imgUrl, name: title, qty: 1 });
  }, [addToCart, closeDialog, productDetail, slug, price, imgUrl, title]);
  const handleAddToCart = async () => {
    try {
      const { data } = await axios.get(`/api/products/${slug}`);
      const product = data?.product;
      const pv = product?.variants || [];
      if (pv.length === 1) {
        addToCart({ id: String(pv[0].id), slug, price: pv[0].priceWithTax ?? price, imgUrl, name: title, qty: 1 });
        return;
      }
      if (pv.length > 1) {
        setProductDetail(product);
        setDialogOpen(true);
      }
    } catch (e) {
      // ignore
    }
  };

  

  return (
    <StyledBazaarCard hoverEffect={hoverEffect}>
      <ImageWrapper>
        {/* DISCOUNT PERCENT CHIP IF AVAILABLE */}
        <DiscountChip discount={discount} />

        {/* HOVER ACTION ICONS */}
        <HoverActions
          isFavorite={isFavorite}
          toggleView={toggleDialog}
          toggleFavorite={toggleFavorite}
        />

        {/* PRODUCT IMAGE / THUMBNAIL */}
        <Link href={`/products/${slug}`}>
          <LazyImage priority src={imgUrl} width={500} height={500} alt={title} />
        </Link>
      </ImageWrapper>

      {/* PRODUCT VIEW DIALOG BOX */}
      <ProductViewDialog
        openDialog={openModal}
        handleCloseDialog={toggleDialog}
        product={{ title, price, id, slug, imgGroup: [imgUrl, imgUrl] }}
      />

      <ContentWrapper>
        <Box flex="1 1 0" minWidth="0px" mr={1}>
          {/* PRODUCT NAME / TITLE */}
          <ProductTitle title={title} slug={slug} />

          {/* PRODUCT RATINGS IF AVAILABLE */}
          {!hideRating ? <Rating size="small" value={rating} color="warn" readOnly /> : null}

          {/* PRODUCT SIZE IF AVAILABLE */}
          {showProductSize ? (
            <Span color="grey.600" mb={1} display="block">
              Liter
            </Span>
          ) : null}

          {/* PRODUCT PRICE WITH DISCOUNT */}
          <ProductPrice listPrice={discount ? price / (1 - discount / 100) : 0} price={price} />
        </Box>

        <IconButton color="primary" onClick={handleAddToCart}>
          <AddShoppingCartIcon fontSize="small" />
        </IconButton>
      </ContentWrapper>
      <VariantConfigDialog open={dialogOpen} product={productDetail} onClose={closeDialog} onConfirm={onConfirmVariant} />
    </StyledBazaarCard>
  );
}
