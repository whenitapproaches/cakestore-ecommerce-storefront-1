import { useContext, useCallback } from "react"
import { CartContext } from "contexts/CartContext"
import { useToast } from "contexts/ToastContext"
import { useTranslation } from "react-i18next"

const useCart = () => {
  const { state, dispatch } = useContext(CartContext)
  const { showToast } = useToast()
  const { t } = useTranslation()

  // Enhanced add to cart that works with local state
  const addToCartEnhanced = useCallback(
    async (cartItem: any) => {
      // First, try to sync with server cart API (POST /api/cart)
      const qtyToAdd = cartItem.qty || 1
      let synced = false
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            productVariantId: String(cartItem.id),
            quantity: qtyToAdd,
          }),
        })
        const data = await res.json()
        if (res.ok && data?.cart?.lines) {
          const mapped = data.cart.lines.map((l: any) => ({
            id: l?.productVariant?.id ?? l?.id,
            orderLineId: l?.id ?? undefined,
            qty: l?.quantity ?? 0,
            price: l?.unitPriceWithTax ?? 0,
            name: l?.productVariant?.name ?? "",
            imgUrl:
              l?.featuredAsset?.preview ??
              l?.productVariant?.featuredAsset?.preview ??
              l?.productVariant?.featuredAsset?.source,
            slug: l?.productVariant?.product?.slug ?? "",
          }))
          dispatch({ type: "SET_CART", payload: mapped })
          synced = true
        }
      } catch {
        // ignore network/server errors and fall back to local update
      }

      // Fallback/local optimistic update when server sync didn't occur
      if (!synced) {
        const existing = state.cart.find((item) => item.id === cartItem.id)
        const nextItem = existing
          ? { ...existing, qty: (existing.qty || 0) + qtyToAdd }
          : { ...cartItem, qty: qtyToAdd }
        dispatch({ type: "CHANGE_CART_AMOUNT", payload: nextItem })
      }

      // Show toast notification
      showToast(`${t("Added to Cart")}: ${cartItem.name}`, 2500)

      return true
    },
    [state.cart, dispatch, showToast]
  )

  // Remove item from cart
  const removeFromCart = useCallback(
    async (item: { id: string | number; orderLineId?: string }) => {
      try {
        if (item.orderLineId) {
          const res = await fetch(`/api/cart?orderLineId=${encodeURIComponent(String(item.orderLineId))}`,
            { method: "DELETE", credentials: "include" })
          const data = await res.json()
          if (res.ok && data?.cart?.lines) {
            const mapped = data.cart.lines.map((l: any) => ({
              id: l?.productVariant?.id ?? l?.id,
              orderLineId: l?.id ?? undefined,
              qty: l?.quantity ?? 0,
              price: l?.unitPriceWithTax ?? 0,
              name: l?.productVariant?.name ?? "",
              imgUrl:
                l?.featuredAsset?.preview ??
                l?.productVariant?.featuredAsset?.preview ??
                l?.productVariant?.featuredAsset?.source,
              slug: l?.productVariant?.product?.slug ?? "",
            }))
            dispatch({ type: "SET_CART", payload: mapped })
            return
          }
        }
      } catch {}
      // fallback - remove locally if API fails
      dispatch({
        type: "CHANGE_CART_AMOUNT",
        payload: { id: item.id, qty: 0, name: "", slug: "", price: 0 },
      })
    },
    [dispatch]
  )

  // Update item quantity
  const updateItemQuantity = useCallback(
    async (itemId: string | number, quantity: number) => {
      const existingItem = state.cart.find((item) => item.id === itemId)
      if (!existingItem) return

      try {
        if (existingItem.orderLineId) {
          const res = await fetch(`/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ orderLineId: String(existingItem.orderLineId), quantity }),
          })
          const data = await res.json()
          if (res.ok && data?.cart?.lines) {
            const mapped = data.cart.lines.map((l: any) => ({
              id: l?.productVariant?.id ?? l?.id,
              orderLineId: l?.id ?? undefined,
              qty: l?.quantity ?? 0,
              price: l?.unitPriceWithTax ?? 0,
              name: l?.productVariant?.name ?? "",
              imgUrl:
                l?.featuredAsset?.preview ??
                l?.productVariant?.featuredAsset?.preview ??
                l?.productVariant?.featuredAsset?.source,
              slug: l?.productVariant?.product?.slug ?? "",
            }))
            dispatch({ type: "SET_CART", payload: mapped })
            return
          }
        }
      } catch {}

      // fallback local update
      dispatch({
        type: "CHANGE_CART_AMOUNT",
        payload: { ...existingItem, qty: quantity },
      })
    },
    [state.cart, dispatch]
  )

  // Get cart total
  const getCartTotal = useCallback(() => {
    return state.cart.reduce((total, item) => total + item.price * item.qty, 0)
  }, [state.cart])

  // Get cart item count
  const getCartItemCount = useCallback(() => {
    return state.cart.reduce((count, item) => count + item.qty, 0)
  }, [state.cart])

  // Clear cart
  const clearCart = useCallback(() => {
    state.cart.forEach((item) => {
      dispatch({
        type: "CHANGE_CART_AMOUNT",
        payload: {
          id: item.id,
          qty: 0,
          name: "",
          slug: "",
          price: 0,
        },
      })
    })
  }, [state.cart, dispatch])

  return {
    // Local state
    state,
    dispatch,
    cart: state.cart,

    // Enhanced operations
    addToCartEnhanced,
    removeFromCart,
    updateItemQuantity,
    getCartTotal,
    getCartItemCount,
    clearCart,

    // Legacy support
    addToCart: addToCartEnhanced,
  }
}

export default useCart
