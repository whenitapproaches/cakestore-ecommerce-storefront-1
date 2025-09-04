"use client"
import {
  storefrontApiMutation,
  storefrontApiQuery,
  VENDURE_HOST,
} from "graphql/client"
import { ActiveOrderSelector, ActiveOrderType } from "graphql/selectors"
import {
  useState,
  createContext,
  useContext,
  ReactNode,
  createElement,
} from "react"
import { useChannels } from "channels"

function createContainer<TValue>(useHook: () => TValue) {
  const Ctx = createContext<TValue | undefined>(undefined)
  function Provider({ children }: { children: ReactNode }) {
    const value = useHook()
    return createElement(Ctx.Provider, { value }, children as any)
  }
  function useContainer() {
    const value = useContext(Ctx)
    if (value === undefined) {
      throw new Error("useContainer must be used within its Provider")
    }
    return value
  }
  return { Provider, useContainer }
}

const useCartContainer = createContainer(() => {
  const ctx = useChannels()
  const [activeOrder, setActiveOrder] = useState<ActiveOrderType>()
  const [isLogged, setIsLogged] = useState(false)
  const [isOpen, setOpen] = useState(false)
  const open = () => setOpen(true)
  const close = () => setOpen(false)

  const fetchActiveOrder = async () => {
    try {
      // Prefer server proxy to persist vendure-auth-token reliably
      const res = await fetch("/api/cart", { method: "GET", cache: "no-store", credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setActiveOrder(data?.cart)
        // Keep activeCustomer check via direct query as a best-effort secondary call
        try {
          const { activeCustomer } = await storefrontApiQuery(ctx)({ activeCustomer: { id: true } })
          setIsLogged(!!activeCustomer?.id)
        } catch {}
        return data?.cart
      }
      // Fallback to direct Vendure query if API failed
      const [{ activeOrder }, { activeCustomer }] = await Promise.all([
        storefrontApiQuery(ctx)({ activeOrder: ActiveOrderSelector }),
        storefrontApiQuery(ctx)({ activeCustomer: { id: true } }),
      ])
      setActiveOrder(activeOrder)
      setIsLogged(!!activeCustomer?.id)
      return activeOrder
    } catch (e) {
      console.log(e)
    }
  }

  const addToCart = async (id: string, q: number, o?: boolean) => {
    setActiveOrder((c) => {
      return c && { ...c, totalQuantity: c.totalQuantity + 1 }
    })
    try {
      // Prefer server proxy to persist vendure-auth-token reliably
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productVariantId: id, quantity: q }),
      })
      const data = await res.json()
      if (res.ok && data?.cart) {
        setActiveOrder(data.cart)
        if (o) open()
        return
      }
      // Fallback to direct Vendure mutation
      const { addItemToOrder } = await storefrontApiMutation(ctx)({
        addItemToOrder: [
          { productVariantId: id, quantity: q },
          {
            __typename: true,
            "...on Order": ActiveOrderSelector,
            "...on OrderLimitError": {
              errorCode: true,
              message: true,
            },
            "...on InsufficientStockError": {
              errorCode: true,
              message: true,
            },
            "...on NegativeQuantityError": {
              errorCode: true,
              message: true,
            },
            "...on OrderModificationError": {
              errorCode: true,
              message: true,
            },
          },
        ],
      })
      if (addItemToOrder.__typename === "Order") {
        setActiveOrder(addItemToOrder)
        if (o) open()
      }
    } catch (e) {
      console.log(e)
    }
  }
  const removeFromCart = async (id: string) => {
    setActiveOrder((c) => {
      return c && { ...c, lines: c.lines.filter((l) => l.id !== id) }
    })
    try {
      // Prefer server proxy
      const res = await fetch(`/api/cart?orderLineId=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.cart) {
          setActiveOrder(data.cart)
          return
        }
      }
      // Fallback to direct Vendure mutation
      const { removeOrderLine } = await storefrontApiMutation(ctx)({
        removeOrderLine: [
          { orderLineId: id },
          {
            __typename: true,
            "...on Order": ActiveOrderSelector,
            "...on OrderModificationError": {
              errorCode: true,
              message: true,
            },
          },
        ],
      })
      if (removeOrderLine.__typename === "Order") {
        setActiveOrder(removeOrderLine)
        return
      }
    } catch (e) {
      console.log(e)
    }
  }

  const setItemQuantityInCart = async (id: string, q: number) => {
    setActiveOrder((c) => {
      if (c?.lines.find((l) => l.id === id)) {
        return {
          ...c,
          lines: c.lines.map((l) => (l.id === id ? { ...l, q } : l)),
        }
      }
      return c
    })
    try {
      // Prefer server proxy
      const res = await fetch(`/api/cart`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderLineId: id, quantity: q }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.cart) {
          setActiveOrder(data.cart)
          return
        }
      }
      // Fallback to direct Vendure mutation
      const { adjustOrderLine } = await storefrontApiMutation(ctx)({
        adjustOrderLine: [
          { orderLineId: id, quantity: q },
          {
            __typename: true,
            "...on Order": ActiveOrderSelector,
            "...on OrderLimitError": {
              errorCode: true,
              message: true,
            },
            "...on InsufficientStockError": {
              errorCode: true,
              message: true,
            },
            "...on NegativeQuantityError": {
              errorCode: true,
              message: true,
            },
            "...on OrderModificationError": {
              errorCode: true,
              message: true,
            },
          },
        ],
      })
      if (adjustOrderLine.__typename === "Order") {
        setActiveOrder(adjustOrderLine)
        return
      }
      return adjustOrderLine
    } catch (e) {
      console.log(e)
    }
  }

  const applyCouponCode = async (code: string) => {
    try {
      const { applyCouponCode } = await storefrontApiMutation(ctx)({
        applyCouponCode: [
          { couponCode: code },
          {
            __typename: true,
            "...on Order": ActiveOrderSelector,
            "...on CouponCodeExpiredError": { errorCode: true, message: true },
            "...on CouponCodeInvalidError": { errorCode: true, message: true },
            "...on CouponCodeLimitError": { errorCode: true, message: true },
          },
        ],
      })
      if (applyCouponCode.__typename === "Order") {
        setActiveOrder(applyCouponCode)
        return true
      }
      return false
    } catch (e) {
      console.log(e)
      return false
    }
  }

  const removeCouponCode = async (code: string) => {
    try {
      const { removeCouponCode } = await storefrontApiMutation(ctx)({
        removeCouponCode: [{ couponCode: code }, ActiveOrderSelector],
      })
      if (removeCouponCode?.id) {
        setActiveOrder(removeCouponCode)
        return
      }
    } catch (e) {
      console.log(e)
    }
  }

  return {
    isLogged,
    activeOrder,
    cart: activeOrder,
    addToCart,
    setItemQuantityInCart,
    removeFromCart,
    fetchActiveOrder,

    applyCouponCode,
    removeCouponCode,

    isOpen,
    open,
    close,
  }
})

export const useCart = useCartContainer.useContainer
export const CartProvider = useCartContainer.Provider
