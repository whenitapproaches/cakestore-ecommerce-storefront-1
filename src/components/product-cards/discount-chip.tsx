"use client";

import Chip, { ChipProps } from "@mui/material/Chip";
import styled from "@mui/material/styles/styled";

// STYLED COMPONENT
const StyledChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "shape"
})<{ shape: "rounded" | "square" }>(({ theme, shape }) => ({
  paddingLeft: 2,
  paddingRight: 2,
  height: '20px',
  fontWeight: 600,
  fontSize: "12px",
  color: theme.palette.common.white,
  background: theme.palette.success.main,
  userSelect: 'none',
  ...(shape === "square" && { borderRadius: 0 }),
  "&:hover": {
    background: theme.palette.success.main,
    color: theme.palette.common.white,
  }
}));

// ==============================================================
interface Props extends ChipProps {
  discount: number;
  shape?: "rounded" | "square";
}
// ==============================================================

export default function DiscountChip({ discount = 0, shape = "rounded", ...props }: Props) {
  return discount > 0 ? (
    <StyledChip size="small" shape={shape} label={`-${discount}%`} {...props} />
  ) : null;
}
