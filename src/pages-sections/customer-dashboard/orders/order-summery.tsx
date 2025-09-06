import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
// GLOBAL CUSTOM COMPONENTS
import { FlexBetween } from "components/flex-box";
import { H5, H6, Paragraph } from "components/Typography";
// CUSTOM UTILS LIBRARY FUNCTION
import { formatCurrency } from "lib";
// CUSTOM DATA MODEL
import { useTranslation } from "react-i18next";

// ==============================================================
type Props = { order: any };
// ==============================================================

function ListItem({ title, value }: { title: string; value: string }) {
  return (
    <FlexBetween mb={1}>
      <Paragraph color="grey.600">{title}</Paragraph>
      <H6>{value}</H6>
    </FlexBetween>
  );
}

export default function OrderSummery({ order }: Props) {
  const { t } = useTranslation()
  const shippingAddress = (() => {
    const addr = order?.shippingAddress?.streetLine1
    const city = order?.shippingAddress?.city || order?.shippingAddress?.province
    const province = order?.shippingAddress?.province
    return [addr, city, province].filter(Boolean).join(", ")
  })()

  const subtotal = Number(order?.subTotalWithTax || order?.subTotal || 0)
  const shipping = (Array.isArray(order?.shippingLines) ? order.shippingLines : []).reduce(
    (acc: number, s: any) => acc + (Number(s?.priceWithTax) || 0),
    0
  )
  const discount = (Array.isArray(order?.discounts) ? order.discounts : []).reduce(
    (acc: number, d: any) => acc + Math.abs(Number(d?.amountWithTax) || 0),
    0
  )
  const total = Number(order?.totalWithTax || order?.total || 0)
  const customer = order?.customer || {}
  return (
    <Grid container spacing={3}>
      {/* CUSTOMER & SHIPPING INFO */}
      <Grid item lg={6} md={6} xs={12}>
        <Card sx={{ p: 3 }}>
          <H5 mt={0} mb={2}>{t("Customer")}</H5>
          <Paragraph fontSize={14} my={0}>
            {customer?.firstName} {customer?.lastName}
          </Paragraph>
          <Paragraph fontSize={14} my={0}>{customer?.emailAddress}</Paragraph>
          <Paragraph fontSize={14} my={0}>{customer?.phoneNumber}</Paragraph>
          <Divider sx={{ my: 2 }} />
          <H5 mt={0} mb={2}>{t("Shipping Address")}</H5>
          <Paragraph fontSize={14} my={0}>{shippingAddress}</Paragraph>
        </Card>
      </Grid>

      {/* TOTAL SUMMERY SECTION */}
      <Grid item lg={6} md={6} xs={12}>
        <Card sx={{ p: 3 }}>
          <H5 mt={0} mb={2}>{t("Total Summary")}</H5>

          <ListItem title={`${t("Subtotal")}:`} value={formatCurrency(subtotal)} />
          <ListItem title={`${t("Shipping fee")}:`} value={formatCurrency(shipping)} />
          <ListItem title={`${t("Discount")}:`} value={formatCurrency(discount)} />

          <Divider sx={{ mb: 1 }} />

          <FlexBetween mb={2}>
            <H6>{t("Total")}</H6>
            <H6>{formatCurrency(total)}</H6>
          </FlexBetween>
        </Card>
      </Grid>
    </Grid>
  );
}
