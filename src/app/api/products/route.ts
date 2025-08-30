import { NextRequest, NextResponse } from "next/server"
import { storefrontApiQuery } from "graphql/client"
import { getContext } from "lib/getStatic"
import { SortOrder } from "zeus"
import { ProductSearchResultSelector } from "graphql/selectors"
import { HttpStatusCode } from "axios"

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
    const priceRange = searchParams
      .get("price")
      ?.split(",")
      .map((p) => parseFloat(p)) || [0, 300]
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
      searchInput.search = search
    }

    // Add filters if provided
    const filters: any = {}
    if (brand.length > 0) filters.brand = brand
    if (color.length > 0) filters.color = color
    if (sales.length > 0) filters.sales = sales
    if (priceRange[0] > 0 || priceRange[1] < 300) {
      filters.priceRange = { min: priceRange[0], max: priceRange[1] }
    }
    if (rating > 0) filters.rating = rating

    if (Object.keys(filters).length > 0) {
      searchInput.filters = filters
    }

    console.log(sortBy)

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

    console.log(products.customSearch)

    return NextResponse.json({
      items: products.customSearch.items,
      total: products.customSearch.totalItems,
      page,
      limit,
      totalPages: Math.ceil(products.customSearch.totalItems / limit),
    })
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
