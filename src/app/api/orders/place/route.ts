import { NextRequest, NextResponse } from "next/server"
import { HttpStatusCode } from "axios"
import {
  storefrontApiMutation,
  storefrontApiQuery,
  VendureChain,
  VENDURE_HOST,
  scalars,
} from "graphql/client"
import { getContext } from "lib/getStatic"
import { ActiveOrderSelector, ShippingMethodsSelector } from "graphql/selectors"
import jwt from "jsonwebtoken"

type OrderTokenPayload = {
  orderCode: string
  iat: number
  exp: number
}

export async function POST(req: NextRequest) {
  try {
    const ctx = getContext()
    const body = await req.json()
    const { emailAddress, firstName, lastName, phoneNumber, shipping, turnstileToken } =
      body || {}

    if (!emailAddress || !firstName || !lastName || !phoneNumber || !shipping) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: HttpStatusCode.BadRequest }
      )
    }

    // Verify Turnstile
    if (!turnstileToken) {
      return NextResponse.json(
        { error: "CAPTCHA_REQUIRED" },
        { status: HttpStatusCode.BadRequest }
      )
    }

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
    if (!turnstileSecret) {
      return NextResponse.json(
        { error: "Captcha not configured" },
        { status: HttpStatusCode.InternalServerError }
      )
    }

    // Verify Turnstile token with Cloudflare
    const verifyForm = new URLSearchParams()
    verifyForm.append("secret", turnstileSecret)
    verifyForm.append("response", turnstileToken)
    verifyForm.append("remoteip", req.ip || "")

    const turnstileResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: verifyForm.toString(),
    })

    const turnstileData = await turnstileResponse.json()
    if (!turnstileData.success) {
      return NextResponse.json(
        { error: "CAPTCHA_FAILED", details: turnstileData["error-codes"] || [] },
        { status: HttpStatusCode.BadRequest }
      )
    }

    const q = storefrontApiQuery(ctx.params)
    const m = storefrontApiMutation(ctx.params)

    // Ensure we are allowed to proceed to arranging payment
    const { nextOrderStates } = await q({ nextOrderStates: true })

    console.log(nextOrderStates)

    if (
      !Array.isArray(nextOrderStates) ||
      !nextOrderStates.includes("ArrangingPayment")
    ) {
      return NextResponse.json(
        { error: "UNKNOWN_ERROR", nextOrderStates },
        { status: HttpStatusCode.BadRequest }
      )
    }

    // Set customer
    const { setCustomerForOrder } = await m({
      setCustomerForOrder: [
        { input: { emailAddress, firstName, lastName, phoneNumber } },
        {
          __typename: true,
          "...on Order": ActiveOrderSelector,
          "...on EmailAddressConflictError": { errorCode: true, message: true },
          "...on AlreadyLoggedInError": { errorCode: true, message: true },
          "...on NoActiveOrderError": { errorCode: true, message: true },
          "...on GuestCheckoutError": { errorCode: true, message: true },
        },
      ],
    })

    console.log(setCustomerForOrder)

    if (setCustomerForOrder.__typename !== "Order") {
      return NextResponse.json(
        { error: `${setCustomerForOrder.__typename?.toUpperCase()}` },
        { status: HttpStatusCode.BadRequest }
      )
    }

    // Set addresses (billing same as shipping)
    const shippingInput = {
      fullName: `${firstName} ${lastName}`.trim(),
      phoneNumber,
      company: "",
      streetLine1: `${String(shipping?.address1 || "")}, ${String(shipping?.ward?.name || "")}`,
      streetLine2: "",
      city: String(shipping?.district?.name || ""),
      province: String(shipping?.province?.name || ""),
      postalCode: "",
      countryCode: "VN",
    }

    const [sa, ba] = await Promise.all([
      m({
        setOrderShippingAddress: [
          { input: shippingInput },
          {
            __typename: true,
            "...on Order": ActiveOrderSelector,
            "...on NoActiveOrderError": { errorCode: true, message: true },
          },
        ],
      }),
      m({
        setOrderBillingAddress: [
          { input: shippingInput },
          {
            __typename: true,
            "...on Order": ActiveOrderSelector,
            "...on NoActiveOrderError": { errorCode: true, message: true },
          },
        ],
      }),
    ])
    console.log(sa, ba)
    if (sa.setOrderShippingAddress.__typename !== "Order") {
      return NextResponse.json(
        { error: `${sa.setOrderShippingAddress.__typename?.toUpperCase()}` },
        { status: HttpStatusCode.BadRequest }
      )
    }
    if (ba.setOrderBillingAddress.__typename !== "Order") {
      return NextResponse.json(
        { error: `${ba.setOrderBillingAddress.__typename?.toUpperCase()}` },
        { status: HttpStatusCode.BadRequest }
      )
    }

    // Set shipping method (get the first available shipping method)
    const { eligibleShippingMethods } = await q({
      eligibleShippingMethods: ShippingMethodsSelector,
    })

    if (!eligibleShippingMethods || eligibleShippingMethods.length === 0) {
      return NextResponse.json(
        { error: "NO_SHIPPING_METHODS_AVAILABLE" },
        { status: HttpStatusCode.BadRequest }
      )
    }

    // Use the first available shipping method
    const shippingMethodId = eligibleShippingMethods[0].id

    const { setOrderShippingMethod } = await m({
      setOrderShippingMethod: [
        { shippingMethodId: [shippingMethodId] },
        {
          __typename: true,
          "...on Order": ActiveOrderSelector,
          "...on OrderModificationError": { errorCode: true, message: true },
          "...on NoActiveOrderError": { errorCode: true, message: true },
          "...on IneligibleShippingMethodError": { errorCode: true, message: true },
        },
      ],
    })

    console.log(setOrderShippingMethod)

    if (setOrderShippingMethod.__typename !== "Order") {
      return NextResponse.json(
        { error: `SHIPPING_METHOD_ERROR_${setOrderShippingMethod.__typename?.toUpperCase()}` },
        { status: HttpStatusCode.BadRequest }
      )
    }

    // Transition to ArrangingPayment
    // Use special header for state transition
    const HOST = `${VENDURE_HOST}?languageCode=${ctx.params.locale}`
    const transitionMutation = VendureChain(HOST, {
      headers: {
        "Content-Type": "application/json",
        "vendure-token": ctx.params.channel,
        ...(process.env.ORDER_SECRET_TOKEN
          ? { "x-order-secret": process.env.ORDER_SECRET_TOKEN as string }
          : {}),
      },
    })("mutation", { scalars })

    const { transitionOrderToState } = await transitionMutation({
      transitionOrderToState: [
        { state: "ArrangingPayment" },
        {
          __typename: true,
          "...on OrderStateTransitionError": { errorCode: true, message: true },
          "...on Order": ActiveOrderSelector,
        },
      ],
    })

    console.log(transitionOrderToState)

    if (transitionOrderToState.__typename !== "Order") {
      return NextResponse.json(
        { error: "ORDER_STATE_TRANSITION_ERROR" },
        { status: HttpStatusCode.BadRequest }
      )
    }

    // Generate JWT token and redirect URL similar to tracking route
    const origin = req.headers.get("x-url-origin") || req.headers.get("origin") || ""
    
    const jwtSecret = process.env.ORDER_REDIRECT_SECRET
    if (!jwtSecret) {
      return NextResponse.json(
        { error: "Order redirect not configured" },
        { status: HttpStatusCode.InternalServerError }
      )
    }

    // Create JWT payload with order code
    const orderCode = transitionOrderToState.code
    const jwtPayload: OrderTokenPayload = {
      orderCode,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    }

    const jwtToken = jwt.sign(jwtPayload, jwtSecret, { algorithm: "HS256" })

    const url = new URL(`${origin}/orders/code/${encodeURIComponent(orderCode)}`)
    url.searchParams.set("token", jwtToken)

    return NextResponse.json(
      { 
        success: true, 
        order: transitionOrderToState,
        redirectUrl: url.toString()
      },
      { status: HttpStatusCode.Ok }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to place order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}
