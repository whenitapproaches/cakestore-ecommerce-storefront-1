import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
// MUI ICON COMPONENT
// CUSTOM ICON COMPONENT
import ShoppingBagOutlined from "icons/ShoppingBagOutlined";
// GLOBAL CUSTOM HOOK
import useCart from "hooks/useCart";

// ==============================================================
interface Props {
  toggleSidenav: () => void;
}
// ==============================================================

export default function LoginCartButtons({ toggleSidenav }: Props) {
  const { state, getCartItemCount } = useCart();
  const itemCount = getCartItemCount();

  const ICON_COLOR = { color: "grey.600" };

  return (
    <div>
      <Badge badgeContent={itemCount} color="primary">
        <IconButton onClick={toggleSidenav}>
          <ShoppingBagOutlined sx={ICON_COLOR} />
        </IconButton>
      </Badge>
    </div>
  );
}
