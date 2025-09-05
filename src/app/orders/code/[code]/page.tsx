import { Metadata } from "next"
import { notFound } from "next/navigation"
import { headers, cookies } from "next/headers"
import { fetchOrder as fetchOrderApi } from "lib/api"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Order Details",
}

type Params = { params: { code: string }; searchParams?: { token?: string } }

async function fetchOrder(code: string, token?: string) {
  const h = headers()
  const origin = h.get("x-url-origin") || h.get("origin") || ""
  const cookieHeader = cookies().toString()
  try {
    return await fetchOrderApi(code, { baseURL: origin, cookie: cookieHeader, token })
  } catch {
    return null
  }
}

export default async function OrderDetailsPage({ params, searchParams }: Params) {
  const data = await fetchOrder(params.code, searchParams?.token)
  if (!data || !data.order) return notFound()

  const { order, qrImageUrl, qrImageUrl2 } = data

  return (
    <div className="container" style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 12 }}>Order {order?.code}</h1>
      <div style={{ marginBottom: 24 }}>
        <div>Total: {order?.totalWithTax}</div>
        <div>Status: {order?.state}</div>
        <div>Items: {order?.totalQuantity}</div>
      </div>

      {(qrImageUrl || qrImageUrl2) && (
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          {qrImageUrl ? (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Banking QR</div>
              <Image src={qrImageUrl} alt="Banking QR" width={320} height={320} style={{ height: "auto", width: "100%", maxWidth: 320 }} />
            </div>
          ) : null}
          {qrImageUrl2 ? (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Banking QR 2</div>
              <Image src={qrImageUrl2} alt="Banking QR 2" width={320} height={320} style={{ height: "auto", width: "100%", maxWidth: 320 }} />
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}


