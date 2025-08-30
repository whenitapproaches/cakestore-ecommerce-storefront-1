"use client"

import styled from "@mui/material/styles/styled"

export const PriceText = styled("div")(({ theme }) => ({
  fontSize: 17,
  lineHeight: 1,
  fontWeight: 700,
  marginTop: ".75rem",
  color: theme.palette.text.main,
  display: "flex",
  flexDirection: "column",
  ".base-price": {
    fontSize: 15,
    marginRight: 8,
    fontWeight: 600,
    textDecoration: "line-through",
    color: theme.palette.grey[600],
  },
  ".price": {
    marginTop: ".25rem",
    color: theme.palette.success.main,
  },
  ".price-container": {
    display: "flex",
    alignItems: "center",
    gap: 2,
  },
}))
