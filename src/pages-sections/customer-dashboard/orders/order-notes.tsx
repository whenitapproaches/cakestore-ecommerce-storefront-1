import { Fragment } from "react"
// MUI
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import Divider from "@mui/material/Divider"
import Timeline from "@mui/lab/Timeline"
import TimelineItem from "@mui/lab/TimelineItem"
import TimelineSeparator from "@mui/lab/TimelineSeparator"
import TimelineConnector from "@mui/lab/TimelineConnector"
import TimelineContent from "@mui/lab/TimelineContent"
import TimelineDot from "@mui/lab/TimelineDot"
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent"
// GLOBAL CUSTOM COMPONENTS
import { H5, Paragraph, Small } from "components/Typography"
// UTILS
import { formatDatetime } from "utils/helpers"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
// I18N
import { useTranslation } from "react-i18next"

// =============================================================
type Props = { order: any }
// =============================================================

export default function OrderNotes({ order }: Props) {
  const { t } = useTranslation()

  // Filter history entries for ORDER_NOTE only
  const noteEntries = Array.isArray(order?.history?.items)
    ? order.history.items.filter(
        (entry: any) => entry.type === "ORDER_NOTE"
      )
    : []

  // Sort by createdAt descending (newest first)
  const sortedNotes = [...noteEntries].sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Don't render if no notes
  if (sortedNotes.length === 0) {
    return null
  }

  return (
    <Card sx={{ p: 3, mb: 4 }}>
      <Box>
        <H5 mt={0} mb={2}>{t("Order Notes")}</H5>
        <Timeline position="right">
          {sortedNotes.map((entry: any, index: number) => {
            const noteData = entry.data || {}
            const note = noteData.note || noteData.message || ""
            const isPublic = noteData.isPublic !== false // Default to public if not specified
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
                  <TimelineDot color={isPublic ? "info" : "warning"} />
                  {index < sortedNotes.length - 1 && (
                    <TimelineConnector />
                  )}
                </TimelineSeparator>
                <TimelineContent sx={{ py: "12px", px: 2 }}>
                  {note && (
                    <Paragraph color="text.secondary" fontSize="14px">
                      {note}
                    </Paragraph>
                  )}
                </TimelineContent>
              </TimelineItem>
            )
          })}
        </Timeline>
      </Box>
    </Card>
  )
}
