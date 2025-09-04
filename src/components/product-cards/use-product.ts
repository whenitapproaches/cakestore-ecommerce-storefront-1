import { useCallback, useState } from "react";
import { useSnackbar } from "notistack";
import useCart from "hooks/useCart";

export default function useProduct(slug: string) {
  const { state, dispatch, addToCart: addToCartEnhanced } = useCart();
  const [openModal, setOpenModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const cartItem = state.cart.find((item) => item.slug === slug);

  const toggleFavorite = useCallback(() => setIsFavorite((fav) => !fav), []);
  const toggleDialog = useCallback(() => setOpenModal((open) => !open), []);

  const handleCartAmountChange = (product: typeof cartItem, type?: "remove") => {
    dispatch({ type: "CHANGE_CART_AMOUNT", payload: product });
  };

  const addToCartAsync = async (product: any) => {
    if (isAddingToCart) return;
    setIsAddingToCart(true);
    try {
      await addToCartEnhanced({
        id: product.id,
        qty: product.qty || 1,
        price: product.price,
        name: product.name,
        imgUrl: product.imgUrl,
        slug: product.slug,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return {
    cartItem,
    openModal,
    isFavorite,
    toggleDialog,
    toggleFavorite,
    handleCartAmountChange,
    addToCartAsync,
    isAddingToCart,
  };
}
