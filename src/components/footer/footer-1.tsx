import { useEffect, useState } from "react"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Container from "@mui/material/Container"
// LOCAL CUSTOM COMPONENT
import LogoSection from "./components/logo"
import AboutLinks from "./components/about-links"
import SocialLinks from "./components/social-links"
import CustomerCareLinks from "./components/customer-care-links"
import HotlineInfo from "./components/hotline-info"
import PaymentMethods from "./components/payment-methods"
import ShippingMethods from "./components/shipping-methods"
// GLOBAL CUSTOM COMPONENTS
import { H4, H6, Paragraph } from "components/Typography"
// STYLED COMPONENTS
import { Heading } from "./styles"
import { useTranslation } from "react-i18next"
// API
import { storeSettingsApi } from "lib/api"

export default function Footer1() {
  const { t } = useTranslation()
  const [storeSettings, setStoreSettings] = useState<{
    shopName: string
    footerAddress: string
  }>({
    shopName: "",
    footerAddress: "",
  })

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const response = await storeSettingsApi.getByKeys([
          "shop-name",
          "footer-address",
        ])
        const settings = response.data.items || []

        const shopNameSetting = settings.find(
          (item: any) => item.key === "shop-name"
        )
        const addressSetting = settings.find(
          (item: any) => item.key === "footer-address"
        )

        setStoreSettings({
          shopName: shopNameSetting?.value || "",
          footerAddress: addressSetting?.value || "",
        })
      } catch (error) {
        console.error("Failed to fetch store settings:", error)
      }
    }

    fetchStoreSettings()
  }, [])
  return (
    <Box component="footer" bgcolor="#fefde8" mb={{ sm: 0, xs: 7 }}>
      <Box
        component={Container}
        color="white"
        overflow="hidden"
        py={{ sm: 10, xs: 4 }}
      >
        <Grid container spacing={3}>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <LogoSection />
          </Grid>

          <Grid item lg={2} md={6} sm={6} xs={12}>
            <PaymentMethods />
          </Grid>

          <Grid item lg={3} md={6} sm={6} xs={12}>
            <ShippingMethods />
          </Grid>

          <Grid item lg={3} md={6} sm={6} xs={12}>
            {/* CONTACT INFORMATION */}
            <H4 color="grey.900" mb={2}>
              {t("Contact Us")}
            </H4>

            <SocialLinks />

            <HotlineInfo />

            {storeSettings.footerAddress && (
              <Box mt={2}>
                <H6 color="grey.900" mb={1}>
                  {t("Address")}
                </H6>
                <Paragraph color="grey.600">
                  {storeSettings.footerAddress}
                </Paragraph>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
      <Box
        component="footer"
        sx={{ bgcolor: "grey.800", color: "grey.500", py: 0.5 }}
      >
        <Container sx={{ textAlign: "center", fontSize: 12 }}>
          © {new Date().getFullYear()} {storeSettings.shopName || ""} All
          Rights Reserved
        </Container>
      </Box>
    </Box>
  )
}
