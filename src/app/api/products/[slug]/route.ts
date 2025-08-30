import { NextRequest, NextResponse } from "next/server"
import { storefrontApiQuery } from "graphql/client"
import { getContext } from "lib/getStatic"
import { ProductDetailSelector } from "graphql/selectors"
import { HttpStatusCode } from "axios"

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Validate slug parameter
    if (!params.slug || typeof params.slug !== 'string') {
      return NextResponse.json(
        {
          error: "Invalid product slug",
        },
        { status: HttpStatusCode.BadRequest }
      )
    }

    const ctx = getContext()
    const api = storefrontApiQuery(ctx.params)

    const result = await api({
      product: [
        { slug: params.slug },
        ProductDetailSelector,
      ],
    })

    // Check if the query was successful and product exists
    if (!result.product) {
      return NextResponse.json(
        {
          error: "Product not found",
          slug: params.slug,
        },
        { status: HttpStatusCode.NotFound }
      )
    }

    return NextResponse.json({
      product: result.product,
    })
  } catch (error) {
    console.error("API Error:", error)
    
    // Handle GraphQL errors specifically
    if (error && typeof error === 'object' && 'errors' in error) {
      const graphqlError = error as { errors: any[] }
      return NextResponse.json(
        {
          error: "GraphQL query failed",
          details: graphqlError.errors[0]?.message || "Unknown GraphQL error",
        },
        { status: HttpStatusCode.BadRequest }
      )
    }
    
    return NextResponse.json(
      {
        error: "Failed to fetch product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}
