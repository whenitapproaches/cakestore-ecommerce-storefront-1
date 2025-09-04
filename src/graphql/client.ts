import {
  GraphQLError,
  GraphQLResponse,
  Thunder,
  ZeusScalars,
  chainOptions,
  fetchOptions,
} from "zeus"
import { GetServerSidePropsContext } from "next"
import { getContext } from "lib/getStatic"

let token: string | null =
  typeof window !== "undefined" ? window.localStorage.getItem("token") : null

// Expose last vendure auth token observed during this request lifecycle
export let latestVendureAuthToken: string | null = null

export const scalars = ZeusScalars({
  Money: {
    decode: (e) => e as number,
  },
  JSON: {
    encode: (e: unknown) => JSON.stringify(JSON.stringify(e)),
    decode: (e: unknown) => JSON.parse(e as string),
  },
  DateTime: {
    decode: (e: unknown) => new Date(e as string).toISOString(),
    encode: (e: unknown) => (e as Date).toISOString(),
  },
})

export const VENDURE_HOST = process.env.NEXT_PUBLIC_VENDURE_HOST || process.env.VENDURE_HOST

const apiFetchVendure =
  (options: fetchOptions) =>
  (query: string, variables: Record<string, unknown> = {}) => {
    const baseFetchOptions = options[1] || {}

    if (query.includes('sort: {')) {
      query = query.replace('"DESC"', 'DESC').replace('"ASC"', 'ASC')
    }

    // TODO: turn this off
    console.log(query)

    const buildAuthHeaders = async (): Promise<Record<string, string>> => {
      // Prefer token from incoming headers or request cookies on the server; avoid module state on server
      if (typeof window === "undefined") {
        try {
          const mod = await import("next/headers")
          const h = mod.headers()
          const incomingAuth = h.get("authorization")
          if (incomingAuth) {
            return { Authorization: incomingAuth }
          }
          const cookieToken = mod.cookies().get("vendure-auth-token")?.value
          if (cookieToken) {
            return { Authorization: `Bearer ${cookieToken}` }
          }
          return {}
        } catch (_) {
          return {}
        }
      }
      // On client, fall back to in-memory/localStorage token
      return token ? { Authorization: `Bearer ${token}` } : {}
    }

    const persistAuthToken = async (authToken: string | null) => {
      if (!authToken) return
      // Persist for subsequent requests
      if (typeof window !== "undefined") {
        token = authToken
      }
      latestVendureAuthToken = authToken
      if (typeof window === "undefined") {
        try {
          const mod = await import("next/headers")
          // httpOnly cookie so browser JS can't read it; used by server routes
          mod
            .cookies()
            .set("vendure-auth-token", authToken, {
              httpOnly: true,
              sameSite: "lax",
              path: "/",
              secure: process.env.NODE_ENV === "production",
            })
        } catch (_) {
          // ignore if cookies API unavailable
        }
      } else {
        try {
          window.localStorage.setItem("token", authToken)
        } catch (_) {
          // ignore storage failures
        }
      }
    }

    const doRequest = async () => {
      const method = (baseFetchOptions as RequestInit).method || "POST"
      const authHeaders = await buildAuthHeaders()

      const baseHeadersInit = (baseFetchOptions as RequestInit).headers
      // Normalize headers into a plain object to merge safely
      const baseHeaders = (() => {
        if (!baseHeadersInit) return {}
        if (baseHeadersInit instanceof Headers) {
          return Object.fromEntries(baseHeadersInit.entries()) as Record<string, string>
        }
        if (Array.isArray(baseHeadersInit)) {
          return Object.fromEntries(baseHeadersInit) as Record<string, string>
        }
        return baseHeadersInit as Record<string, string>
      })()

      const mergedHeaders: Record<string, string> = {
        ...baseHeaders,
        "Content-Type": "application/json",
        ...authHeaders,
      }

      if (method === "GET") {
        const r = await fetch(
          `${options[0]}?query=${encodeURIComponent(query)}`,
          { ...(baseFetchOptions as RequestInit), headers: mergedHeaders, credentials: "include" }
        )
        await persistAuthToken(r.headers.get("vendure-auth-token"))
        const response = await handleFetchResponse(r)
        if (response.errors) {
          throw new GraphQLError(response)
        }
        return response.data
      }

      const r = await fetch(`${options[0]}`, {
        ...(baseFetchOptions as RequestInit),
        body: JSON.stringify({ query, variables }),
        method: "POST",
        credentials: "include",
        headers: mergedHeaders,
      })
      await persistAuthToken(r.headers.get("vendure-auth-token"))
      const response = await handleFetchResponse(r)
      if (response.errors) {
        throw new GraphQLError(response)
      }
      return response.data
    }

    return doRequest()
  }

export const VendureChain = (...options: chainOptions) =>
  Thunder(apiFetchVendure(options))

export const storefrontApiQuery = (ctx: {
  locale: string
  channel: string
}) => {
  const HOST = `${VENDURE_HOST}?languageCode=${ctx.locale}`

  return VendureChain(HOST, {
    headers: {
      "Content-Type": "application/json",
      "vendure-token": ctx.channel,
      // ensure Authorization attached on server too (cookies() already handled in apiFetchVendure)
    },
  })("query", { scalars })
}

export const storefrontApiMutation = (ctx: {
  locale: string
  channel: string
}) => {
  const HOST = `${VENDURE_HOST}?languageCode=${ctx.locale}`

  return VendureChain(HOST, {
    headers: {
      "Content-Type": "application/json",
      "vendure-token": ctx.channel,
      // ensure Authorization attached on server too (cookies() already handled in apiFetchVendure)
    },
  })("mutation", { scalars })
}

export const SSGQuery = (params: { locale: string; channel: string }) => {
  const reqParams = {
    locale: params?.locale as string,
    channel: params?.channel as string,
  }

  const HOST = `${VENDURE_HOST}?languageCode=${reqParams.locale}`
  return VendureChain(HOST, {
    headers: {
      "Content-Type": "application/json",
      "vendure-token": reqParams.channel,
    },
  })("query", { scalars })
}

export const SSRQuery = (context: GetServerSidePropsContext) => {
  const authCookies = {
    session: context.req.cookies["session"],
    "session.sig": context.req.cookies["session.sig"],
  }

  const ctx = getContext(context)
  const properChannel = ctx?.params?.channel as string
  const locale = ctx?.params?.locale as string

  const HOST = `${VENDURE_HOST}?languageCode=${locale}`
  return VendureChain(HOST, {
    headers: {
      Cookie: `session=${authCookies["session"]}; session.sig=${authCookies["session.sig"]}`,
      "Content-Type": "application/json",
      "vendure-token": properChannel,
      ...(context.req.cookies["vendure-auth-token"]
        ? { Authorization: `Bearer ${context.req.cookies["vendure-auth-token"]}` }
        : {}),
    },
  })("query", { scalars })
}

export const SSRMutation = (context: GetServerSidePropsContext) => {
  const authCookies = {
    session: context.req.cookies["session"],
    "session.sig": context.req.cookies["session.sig"],
  }

  const ctx = getContext(context)
  const properChannel = ctx?.params?.channel as string
  const locale = ctx?.params?.locale as string

  const HOST = `${VENDURE_HOST}?languageCode=${locale}`
  return VendureChain(HOST, {
    headers: {
      Cookie: `session=${authCookies["session"]}; session.sig=${authCookies["session.sig"]}`,
      "Content-Type": "application/json",
      "vendure-token": properChannel,
      ...(context.req.cookies["vendure-auth-token"]
        ? { Authorization: `Bearer ${context.req.cookies["vendure-auth-token"]}` }
        : {}),
    },
  })("mutation", { scalars })
}

const handleFetchResponse = (response: Response): Promise<GraphQLResponse> => {
  if (!response.ok) {
    return new Promise((_, reject) => {
      response
        .text()
        .then((text) => {
          try {
            reject(JSON.parse(text))
          } catch (err) {
            reject(text)
          }
        })
        .catch(reject)
    })
  }
  return response.json() as Promise<GraphQLResponse>
}
