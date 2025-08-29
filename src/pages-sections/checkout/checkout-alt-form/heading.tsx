import { BoxProps } from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import { FlexBox } from "components/flex-box";
import { Paragraph } from "components/Typography";

// ==============================================================
interface Props extends BoxProps {
  title: string;
  number: number;
}
// ==============================================================

export default function Heading({ number, title, ...props }: Props) {
  // AVATAR STYLES
  const STYLES = {
    width: 32,
    height: 32,
    color: "primary.text",
    backgroundColor: "primary.main"
  };

  return (
    <FlexBox gap={1.5} alignItems="center" mb={3.5} {...props}>
      <Avatar alt={title} sx={STYLES}>
        {number}
      </Avatar>
      <Paragraph fontSize={20}>{title}</Paragraph>
    </FlexBox>
  );
}
