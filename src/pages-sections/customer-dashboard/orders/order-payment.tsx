import { Box, Card, Grid, Typography } from "@mui/material"
import Image from "next/image"
import { useTranslation } from "react-i18next"
import { H5, Paragraph } from "components/Typography"

// =============================================================
type Props = {
  order: any
  qrImageUrl?: string | null
  qrImageUrl2?: string | null
}
// =============================================================

export default function OrderPayment({
  order,
  qrImageUrl,
  qrImageUrl2,
}: Props) {
  const { t } = useTranslation()

  const payment = order?.payments?.find((payment: any) =>
    ["Authorized", "ArrangingPayment", "Settled"].includes(payment.state)
  )

  const isSettled = payment?.state === "Settled"
  const isNotSettled = payment?.state !== "Settled"

  if (!payment) {
    return null
  }

  // Get payment method display name
  const getPaymentMethodName = (code: string) => {
    switch (code?.toLowerCase()) {
      case "cod":
        return t("Cash on Delivery")
      case "banking":
        return t("Bank Transfer")
      default:
        return code || t("Unknown Payment Method")
    }
  }

  return (
    <Card sx={{ p: 3, mb: 4 }}>
      <H5 mt={0} mb={2}>
        {t("Payment Information")}
      </H5>

      {/* Display Payment Method */}
      <Box sx={{ mb: isSettled ? 0 : 3, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
        <Paragraph fontWeight={600}>
          {t("Payment Method")}: {getPaymentMethodName(payment.method)}
        </Paragraph>
      </Box>

      {/* Show QR codes only for banking payment method */}
      {payment.method === "banking" && (qrImageUrl || qrImageUrl2) && (
        <>
          <Paragraph color="text.secondary" mb={3}>
            {t(
              "Please scan one of the QR codes below to complete your payment"
            )}
          </Paragraph>
        </>
      )}

      {/* QR Codes - only show for banking payment method */}
      {payment.method === "banking" && (qrImageUrl || qrImageUrl2) && (
        <Grid container spacing={3}>
          {qrImageUrl && (
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  border: 1,
                  borderColor: "grey.300",
                  borderRadius: 2,
                  bgcolor: "grey.50",
                }}
              >
                <Typography variant="h6" mb={2}>
                  {t("Payment Method 1")}
                </Typography>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 600,
                    height: 600,
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <Image
                    src={qrImageUrl}
                    alt={t("QR Code for Payment")}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </Box>
              </Box>
            </Grid>
          )}

          {qrImageUrl2 && (
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  border: 1,
                  borderColor: "grey.300",
                  borderRadius: 2,
                  bgcolor: "grey.50",
                }}
              >
                <Typography variant="h6" mb={2}>
                  {t("Payment Method 2")}
                </Typography>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 300,
                    height: 300,
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <Image
                    src={qrImageUrl2}
                    alt={t("QR Code for Payment")}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </Box>
                <Paragraph fontSize="14px" color="text.secondary">
                  {t("Scan with your banking app")}
                </Paragraph>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Payment Instructions - show different instructions based on payment method */}
      {payment.method === "banking" && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: "info.light",
            borderRadius: 1,
            border: 1,
            borderColor: "info.main",
          }}
        >
          <Typography variant="body2" color="info.dark">
            <strong>{t("Payment Instructions")}:</strong>
          </Typography>

          {payment.method === "cod" && (
            <>
              <Typography variant="body2" color="info.dark" mt={1}>
                • {t("Payment will be collected upon delivery")}
              </Typography>
              <Typography variant="body2" color="info.dark">
                • {t("Please have the exact amount ready")}
              </Typography>
              <Typography variant="body2" color="info.dark">
                • {t("Your order is being prepared for shipment")}
              </Typography>
            </>
          )}

          {payment.method === "banking" && payment && (
            <>
              <Typography variant="body2" color="info.dark" mt={1}>
                • {t("Scan the QR code using your mobile banking app")}
              </Typography>
              <Typography variant="body2" color="info.dark">
                • {t("Verify the payment amount matches your order total")}
              </Typography>
              <Typography variant="body2" color="info.dark">
                • {t("Complete the payment in your banking app")}
              </Typography>
              <Typography variant="body2" color="info.dark">
                • {t("Your order will be processed once payment is confirmed")}
              </Typography>
            </>
          )}
        </Box>
      )}
    </Card>
  )
}
