"use client";

import { H3 } from "components/Typography";
import Box from "@mui/material/Box";
// TRANSLATION
import { useTranslation } from "react-i18next";

interface Props {
  description?: string;
}

export default function ProductDescription({ description }: Props) {
  const { t } = useTranslation();
  
  if (!description) {
    return (
      <div>
        <H3 mb={2}>Specification:</H3>
        <div>
          Brand: Beats <br />
          Model: S450 <br />
          Wireless Bluetooth Headset <br />
          FM Frequency Response: 87.5 – 108 MHz <br />
          Feature: FM Radio, Card Supported (Micro SD / TF) <br />
          Made in China <br />
        </div>
      </div>
    );
  }

  return (
    <div>
      <H3 mb={2}>{t("Description")}:</H3>
      <Box 
        dangerouslySetInnerHTML={{ __html: description }}
        sx={{
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            marginTop: 2,
            marginBottom: 1,
            fontWeight: 600,
          },
          '& p': {
            marginBottom: 1,
            lineHeight: 1.6,
          },
          '& ul, & ol': {
            marginBottom: 1,
            paddingLeft: 3,
          },
          '& li': {
            marginBottom: 0.5,
          },
          '& strong, & b': {
            fontWeight: 600,
          },
          '& em, & i': {
            fontStyle: 'italic',
          },
          '& a': {
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
        }}
      />
    </div>
  );
}
