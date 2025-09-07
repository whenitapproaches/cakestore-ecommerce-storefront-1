import { NextRequest, NextResponse } from "next/server"
import { storefrontApiQuery } from "graphql/client"
import { getContext } from "lib/getStatic"
import { SortOrder } from "zeus"
import { ProductSearchResultSelector } from "graphql/selectors"
import { HttpStatusCode } from "axios"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const ctx = getContext()
    const { searchParams } = new URL(req.url)

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const sortBy = searchParams.get("sortBy") || "date"
    const search = searchParams.get("search") || ""

    // Parse filters
    const brand = searchParams.get("brand")?.split(",") || []
    const color = searchParams.get("color")?.split(",") || []
    const sales = searchParams.get("sales")?.split(",") || []
    const priceParam = searchParams.get("price")
    const priceParts = priceParam
      ? priceParam.split(",").map((p) => parseFloat(p))
      : []
    const rating = parseInt(searchParams.get("rating") || "0")

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // // Determine sort order
    // let sortOrder: any = { createdAt: SortOrder.DESC } // default for 'date'
    // if (sortBy === 'asc') {
    //   sortOrder = { price: SortOrder.ASC }
    // } else if (sortBy === 'desc') {
    //   sortOrder = { price: SortOrder.DESC }
    // }

    const api = storefrontApiQuery(ctx.params)

    // Build the search input
    const searchInput: any = {
      take: limit,
      skip: skip,
      // sort: sortOrder,
    }

    // Add search term if provided
    if (search) {
      searchInput.term = search
    }

    // Add filters if provided
    const filters: any = {}
    if (brand.length > 0) filters.brand = brand
    if (color.length > 0) filters.color = color
    if (sales.length > 0) filters.sales = sales
    // Map price to CustomSearchInput fields
    if (priceParts.length === 2) {
      searchInput.priceMin = priceParts[0] * Math.pow(10, 2)
      searchInput.priceMax = priceParts[1] * Math.pow(10, 2)
    } else if (priceParts.length === 1) {
      searchInput.priceMin = priceParts[0] * Math.pow(10, 2)
    }
    if (rating > 0) filters.rating = rating

    if (Object.keys(filters).length > 0) {
      searchInput.filters = filters
    }

    const products = await api({
      customSearch: [
        {
          input: {
            ...searchInput,
            sort: {
              ...(sortBy === "date"
                ? { createdAt: SortOrder.DESC }
                : {
                    price:
                      sortBy === "price-asc" ? SortOrder.ASC : SortOrder.DESC,
                  }),
            },
          },
        },
        { items: ProductSearchResultSelector, totalItems: true },
      ],
    })

    const response = NextResponse.json({
      items: products.customSearch.items,
      total: products.customSearch.totalItems,
      page,
      limit,
      totalPages: Math.ceil(products.customSearch.totalItems / limit),
    })

    // Set cache headers for products API
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600') // 5 minutes cache, 10 minutes stale-while-revalidate
    response.headers.set('ETag', `products-${Date.now()}`) // Simple ETag for cache validation
    
    // Add cache tags for better invalidation
    response.headers.set('x-cache-tags', 'products,product-list')

    return response
  } catch (error) {
    console.error("API Error:", error.errors[0])
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}
