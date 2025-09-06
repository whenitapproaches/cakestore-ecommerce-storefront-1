import { Fragment } from "react"
// MUI
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import Avatar from "@mui/material/Avatar"
import Divider from "@mui/material/Divider"
import styled from "@mui/material/styles/styled"
import Done from "@mui/icons-material/Done"
import Timeline from "@mui/lab/Timeline"
import TimelineItem from "@mui/lab/TimelineItem"
import TimelineSeparator from "@mui/lab/TimelineSeparator"
import TimelineConnector from "@mui/lab/TimelineConnector"
import TimelineContent from "@mui/lab/TimelineContent"
import TimelineDot from "@mui/lab/TimelineDot"
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent"
// CUSTOM ICON COMPONENTS
import Delivery from "icons/Delivery"
import PackageBox from "icons/PackageBox"
import TruckFilled from "icons/TruckFilled"
// GLOBAL CUSTOM COMPONENTS
import { H5, Paragraph, Small } from "components/Typography"
import { FlexBetween, FlexBox } from "components/flex-box"
// UTILS
import { formatDatetime } from "utils/helpers"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
// I18N
import { useTranslation } from "react-i18next"

// STYLED COMPONENTS
const StyledFlexbox = styled(FlexBetween)(({ theme }) => ({
  flexWrap: "wrap",
  marginTop: "2rem",
  marginBottom: "2rem",
  [theme.breakpoints.down("sm")]: { flexDirection: "column" },
  "& .line": {
    height: 4,
    minWidth: 50,
    flex: "1 1 0",
    [theme.breakpoints.down("sm")]: { flex: "unset", height: 50, minWidth: 4 },
  },
}))

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  top: -5,
  right: -5,
  width: 22,
  height: 22,
  position: "absolute",
  bgcolor: theme.palette.grey[200],
  color: theme.palette.success.main,
}))

export default function OrderProgress({ order }: { order: any }) {
  const { t } = useTranslation()
  const ORDER_STATUS = "Shipping"
  const STEP_ICONS = [PackageBox, TruckFilled, Delivery]
  const ORDER_STATUS_LIST = ["Packaging", "Shipping", "Delivering", "Complete"]

  const statusIndex = ORDER_STATUS_LIST.indexOf(ORDER_STATUS)

  // Filter history entries for ORDER_STATE_TRANSITION only and specific states
  const allowedStates = [
    "ArrangingPayment",
    "PaymentSettled",
    "Fulfilled",
    "Shipped",
    "Delivered",
    "Cancelled",
  ]
  const historyEntries = Array.isArray(order?.history?.items)
    ? order.history.items.filter(
        (entry: any) =>
          entry.type === "ORDER_STATE_TRANSITION" &&
          allowedStates.includes(entry.data?.to)
      )
    : []

  // Sort by createdAt descending (newest first)
  const sortedHistory = [...historyEntries].sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const getStateDisplayName = (state: string) => {
    // Map internal states to user-friendly names
    const stateMap: { [key: string]: string } = {
      Created: t("Order Created"),
      AddingItems: t("Adding Items"),
      ArrangingPayment: t("Arranging Payment"),
      PaymentAuthorized: t("Payment Authorized"),
      PaymentSettled: t("Payment Settled"),
      PartiallyFulfilled: t("Partially Fulfilled"),
      Fulfilled: t("Fulfilled"),
      PartiallyShipped: t("Partially Shipped"),
      Shipped: t("Shipped"),
      PartiallyDelivered: t("Partially Delivered"),
      Delivered: t("Delivered"),
      Cancelled: t("Cancelled"),
    }
    return stateMap[state] || state
  }

  return (
    <Card sx={{ p: 3, mb: 4 }}>
      {/* Order History Timeline */}
      {sortedHistory.length > 0 && (
        <>
          <Box>
            <H5 mt={0} mb={2}>{t("Order History")}</H5>
            <Timeline position="right">
              {sortedHistory.map((entry: any, index: number) => {
                const toState = entry.data?.to
                const isCurrentState = index === 0 // First item is the most recent (current) state
                const relativeTime = formatDistanceToNow(
                  new Date(entry.createdAt),
                  {
                    addSuffix: true,
                    locale: vi,
                  }
                )

                return (
                  <TimelineItem key={index}>
                    <TimelineOppositeContent
                      sx={{ m: "auto 0", flex: 0.3 }}
                      align="right"
                      variant="body2"
                      color="text.secondary"
                    >
                      <Small fontWeight="500" color="text.primary">
                        {relativeTime}
                      </Small>
                      <br />
                      <Small>{formatDatetime(entry.createdAt)}</Small>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot
                        color={isCurrentState ? "primary" : "grey"}
                      />
                      {index < sortedHistory.length - 1 && (
                        <TimelineConnector />
                      )}
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: "12px", px: 2 }}>
                      <Paragraph fontWeight="600">
                        {getStateDisplayName(toState)}
                      </Paragraph>
                    </TimelineContent>
                  </TimelineItem>
                )
              })}
            </Timeline>
          </Box>
        </>
      )}
    </Card>
  )
}
