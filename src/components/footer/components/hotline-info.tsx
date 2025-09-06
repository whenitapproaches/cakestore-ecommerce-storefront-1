"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import styled from "@mui/material/styles/styled";
import PhoneIcon from "@mui/icons-material/Phone";
// GLOBAL CUSTOM COMPONENT
import { Paragraph } from "components/Typography";
import { FlexBox } from "components/flex-box";
// API
import { storeSettingsApi } from "lib/api";

// STYLED COMPONENTS
const HotlineContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "16px 0",
  borderTop: `1px solid ${theme.palette.grey[700]}`,
  marginTop: "16px",
}));

const PhoneIconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.main,
  color: "white",
}));

const HotlineContent = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
}));

const HotlineTitle = styled(Paragraph)(({ theme }) => ({
  color: "white",
  fontSize: "14px",
  fontWeight: 600,
  margin: 0,
}));

const HotlineNumber = styled(Paragraph)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: "18px",
  fontWeight: 700,
  margin: 0,
}));

const HotlineSubtitle = styled(Paragraph)(({ theme }) => ({
  color: theme.palette.grey[400],
  fontSize: "12px",
  margin: 0,
}));

// ==============================================================
export default function HotlineInfo() {
  const [hotlineNumber, setHotlineNumber] = useState<string>("");
  const [hotlineDescription, setHotlineDescription] = useState<string>("");

  useEffect(() => {
    const fetchHotlineData = async () => {
      try {
        const response = await storeSettingsApi.getByKeys(["hotline-phone-number", "hotline-description"]);
        const settings: Record<string, string> = {};
        response.data.items?.forEach((item: any) => {
          settings[item.key] = item.value;
        });
        
        if (settings["hotline-phone-number"]) {
          setHotlineNumber(settings["hotline-phone-number"]);
        }
        if (settings["hotline-description"]) {
          setHotlineDescription(settings["hotline-description"]);
        }
      } catch (error) {
        console.error("Failed to fetch hotline data:", error);
      }
    };

    fetchHotlineData();
  }, []);

  if (!hotlineNumber) {
    return null;
  }

  return (
    <HotlineContainer>
      <PhoneIconWrapper>
        <PhoneIcon fontSize="small" />
      </PhoneIconWrapper>
      <HotlineContent>
        <HotlineTitle>Hotline chăm sóc khách hàng</HotlineTitle>
        <HotlineNumber>{hotlineNumber}</HotlineNumber>
        <HotlineSubtitle>{hotlineDescription || "Thứ Hai – Thứ Sáu (8h-18h)"}</HotlineSubtitle>
      </HotlineContent>
    </HotlineContainer>
  );
}
