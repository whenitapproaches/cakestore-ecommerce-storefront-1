import { MouseEvent, useCallback, useEffect, useState } from "react";
import styled from "@mui/material/styles/styled";
import CategoryList from "./category-list";

// STYLED COMPONENT
const Wrapper = styled("div", {
  shouldForwardProp: (prop) => prop !== "open"
})<{ open: boolean }>(({ open, theme: { direction } }) => ({
  cursor: "pointer",
  position: "relative",
  "& .dropdown-icon": {
    transition: "all 250ms ease-in-out",
    transform: `rotate(${open ? (direction === "rtl" ? "-90deg" : "90deg") : "0deg"})`
  }
}));

// ===========================================================
type Props = { render: (handler: Function) => JSX.Element };
// ===========================================================

export default function CategoryMenu({ render }: Props) {
  const [open, setOpen] = useState(false);

  const onClick = (e: MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setOpen((open) => !open);
  };

  const handleDocumentClick = useCallback(() => setOpen(false), []);

  useEffect(() => {
    window.addEventListener("click", handleDocumentClick);
    return () => window.removeEventListener("click", handleDocumentClick);
  }, [handleDocumentClick]);

  return (
    <Wrapper open={open}>
      {render(onClick)}

      <CategoryList open={open} />
    </Wrapper>
  );
}
