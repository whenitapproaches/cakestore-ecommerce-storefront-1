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
import PaymentIcon from "@mui/icons-material/Payment"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
// CUSTOM ICON COMPONENTS
import Delivery from "icons/Delivery"
import PackageBox from "icons/PackageBox"
import TruckFilled from "icons/TruckFilled"
// GLOBAL CUSTOM COMPONENTS
import { H5, H6, Paragraph, Small } from "components/Typography"
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

  // Filter and process history entries
  const historyEntries = Array.isArray(order?.history?.items)
    ? order.history.items
    : []

  // Payment timeline - ORDER_STATE_TRANSITION with payment-related states
  const paymentStates = ["ArrangingPayment", "PaymentSettled"]
  const paymentHistory = historyEntries
    .filter(
      (entry: any) =>
        entry.type === "ORDER_STATE_TRANSITION" &&
        paymentStates.includes(entry.data?.to)
    )
    .map((entry: any) => ({ ...entry, category: "payment" }))

  // Fulfillment timeline - ORDER_FULFILLMENT for recognition and ORDER_FULFILLMENT_TRANSITION for status changes
  const fulfillmentHistory = historyEntries
    .filter((entry: any) => {
      if (entry.type === "ORDER_FULFILLMENT") {
        return true // Order is recognized for fulfillment
      }
      if (entry.type === "ORDER_FULFILLMENT_TRANSITION") {
        const toState = entry.data?.to
        return toState === "Shipped" || toState === "Delivered"
      }
      return false
    })
    .map((entry: any) => ({ ...entry, category: "fulfillment" }))

  // Combine and sort all timeline entries chronologically
  const combinedHistory = [...paymentHistory, ...fulfillmentHistory].sort(
    (a: any, b: any) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  const getStateDisplayName = (state: string) => {
    const stateMap: { [key: string]: string } = {
      ArrangingPayment: t("Arranging Payment"),
      PaymentSettled: t("Payment Settled"),
      Shipped: t("Shipped"),
      Delivered: t("Delivered"),
    }
    return stateMap[state] || state
  }

  const getPaymentIcon = (state: string) => {
    switch (state) {
      case "ArrangingPayment":
        return <PaymentIcon />
      case "PaymentSettled":
        return <CheckCircleIcon />
      default:
        return <PaymentIcon />
    }
  }

  const getFulfillmentIcon = (entry: any) => {
    if (entry.type === "ORDER_FULFILLMENT") {
      return <PackageBox />
    }
    if (entry.type === "ORDER_FULFILLMENT_TRANSITION") {
      const toState = entry.data?.to
      switch (toState) {
        case "Shipped":
          return <LocalShippingIcon />
        case "Delivered":
          return <Delivery />
        default:
          return <TruckFilled />
      }
    }
    return <PackageBox />
  }

  const getFulfillmentLabel = (entry: any) => {
    if (entry.type === "ORDER_FULFILLMENT") {
      return t("Order Fulfillment Started")
    }
    if (entry.type === "ORDER_FULFILLMENT_TRANSITION") {
      return getStateDisplayName(entry.data?.to)
    }
    return t("Fulfillment Update")
  }

  const renderTimelineItem = (
    entry: any,
    index: number,
    totalItems: number,
    isCurrentState: boolean = false
  ) => {
    const relativeTime = formatDistanceToNow(new Date(entry.createdAt), {
      addSuffix: true,
      locale: vi,
    })

    // Determine color based on entry category
    const getTimelineColor = () => {
      return entry.category === "payment" ? "primary" : "secondary"
    }

    return (
      <TimelineItem key={`${entry.type}-${entry.createdAt}-${index}`}>
        <TimelineOppositeContent
          sx={{ m: "auto 0", flex: 0.3 }}
          align="right"
          variant="body2"
          color="text.secondary"
        >
          <Small
            fontWeight="500"
            color={isCurrentState ? "text.primary" : "text.disabled"}
          >
            {relativeTime}
          </Small>
          <br />
          <Small color={isCurrentState ? "text.secondary" : "text.disabled"}>
            {formatDatetime(entry.createdAt)}
          </Small>
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot
            color={getTimelineColor()}
            sx={{
              p: 1,
              opacity: isCurrentState ? 1 : 0.5,
              "& .MuiSvgIcon-root": {
                opacity: isCurrentState ? 1 : 0.6,
              },
            }}
          >
            {entry.category === "payment"
              ? getPaymentIcon(entry.data?.to)
              : getFulfillmentIcon(entry)}
          </TimelineDot>
          {index < totalItems - 1 && (
            <TimelineConnector
              sx={{
                opacity: isCurrentState || index === totalItems - 2 ? 1 : 0.3,
              }}
            />
          )}
        </TimelineSeparator>
        <TimelineContent sx={{ py: "12px", px: 2 }}>
          <Paragraph
            fontWeight={isCurrentState ? "600" : "400"}
            color={isCurrentState ? "text.primary" : "text.disabled"}
          >
            {entry.category === "payment"
              ? getStateDisplayName(entry.data?.to)
              : getFulfillmentLabel(entry)}
          </Paragraph>
        </TimelineContent>
      </TimelineItem>
    )
  }

  return (
    <Card sx={{ p: 3, mb: 4 }}>
      {/* Unified Order Progress Timeline */}
      {combinedHistory.length > 0 && (
        <Box>
          <H6 mt={0} mb={2} color="text.primary">
            {t("Order Progress")}
          </H6>
          <Timeline position="right">
            {combinedHistory.map((entry: any, index: number) => {
              // Determine if this is the most recent entry of its category
              const categoryEntries = combinedHistory.filter(
                (e) => e.category === entry.category
              )
              const isCurrentStateInCategory =
                categoryEntries.indexOf(entry) === categoryEntries.length - 1

              return renderTimelineItem(
                entry,
                index,
                combinedHistory.length,
                isCurrentStateInCategory
              )
            })}
          </Timeline>
        </Box>
      )}

      {/* No Progress Message */}
      {combinedHistory.length === 0 && (
        <Box textAlign="center" py={4}>
          <Paragraph color="text.secondary">
            {t("No progress information available")}
          </Paragraph>
        </Box>
      )}
    </Card>
  )
}
