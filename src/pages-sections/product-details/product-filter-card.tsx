"use client"

import { Fragment, useState } from "react"
// MUI
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import Rating from "@mui/material/Rating"
import Divider from "@mui/material/Divider"
import Collapse from "@mui/material/Collapse"
import TextField from "@mui/material/TextField"
import FormGroup from "@mui/material/FormGroup"
// LOCAL CUSTOM COMPONENTS
import CheckboxLabel from "./checkbox-label"
// GLOBAL CUSTOM COMPONENTS
import { FlexBetween, FlexBox } from "components/flex-box"
import { H5, H6, Paragraph, Span } from "components/Typography"
import AccordionHeader from "components/accordion/accordion-header"
// TYPE
import { ProductFilterKeys, ProductFilterValues, ProductFilters } from "./types"
import { Slider, RadioGroup, FormControlLabel, Radio } from "@mui/material"
import { useTranslation } from "react-i18next"

// ============================================================================
interface Props {
  filters?: ProductFilters
  changeFilters?: (key: ProductFilterKeys, values: ProductFilterValues) => void
  priceOptions?: { id: string; min?: number; max?: number; label: string }[]
}
// ============================================================================

export default function ProductFilterCard({
  filters,
  changeFilters,
  priceOptions = [],
}: Props) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(true)

  const handleChangePrice = (values: number[]) => {
    changeFilters("price", values)
  }

  const handleChangeColor = (value: string) => {
    const values = filters.color.includes(value)
      ? filters.color.filter((item) => item !== value)
      : [...filters.color, value]

    changeFilters("color", values)
  }

  const handleChangeBrand = (value: string) => {
    const values = filters.brand.includes(value)
      ? filters.brand.filter((item) => item !== value)
      : [...filters.brand, value]

    changeFilters("brand", values)
  }

  const handleChangeSales = (value: string) => {
    const values = filters.sales.includes(value)
      ? filters.sales.filter((item) => item !== value)
      : [...filters.sales, value]

    changeFilters("sales", values)
  }

  const handleChangeRating = (value: number) => {
    changeFilters("rating", value)
  }

  return (
    <div>
      {/* PRICE VARIANT FILTER (Radio from store settings) */}
      <H6 mb={2}>{t("Price Range")}</H6>
      {priceOptions.length ? (
        <RadioGroup
          value={(() => {
            const [min, max] = filters.price

            if (filters.price?.length === 1) return `gte-${min}`
            if (filters.price?.length === 2) {
              if (min === 0) return `lt-${max}`
              return `range-${min}-${max}`
            }
            return ""
          })()}
          onChange={(_, val) => {
            const valStr = val as string
            const matchGte = /^gte-(\d+)$/i.exec(valStr)
            const matchLt = /^lt-(\d+)$/i.exec(valStr)
            const matchRange = /^range-(\d+)-(\d+)$/i.exec(valStr)
            if (matchGte) {
              changeFilters("price", [Number(matchGte[1])])
            } else if (matchLt) {
              changeFilters("price", [0, Number(matchLt[1])])
            } else if (matchRange) {
              changeFilters("price", [
                Number(matchRange[1]),
                Number(matchRange[2]),
              ])
            } else {
              changeFilters("price", [])
            }
          }}
        >
          {priceOptions.map((opt) => (
            <FormControlLabel
              key={opt.id}
              value={
                opt.min != null && opt.max == null
                  ? `gte-${opt.min}`
                  : opt.min === 0
                    ? `lt-${opt.max}`
                    : `range-${opt.min}-${opt.max}`
              }
              control={<Radio size="small" />}
              label={t(opt.label)}
            />
          ))}
        </RadioGroup>
      ) : (
        <Paragraph color="grey.600">
          {t("No price options configured.")}
        </Paragraph>
      )}
    </div>
  )
}
