import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import { H4, H6 } from "components/Typography"
import Image from "components/BazaarImage"
import { useTranslation } from "react-i18next"

export default function ShippingMethods() {
  const { t } = useTranslation()

  const shippingMethods = [
    {
      name: "Be Delivery",
      image: "/assets/images/logos/be.png",
      alt: "Be Delivery",
    },
    {
      name: "Grab",
      image: "/assets/images/logos/grab.png",
      alt: "Grab",
    },
    {
      name: "Viettel Post",
      image: "/assets/images/logos/viettelpost.png",
      alt: "Viettel Post",
    },
    {
      name: "SPX Express",
      image: "/assets/images/logos/spx-express.jpg",
      alt: "SPX Express",
    },
  ]

  return (
    <Box>
      <H4 color="grey.900" mb={2}>
        {t("Shipping Methods")}
      </H4>

      <Grid container spacing={1}>
        {shippingMethods.map((method) => (
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
                width: "100%",
                aspectRatio: "1",
                "&:hover": {
                  borderColor: "grey.400",
                  boxShadow: 1,
                },
                maxWidth: "48px",
                padding: 0,
              }}
            >
              <Image
                src={method.image}
                alt={method.alt}
                sx={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
