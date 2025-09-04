import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
// LOCAL CUSTOM COMPONENTS
import SearchResult from "./components/search-result";
import { useTranslation } from "react-i18next";
// LOCAL CUSTOM HOOKS
import useSearch from "./hooks/use-search";
// CUSTOM ICON COMPONENT
import Search from "icons/Search";

export default function SearchInputWithCategory() {
  const { parentRef, resultList, handleSearch } = useSearch();
  const { t } = useTranslation();

  const INPUT_PROPS = {
    sx: {
      border: 0,
      height: 44,
      padding: 0,
      overflow: "hidden",
      backgroundColor: "grey.200",
      "& .MuiOutlinedInput-notchedOutline": { border: 0 }
    },
    startAdornment: (
      <Box
        mr={2}
        px={2}
        display="grid"
        alignItems="center"
        justifyContent="center"
        borderRight="1px solid"
        borderColor="grey.400">
        <Search sx={{ fontSize: 17, color: "grey.600" }} />
      </Box>
    ),
  };

  return (
    <Box position="relative" flex="1 1 0" maxWidth="670px" mx="auto" {...{ ref: parentRef }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder={`${t("Search")}...`}
        onChange={handleSearch}
        InputProps={INPUT_PROPS}
      />

      {/* SHOW SEARCH RESULT LIST */}
      {resultList.length > 0 ? <SearchResult results={resultList} /> : null}
    </Box>
  );
}
