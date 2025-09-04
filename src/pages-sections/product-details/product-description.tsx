"use client";

import Box from "@mui/material/Box";
// TRANSLATION
import { useTranslation } from "react-i18next";

interface Props {
  description?: string;
}

export default function ProductDescription({ description }: Props) {
  const { t } = useTranslation();
  
  if (!description) {
    return <Box>{t("This Product Has No Description")}</Box>;
  }

  return (
    <div>
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
