"use client"

import { useCallback, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import { Theme } from "@mui/material/styles"
import MenuItem from "@mui/material/MenuItem"
import TextField from "@mui/material/TextField"
import Container from "@mui/material/Container"
import IconButton from "@mui/material/IconButton"
import Chip from "@mui/material/Chip"
import useMediaQuery from "@mui/material/useMediaQuery"
// MUI ICON COMPONENTS
import Apps from "@mui/icons-material/Apps"
import ViewList from "@mui/icons-material/ViewList"
import FilterList from "@mui/icons-material/FilterList"
// Local CUSTOM COMPONENT
import ProductFilterCard from "../product-filter-card"
// GLOBAL CUSTOM COMPONENTS
import Sidenav from "components/side-nav"
import { H5, Paragraph } from "components/Typography"
import { FlexBetween, FlexBox } from "components/flex-box"
import ProductsGridView from "components/products-view/products-grid-view"
import ProductsListView from "components/products-view/products-list-view"
// TYPE
import {
  ProductFilterKeys,
  ProductFilterValues,
  ProductFilters,
} from "../types"
import Product from "models/Product.model"
import { useTranslation } from "react-i18next"
import { formatCurrency } from "lib"

const SORT_OPTIONS = [
  { key: "date", value: "date" },
  { key: "price", value: "price-asc" },
  { key: "price-desc", value: "price-desc" },
]

const initialFilters = {
  rating: 0,
  color: [],
  brand: [],
  sales: [],
  price: [],
}

interface ProductSearchPageViewProps {
  products?: Product[]
  total?: number
  priceFilterSetting?: { key: string; value: string } | null
  initialFilters?: {
    page: number
    limit: number
    sortBy: string
    view: string
    filters: ProductFilters
    search: string
  }
}

export default function ProductSearchPageView({
  products,
  total,
  priceFilterSetting,
  initialFilters,
}: ProductSearchPageViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [view, setView] = useState(initialFilters?.view || "grid")
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || "date")
  const [filters, setFilters] = useState<ProductFilters>(
    initialFilters?.filters || {
      rating: 0,
      color: [],
      brand: [],
      sales: [],
      price: [],
    }
  )
  const [page, setPage] = useState(initialFilters?.page || 1)
  const [limit] = useState(initialFilters?.limit || 12)
  const [search, setSearch] = useState(initialFilters?.search || "")

  const downMd = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"))

  const { t } = useTranslation()

  // Sync state with URL changes (for browser back/forward)
  useEffect(() => {
    if (initialFilters) {
      setView(initialFilters.view)
      setSortBy(initialFilters.sortBy)
      setFilters(initialFilters.filters)
      setPage(initialFilters.page)
      setSearch(initialFilters.search)
    }
  }, [initialFilters])

  // Function to update URL with current state
  const updateURL = useCallback(
    (newParams: {
      page?: number
      sortBy?: string
      view?: string
      filters?: ProductFilters
      search?: string
    }) => {
      const params = new URLSearchParams(searchParams.toString())

      // Update page
      if (newParams.page) {
        params.set("page", newParams.page.toString())
      }

      // Update sortBy
      if (newParams.sortBy) {
        params.set("sortBy", newParams.sortBy)
      }

      // Update view
      if (newParams.view) {
        params.set("view", newParams.view)
      }

      // Update search
      if (newParams.search !== undefined) {
        if (newParams.search) {
          params.set("search", newParams.search)
        } else {
          params.delete("search")
        }
      }

      // Update filters
      if (newParams.filters) {
        const filters = newParams.filters

        // Brand filter
        if (filters.brand?.length) {
          params.set("brand", filters.brand.join(","))
        } else {
          params.delete("brand")
        }

        // Color filter
        if (filters.color?.length) {
          params.set("color", filters.color.join(","))
        } else {
          params.delete("color")
        }

        // Sales filter
        if (filters.sales?.length) {
          params.set("sales", filters.sales.join(","))
        } else {
          params.delete("sales")
        }

        // Price filter (supports one- or two-number formats)
        if (filters.price?.length) {
          params.set("price", filters.price.join(","))
        } else {
          params.delete("price")
        }

        // Rating filter
        if (filters.rating && filters.rating > 0) {
          params.set("rating", filters.rating.toString())
        } else {
          params.delete("rating")
        }
      }

      // Navigate to the new URL
      router.push(`/shop?${params.toString()}`)
    },
    [router, searchParams]
  )

  const handleChangeFilters = useCallback(
    (key: ProductFilterKeys, values: ProductFilterValues) => {
      const newFilters = { ...filters, [key]: values }
      setFilters(newFilters)
      setPage(1) // Reset to first page when filters change
      updateURL({ page: 1, filters: newFilters })
    },
    [filters, updateURL]
  )

  const handleChangeSortBy = useCallback(
    (v: string) => {
      setSortBy(v)
      setPage(1) // Reset to first page when sort changes
      updateURL({ page: 1, sortBy: v })
    },
    [updateURL]
  )

  const toggleView = useCallback(
    (v: string) => () => {
      setView(v)
      updateURL({ view: v })
    },
    [updateURL]
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage)
      updateURL({ page: newPage })
    },
    [updateURL]
  )

  const clearSearch = useCallback(() => {
    setSearch("")
    setPage(1)
    updateURL({ search: "", page: 1 })
  }, [updateURL])

  const clearPrice = useCallback(() => {
    handleChangeFilters("price", [])
  }, [handleChangeFilters])

  return (
    <div className="bg-white pt-2 pb-4">
      <Container>
        {/* FILTER ACTION AREA */}
        <FlexBetween flexWrap="wrap" gap={2} mb={2}>
          <div>
            {search && (
              <div>
                <H5 lineHeight={1} mb={1}>
                  {t("Searching for")} &quot; {search} &quot;
                </H5>
                <Paragraph color="grey.600">
                  {total} {t("results found")}
                </Paragraph>
              </div>
            )}
          </div>

          <FlexBox alignItems="center" columnGap={4} flexWrap="wrap">
            <FlexBox alignItems="center" gap={1} flex="1 1 0">
              <Paragraph color="grey.600" whiteSpace="pre">
                {t("Sort by")}:
              </Paragraph>

              <TextField
                select
                fullWidth
                size="small"
                value={sortBy}
                variant="outlined"
                placeholder="Sort by"
                onChange={(e) => handleChangeSortBy(e.target.value)}
                sx={{ flex: "1 1 0", minWidth: "150px" }}
              >
                {SORT_OPTIONS.map((item) => (
                  <MenuItem value={item.value} key={item.value}>
                    {t(`sort.${item.key}`)}
                  </MenuItem>
                ))}
              </TextField>
            </FlexBox>

            <FlexBox alignItems="center" my="0.25rem">
              <Paragraph color="grey.600" mr={1}>
                {t("View")}:
              </Paragraph>

              <IconButton onClick={toggleView("grid")}>
                <Apps
                  fontSize="small"
                  color={view === "grid" ? "primary" : "inherit"}
                />
              </IconButton>

              <IconButton onClick={toggleView("list")}>
                <ViewList
                  fontSize="small"
                  color={view === "list" ? "primary" : "inherit"}
                />
              </IconButton>

              {/* SHOW IN THE SMALL DEVICE */}
              {downMd && (
                <Sidenav
                  handler={(close) => (
                    <IconButton onClick={close}>
                      <FilterList fontSize="small" />
                    </IconButton>
                  )}
                >
                  <Box px={3} py={2}>
                    <ProductFilterCard
                      filters={filters}
                      changeFilters={handleChangeFilters}
                      priceOptions={(() => {
                        const raw = priceFilterSetting?.value || ""
                        if (!raw) return []
                        return raw.split("|").map((segment) => {
                          const parts = segment.split(",").map((p) => p.trim())

                          if (parts.length === 1) {
                            const min = Number(parts[0])
                            return {
                              id: `gte-${min}`,
                              min,
                              label: `${formatCurrency(min, true)}+`,
                            }
                          }

                          const min = Number(parts[0])
                          const max = Number(parts[1])
                          if (min === 0) {
                            return {
                              id: `lt-${max}`,
                              min: 0,
                              max,
                              label: `< ${formatCurrency(max, true)}`,
                            }
                          }

                          return {
                            id: `range-${min}-${max}`,
                            min,
                            max,
                            label: `${formatCurrency(min, true)} - ${formatCurrency(max, true)}`,
                          }
                        })
                      })()}
                    />
                  </Box>
                </Sidenav>
              )}
            </FlexBox>
          </FlexBox>
        </FlexBetween>

        {/* ACTIVE FILTER TAGS */}
        <FlexBox gap={1} flexWrap="wrap" mb={2}>
          {search ? (
            <Chip
              size="small"
              variant="outlined"
              label={`${t("Search")}: "${search}"`}
              onDelete={clearSearch}
            />
          ) : null}

          {filters.price?.length ? (
            <Chip
              size="small"
              variant="outlined"
              label={(() => {
                const [min, max] = filters.price
                if (filters.price.length === 1) return `${t("Price")}: ${formatCurrency(min, true)}+`
                if (filters.price.length === 2) {
                  if (min === 0) return `${t("Price")}: < ${formatCurrency(max, true)}`
                  return `${t("Price")}: ${formatCurrency(min, true)} - ${formatCurrency(max, true)}`
                }
                return `${t("Price")}`
              })()}
              onDelete={clearPrice}
            />
          ) : null}
        </FlexBox>

        <Grid container spacing={4}>
          <Grid
            item
            xl={2}
            md={3}
            sx={{ display: { md: "block", xs: "none" } }}
          >
            <ProductFilterCard
              filters={filters}
              changeFilters={handleChangeFilters}
              priceOptions={(() => {
                const raw = priceFilterSetting?.value || ""
                if (!raw) return []
                return raw.split("|").map((segment) => {
                  const parts = segment
                    .split(",")
                    .map((p) => p.trim())
                    .filter(Boolean)

                  if (parts.length === 1) {
                    const min = Number(parts[0])
                    return {
                      id: `gte-${min}`,
                      min,
                      label: `${formatCurrency(min, true)}+`,
                    }
                  }

                  const min = Number(parts[0])
                  const max = Number(parts[1])
                  if (min === 0) {
                    return {
                      id: `lt-${max}`,
                      min: 0,
                      max,
                      label: `< ${formatCurrency(max, true)}`,
                    }
                  }

                  return {
                    id: `range-${min}-${max}`,
                    min,
                    max,
                    label: `${formatCurrency(min, true)} - ${formatCurrency(max, true)}`,
                  }
                })
              })()}
            />
          </Grid>

          {/* PRODUCT VIEW AREA */}
          <Grid item xl={10} md={9} xs={12}>
            {view === "grid" ? (
              <ProductsGridView
                products={products || []}
                total={total || 0}
                page={page}
                limit={limit}
                onPageChange={handlePageChange}
              />
            ) : (
              <ProductsListView
                products={products || []}
                total={total || 0}
                page={page}
                limit={limit}
                onPageChange={handlePageChange}
              />
            )}
          </Grid>
        </Grid>
      </Container>
    </div>
  )
}
