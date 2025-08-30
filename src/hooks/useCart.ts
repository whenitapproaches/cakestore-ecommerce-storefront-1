import { useContext, useCallback } from "react";
import { CartContext } from "contexts/CartContext";
import { useToast } from "contexts/ToastContext";
import { useTranslation } from "react-i18next";

const useCart = () => {
  const { state, dispatch } = useContext(CartContext);
  const { showToast } = useToast();
  const { t } = useTranslation();

  // Enhanced add to cart that works with local state
  const addToCartEnhanced = useCallback(async (cartItem: any) => {
    // Update local state for immediate UI feedback
    dispatch({
      type: "CHANGE_CART_AMOUNT",
      payload: cartItem,
    });
    
    // Show toast notification
    showToast(`${t("Added to Cart")}: ${cartItem.name}`, 2500);
    
    // TODO: In the future, this could be enhanced to sync with GraphQL
    // For now, we'll use local state as the primary cart system
    return true;
  }, [dispatch, showToast]);

  // Remove item from cart
  const removeFromCart = useCallback((itemId: string | number) => {
    dispatch({
      type: "CHANGE_CART_AMOUNT",
      payload: {
        id: itemId,
        qty: 0, // Setting qty to 0 will remove the item
        name: "",
        slug: "",
        price: 0,
      },
    });
  }, [dispatch]);

  // Update item quantity
  const updateItemQuantity = useCallback((itemId: string | number, quantity: number) => {
    const existingItem = state.cart.find(item => item.id === itemId);
    if (existingItem) {
      dispatch({
        type: "CHANGE_CART_AMOUNT",
        payload: {
          ...existingItem,
          qty: quantity,
        },
      });
    }
  }, [state.cart, dispatch]);

  // Get cart total
  const getCartTotal = useCallback(() => {
    return state.cart.reduce((total, item) => total + (item.price * item.qty), 0);
  }, [state.cart]);

  // Get cart item count
  const getCartItemCount = useCallback(() => {
    return state.cart.reduce((count, item) => count + item.qty, 0);
  }, [state.cart]);

  // Clear cart
  const clearCart = useCallback(() => {
    state.cart.forEach(item => {
      dispatch({
        type: "CHANGE_CART_AMOUNT",
        payload: {
          id: item.id,
          qty: 0,
          name: "",
          slug: "",
          price: 0,
        },
      });
    });
  }, [state.cart, dispatch]);

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
  };
};

export default useCart;
