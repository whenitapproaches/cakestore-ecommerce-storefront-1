import { Fragment } from "react";
import Drawer from "@mui/material/Drawer";
import { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
// GLOBAL CUSTOM COMPONENTS
import { MiniCart } from "components/mini-cart";

// ==============================================================
interface Props {
  sidenavOpen: boolean;
  toggleSidenav: () => void;
}
// ==============================================================

export default function DialogDrawer(props: Props) {
  const { sidenavOpen, toggleSidenav } = props;

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("xs"));

  return (
    <Fragment>
      <Drawer open={sidenavOpen} anchor="right" onClose={toggleSidenav} sx={{ zIndex: 9999 }}>
        <MiniCart toggleSidenav={toggleSidenav} />
      </Drawer>
    </Fragment>
  );
}
