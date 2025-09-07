import { Metadata } from "next"
import { notFound } from "next/navigation"
import { headers, cookies } from "next/headers"
import { fetchOrder as fetchOrderApi } from "lib/api"
import { Box } from "@mui/material"
import { Container } from "@mui/material"
import OrderDetailsPageView from "pages-sections/customer-dashboard/orders/page-view/order-details"
import { t } from "i18next"

export const metadata: Metadata = {
  title: "Order Details",
}

type Params = { params: { code: string }; searchParams?: { token?: string } }

async function fetchOrder(code: string, token?: string) {
  const h = headers()
  const origin = h.get("x-url-origin") || h.get("origin") || ""
  const cookieHeader = cookies().toString()
  try {
    return await fetchOrderApi(code, {
      baseURL: origin,
      cookie: cookieHeader,
      token,
    })
  } catch {
    return null
  }
}

export default async function OrderDetailsPage({
  params,
  searchParams,
}: Params) {
  const data = await fetchOrder(params.code, searchParams?.token)
  if (!data || !data.order) return notFound()

  const { order, qrImageUrl, qrImageUrl2 } = data

  return (
    <div className="bg-white pt-2 pb-4">
      <Container>
        <OrderDetailsPageView order={order} qrImageUrl={qrImageUrl} qrImageUrl2={qrImageUrl2} />
      </Container>
    </div>
  )
}
