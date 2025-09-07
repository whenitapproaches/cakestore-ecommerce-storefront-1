import { useEffect, useState } from "react"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormControl from "@mui/material/FormControl"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
import { Paragraph, H6 } from "components/Typography"
import { paymentMethodsApi } from "lib/api"
import { useToast } from "contexts/ToastContext"
import { useTranslation } from "react-i18next"

interface PaymentMethod {
  id: string
  name: string
  code: string
  description?: string | null
  isEligible: boolean
}

interface Props {
  onPaymentMethodChange?: (paymentMethod: PaymentMethod | null) => void
}

export default function PaymentMethodsSelection({ onPaymentMethodChange }: Props) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch available payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const { data } = await paymentMethodsApi.getEligibleMethods()
        const eligibleMethods = (data?.methods || []).filter(method => method.isEligible)
        setPaymentMethods(eligibleMethods)
        
        // Auto-select if only one method is available
        if (eligibleMethods.length === 1) {
          const method = eligibleMethods[0]
          setSelectedPaymentMethod(method.code)
          onPaymentMethodChange?.(method)
        }
      } catch (error) {
        console.error("Failed to fetch payment methods:", error)
        setError("Failed to load payment methods")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [])

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const paymentMethodCode = event.target.value
    const paymentMethod = paymentMethods.find(method => method.code === paymentMethodCode)
    
    if (!paymentMethod) return
    
    setSelectedPaymentMethod(paymentMethodCode)
    onPaymentMethodChange?.(paymentMethod)
  }

  if (isLoading) {
    return (
      <Card sx={{ p: 3, mt: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <CircularProgress size={20} />
          <Paragraph>{t("Loading payment methods...")}</Paragraph>
        </Box>
      </Card>
    )
  }

  if (error) {
    return (
      <Card sx={{ p: 3, mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Card>
    )
  }

  if (paymentMethods.length === 0) {
    return (
      <Card sx={{ p: 3, mt: 2 }}>
        <Alert severity="warning">{t("No payment methods available")}</Alert>
      </Card>
    )
  }

  return (
    <Card sx={{ p: 3, mt: 2 }}>
      <H6 mb={2}>{t("Payment Method")}</H6>
      
      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          value={selectedPaymentMethod}
          onChange={handlePaymentMethodChange}
        >
          {paymentMethods.map((method) => (
            <FormControlLabel
              key={method.code}
              value={method.code}
              control={<Radio />}
              label={
                <Box>
                  <Paragraph fontWeight={500}>{method.name}</Paragraph>
                  {method.description && (
                    <Paragraph 
                      color="grey.600" 
                      fontSize={14}
                      dangerouslySetInnerHTML={{ __html: method.description }}
                    />
                  )}
                </Box>
              }
              sx={{
                mb: 1,
                p: 1,
                border: "1px solid",
                borderColor: selectedPaymentMethod === method.code ? "primary.main" : "grey.300",
                borderRadius: 1,
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "primary.50"
                }
              }}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Card>
  )
}
