import { FC } from "react"
import Link from "next/link"
import Card from "@mui/material/Card"
import Button from "@mui/material/Button"
import Avatar from "@mui/material/Avatar"
import { formatDatetime } from "utils/helpers"
// GLOBAL CUSTOM COMPONENTS
import { H6, Paragraph } from "components/Typography"
import { FlexBetween, FlexBox } from "components/flex-box"
// CUSTOM UTILS LIBRARY FUNCTION
import { formatCurrency } from "lib"
import { useTranslation } from "react-i18next"

// ==============================================================
type Props = { order: any }
// ==============================================================

export default function OrderedProducts({ order }: Props) {
  const { t } = useTranslation()
  const id = order?.code || order?.id
  const orderPlacedAt = order?.orderPlacedAt
  const lines: any[] = Array.isArray(order?.lines) ? order.lines : []

  return (
    <Card sx={{ p: 0, mb: "30px" }}>
      <FlexBetween px={3} py={2} flexWrap="wrap" bgcolor="grey.200">
        <Item title={`${t("Order code")}:`} value={String(id || "-")} />
        {orderPlacedAt ? (
          <Item
            title={`${t("Confirmed at")}:`}
            value={formatDatetime(new Date(orderPlacedAt))}
          />
        ) : null}
      </FlexBetween>

      {lines.map((item: any, ind: number) => (
        <FlexBetween px={2} py={1} flexWrap="wrap" key={ind}>
          <FlexBox gap={2.5} alignItems="center">
            <Avatar
              variant="rounded"
              alt={item?.productVariant?.name || ""}
              src={
                item?.productVariant?.featuredAsset?.preview ||
                item?.productVariant?.product?.featuredAsset?.preview ||
                undefined
              }
              sx={{ height: 128, width: 128 }}
            />

            <div>
              <H6>
                <Link
                  href={`/products/${item?.productVariant?.product?.slug || ""}`}
                >
                  {item?.productVariant?.name || ""}
                </Link>
              </H6>
              <Paragraph color="grey.600">
                {formatCurrency(item?.unitPriceWithTax || 0)} x{" "}
                {item?.quantity || 0}
              </Paragraph>
            </div>
          </FlexBox>

          <Paragraph color="grey.600">
            {formatCurrency(
              item?.discountedLinePriceWithTax ?? item?.linePriceWithTax ?? 0
            )}
          </Paragraph>
        </FlexBetween>
      ))}
    </Card>
  )
}

function Item({ title, value }: { title: string; value: string }) {
  return (
    <FlexBox gap={1} alignItems="center">
      <Paragraph color="grey.600">{title}</Paragraph>
      <Paragraph>{value}</Paragraph>
    </FlexBox>
  )
}
