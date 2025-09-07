import Link from "next/link"
import MenuItem from "@mui/material/MenuItem"
import Divider from "@mui/material/Divider"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
// STYLED COMPONENT
import { SearchResultCard } from "../styles"
import { formatCurrency } from "lib"

// ==============================================================
type Props = { results: any[]; search?: string }
// ==============================================================

export default function SearchResult({ results, search }: Props) {
  return (
    <SearchResultCard elevation={2}>
      {results.map((p) => (
        <Link href={`/products/${p.slug}`} key={p.id}>
          <MenuItem key={p.id} sx={{ py: 1 }}>
            <Box display="flex" alignItems="center" gap={1}>
              {p.asset?.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.asset.preview}
                  alt={p.name}
                  width={40}
                  height={40}
                  style={{ objectFit: "cover", borderRadius: 4 }}
                />
              ) : null}
              <Box>
                <Typography variant="body2" noWrap>
                  {p.name}
                </Typography>
                {p.price ? (
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(p.price)}
                  </Typography>
                ) : null}
              </Box>
            </Box>
          </MenuItem>
        </Link>
      ))}

      <Divider />
      <Link href={`/shop?search=${encodeURIComponent(search || "")}`}>
        <MenuItem sx={{ justifyContent: "center", fontWeight: 600 }}>
          Xem tất cả &quot;{search}&quot;
        </MenuItem>
      </Link>
    </SearchResultCard>
  )
}
