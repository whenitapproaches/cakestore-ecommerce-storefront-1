import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { HttpStatusCode } from "axios"
import { storefrontApiQuery, storefrontApiMutation, latestVendureAuthToken } from "graphql/client"
import { getContext } from "lib/getStatic"
import { ActiveOrderSelector, ShippingMethodsSelector } from "graphql/selectors"

export async function GET() {
  try {
    const ctx = getContext()
    const api = storefrontApiQuery(ctx.params)

    const { eligibleShippingMethods } = await api({
      eligibleShippingMethods: ShippingMethodsSelector,
    })

    const methods = (eligibleShippingMethods || []).map((m: any) => ({
      id: String(m.id),
      name: String(m.name),
      description: m?.description ?? null,
      price: Number(m?.price ?? 0),
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
      { error: "Failed to fetch eligible shipping methods", details: error instanceof Error ? error.message : "Unknown error" },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const shippingMethodIds: string[] = body?.shippingMethodIds || body?.shippingMethodId || []

    if (!Array.isArray(shippingMethodIds) || shippingMethodIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required field: shippingMethodIds" },
        { status: HttpStatusCode.BadRequest }
      )
    }

    const ctx = getContext()
    const api = storefrontApiMutation(ctx.params)

    const { setOrderShippingMethod } = await api({
      setOrderShippingMethod: [
        { shippingMethodId: shippingMethodIds },
        {
          __typename: true,
          "...on Order": ActiveOrderSelector,
          "...on OrderModificationError": { errorCode: true, message: true },
          "...on NoActiveOrderError": { errorCode: true, message: true },
          "...on IneligibleShippingMethodError": { errorCode: true, message: true },
        },
      ],
    })

    if (setOrderShippingMethod?.__typename === "Order") {
      const response = NextResponse.json({ success: true, order: setOrderShippingMethod })
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
    }

    return NextResponse.json(
      { error: "Failed to set order shipping method", details: setOrderShippingMethod },
      { status: HttpStatusCode.BadRequest }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to set order shipping method", details: error instanceof Error ? error.message : "Unknown error" },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}


