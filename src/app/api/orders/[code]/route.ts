import { NextRequest, NextResponse } from "next/server"
import { storefrontApiQuery } from "graphql/client"
import { getContext } from "lib/getStatic"
import { OrderMaskedSelector, StoreSettingsSelector } from "graphql/selectors"
import { HttpStatusCode } from "axios"
import jwt from "jsonwebtoken"
import { storeSettingsApi } from "lib/api"

type OrderTokenPayload = {
  orderCode: string
  iat: number
  exp: number
}

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    // Verify JWT token query parameter
    const token = req.nextUrl.searchParams.get("token")
    const jwtSecret = process.env.ORDER_REDIRECT_SECRET
    if (!token || !jwtSecret) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: HttpStatusCode.Unauthorized }
      )
    }

    // Verify and decode JWT token
    let decoded: OrderTokenPayload
    try {
      decoded = jwt.verify(token, jwtSecret, {
        algorithms: ["HS256"],
      }) as OrderTokenPayload
    } catch (jwtError: any) {
      const errorMessage =
        jwtError.name === "TokenExpiredError"
          ? "Token expired"
          : "Invalid token"
      return NextResponse.json(
        { error: errorMessage },
        { status: HttpStatusCode.Unauthorized }
      )
    }

    const code = params.code
    const tokenOrderCode = decoded.orderCode

    // Verify that the order code in the URL matches the one in the JWT payload
    if (code !== tokenOrderCode) {
      return NextResponse.json(
        { error: "Invalid token for this order" },
        { status: HttpStatusCode.Unauthorized }
      )
    }

    const ctx = getContext()
    const api = storefrontApiQuery(ctx.params)

    // Fetch masked order by code
    const data = await (api as any)({
      orderByCodeMasked: [
        { code },
        {
          ...OrderMaskedSelector,
          history: [
            {
              options: {
                filter: {
                  type: { in: ["ORDER_STATE_TRANSITION", "ORDER_NOTE"] },
                },
              },
            },
            OrderMaskedSelector.history as any,
          ],
        } as any,
      ],
    })

    const order = (data as any)?.orderByCodeMasked

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: HttpStatusCode.NotFound }
      )
    }

    // Determine if order payment is completed (any payment settled)
    const isPaid = Array.isArray(order.payments)
      ? order.payments.some(
          (p: any) => (p?.state || "").toLowerCase() === "settled"
        )
      : false

    let qrImageUrl: string | null = null
    let qrImageUrl2: string | null = null

    if (!isPaid) {
      // Fetch store settings for QR base URLs
      const settingsData = await api({
        storeSettings: [
          { keys: ["banking-qr", "banking-qr-2"] },
          StoreSettingsSelector,
        ],
      })

      const rawSettings: any = settingsData?.storeSettings
      const settings = Array.isArray(rawSettings)
        ? rawSettings
        : rawSettings?.items || []
      const primary = settings.find((s: any) => s?.key === "banking-qr")
      const secondary = settings.find((s: any) => s?.key === "banking-qr-2")

      const buildQr = (base?: string | null) => {
        if (!base || !String(base).trim()) return null
        try {
          const u = new URL(base)
          u.searchParams.set("addInfo", order.code)
          u.searchParams.set(
            "amount",
            String(order.totalWithTax / Math.pow(10, 2))
          )
          return u.toString()
        } catch (_) {
          return null
        }
      }

      qrImageUrl = buildQr(primary?.value as string | undefined)
      qrImageUrl2 = buildQr(secondary?.value as string | undefined)
    }

    const response = NextResponse.json({ order, qrImageUrl, qrImageUrl2 })
    response.headers.set(
      "Cache-Control",
      "private, no-store, no-cache, must-revalidate"
    )
    response.headers.set("x-cache-tags", `order-${order.code}`)
    return response
  } catch (error: any) {
    console.error("Order by code API Error:", error?.errors?.[0] || error)
    return NextResponse.json(
      {
        error: "Failed to fetch order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}
