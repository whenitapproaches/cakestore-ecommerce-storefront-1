"use client";

import Link from "next/link";
import { SxProps, Theme } from "@mui/material/styles";
// GLOBAL CUSTOM COMPONENTS
import LazyImage from "components/LazyImage";
import { H3, Span } from "components/Typography";
// LOCAL CUSTOM HOOK
import useProduct from "../use-product";
// LOCAL CUSTOM COMPONENTS
import ProductPrice from "../product-price";
import DiscountChip from "../discount-chip";
import ProductStatus from "./components/product-status";
import ProductRating from "../product-rating";
import IconButton from "@mui/material/IconButton";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import useCart from "hooks/useCart";
import VariantConfigDialog from "../variant-config-dialog";
import axios from "axios";
import { useCallback, useState } from "react";
// STYLED COMPONENTS
import { StyledCard, ContentWrapper, ColorBox, ImgBox } from "./styles";

// =======================================================
interface Props {
  off: number;
  slug: string;
  price: number;
  title: string;
  imgUrl: string;
  status: string;
  rating?: number;
  id: string | number;
  sx?: SxProps<Theme>;
  hideRating?: boolean;
  productColors: string[];
}
// =======================================================

export default function ProductCard7(props: Props) {
  const { sx, off, status, id, title, price, imgUrl, rating, hideRating, productColors, slug } =
    props;

  const { } = useProduct(slug);
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
    <StyledCard sx={sx}>
      <Link href={`/products/${slug}`}>
        <ImgBox>
          {/* PRODUCT BADGE STATUS IF STATUS AVAILABLE */}
          <ProductStatus status={status} />

          {/* DISCOUNT PERCENT CHIP IF AVAILABLE */}
          <DiscountChip discount={off} sx={{ borderRadius: 0 }} />

          {/* PRODUCT IMAGE / THUMBNAIL */}
          <div className="img-wrapper">
            <LazyImage alt={title} width={300} height={273} src={imgUrl} />
          </div>
        </ImgBox>
      </Link>

      <ContentWrapper>
        <div className="content">
          {/* PRODUCT TITLE / NAME */}
          <Link href={`/products/${slug}`}>
            <H3 mb={1} ellipsis title={title} fontSize={24} fontWeight={700} color="text.secondary">
              {title}
            </H3>
          </Link>

          {/* PRODUCT RATING / REVIEW  */}
          <ProductRating showRating={!hideRating} rating={rating} />

          {/* PRODUCT COLORS */}
          {productColors.length ? (
            <ColorBox>
              {productColors.map((color, ind) => (
                <Span key={ind} bgcolor={color} />
              ))}
            </ColorBox>
          ) : null}

          {/* PRODUCT PRICE WITH DISCOUNT */}
          <ProductPrice listPrice={off ? price / (1 - off / 100) : 0} price={price} />
        </div>

        <IconButton color="primary" onClick={handleAddToCart}>
          <AddShoppingCartIcon fontSize="small" />
        </IconButton>
      </ContentWrapper>
      <VariantConfigDialog open={dialogOpen} product={productDetail} onClose={closeDialog} onConfirm={onConfirmVariant} />
    </StyledCard>
  );
}
