import Link from "next/link";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";
// MUI ICON COMPONENTS
import Add from "@mui/icons-material/Add";
import Close from "@mui/icons-material/Close";
import Remove from "@mui/icons-material/Remove";
// GLOBAL CUSTOM COMPONENTS
import Image from "components/BazaarImage";
import { Span } from "components/Typography";
import { FlexBox } from "components/flex-box";
// GLOBAL CUSTOM HOOK
import useCart from "hooks/useCart";
// CUSTOM UTILS LIBRARY FUNCTION
import { currency, formatCurrency } from "lib";
// STYLED COMPONENT
import { Wrapper } from "./styles";

// =========================================================
type Props = {
  qty: number;
  name: string;
  slug: string;
  price: number;
  imgUrl?: string;
  id: string | number;
  orderLineId?: string;
  stockLevel?: string;
};
// =========================================================

export default function CartItem({ id, name, qty, price, imgUrl, slug, orderLineId, stockLevel }: Props) {
  const { updateItemQuantity, removeFromCart } = useCart();

  const [inputQty, setInputQty] = useState<number>(qty);
  const [saving, setSaving] = useState<boolean>(false);
  useEffect(() => {
    setInputQty(qty);
  }, [qty]);

  // Handle +/- clicks via API
  const handleCartAmountChange = (amount: number) => async () => {
    const next = Math.max(0, Math.floor(amount || 0));
    try {
      setSaving(true);
      if (next === 0) {
        const ok = await removeFromCart({ id, orderLineId });
        if (!ok) {
          setInputQty(qty);
        }
        return;
      }
      const ok = await updateItemQuantity(id, next);
      if (!ok) {
        setInputQty(qty);
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle manual input editing
  const commitInput = async () => {
    const normalized = Math.max(0, Math.floor(Number(inputQty) || 0));
    if (normalized === qty) return;
    try {
      setSaving(true);
      if (normalized === 0) {
        const ok = await removeFromCart({ id, orderLineId });
        if (!ok) setInputQty(qty);
        return;
      }
      const ok = await updateItemQuantity(id, normalized);
      if (!ok) setInputQty(qty);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Wrapper sx={{ opacity: stockLevel === "OUT_OF_STOCK" ? 0.5 : 1 }}>
      <Image
        alt={name}
        width={140}
        height={140}
        display="block"
        src={imgUrl}
      />

      {/* DELETE BUTTON */}
      <IconButton
        size="small"
        onClick={handleCartAmountChange(0)}
        disabled={saving}
        sx={{ position: "absolute", right: 15, top: 15 }}>
        {saving ? (
          <CircularProgress size={16} />
        ) : (
          <Close fontSize="small" />
        )}
      </IconButton>

      <FlexBox p={2} rowGap={2} width="100%" flexDirection="column">
        <Link href={`/products/${slug}`}>
          <Span ellipsis fontWeight="600" fontSize={18}>
            {name}
          </Span>
        </Link>

        {/* PRODUCT PRICE SECTION */}
        <FlexBox gap={1} flexWrap="wrap" alignItems="center">
          <Span color="grey.600">
            {formatCurrency(price)} x {qty}
          </Span>

          <Span fontWeight={600} color="primary.main">
            {formatCurrency(price * qty)}
          </Span>
          {stockLevel === "OUT_OF_STOCK" ? (
            <Span color="error.main" ml={2}>{"Hết hàng"}</Span>
          ) : null}
        </FlexBox>

        {/* PRODUCT QUANTITY INC/DEC + MANUAL INPUT */}
        <FlexBox alignItems="center" gap={1}>
          <Button
            color="primary"
            sx={{ p: "5px", width: 36, height: 36, minWidth: 36, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            variant="outlined"
            disabled={qty <= 1 || saving || stockLevel === "OUT_OF_STOCK"}
            onClick={handleCartAmountChange(qty - 1)}>
            {saving ? <CircularProgress size={20} /> : <Remove fontSize="small" />}
          </Button>

          <TextField
            type="number"
            size="small"
            value={inputQty}
            inputProps={{ min: 0, style: { textAlign: "center", width: 32 } }}
            sx={{
              '& .MuiInputBase-input[type=number]': { MozAppearance: 'textfield' },
              '& .MuiInputBase-input[type=number]::-webkit-outer-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
              '& .MuiInputBase-input[type=number]::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
            }}
            disabled={saving || stockLevel === "OUT_OF_STOCK"}
            onChange={(e) => setInputQty(Number(e.target.value))}
            onBlur={commitInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur()
              }
            }}
          />

          <Button
            color="primary"
            sx={{ p: "5px", width: 36, height: 36, minWidth: 36, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            variant="outlined"
            disabled={saving || stockLevel === "OUT_OF_STOCK"}
            onClick={handleCartAmountChange(qty + 1)}>
            {saving ? <CircularProgress size={20} /> : <Add fontSize="small" />}
          </Button>

        </FlexBox>
      </FlexBox>
    </Wrapper>
  );
}
