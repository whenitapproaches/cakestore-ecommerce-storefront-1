import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import { H4, H6 } from "components/Typography"
import Image from "components/BazaarImage"
import { useTranslation } from "react-i18next"
import Typography from "@mui/material/Typography"
import { QrCode } from "@mui/icons-material"
import DeliveryBox from "icons/DeliveryBox"

export default function PaymentMethods() {
  const { t } = useTranslation()

  const paymentMethods = [
    {
      name: "COD",
      alt: "Cash on Delivery",
      component: () => (
        <Box
          sx={{ userSelect: "none" }}
          bgcolor={"secondary.main"}
          width={"100%"}
          height={"100%"}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <DeliveryBox sx={{ fontSize: 13 }} />
          <Typography
            ml={0.25}
            fontSize={11}
            color="white"
            fontStyle={"italic"}
            letterSpacing={1}
            fontWeight={900}
          >
            COD
          </Typography>
        </Box>
      ),
    },
    {
      name: "QR",
      alt: "QR",
      component: () => (
        <Box
          sx={{ userSelect: "none" }}
          bgcolor={"primary.main"}
          width={"100%"}
          height={"100%"}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <QrCode sx={{ fontSize: 19 }} />
          <Typography
            fontSize={15}
            color="white"
            fontStyle={"italic"}
            letterSpacing={1}
            fontWeight={900}
          >
            QR
          </Typography>
        </Box>
      ),
    },
  ]

  return (
    <Box>
      <H4 color="grey.900" mb={2}>
        {t("Payment Methods")}
      </H4>

      <Grid container spacing={1}>
        {paymentMethods.map((method) => (
          <Grid item key={method.name}>
            <Box
              sx={{
                border: "1px solid",
                borderColor: "grey.300",
                borderRadius: 1,
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "white",
                aspectRatio: "1",
                "&:hover": {
                  borderColor: "grey.400",
                  boxShadow: 1,
                },
                width: "48px",
                height: "48px",
                padding: 0,
              }}
            >
              {method.component()}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
