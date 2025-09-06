import { NextRequest, NextResponse } from "next/server"
import { HttpStatusCode } from "axios"
import jwt from "jsonwebtoken"

// Cloudflare Turnstile verify endpoint
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify"

type VerifyResponse = {
  success: boolean
  "error-codes"?: string[]
}

type OrderTokenPayload = {
  orderCode: string
  iat: number
  exp: number
}

export async function POST(req: NextRequest) {
  try {
    const { code, token: captchaToken } = await req.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Missing order code" },
        { status: HttpStatusCode.BadRequest }
      )
    }

    if (!captchaToken || typeof captchaToken !== "string") {
      return NextResponse.json(
        { error: "Missing captcha token" },
        { status: HttpStatusCode.BadRequest }
      )
    }

    const secret = process.env.TURNSTILE_SECRET_KEY
    if (!secret) {
      return NextResponse.json(
        { error: "Captcha not configured" },
        { status: HttpStatusCode.InternalServerError }
      )
    }

    // Verify captcha server-side
    const verifyForm = new URLSearchParams()
    verifyForm.append("secret", secret)
    verifyForm.append("response", captchaToken)
    verifyForm.append("remoteip", req.ip ?? "")

    const verifyRes = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verifyForm.toString(),
    })
    const verifyJson = (await verifyRes.json()) as VerifyResponse

    if (!verifyJson.success) {
      return NextResponse.json(
        { error: "Captcha failed", details: verifyJson["error-codes"] || [] },
        { status: HttpStatusCode.Forbidden }
      )
    }

    // If captcha passed, create a JWT token and redirect to /orders/[code]
    const origin =
      req.headers.get("x-url-origin") || req.headers.get("origin") || ""

    const jwtSecret = process.env.ORDER_REDIRECT_SECRET
    if (!jwtSecret) {
      return NextResponse.json(
        { error: "Order redirect not configured" },
        { status: HttpStatusCode.InternalServerError }
      )
    }

    // Create JWT payload with order code
    const jwtPayload: OrderTokenPayload = {
      orderCode: code,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    }

    const jwtToken = jwt.sign(jwtPayload, jwtSecret, { algorithm: "HS256" })

    const url = new URL(`${origin}/orders/code/${encodeURIComponent(code)}`)
    url.searchParams.set("token", jwtToken)

    // If the request expects HTML, redirect; otherwise return JSON for fetch()
    const accept = req.headers.get("accept") || ""
    if (accept.includes("text/html")) {
      return NextResponse.redirect(url.toString(), { status: 303 })
    }
    return NextResponse.json(
      { url: url.toString() },
      { status: HttpStatusCode.Ok }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to verify order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}
