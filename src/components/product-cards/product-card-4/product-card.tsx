import Link from "next/link";
import Box from "@mui/material/Box";
// GLOBAL CUSTOM COMPONENTS
import LazyImage from "components/LazyImage";
import ProductViewDialog from "components/products-view/product-view-dialog";
// LOCAL CUSTOM HOOKS
import useProduct from "../use-product";
// LOCAL CUSTOM COMPONENTS
import DiscountChip from "../discount-chip";
import ProductPrice from "../product-price";
import ProductTitle from "../product-title";
import ProductRating from "../product-rating";
import HoverActions from "./components/hover-actions";
import IconButton from "@mui/material/IconButton";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import useCart from "hooks/useCart";
import VariantConfigDialog from "../variant-config-dialog";
import axios from "axios";
import { useCallback, useState } from "react";
// STYLED COMPONENTS
import { ContentWrapper, ImageWrapper, StyledBazaarCard } from "./styles";

// ===============================================================
type Props = {
  off: number;
  slug: string;
  title: string;
  price: number;
  imgUrl: string;
  rating?: number;
  id: string | number;
  hideRating?: boolean;
  hoverEffect?: boolean;
};
// ===============================================================

export default function ProductCard4(props: Props) {
  const { off, id, title, price, imgUrl, rating, hideRating, hoverEffect, slug } = props;

  const { isFavorite, openModal, toggleDialog, toggleFavorite } = useProduct(slug);
  const { addToCart } = useCart();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [productDetail, setProductDetail] = useState<any>(null);
  const closeDialog = useCallback(() => setDialogOpen(false), []);
  const onConfirmVariant = useCallback((variantId: string) => {
    closeDialog();
    const variant = productDetail?.variants?.find((v: any) => String(v.id) === String(variantId));
    addToCart({ id: String(variantId), slug, price: variant?.priceWithTax ?? price, name: title, imgUrl, qty: 1 });
  }, [addToCart, closeDialog, productDetail, slug, price, title, imgUrl]);
  const handleAddToCart = async () => {
    try {
      const { data } = await axios.get(`/api/products/${slug}`);
      const product = data?.product;
      const pv = product?.variants || [];
      if (pv.length === 1) {
        addToCart({ id: String(pv[0].id), slug, price: pv[0].priceWithTax ?? price, name: title, imgUrl, qty: 1 });
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
        <DiscountChip discount={off} />

        {/* PRODUCT IMAGE / THUMBNAIL */}
        <Link href={`/products/${slug}`}>
          <LazyImage alt={title} src={imgUrl} width={450} height={450} />
        </Link>

        {/* HOVER ACTION ICONS */}
        <HoverActions
          isFavorite={isFavorite}
          toggleView={toggleDialog}
          toggleFavorite={toggleFavorite}
          handleIncrementQuantity={handleAddToCart}
        />
      </ImageWrapper>

      {/* PRODUCT VIEW DIALOG BOX */}
      <ProductViewDialog
        openDialog={openModal}
        handleCloseDialog={toggleDialog}
        product={{ title, price, id, slug, imgGroup: [imgUrl, imgUrl] }}
      />

      <ContentWrapper>
        <Box flex="1 1 0" pt="3px">
          {/* PRODUCT NAME / TITLE */}
          <ProductTitle title={title} slug={slug} />

          {/* PRODUCT RATING / REVIEW  */}
          <ProductRating showRating={!hideRating} rating={rating} />

          {/* PRODUCT PRICE WITH DISCOUNT */}
          <ProductPrice listPrice={off ? price / (1 - off / 100) : 0} price={price} />
        </Box>

        <IconButton color="primary" onClick={handleAddToCart}>
          <AddShoppingCartIcon fontSize="small" />
        </IconButton>
      </ContentWrapper>
      <VariantConfigDialog open={dialogOpen} product={productDetail} onClose={closeDialog} onConfirm={onConfirmVariant} />
    </StyledBazaarCard>
  );
}
