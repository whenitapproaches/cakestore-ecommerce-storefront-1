import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
// Local cart hook
import useCart from "hooks/useCart";
// LOCAL CUSTOM COMPONENTS
import TopHeader from "./components/top-header";
import MiniCartItem from "./components/cart-item";
import EmptyCartView from "./components/empty-view";
import BottomActions from "./components/bottom-actions";
// GLOBAL CUSTOM COMPONENT
import Scrollbar from "components/scrollbar";
// CUSTOM UTILS LIBRARY FUNCTION
import { currency, formatCurrency } from "lib";
// CUSTOM DATA MODEL
import { CartItem } from "contexts/CartContext";

// =========================================================
type Props = { toggleSidenav: () => void };
// =========================================================

export default function MiniCart({ toggleSidenav }: Props) {
  const { push } = useRouter();
  const { state, dispatch, updateItemQuantity, removeFromCart } = useCart();
  const cartList = state.cart;

  const handleIncrease = async (product: CartItem) => {
    const nextQty = product.qty + 1
    await updateItemQuantity(product.id, nextQty)
  }

  const handleDecrease = async (product: CartItem) => {
    const nextQty = Math.max(1, product.qty - 1)
    await updateItemQuantity(product.id, nextQty)
  }

  const handleRemove = async (product: CartItem) => {
    await removeFromCart({ id: product.id, orderLineId: product.orderLineId })
  }

  const getTotalPrice = () => {
    return cartList.reduce((acc, item) => acc + item.price * item.qty, 0);
  };

  const handleNavigate = (path: string) => () => {
    toggleSidenav();
    push(path);
  };

  return (
    <Box width="100%" minWidth={380}>
      {/* HEADING SECTION */}
      <TopHeader toggle={toggleSidenav} total={cartList.length} />

      <Divider />

      <Box height={`calc(100vh - ${cartList.length ? "207px" : "75px"})`}>
        {/* CART ITEM LIST */}
        {cartList.length > 0 ? (
          <Scrollbar>
            {cartList.map((item) => (
              <MiniCartItem
                item={item}
                key={item.id}
                handleIncrease={handleIncrease}
                handleDecrease={handleDecrease}
                handleRemove={handleRemove}
              />
            ))}
          </Scrollbar>
        ) : (
          <EmptyCartView />
        )}
      </Box>

      {/* CART BOTTOM ACTION BUTTONS */}
      {cartList.length > 0 ? (
        <BottomActions total={formatCurrency(getTotalPrice())} handleNavigate={handleNavigate} />
      ) : null}
    </Box>
  );
}
