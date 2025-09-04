import { NextRequest, NextResponse } from "next/server"
import { storefrontApiQuery } from "graphql/client"
import { getContext } from "lib/getStatic"
import { StoreSettingsSelector } from "graphql/selectors"
import { HttpStatusCode } from "axios"

export async function GET(req: NextRequest) {
  try {
    const ctx = getContext()
    const { searchParams } = new URL(req.url)

    // support comma or pipe separated keys, default to price-filter
    const keysParam = searchParams.get("keys")?.split(",") || ["price-filter"]

    const api = storefrontApiQuery(ctx.params)

    const data = await api({
      storeSettings: [{ keys: keysParam }, StoreSettingsSelector],
    })

    const response = NextResponse.json({
      items: data.storeSettings,
    })

    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    )
    response.headers.set("ETag", `store-settings-${Date.now()}`)
    response.headers.set("x-cache-tags", "store-settings")

    return response
  } catch (error: any) {
    console.error("Store settings API Error:", error?.errors?.[0] || error)
    return NextResponse.json(
      {
        error: "Failed to fetch store settings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}
