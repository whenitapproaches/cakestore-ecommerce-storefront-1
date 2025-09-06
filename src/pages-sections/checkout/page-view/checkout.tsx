"use client";

import Grid from "@mui/material/Grid";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "contexts/ToastContext";
import { cartApi } from "lib";
import { useTranslation } from "react-i18next";
// LOCAL CUSTOM COMPONENTS
import { CheckoutForm } from "../checkout-form";
import { CheckoutSummary } from "../checkout-summery";

export default function CheckoutPageView() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    const validateCartStock = async () => {
      try {
        const { data } = await cartApi.getActive();
        const lines: any[] = Array.isArray(data?.cart?.lines) ? data.cart.lines : [];
        if (!lines.length) {
          showToast(t("Please add items to cart before checkout"), 3000, "error");
          router.push("/shop");
          return;
        }
        const outOfStock = lines.find((l: any) => {
          const level = String(l?.productVariant?.stockLevel || "");
          return level === "OUT_OF_STOCK";
        });
        if (outOfStock && !cancelled) {
          const name = outOfStock?.productVariant?.name || outOfStock?.productVariant?.product?.name || "";
          showToast(`${t("Out of Stock")}: ${name}`, 3000, "error");
          router.push("/cart");
        }
      } catch {}
    };
    validateCartStock();
    return () => {
      cancelled = true;
    };
  }, [router, showToast, t]);

  return (
    <Grid container flexWrap="wrap-reverse" spacing={3}>
      <Grid item lg={8} md={8} xs={12}>
        <CheckoutForm />
      </Grid>

      <Grid item lg={4} md={4} xs={12}>
        <CheckoutSummary />
      </Grid>
    </Grid>
  );
}
