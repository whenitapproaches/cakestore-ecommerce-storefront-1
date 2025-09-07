import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { storefrontApiMutation, storefrontApiQuery, latestVendureAuthToken } from "graphql/client"
import { getContext } from "lib/getStatic"
import { ActiveOrderSelector } from "graphql/selectors"
import { HttpStatusCode } from "axios"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const ctx = getContext()
    const api = storefrontApiQuery(ctx.params)

    const result = await api({
      activeOrder: ActiveOrderSelector,
    })

    const response = NextResponse.json({
      cart: result.activeOrder,
    })

    // Ensure cart API is never cached
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    const vendureAuthToken = latestVendureAuthToken || cookies().get('vendure-auth-token')?.value
    if (vendureAuthToken) {
      response.cookies.set('vendure-auth-token', vendureAuthToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      })
    }

    return response
  } catch (error) {
    console.error("Cart API Error:", error)
    
    return NextResponse.json(
      {
        error: "Failed to fetch cart",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productVariantId, quantity } = body

    if (!productVariantId || !quantity) {
      return NextResponse.json(
        {
          error: "Missing required fields: productVariantId, quantity",
        },
        { status: HttpStatusCode.BadRequest }
      )
    }

    const ctx = getContext()
    const api = storefrontApiMutation(ctx.params)

    const result = await api({
      addItemToOrder: [
        { productVariantId, quantity },
        {
          __typename: true,
          '...on Order': ActiveOrderSelector,
          '...on OrderLimitError': {
            errorCode: true,
            message: true,
          },
          '...on InsufficientStockError': {
            errorCode: true,
            message: true,
          },
          '...on NegativeQuantityError': {
            errorCode: true,
            message: true,
          },
          '...on OrderModificationError': {
            errorCode: true,
            message: true,
          },
        },
      ],
    })

    if (result.addItemToOrder.__typename === 'Order') {
      const response = NextResponse.json({
        success: true,
        cart: result.addItemToOrder,
      })

      // Ensure cart API is never cached
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')

      const vendureAuthToken = latestVendureAuthToken || cookies().get('vendure-auth-token')?.value
      if (vendureAuthToken) {
        response.cookies.set('vendure-auth-token', vendureAuthToken, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
        })
      }

      return response
    } else {
      return NextResponse.json(
        {
          error: "Failed to add item to cart",
          details: result.addItemToOrder,
        },
        { status: HttpStatusCode.BadRequest }
      )
    }
  } catch (error) {
    console.error("Cart API Error:", error)
    
    return NextResponse.json(
      {
        error: "Failed to add item to cart",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderLineId, quantity } = body

    if (!orderLineId || quantity === undefined) {
      return NextResponse.json(
        {
          error: "Missing required fields: orderLineId, quantity",
        },
        { status: HttpStatusCode.BadRequest }
      )
    }

    const ctx = getContext()
    const api = storefrontApiMutation(ctx.params)

    const result = await api({
      adjustOrderLine: [
        { orderLineId, quantity },
        {
          __typename: true,
          '...on Order': ActiveOrderSelector,
          '...on OrderLimitError': {
            errorCode: true,
            message: true,
          },
          '...on InsufficientStockError': {
            errorCode: true,
            message: true,
          },
          '...on NegativeQuantityError': {
            errorCode: true,
            message: true,
          },
          '...on OrderModificationError': {
            errorCode: true,
            message: true,
          },
        },
      ],
    })

    if (result.adjustOrderLine.__typename === 'Order') {
      const response = NextResponse.json({
        success: true,
        cart: result.adjustOrderLine,
      })

      // Ensure cart API is never cached
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')

      const vendureAuthToken = latestVendureAuthToken || cookies().get('vendure-auth-token')?.value
      if (vendureAuthToken) {
        response.cookies.set('vendure-auth-token', vendureAuthToken, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
        })
      }

      return response
    } else {
      return NextResponse.json(
        {
          error: "Failed to update cart item",
          details: result.adjustOrderLine,
        },
        { status: HttpStatusCode.BadRequest }
      )
    }
  } catch (error) {
    console.error("Cart API Error:", error)
    
    return NextResponse.json(
      {
        error: "Failed to update cart item",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderLineId = searchParams.get('orderLineId')

    if (!orderLineId) {
      return NextResponse.json(
        {
          error: "Missing required parameter: orderLineId",
        },
        { status: HttpStatusCode.BadRequest }
      )
    }

    const ctx = getContext()
    const api = storefrontApiMutation(ctx.params)

    const result = await api({
      removeOrderLine: [
        { orderLineId },
        {
          __typename: true,
          '...on Order': ActiveOrderSelector,
          '...on OrderModificationError': {
            errorCode: true,
            message: true,
          },
        },
      ],
    })

    if (result.removeOrderLine.__typename === 'Order') {
      const response = NextResponse.json({
        success: true,
        cart: result.removeOrderLine,
      })

      // Ensure cart API is never cached
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')

      const vendureAuthToken = latestVendureAuthToken || cookies().get('vendure-auth-token')?.value
      if (vendureAuthToken) {
        response.cookies.set('vendure-auth-token', vendureAuthToken, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
        })
      }

      return response
    } else {
      return NextResponse.json(
        {
          error: "Failed to remove cart item",
          details: result.removeOrderLine,
        },
        { status: HttpStatusCode.BadRequest }
      )
    }
  } catch (error) {
    console.error("Cart API Error:", error)
    
    return NextResponse.json(
      {
        error: "Failed to remove cart item",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}
