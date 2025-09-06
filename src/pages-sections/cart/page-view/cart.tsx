"use client";

import Grid from "@mui/material/Grid";
// GLOBAL CUSTOM HOOK
import useCart from "hooks/useCart";
// LOCAL CUSTOM COMPONENTS
import CartItem from "../cart-item";
import CheckoutForm from "../checkout-form";
import { Paragraph } from "components/Typography";
import { useTranslation } from "react-i18next";
import { FlexBox } from "components/flex-box";

export default function CartPageView() {
  const { state } = useCart();
  const { t } = useTranslation();

  return (
    <Grid container spacing={3}>
      {/* CART PRODUCT LIST */}
      <Grid item md={8} xs={12}>
        {state.cart.length === 0 ? (
          <FlexBox alignItems="center" justifyContent="center" py={6}>
            <Paragraph color="grey.600">{t("Your shopping bag is empty")}</Paragraph>
          </FlexBox>
        ) : (
          state.cart.map(({ name, id, price, qty, slug, imgUrl, orderLineId, stockLevel }) => (
            <CartItem
              id={id}
              key={id}
              qty={qty}
              name={name}
              slug={slug}
              price={price}
              imgUrl={imgUrl}
              orderLineId={orderLineId}
              stockLevel={stockLevel}
            />
          ))
        )}
      </Grid>

      {/* CHECKOUT FORM */}
      <Grid item md={4} xs={12}>
        <CheckoutForm />
      </Grid>
    </Grid>
  );
}
