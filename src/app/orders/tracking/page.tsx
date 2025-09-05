"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Script from "next/script"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import BazaarCard from "components/BazaarCard"
import BazaarTextField from "components/BazaarTextField"
import { H2, Paragraph } from "components/Typography"
import SectionHeader from "components/section-header/section-header"
import { useTranslation } from "react-i18next"
import { Container, TextField } from "@mui/material"

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""

export default function OrderTrackingPage() {
  const { t } = useTranslation()
  const [code, setCode] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | {
    valid: boolean
    data?: any
    error?: string
  }>(null)

  const disabled = useMemo(
    () => !code.trim() || !token || loading,
    [code, token, loading]
  )

  const handleVerify = useCallback(async () => {
    try {
      setLoading(true)
      setResult(null)
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), token }),
      })
      // If server redirected, follow it
      if (res.redirected && res.url) {
        window.location.href = res.url
        return
      }
      // Otherwise expect JSON { url } or error
      const contentType = res.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        const json = await res.json()
        if (!res.ok || json?.error) {
          setResult({ valid: false, error: json?.error || t("Order tracking failed") })
          return
        }
        if (json?.url) {
          window.location.href = json.url
          return
        }
        setResult(json)
      } else {
        setResult({ valid: false, error: t("Unexpected response") })
      }
    } catch (e: any) {
      setResult({ valid: false, error: e?.message || t("Unknown error") })
    } finally {
      setLoading(false)
      try {
        // @ts-ignore
        if (window.turnstile && document?.getElementById("cf-turnstile")) {
          // @ts-ignore
          window.turnstile.reset()
        }
      } catch {}
    }
  }, [code, token, t])

  const hasRenderedRef = useRef(false)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retriesRef = useRef(0)

  const renderTurnstile = useCallback(() => {
    try {
      const container = document.getElementById("cf-turnstile")
      if (!container) return

      // If Turnstile script not ready yet, retry shortly
      // @ts-ignore
      if (!window.turnstile) {
        if (retriesRef.current < 20) {
          retriesRef.current += 1
          retryTimerRef.current = setTimeout(renderTurnstile, 200)
        }
        return
      }

      if (hasRenderedRef.current && container.childElementCount > 0) return

      // Clear any previous children before rendering afresh
      try {
        while (container.firstChild) container.removeChild(container.firstChild)
      } catch {}

      // @ts-ignore
      window.turnstile.render("#cf-turnstile", {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (t: string) => setToken(t),
        "error-callback": () => setToken(null),
        "expired-callback": () => setToken(null),
      })
      hasRenderedRef.current = true
    } catch {}
  }, [])

  useEffect(() => {
    // Attempt to render on mount in case the script is already present from a previous page
    renderTurnstile()
    // Expose global onload callback used by the script tag
    ;(window as any).cfTurnstileOnload = () => {
      retriesRef.current = 0
      renderTurnstile()
    }
    return () => {
      hasRenderedRef.current = false
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    }
  }, [renderTurnstile])

  return (
    <div className="bg-white pt-2 pb-4">
      <Container>
        <Box className="container" sx={{ py: 3, maxWidth: 720 }}>
          <SectionHeader title={t("Track your order")} />
          <BazaarCard sx={{ p: 3 }}>
            <Paragraph mb={2}>
              {t("Enter your order code to check its status.")}
            </Paragraph>

            <Box display="flex" flexDirection="column" gap={1.5} mb={1.5}>
              <TextField
                fullWidth
                name="code"
                label={t("Order code")}
                placeholder={t("Enter order code") as string}
                onChange={(e: any) => setCode(e.target.value)}
                value={code}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleVerify}
                disabled={disabled}
                fullWidth
                sx={{ maxWidth: 120 }}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  t("Check")
                )}
              </Button>
            </Box>

            <Box id="cf-turnstile" mb={2} />
            <Script
              src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=cfTurnstileOnload&render=explicit"
              async
              defer
              onLoad={renderTurnstile}
              onReady={renderTurnstile}
            />

            {result && (
              <Box mt={2}>
                {result.valid ? (
                  <Box>
                    <H2 mb={1}>{t("Order found")}</H2>
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        background: "#f9fafb",
                        padding: 12,
                        borderRadius: 8,
                      }}
                    >
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </Box>
                ) : (
                  <Paragraph color="error.main">
                    {result.error || t("Order not found or invalid.")}
                  </Paragraph>
                )}
              </Box>
            )}
          </BazaarCard>
        </Box>
      </Container>
    </div>
  )
}
