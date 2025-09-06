"use client";

import Badge from "@mui/material/Badge";
import { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
// CUSTOM ICON COMPONENTS
import Home from "icons/Home";
import CategoryOutlined from "icons/CategoryOutline";
import ShoppingBagOutlined from "icons/ShoppingBagOutlined";
// GLOBAL CUSTOM HOOK
import useCart from "hooks/useCart";
// STYLED COMPONENTS
import { iconStyle, StyledNavLink, Wrapper } from "./styles";
import { useTranslation } from "react-i18next";

export default function MobileNavigationBar() {
  const { getCartItemCount } = useCart();
  const itemCount = getCartItemCount();
  const DOWN_900 = useMediaQuery((theme: Theme) => theme.breakpoints.down(900));
  const { t } = useTranslation();
  if (DOWN_900) {
    return (
      <Wrapper>
        {list.map(({ Icon, href, title }) => (
          <StyledNavLink href={href} key={title}>
            {title === "Cart" ? (
              <Badge badgeContent={itemCount} color="primary">
                <Icon fontSize="small" sx={iconStyle} />
              </Badge>
            ) : (
              <Icon sx={iconStyle} fontSize="small" />
            )}

            {t(title)}
          </StyledNavLink>
        ))}
      </Wrapper>
    );
  }

  return null;
}

const list = [
  { title: "Shop", Icon: Home, href: "/shop" },
  { title: "Cart", Icon: ShoppingBagOutlined, href: "/cart" },
];
