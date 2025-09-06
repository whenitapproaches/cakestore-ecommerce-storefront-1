"use client"

import { Fragment } from "react"
import ShoppingBag from "@mui/icons-material/ShoppingBag"
// Local CUSTOM COMPONENTS
import OrderSummery from "../order-summery"
import OrderProgress from "../order-progress"
import OrderedProducts from "../ordered-products"
import DashboardHeader from "../../dashboard-header"
import OrderNotes from "../order-notes"
import OrderPayment from "../order-payment"
import Order from "models/Order.model"
import { Grid } from "@mui/material"

// =============================================================
type Props = {
  order: Order
  qrImageUrl?: string | null
  qrImageUrl2?: string | null
}
// =============================================================

export default function OrderDetailsPageView({
  order,
  qrImageUrl,
  qrImageUrl2,
}: Props) {
  return (
    <Fragment>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <OrderedProducts order={order} />
          <OrderPayment
            order={order}
            qrImageUrl={qrImageUrl}
            qrImageUrl2={qrImageUrl2}
          />
          <OrderNotes order={order} />
          <OrderSummery order={order} />
        </Grid>
        <Grid item xs={12} md={4}>
          <OrderProgress order={order} />
        </Grid>
      </Grid>
    </Fragment>
  )
}
