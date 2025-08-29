import Divider from "@mui/material/Divider";
// MUI ICON COMPONENTS
import Favorite from "@mui/icons-material/Favorite";
import RemoveRedEye from "@mui/icons-material/RemoveRedEye";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import AddShoppingCart from "@mui/icons-material/AddShoppingCart";
// GLOBAL CUSTOM COMPONENT
import { Span } from "components/Typography";
// STYLED COMPONENT
import { ItemController } from "../styles";

// ==============================================================
interface Props {
  isFavorite: boolean;
  toggleView: () => void;
  toggleFavorite: () => void;
  handleAddToCart: () => void;
}
// ==============================================================

export default function HoverActions({
  isFavorite,
  toggleView,
  toggleFavorite,
  handleAddToCart
}: Props) {
  return (
    <ItemController className="controlBox">
      <Span onClick={toggleView}>
        <RemoveRedEye />
      </Span>

      <Divider orientation="horizontal" flexItem />

      <Span onClick={toggleFavorite}>
        {isFavorite ? (
          <Favorite color="primary" fontSize="small" />
        ) : (
          <FavoriteBorder fontSize="small" color="primary" />
        )}
      </Span>

      <Divider orientation="horizontal" flexItem />

      <Span onClick={handleAddToCart}>
        <AddShoppingCart />
      </Span>
    </ItemController>
  );
}
