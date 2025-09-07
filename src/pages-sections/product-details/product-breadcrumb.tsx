"use client"

import { Breadcrumbs, Typography } from "@mui/material";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function ProductBreadcrumbs({ product }: { product: any }) {
  const { t } = useTranslation()
  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      <Link href="/shop">
        <Typography color="GrayText">{t("Shop")}</Typography>
      </Link>
      <Typography color="InfoText">
        {product?.name || "Product"}
      </Typography>
    </Breadcrumbs>
  )
}