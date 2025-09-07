import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Script from "next/script"
import Grid from "@mui/material/Grid"
import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import * as yup from "yup"
import { Formik } from "formik"
// LOCAL CUSTOM COMPONENTS
import ShippingForm from "./shipping-form"
import { ordersApi, shippingApi, paymentMethodsApi } from "lib"
import { useToast } from "contexts/ToastContext"
import { useTranslation } from "react-i18next"
import { useChannels } from "channels"

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""

interface Props {
  selectedPaymentMethod?: {
    id: string
    name: string
    code: string
    description?: string | null
    isEligible: boolean
  } | null
}

export default function CheckoutForm({ selectedPaymentMethod }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const { t } = useTranslation()
  const ctx = useChannels()

  const [token, setToken] = useState<string | null>(null)
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false)
  const [shippingMethods, setShippingMethods] = useState<
    Array<{
      id: string
      name: string
      description?: string | null
      price: number
    }>
  >([])
  const [appliedShipping, setAppliedShipping] = useState<{
    id: string
    name: string
    price: number
  } | null>(null)
  const [isApplyingShipping, setIsApplyingShipping] = useState(false)
  const [shippingFetched, setShippingFetched] = useState(false)
  const hasRenderedRef = useRef(false)
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null)
  const retriesRef = useRef(0)
  const widgetIdRef = useRef<string | null>(null)

  const handleFormSubmit = async (values: typeof initialValues) => {
    // Prevent multiple submissions
    if (isPlacingOrder) return

    try {
      // Check Turnstile token
      if (!token) {
        showToast(t("Please complete the captcha verification"), 3000, "error")
        return
      }

      // Check if shipping method is applied
      if (!appliedShipping && shippingMethods.length > 0) {
        showToast(t("Please wait for shipping method to be applied"), 3000, "error")
        return
      }

      // Check if payment method is selected
      if (!selectedPaymentMethod) {
        showToast(t("Please select a payment method"), 3000, "error")
        return
      }

      setIsPlacingOrder(true)

      const payload = {
        emailAddress: values.shipping_email || "",
        firstName: values.shipping_first_name,
        lastName: values.shipping_last_name,
        phoneNumber: values.shipping_contact,
        shipping: {
          address1: values.shipping_address1,
          province: values.shipping_province,
          district: values.shipping_district,
          ward: values.shipping_ward,
        },
        paymentMethodCode: selectedPaymentMethod.code,
        turnstileToken: token,
      }
      const res = await ordersApi.place(payload)
      if (!res.ok) {
        const raw = (res.data as any)?.error || "UNKNOWN_ERROR"
        showToast(t(String(raw)) as string, 3000, "error")
        // Reset Turnstile on error
        setToken(null)
        renderTurnstile(true)
        setIsPlacingOrder(false)
        return
      }

      // Redirect to order details page with JWT token
      const redirectUrl = (res.data as any)?.redirectUrl
      if (redirectUrl) {
        window.location.href = redirectUrl
      } else {
        // Fallback to payment page if no redirect URL
        router.push("/payment")
      }
    } catch {
      showToast(t("Unknown error"), 3000, "error")
      // Reset Turnstile on error
      setToken(null)
      renderTurnstile(true)
      setIsPlacingOrder(false)
    }
  }

  const resetTurnstile = useCallback(() => {
    try {
      // @ts-ignore
      if (window.turnstile && widgetIdRef.current) {
        // @ts-ignore
        window.turnstile.reset(widgetIdRef.current)
        setToken(null)
        return true
      }
    } catch {}
    return false
  }, [])

  const renderTurnstile = useCallback((forceRender = false) => {
    try {
      const container = document.getElementById("cf-turnstile-checkout")
      if (!container) return

      // If Turnstile script not ready yet, retry shortly
      // @ts-ignore
      if (!window.turnstile) {
        if (retriesRef.current < 20) {
          retriesRef.current += 1
          retryTimerRef.current = setTimeout(() => renderTurnstile(forceRender), 200)
        }
        return
      }

      // Try to reset existing widget first if forcing re-render
      if (forceRender && resetTurnstile()) {
        return
      }

      // Skip rendering if already rendered and not forcing a re-render
      if (!forceRender && hasRenderedRef.current && container.childElementCount > 0) return

      // Clear any previous children before rendering afresh
      try {
        while (container.firstChild) container.removeChild(container.firstChild)
      } catch {}

      // Reset the rendered flag when forcing re-render
      if (forceRender) {
        hasRenderedRef.current = false
        widgetIdRef.current = null
      }

      // @ts-ignore
      const widgetId = window.turnstile.render("#cf-turnstile-checkout", {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (t: string) => setToken(t),
        "error-callback": () => setToken(null),
        "expired-callback": () => setToken(null),
      })
      
      widgetIdRef.current = widgetId
      hasRenderedRef.current = true
    } catch {}
  }, [resetTurnstile])

  // Fetch and apply shipping methods
  useEffect(() => {
    const fetchEligibleShipping = async () => {
      try {
        if (shippingFetched) return
        const { data } = await shippingApi.getEligibleMethods()
        const normalized = (data?.methods || []).map((m: any) => ({
          id: String(m.id),
          name: String(m.name),
          description: m?.description ?? null,
          price: Number(m.price ?? 0),
        }))
        setShippingMethods(normalized)
        setShippingFetched(true)

        // Auto-apply if only one shipping method is available
        if (normalized.length === 1) {
          setIsApplyingShipping(true)
          try {
            const applyRes = await shippingApi.setShippingMethod([normalized[0].id])
            if (applyRes.ok && (applyRes.data as any)?.success) {
              setAppliedShipping({
                id: normalized[0].id,
                name: normalized[0].name,
                price: normalized[0].price,
              })
            }
          } catch (error) {
            console.error("Failed to apply shipping method:", error)
          } finally {
            setIsApplyingShipping(false)
          }
        }
      } catch (e) {
        console.error("Failed to fetch shipping methods:", e)
      }
    }
    fetchEligibleShipping()
  }, [ctx.locale, ctx.channel, shippingFetched])

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
    <>
      {/* Turnstile Script */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=cfTurnstileOnload"
        strategy="lazyOnload"
      />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => {
          return (
            <form onSubmit={handleSubmit} autoComplete="on">
              <ShippingForm
                values={values}
                errors={errors}
                touched={touched}
                handleBlur={handleBlur}
                handleChange={handleChange}
                setFieldValue={setFieldValue}
              />

              {/* Turnstile Captcha */}
              <Box
                sx={{ mt: 3, mb: 3, display: "flex", justifyContent: "center" }}
              >
                <div id="cf-turnstile-checkout"></div>
              </Box>

              <Grid container spacing={6}>
                <Grid item sm={6} xs={12}>
                  <Button
                    LinkComponent={Link}
                    variant="outlined"
                    color="primary"
                    type="button"
                    href="/cart"
                    fullWidth
                    disabled={isPlacingOrder}
                  >
                    {t("Back to Cart")}
                  </Button>
                </Grid>

                <Grid item sm={6} xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    disabled={isPlacingOrder || isApplyingShipping}
                    startIcon={(isPlacingOrder || isApplyingShipping) ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {isPlacingOrder 
                      ? t("Placing order...") 
                      : isApplyingShipping 
                        ? t("Setting up shipping...") 
                        : t("Place order")
                    }
                  </Button>
                </Grid>
              </Grid>
            </form>
          )
        }}
      </Formik>
    </>
  )
}

const initialValues = {
  shipping_first_name: "",
  shipping_last_name: "",
  shipping_email: "",
  shipping_contact: "",
  shipping_address1: "",
  shipping_province: null as any,
  shipping_district: null as any,
  shipping_ward: null as any,
}

// uncomment these fields below for from validation
const checkoutSchema = yup.object().shape({
  shipping_first_name: yup.string().required("required"),
  shipping_last_name: yup.string().required("required"),
  shipping_email: yup.string().email("invalid email").nullable(),
  shipping_contact: yup
    .string()
    .required("required")
    .matches(/^\d{10,11}$/g, "Phone must be 10-11 digits"),
  shipping_address1: yup.string().required("required"),
  shipping_province: yup.mixed().required("required"),
  shipping_district: yup.mixed().required("required"),
  shipping_ward: yup.mixed().required("required"),
})

