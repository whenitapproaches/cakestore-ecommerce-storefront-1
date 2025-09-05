import { NextRequest, NextResponse } from "next/server"
import { storefrontApiQuery } from "graphql/client"
import { getContext } from "lib/getStatic"
import { OrderMaskedSelector, StoreSettingsSelector } from "graphql/selectors"
import { HttpStatusCode } from "axios"
import crypto from "crypto"

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    // Verify token query parameter
    const token = req.nextUrl.searchParams.get("token")
    const redirectSecret = process.env.ORDER_REDIRECT_SECRET
    if (!token || !redirectSecret) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: HttpStatusCode.Unauthorized }
      )
    }

    const [codePart, expPart, sig] = token.split(".")
    if (!codePart || !expPart || !sig) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: HttpStatusCode.Unauthorized }
      )
    }
    const exp = parseInt(expPart, 10)
    if (!Number.isFinite(exp) || Math.floor(Date.now() / 1000) > exp) {
      return NextResponse.json(
        { error: "Token expired" },
        { status: HttpStatusCode.Unauthorized }
      )
    }
    const payload = `${codePart}.${expPart}`
    const expectedSig = crypto
      .createHmac("sha256", redirectSecret)
      .update(payload)
      .digest("hex")

    // Constant-time compare without relying on Node types
    const a = Uint8Array.from(Buffer.from(sig, "hex"))
    const b = Uint8Array.from(Buffer.from(expectedSig, "hex"))
    if (a.length !== b.length) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: HttpStatusCode.Unauthorized }
      )
    }
    let diff = 0
    for (let i = 0; i < a.length; i++) {
      diff |= a[i] ^ b[i]
    }
    if (diff !== 0) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: HttpStatusCode.Unauthorized }
      )
    }

    const ctx = getContext()
    const api = storefrontApiQuery(ctx.params)

    const code = params.code
    if (code !== codePart) {
      return NextResponse.json(
        { error: "Invalid token for code" },
        { status: HttpStatusCode.Unauthorized }
      )
    }

    // Fetch masked order by code
    const data = await (api as any)({
      orderByCodeMasked: [{ code }, OrderMaskedSelector as any],
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
      ? order.payments.some((p: any) => (p?.state || "").toLowerCase() === "settled")
      : false

    let qrImageUrl: string | null = null
    let qrImageUrl2: string | null = null

    if (!isPaid) {
      // Fetch store settings for QR base URLs
      const settingsData = await api({
        storeSettings: [
          { keys: ["banking-qr", "banking-qr-2"] },
          { items: StoreSettingsSelector, totalItems: true },
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
          u.searchParams.set("amount", String(order.totalWithTax))
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

