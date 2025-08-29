// GLOBAL CUSTOM COMPONENTS
import { Paragraph } from "components/Typography";
import { FlexBetween } from "components/flex-box";
// CUSTOM UTILS LIBRARY FUNCTION
import { currency } from "lib";

// ==============================================================
interface Props {
  title: string;
  value?: number;
  mb?: number;
  color?: string;
}
// ==============================================================

export default function ListItem({ title, value, mb = 0.5, color = "grey.600" }: Props) {
  return (
    <FlexBetween mb={mb}>
      <Paragraph color={color}>{title}:</Paragraph>
      <Paragraph fontWeight="700">{value ? currency(value) : "-"}</Paragraph>
    </FlexBetween>
  );
}
