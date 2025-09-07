import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { HttpStatusCode } from "axios"
import { storefrontApiQuery, storefrontApiMutation, latestVendureAuthToken } from "graphql/client"
import { getContext } from "lib/getStatic"
import { ActiveOrderSelector, AvailablePaymentMethodsSelector } from "graphql/selectors"

export async function GET() {
  try {
    const ctx = getContext()
    const api = storefrontApiQuery(ctx.params)

    const { eligiblePaymentMethods } = await api({
      eligiblePaymentMethods: AvailablePaymentMethodsSelector,
    })

    const methods = (eligiblePaymentMethods || []).map((m: any) => ({
      id: String(m.id),
      name: String(m.name),
      code: String(m.code),
      description: m?.description ?? null,
      isEligible: Boolean(m?.isEligible ?? true),
    }))

    const response = NextResponse.json({ methods })
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    const vendureAuthToken = latestVendureAuthToken || cookies().get("vendure-auth-token")?.value
    if (vendureAuthToken) {
      response.cookies.set("vendure-auth-token", vendureAuthToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      })
    }

    return response
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch eligible payment methods", details: error instanceof Error ? error.message : "Unknown error" },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}
