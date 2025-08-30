import Box from "@mui/material/Box";
// GLOBAL CUSTOM COMPONENTS
import FlexBox from "components/flex-box/flex-box";
import { Paragraph } from "components/Typography";
// CUSTOM UTILS LIBRARY FUNCTIONS
import { formatCurrency } from "lib";

// ==============================================================
type Props = { price: number; listPrice: number };
// ==============================================================

export default function ProductPrice({ listPrice, price }: Props) {
  return (
    <FlexBox alignItems="center" gap={1} mt={0.5}>
      <Paragraph fontWeight={600} color={`${listPrice ? 'success.main' : 'text.main'}`}>
        {formatCurrency(price)}
      </Paragraph>

      {listPrice ? (
        <Box component="del" fontWeight={600} color="grey.600">
          {formatCurrency(listPrice)}
        </Box>
      ) : null}
    </FlexBox>
  );
}
