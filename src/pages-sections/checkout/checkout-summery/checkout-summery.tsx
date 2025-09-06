import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import { Paragraph, Span } from "components/Typography";
import { FlexBetween } from "components/flex-box";
import { useEffect, useMemo, useState } from "react";
import { cartApi, formatCurrency } from "lib";
import { useTranslation } from "react-i18next";

export default function CheckoutSummary() {
  const { t } = useTranslation();
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [count, setCount] = useState(0);

  const total = useMemo(() => Math.max(0, subtotal + shipping - discount), [subtotal, shipping, discount]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await cartApi.getActive();
        const lines: any[] = Array.isArray(data?.cart?.lines) ? data.cart.lines : [];
        const sub = lines.reduce((acc, l: any) => acc + (Number(l?.unitPriceWithTax) || 0) * (Number(l?.quantity) || 0), 0);
        const disc = (Array.isArray(data?.cart?.discounts) ? data.cart.discounts : []).reduce(
          (acc: number, d: any) => acc + Math.abs(Number(d?.amountWithTax) || 0),
          0
        );
        const ship = (Array.isArray(data?.cart?.shippingLines) ? data.cart.shippingLines : []).reduce(
          (acc: number, s: any) => acc + (Number(s?.priceWithTax) || 0),
          0
        );
        if (!cancelled) {
          setSubtotal(sub);
          setShipping(ship);
          setDiscount(disc);
          setCount(lines.reduce((acc, l: any) => acc + (Number(l?.quantity) || 0), 0));
        }
      } catch {}
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card sx={{ p: 3 }}>
      <Paragraph fontWeight={600} mb={1}>
        {t("Cart Summary")} ({count} {t("items")})
      </Paragraph>

      <FlexBetween mb={1}>
        <Span color="grey.600">{t("Subtotal")}</Span>
        <Span>{formatCurrency(subtotal)}</Span>
      </FlexBetween>

      <FlexBetween mb={1}>
        <Span color="grey.600">{t("Estimated Shipping")}</Span>
        <Span>{formatCurrency(shipping)}</Span>
      </FlexBetween>

      <FlexBetween mb={2}>
        <Span color="grey.600">{t("Discounts")}</Span>
        <Span>{formatCurrency(discount)}</Span>
      </FlexBetween>

      <Divider sx={{ my: 2 }} />

      <FlexBetween>
        <Paragraph fontSize={18} fontWeight={600} lineHeight={1}>
          {t("Total")}
        </Paragraph>
        <Paragraph fontSize={25} fontWeight={600} lineHeight={1} color="success.main">
          {formatCurrency(total)}
        </Paragraph>
      </FlexBetween>
    </Card>
  );
}
