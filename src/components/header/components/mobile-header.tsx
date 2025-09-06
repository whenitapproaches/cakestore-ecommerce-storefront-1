import Link from "next/link";
import { Fragment } from "react";
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
// MUI ICON COMPONENT
import Clear from "@mui/icons-material/Clear";
// CUSTOM ICON COMPONENTS
import Icon from "icons";
// LOCAL CUSTOM COMPONENTS
// GLOBAL CUSTOM COMPONENTS
import Image from "components/BazaarImage";
import { Paragraph } from "components/Typography";
import { SearchInput } from "components/search-box";
import { MobileMenu } from "components/navbar/mobile-menu";
import { FlexBetween, FlexBox } from "components/flex-box";
// GLOBAL CUSTOM HOOK
import useCart from "hooks/useCart";
// LOCAL CUSTOM HOOK
import useHeader from "../hooks/use-header";

export default function MobileHeader() {
  const { getCartItemCount } = useCart();
  const itemCount = getCartItemCount();
  const { sidenavOpen, searchBarOpen, toggleSearchBar, toggleSidenav } = useHeader();

  const ICON_STYLE = { color: "grey.600", fontSize: 20 };

  return (
    <Fragment>
      <FlexBetween width="100%">
        {/* LEFT CONTENT - NAVIGATION ICON BUTTON */}
        <Box flex={1}>
          <MobileMenu />
        </Box>

        {/* MIDDLE CONTENT - LOGO */}
        <Link href="/">
          <Image height={44} src="/assets/images/bazaar-black-sm.svg" alt="logo" />
        </Link>

        {/* RIGHT CONTENT - CART, SEARCH BUTTON */}
        <FlexBox justifyContent="end" flex={1}>
          <IconButton onClick={toggleSearchBar}>
            <Icon.Search sx={ICON_STYLE} />
          </IconButton>

          <Badge badgeContent={itemCount} color="primary">
            <IconButton onClick={toggleSidenav}>
              <Icon.CartBag sx={ICON_STYLE} />
            </IconButton>
          </Badge>
        </FlexBox>
      </FlexBetween>

      {/* SEARCH FORM DRAWER */}
      <Drawer open={searchBarOpen} anchor="top" onClose={toggleSearchBar} sx={{ zIndex: 9999 }}>
        <Box width="auto" padding={2} height="100vh">
          <FlexBetween mb={1}>
            <Paragraph></Paragraph>

            <IconButton onClick={toggleSearchBar}>
              <Clear />
            </IconButton>
          </FlexBetween>

          {/* CATEGORY BASED SEARCH FORM */}
          <SearchInput />
        </Box>
      </Drawer>

      {/* CART SIDE BAR ONLY */}
      <Drawer open={sidenavOpen} anchor="right" onClose={toggleSidenav} sx={{ zIndex: 9999 }}>
        <Box width={{ xs: 310, sm: 350 }}>
          {/* The existing DialogDrawer used to host cart; use same MiniCart component if needed */}
        </Box>
      </Drawer>
    </Fragment>
  );
}
