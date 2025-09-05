import Link from "next/link"
import { useRouter } from "next/navigation"
// MUI
import Card from "@mui/material/Card"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import TextField from "@mui/material/TextField"
import Chip from "@mui/material/Chip"
import Stack from "@mui/material/Stack"
import CircularProgress from "@mui/material/CircularProgress"
// GLOBAL CUSTOM HOOK
import useCart from "hooks/useCart"
// GLOBAL CUSTOM COMPONENTS
import { Span } from "components/Typography"
import { FlexBetween, FlexBox } from "components/flex-box"
// CUSTOM UTILS LIBRARY FUNCTION
import { formatCurrency, shippingApi, couponApi, cartApi } from "lib"
import { useTranslation } from "react-i18next"
import { useEffect, useMemo, useState } from "react"
import { useChannels } from "channels"
import { useToast } from "contexts/ToastContext"

export default function CheckoutForm() {
  const { t } = useTranslation()
  const { state } = useCart()
  const ctx = useChannels()
  const { showToast } = useToast()
  const router = useRouter()

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
  const [isApplying, setIsApplying] = useState(false)
  const [voucher, setVoucher] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)
  const [shippingFetched, setShippingFetched] = useState(false)
  const [couponCodes, setCouponCodes] = useState<string[]>([])
  const [removingCode, setRemovingCode] = useState<string | null>(null)

  const getTotalPrice = () =>
    state.cart.reduce((acc, item) => acc + item.price * item.qty, 0)
  const subtotal = useMemo(() => getTotalPrice(), [state.cart])
  const cartSignature = useMemo(
    () =>
      state.cart
        .map((i) => `${i.orderLineId || i.id}:${i.qty}`)
        .sort()
        .join("|"),
    [state.cart]
  )

  // Hydrate discount from cart API at startup
  useEffect(() => {
    let cancelled = false
    const hydrateDiscount = async () => {
      try {
        const { data } = await cartApi.getActive()
        const discounts: any[] = Array.isArray(data?.cart?.discounts)
          ? data.cart.discounts
          : []
        const sum = discounts.reduce((acc: number, d: any) => {
          const amt = Number(d?.amountWithTax) || 0
          return acc + Math.abs(amt)
        }, 0)
        if (!cancelled) setDiscountAmount(sum)
        const codes: string[] = Array.isArray(data?.cart?.couponCodes)
          ? data.cart.couponCodes
          : []
        if (!cancelled) setCouponCodes(codes)
      } catch {}
    }
    hydrateDiscount()
    return () => {
      cancelled = true
    }
  }, [])

  // Re-fetch cart whenever cart content changes to keep discounts/coupons in sync
  useEffect(() => {
    let cancelled = false
    const refreshFromCart = async () => {
      try {
        const { data } = await cartApi.getActive()
        const discounts: any[] = Array.isArray(data?.cart?.discounts)
          ? data.cart.discounts
          : []
        const sum = discounts.reduce(
          (acc: number, d: any) =>
            acc + Math.abs(Number(d?.amountWithTax) || 0),
          0
        )
        const codes: string[] = Array.isArray(data?.cart?.couponCodes)
          ? data.cart.couponCodes
          : []
        if (!cancelled) {
          setDiscountAmount(sum)
          setCouponCodes(codes)
        }
      } catch {}
    }
    // Skip if no items; still refresh to clear discounts
    refreshFromCart()
    return () => {
      cancelled = true
    }
  }, [cartSignature])

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

        if (normalized.length === 1) {
          setIsApplying(true)
          try {
            const applyRes = await shippingApi.setShippingMethod([
              normalized[0].id,
            ])
            if (applyRes.ok && (applyRes.data as any)?.success) {
              setAppliedShipping({
                id: normalized[0].id,
                name: normalized[0].name,
                price: normalized[0].price,
              })
            }
          } finally {
            setIsApplying(false)
          }
        }
      } catch (e) {
        // swallow errors to avoid blocking checkout UI
      }
    }
    fetchEligibleShipping()
  }, [ctx.locale, ctx.channel, shippingFetched])

  return (
    <Card sx={{ padding: 3 }}>
      {/* Voucher section */}
      <Span fontWeight={600} display="block" mb={2}>
        {t("Voucher")}
      </Span>
      {couponCodes.length > 0 && (
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
          {couponCodes.map((code) => {
            const isLoading = removingCode === code
            return (
              <Chip
                key={code}
                label={code}
                disabled={isLoading}
                deleteIcon={
                  isLoading ? <CircularProgress size={16} /> : undefined
                }
                onDelete={
                  isLoading
                    ? undefined
                    : async () => {
                        try {
                          setRemovingCode(code)
                          const res = await couponApi.remove(code)
                          if (res.ok && (res.data as any)?.success) {
                            const order = (res.data as any)?.order
                            const discounts = Array.isArray(order?.discounts)
                              ? order.discounts
                              : []
                            const sum = discounts.reduce(
                              (acc: number, d: any) =>
                                acc + Math.abs(Number(d?.amountWithTax) || 0),
                              0
                            )
                            setDiscountAmount(sum)
                            const codes: string[] = Array.isArray(
                              order?.couponCodes
                            )
                              ? order.couponCodes
                              : []
                            setCouponCodes(codes)
                            showToast(t("Voucher removed"), 2000, "success")
                          } else {
                            showToast(
                              t("Failed to apply voucher"),
                              3000,
                              "error"
                            )
                          }
                        } catch {
                          showToast(t("Unknown error"), 3000, "error")
                        } finally {
                          setRemovingCode(null)
                        }
                      }
                }
                sx={{ mr: 1, mb: 1 }}
              />
            )
          })}
        </Stack>
      )}
      <TextField
        fullWidth
        size="small"
        label={t("Voucher") as string}
        variant="outlined"
        placeholder={t("Voucher") as string}
        value={voucher}
        onChange={(e) => setVoucher(e.target.value)}
      />
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        sx={{ mt: 2, mb: 4 }}
        onClick={async () => {
          try {
            const code = voucher.trim()
            if (!code) return
            const res = await couponApi.apply(code)
            if (res.ok && (res.data as any)?.success) {
              showToast(t("Voucher applied successfully"), 2000, "success")
              const order = (res.data as any)?.order
              const discounts = Array.isArray(order?.discounts)
                ? order.discounts
                : []
              const sum = discounts.reduce((acc: number, d: any) => {
                const amt = Number(d?.amountWithTax) || 0
                return acc + Math.abs(amt)
              }, 0)
              setDiscountAmount(sum)
              const codes: string[] = Array.isArray(order?.couponCodes)
                ? order.couponCodes
                : []
              setCouponCodes(codes)
            } else {
              showToast(t("Failed to apply voucher"), 3000, "error")
            }
          } catch (e) {
            showToast(t("Unknown error"), 3000, "error")
          }
        }}
      >
        {t("Apply Voucher")}
      </Button>

      {/* Cart summary */}
      <Span fontWeight={600} display="block" mb={1}>
        {t("Cart Summary")} ({state.cart.reduce((c, i) => c + i.qty, 0)}{" "}
        {t("items")})
      </Span>

      <FlexBetween mb={1}>
        <Span color="grey.600">{t("Subtotal")}</Span>
        <Span>{formatCurrency(subtotal)}</Span>
      </FlexBetween>

      <FlexBetween mb={1}>
        <Span color="grey.600">{t("Estimated Shipping")}</Span>
        <Span>
          {appliedShipping
            ? formatCurrency(appliedShipping.price)
            : t("Not determined")}
        </Span>
      </FlexBetween>

      <FlexBetween mb={2}>
        <Span color="grey.600">{t("Discounts")}</Span>
        <Span>{formatCurrency(discountAmount)}</Span>
      </FlexBetween>

      <Divider sx={{ mb: 2 }} />

      <FlexBetween mb={3}>
        <Span fontWeight={600}>{t("Total")}</Span>
        <Span
          fontSize={18}
          fontWeight={600}
          lineHeight="1"
          color="success.main"
        >
          {formatCurrency(
            Math.max(
              0,
              subtotal + (appliedShipping?.price || 0) - discountAmount
            )
          )}
        </Span>
      </FlexBetween>

      <Button
        fullWidth
        color="primary"
        variant="contained"
        disabled={isApplying}
        onClick={async () => {
          try {
            const { data } = await cartApi.getActive()
            const lines: any[] = Array.isArray(data?.cart?.lines) ? data.cart.lines : []
            const out = lines.find((l: any) => String(l?.productVariant?.stockLevel || "") === "OUT_OF_STOCK")
            if (out) {
              const name = out?.productVariant?.name || out?.productVariant?.product?.name || ""
              showToast(`${name} ${t("Out of Stock")}`, 3000, "error")
              return
            }
            router.push("/checkout")
          } catch {
            router.push("/checkout")
          }
        }}
      >
        {t("Continue")}
      </Button>
    </Card>
  )
}
