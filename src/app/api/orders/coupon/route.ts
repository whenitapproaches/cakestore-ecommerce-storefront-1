import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { HttpStatusCode } from "axios"
import { storefrontApiMutation, latestVendureAuthToken } from "graphql/client"
import { getContext } from "lib/getStatic"
import { ActiveOrderSelector } from "graphql/selectors"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const code: string | undefined = body?.code
    if (!code) {
      return NextResponse.json(
        { error: "Missing required field: code" },
        { status: HttpStatusCode.BadRequest }
      )
    }

    const ctx = getContext()
    const api = storefrontApiMutation(ctx.params)

    const { applyCouponCode } = await api({
      applyCouponCode: [
        { couponCode: code },
        {
          __typename: true,
          "...on Order": ActiveOrderSelector,
          "...on CouponCodeExpiredError": { errorCode: true, message: true },
          "...on CouponCodeInvalidError": { errorCode: true, message: true },
          "...on CouponCodeLimitError": { errorCode: true, message: true },
        },
      ],
    })

    if (applyCouponCode?.__typename === "Order") {
      const response = NextResponse.json({ success: true, order: applyCouponCode })
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
      { success: false, details: applyCouponCode },
      { status: HttpStatusCode.BadRequest }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to apply coupon", details: error instanceof Error ? error.message : "Unknown error" },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    if (!code) {
      return NextResponse.json(
        { error: "Missing required parameter: code" },
        { status: HttpStatusCode.BadRequest }
      )
    }

    const ctx = getContext()
    const api = storefrontApiMutation(ctx.params)

    const { removeCouponCode } = await api({
      removeCouponCode: [{ couponCode: code }, ActiveOrderSelector],
    })

    const response = NextResponse.json({ success: true, order: removeCouponCode })
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
      { error: "Failed to remove coupon", details: error instanceof Error ? error.message : "Unknown error" },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}


