"use client";

import { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import styled from "@mui/material/styles/styled";
import Image from "next/image";
// GLOBAL CUSTOM COMPONENT
import FlexBox from "components/flex-box/flex-box";
// API
import { storeSettingsApi } from "lib/api";

// STYLED COMPONENTS
const StyledIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "variant"
})<Props>(({ variant, theme }) => ({
  margin: 4,
  fontSize: 12,
  padding: "10px",
  borderRadius: "50%",
  width: "60px",
  height: "60px",
  ...(variant === "light" && {
    backgroundColor: "rgba(0,0,0,0.2)"
  }),
  ...(variant === "dark" && {
    backgroundColor: theme.palette.grey[700],
    ":hover": { backgroundColor: theme.palette.grey[800] }
  }),
  ".icon": { color: "white" }
}));

// ==============================================================
type Props = { variant?: "light" | "dark" };
// ==============================================================

export default function SocialLinks({ variant = "light" }: Props) {
  const [socialLinks, setSocialLinks] = useState<{
    facebook: string;
    youtube: string;
    zalo: string;
  }>({
    facebook: "",
    youtube: "",
    zalo: "",
  });

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await storeSettingsApi.getByKeys(["social-facebook", "social-youtube", "social-zalo"]);
        const settings: Record<string, string> = {};
        response.data.items?.forEach((item: any) => {
          settings[item.key] = item.value;
        });

        console.log(settings)
        
        setSocialLinks({
          facebook: settings["social-facebook"] || "",
          youtube: settings["social-youtube"] || "",
          zalo: settings["social-zalo"] || "",
        });
      } catch (error) {
        console.error("Failed to fetch social links:", error);
      }
    };

    fetchSocialLinks();
  }, []);

  const socialIconsData = [
    { name: "facebook", url: socialLinks.facebook, icon: "/assets/images/icons/facebook.png" },
    { name: "youtube", url: socialLinks.youtube, icon: "/assets/images/icons/youtube.png" },
    { name: "zalo", url: socialLinks.zalo, icon: "/assets/images/icons/zalo.png" },
  ];

  return (
    <FlexBox className="flex" mx={-0.625}>
      {socialIconsData.map(({ name, url, icon }, ind) => (
        url ? (
          <a href={url} target="_blank" rel="noreferrer noopener" key={ind}>
            <StyledIconButton variant={variant}>
              <Image
                src={icon}
                alt={name}
                width={40}
                height={40}
                className="icon"
              />
            </StyledIconButton>
          </a>
        ) : null
      ))}
    </FlexBox>
  );
}
