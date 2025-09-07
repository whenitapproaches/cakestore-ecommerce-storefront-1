import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMore from "@mui/icons-material/ExpandMore";
// GLOBAL CUSTOM COMPONENTS
import { H6 } from "components/Typography";
import { NavLink } from "components/nav-link";
import { useTranslation } from "react-i18next";

const ACCORDION_STYLES = {
  "&:not(:last-child)": { borderBottom: 0 },
  "&:before": { display: "none" },
};

const ACCORDION_SUMMARY_STYLES = {
  padding: 0,
  minHeight: 48,
  boxShadow: "none",
  "& .Mui-expanded": { color: "primary.main", margin: 0 },
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    margin: 0,
    "& .MuiSvgIcon-root": { color: "primary.main" },
  },
};

export const RenderLevels = ({ data, handleClose }: { data: any[], handleClose: () => void }) => {
  const { t } = useTranslation()

  return (
    <>
      {data.map((item: any, index: number) => {
    if (item.child) {
      return (
        <Accordion square key={index} elevation={0} disableGutters sx={ACCORDION_STYLES}>
          <AccordionSummary expandIcon={<ExpandMore />} sx={ACCORDION_SUMMARY_STYLES}>
            <H6>{item.title}</H6>
          </AccordionSummary>

          <Box mx={2}><RenderLevels data={item.child} handleClose={handleClose} /></Box>
        </Accordion>
      );
    }

    if (item.extLink) {
      return (
        <H6 key={index} py={1}>
          <NavLink href={item.url}>{t(item.title)}</NavLink>
        </H6>
      );
    }

    return (
      <Box key={index} py={1}>
        <NavLink href={item.url} onClick={handleClose}>
          {t(item.title)}
        </NavLink>
      </Box>
    );
      })}
    </>
  );
};
