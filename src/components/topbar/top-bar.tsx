import Link from "next/link"
import { useState, useEffect } from "react"
// MUI
import MenuItem from "@mui/material/MenuItem"
import IconButton from "@mui/material/IconButton"
import TouchRipple from "@mui/material/ButtonBase"
// TRANSLATION
import { useTranslation } from "react-i18next"
// MUI ICON COMPONENTS
import Add from "@mui/icons-material/Add"
import Remove from "@mui/icons-material/Remove"
import Twitter from "@mui/icons-material/Twitter"
import Facebook from "@mui/icons-material/Facebook"
import Instagram from "@mui/icons-material/Instagram"
import ExpandMore from "@mui/icons-material/ExpandMore"
// GLOBAL CUSTOM COMPONENTS
import { Span } from "components/Typography"
import BazaarMenu from "components/BazaarMenu"
import { FlexBetween, FlexBox } from "components/flex-box"
// STYLED COMPONENTS
import { StyledChip, StyledContainer, StyledRoot } from "./styles"
import ZaloIcon from "components/icons/zalo"
// API
import { storeSettingsApi } from "lib/api"

// ==============================================================
interface LanguageOption {
  [key: string]: { title: string; value: string }
}
// ==============================================================

// LANGUAGE OPTIONS
const languageOptions: LanguageOption = {
  vi: { title: "VI", value: "vi" },
}

const socialLinks = [
  { id: 1, Icon: Twitter, url: "#" },
  { id: 2, Icon: Facebook, url: "#" },
  { id: 3, Icon: Instagram, url: "#" },
  {
    id: 4,
    Icon: ZaloIcon,
    url: "",
  },
]

// ===========================================
type Props = { bgColor?: string }
// ===========================================

export default function Topbar({ bgColor }: Props) {
  const { i18n, t } = useTranslation()
  const [announcement, setAnnouncement] = useState<string>("")

  const handleChangeLanguage = (language: string) => {
    i18n.changeLanguage(language)
  }

  // Fetch announcement from store settings
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await storeSettingsApi.getByKeys("announcement")
        const announcementSetting = response.data.items?.find((item: any) => item.key === "announcement")
        if (announcementSetting?.value) {
          setAnnouncement(announcementSetting.value)
        }
      } catch (error) {
        console.error("Failed to fetch announcement:", error)
      }
    }

    fetchAnnouncement()
  }, [])

  const selectedLanguage = languageOptions[i18n.language]

  return (
    <StyledRoot bgColor={bgColor} expand={0}>
      <StyledContainer>
        <FlexBetween width="100%">
          <FlexBox alignItems="center" gap={1}>
            <Span className="title">{announcement}</Span>
          </FlexBox>
        </FlexBetween>
      </StyledContainer>
    </StyledRoot>
  )
}
