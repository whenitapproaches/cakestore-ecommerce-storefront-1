"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
// CUSTOM GLOBAL COMPONENTS
import { FlexBox, FlexRowCenter } from "components/flex-box";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <FlexRowCenter px={2} minHeight="100vh" flexDirection="column">
      <Box maxWidth={320} width="100%" mb={3}>
        <Image
          alt="Not Found!"
          src={require("../../../public/assets/images/illustrations/404.svg")}
          style={{ width: "100%", height: "auto" }}
        />
      </Box>

      <FlexBox flexWrap="wrap" gap={2}>
        <Button variant="contained" color="primary" onClick={() => router.push("/")}>
          {t("Go to Home")}
        </Button>
      </FlexBox>
    </FlexRowCenter>
  );
}
