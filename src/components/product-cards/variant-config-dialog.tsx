"use client"

import { useMemo, useState, useEffect } from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import { formatCurrency } from "lib"
import { useTranslation } from "react-i18next"

type ProductDetail = {
  optionGroups?: Array<{
    id: string
    name: string
    code: string
    options: Array<{ id: string; code: string; name: string }>
  }>
  variants?: Array<{
    id: string
    name: string
    priceWithTax?: number
    options?: Array<{ id: string; groupId: string; code: string; name: string }>
  }>
}

type Props = {
  open: boolean
  product?: ProductDetail | null
  onClose: () => void
  onConfirm: (variantId: string) => void
}

export default function VariantConfigDialog({
  open,
  product,
  onClose,
  onConfirm,
}: Props) {
  const [selectedByGroup, setSelectedByGroup] = useState<
    Record<string, string>
  >({})
  const { t } = useTranslation()

  // Initialize default selection to the first option in each group when opening/dialog product changes
  useEffect(() => {
    if (!open) return
    const groups = product?.optionGroups || []
    if (!groups.length) return
    const initial: Record<string, string> = {}
    groups.forEach((g) => {
      const first = g.options?.[0]
      if (first) initial[g.id] = first.id
    })
    setSelectedByGroup(initial)
  }, [open, product])

  const currentVariant = useMemo(() => {
    const groups = product?.optionGroups || []
    const variants = product?.variants || []
    if (!groups.length || !variants.length) return null

    return (
      variants.find((v) => {
        const opts = v.options || []
        return groups.every((g) => {
          const sel = selectedByGroup[g.id]
          if (!sel) return false
          return opts.some((o) => o.id === sel)
        })
      }) || null
    )
  }, [product, selectedByGroup])

  const handleSelect = (groupId: string, optionId: string) => {
    setSelectedByGroup((prev) => ({ ...prev, [groupId]: optionId }))
  }

  const canConfirm = Boolean(currentVariant?.id)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("Select options")}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {(product?.optionGroups || []).map((group) => (
            <Stack key={group.id} spacing={1}>
              <Typography variant="h6" fontWeight={600} mb={1}>
                {t(group.name)}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {group.options.map((opt) => {
                  const selected = selectedByGroup[group.id] === opt.id
                  return (
                    <Chip
                      key={opt.id}
                      label={opt.name}
                      color={selected ? "primary" : "default"}
                      onClick={() => handleSelect(group.id, opt.id)}
                      sx={{
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        height: "40px",
                        px: 2,
                        border: selected ? "2px solid" : "1px solid",
                        borderColor: selected ? "primary.main" : "grey.300",
                        backgroundColor: selected
                          ? "primary.main"
                          : "transparent",
                        color: selected ? "white" : "text.primary",
                        fontWeight: selected ? 600 : 400,
                        "&:hover": {
                          backgroundColor: selected
                            ? "primary.dark"
                            : "primary.light",
                          color: selected ? "white" : "text.primary",
                        },
                      }}
                    />
                  )
                })}
              </Stack>
            </Stack>
          ))}

          <Divider />

          <Stack>
            <Typography variant="body2" color="text.secondary" mb={0.5}>
              {t("Price")}
            </Typography>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              {currentVariant?.priceWithTax != null
                ? formatCurrency(currentVariant.priceWithTax)
                : "—"}
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("cancel")}</Button>
        <Button
          onClick={() => currentVariant && onConfirm(currentVariant.id)}
          disabled={!canConfirm}
          color="primary"
          variant="contained"
        >
          {t("OK")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
