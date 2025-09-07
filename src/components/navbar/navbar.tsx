import NavigationList from "./nav-list"
// STYLED COMPONENTS
import { NavBarWrapper, InnerContainer } from "./styles"
// DATA TYPES

// ==========================================================
interface Props {
  border?: number
  elevation?: number
}
// ==========================================================

export default function Navbar({
  border,
  elevation = 2,
}: Props) {
  return (
    <NavBarWrapper hoverEffect={false} elevation={elevation} border={border}>
      <InnerContainer sx={{ justifyContent: "center" }}>
        <NavigationList />
      </InnerContainer>
    </NavBarWrapper>
  )
}
