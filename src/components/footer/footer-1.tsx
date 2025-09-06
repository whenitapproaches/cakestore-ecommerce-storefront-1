import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Container from "@mui/material/Container"
// LOCAL CUSTOM COMPONENT
import LogoSection from "./components/logo"
import AboutLinks from "./components/about-links"
import SocialLinks from "./components/social-links"
import CustomerCareLinks from "./components/customer-care-links"
import HotlineInfo from "./components/hotline-info"
// GLOBAL CUSTOM COMPONENTS
import { Paragraph } from "components/Typography"
// STYLED COMPONENTS
import { Heading } from "./styles"
import { useTranslation } from "react-i18next";

export default function Footer1() {
  const { t } = useTranslation();
  return (
    <Box component="footer" bgcolor="#222935" mb={{ sm: 0, xs: 7 }}>
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

          {/* ABOUT US LINKS */}
          <Grid item lg={2} md={6} sm={6} xs={12}>
            <AboutLinks />
          </Grid>

          {/* CUSTOMER CARE LINKS */}
          <Grid item lg={3} md={6} sm={6} xs={12}>
            <CustomerCareLinks />
          </Grid>

          {/* CONTACT & SOCIAL LINKS */}
          <Grid item lg={3} md={6} sm={6} xs={12}>
            {/* CONTACT INFORMATION */}
            <Heading>{t("Contact Us")}</Heading>

            {/* SOCIAL LINKS WITH ICON */}
            <SocialLinks />

            {/* HOTLINE INFORMATION */}
            <HotlineInfo />
          </Grid>
        </Grid>
      </Box>
      <Box
        component="footer"
        sx={{ bgcolor: "grey.900", color: "grey.500", py: 0.5 }}
      >
        <Container sx={{ textAlign: "center", fontSize: 12 }}>
          © {new Date().getFullYear()} All Rights Reserved
        </Container>
      </Box>
    </Box>
  )
}
