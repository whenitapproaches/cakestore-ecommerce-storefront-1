import { NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { HttpStatusCode } from "axios"

// Secret key for admin authentication
const ADMIN_SECRET = process.env.ADMIN_SECRET || "your-secret-key-here"

export async function POST(req: NextRequest) {
  try {
    // Verify admin secret
    const authHeader = req.headers.get("authorization")
    if (!authHeader || authHeader !== `Bearer ${ADMIN_SECRET}`) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Invalid admin secret",
        },
        { status: HttpStatusCode.Unauthorized }
      )
    }

    const body = await req.json()
    const { paths, tags } = body

    const revalidatedPaths: string[] = Array.isArray(paths) ? paths : []
    const revalidatedTags: string[] = Array.isArray(tags) ? tags : []

    // Validate that at least one path or tag is provided
    if (revalidatedPaths.length === 0 && revalidatedTags.length === 0) {
      return NextResponse.json(
        {
          error: "No paths or tags provided",
          message: "Please provide at least one path or tag to invalidate",
        },
        { status: HttpStatusCode.BadRequest }
      )
    }

    // Perform revalidation
    for (const path of revalidatedPaths) {
      try {
        revalidatePath(path)
      } catch (error) {
        console.error(`Failed to revalidate path: ${path}`, error)
      }
    }

    for (const tag of revalidatedTags) {
      try {
        revalidateTag(tag)
      } catch (error) {
        console.error(`Failed to revalidate tag: ${tag}`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cache invalidated successfully",
      revalidatedPaths,
      revalidatedTags,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cache invalidation error:", error)

    return NextResponse.json(
      {
        error: "Failed to invalidate cache",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}

// GET method to check cache status
export async function GET(req: NextRequest) {
  try {
    // Verify admin secret
    const authHeader = req.headers.get("authorization")
    if (!authHeader || authHeader !== `Bearer ${ADMIN_SECRET}`) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Invalid admin secret",
        },
        { status: HttpStatusCode.Unauthorized }
      )
    }

    return NextResponse.json({
      status: "Cache invalidation service is running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    console.error("Cache status check error:", error)

    return NextResponse.json(
      {
        error: "Failed to check cache status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}
