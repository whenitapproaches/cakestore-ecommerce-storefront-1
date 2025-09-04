import Image from "next/image";
// GLOBAL CUSTOM COMPONENTS
import { FlexBox } from "components/flex-box";
import { Paragraph } from "components/Typography";
import { useTranslation } from "react-i18next";

export default function EmptyCartView() {
  const { t } = useTranslation();
  return (
    <FlexBox
      alignItems="center"
      flexDirection="column"
      justifyContent="center"
      height="calc(100% - 74px)">
      <Image width={90} height={100} alt="banner" src="/assets/images/logos/shopping-bag.svg" />

      <Paragraph fontSize={15} mt={2} color="grey.600" textAlign="center" maxWidth={200}>
        {t("Your shopping bag is empty")}
      </Paragraph>
    </FlexBox>
  );
}
