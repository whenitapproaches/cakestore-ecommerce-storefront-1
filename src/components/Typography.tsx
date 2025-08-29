"use client";

import Box, { BoxProps } from "@mui/material/Box";
import styled from "@mui/material/styles/styled";
import clsx from "clsx";

// ==============================================================
type Ellipsis = { ellipsis: number };
interface Props extends BoxProps {
  ellipsis?: boolean;
}
// ==============================================================

const StyledBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "ellipsis"
})<Ellipsis>(({ ellipsis }) => ({
  ...(ellipsis && { overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" })
}));

export function H1(props: Props) {
  const { ellipsis, children, className, ...others } = props;

  return (
    <StyledBox
      fontSize={30}
      component="h1"
      fontWeight={700}
      ellipsis={ellipsis ? 1 : 0}
      {...(className && { className: clsx({ [className]: true }) })}
      {...others}>
      {children}
    </StyledBox>
  );
}

export function H2(props: Props) {
  const { ellipsis, children, className, ...others } = props;

  return (
    <StyledBox
      fontSize={25}
      component="h2"
      fontWeight={700}
      ellipsis={ellipsis ? 1 : 0}
      {...(className && { className: clsx({ [className]: true }) })}
      {...others}>
      {children}
    </StyledBox>
  );
}

export function H3(props: Props) {
  const { ellipsis, children, className, ...others } = props;

  return (
    <StyledBox
      fontSize={20}
      component="h3"
      fontWeight={700}
      ellipsis={ellipsis ? 1 : 0}
      {...(className && { className: clsx({ [className]: true }) })}
      {...others}>
      {children}
    </StyledBox>
  );
}

export function H4(props: Props) {
  const { ellipsis, children, className, ...others } = props;

  return (
    <StyledBox
      fontSize={17}
      component="h4"
      fontWeight={600}
      ellipsis={ellipsis ? 1 : 0}
      {...(className && { className: clsx({ [className]: true }) })}
      {...others}>
      {children}
    </StyledBox>
  );
}

export function H5(props: Props) {
  const { ellipsis, children, className, ...others } = props;

  return (
    <StyledBox
      fontSize={16}
      component="h5"
      lineHeight={1}
      fontWeight={600}
      ellipsis={ellipsis ? 1 : 0}
      {...(className && { className: clsx({ [className]: true }) })}
      {...others}>
      {children}
    </StyledBox>
  );
}

export function H6(props: Props) {
  const { ellipsis, children, className, ...others } = props;

  return (
    <StyledBox
      fontSize={14}
      component="h6"
      fontWeight={600}
      ellipsis={ellipsis ? 1 : 0}
      {...(className && { className: clsx({ [className]: true }) })}
      {...others}>
      {children}
    </StyledBox>
  );
}

export function Paragraph(props: Props) {
  const { ellipsis, children, className, ...others } = props;

  return (
    <StyledBox
      fontSize={14}
      component="p"
      fontWeight={400}
      ellipsis={ellipsis ? 1 : 0}
      {...(className && { className: clsx({ [className]: true }) })}
      {...others}>
      {children}
    </StyledBox>
  );
}

export function Small(props: Props) {
  const { ellipsis = false, children, className, ...others } = props;

  return (
    <StyledBox
      fontSize={12}
      fontWeight={400}
      component="small"
      ellipsis={ellipsis ? 1 : 0}
      {...(className && { className: clsx({ [className]: true }) })}
      {...others}>
      {children}
    </StyledBox>
  );
}

export function Span(props: Props) {
  const { ellipsis = false, children, className, ...others } = props;

  return (
    <StyledBox
      component="span"
      ellipsis={ellipsis ? 1 : 0}
      {...(className && { className: clsx({ [className]: true }) })}
      {...others}>
      {children}
    </StyledBox>
  );
}

export function Tiny(props: Props) {
  const { ellipsis = false, children, className, ...others } = props;

  return (
    <StyledBox
      component="small"
      fontSize={10}
      fontWeight={400}
      ellipsis={ellipsis ? 1 : 0}
      {...(className && { className: clsx({ [className]: true }) })}
      {...others}>
      {children}
    </StyledBox>
  );
}
