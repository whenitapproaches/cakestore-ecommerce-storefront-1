import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import TextField from "@mui/material/TextField"
// LOCAL CUSTOM HOOKS
import useSearch from "./hooks/use-search"
// LOCAL CUSTOM COMPONENT
import SearchResult from "./components/search-result"
// STYLED COMPONENT
import { SearchOutlinedIcon } from "./styles"
import { useTranslation } from "react-i18next"

export default function SearchInput() {
  const { handleSearch, parentRef, resultList, searchText, clearSearch } =
    useSearch()
  const { t } = useTranslation()

  const INPUT_PROPS = {
    sx: {
      border: 0,
      height: 44,
      paddingRight: 0,
      overflow: "hidden",
      backgroundColor: "grey.200",
      "& .MuiOutlinedInput-notchedOutline": { border: 0 },
    },
    endAdornment: (
      <Box display="flex" alignItems="center">
        {searchText ? (
          <IconButton size="small" onClick={clearSearch} sx={{ mr: 0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        ) : null}
        <Button
          color="primary"
          disableElevation
          variant="contained"
          sx={{ px: "3rem", height: "100%", borderRadius: "0 4px 4px 0" }}
        >
          Search
        </Button>
      </Box>
    ),
    startAdornment: <SearchOutlinedIcon fontSize="small" />,
  }

  return (
    <Box
      position="relative"
      flex="1 1 0"
      maxWidth="670px"
      mx="auto"
      {...{ ref: parentRef }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder={`${t("Search")}...`}
        value={searchText}
        onChange={handleSearch}
        InputProps={INPUT_PROPS}
      />

      {/* SHOW SEARCH RESULT LIST */}
      {resultList.length > 0 ? (
        <SearchResult results={resultList} search={searchText} />
      ) : null}
    </Box>
  )
}
