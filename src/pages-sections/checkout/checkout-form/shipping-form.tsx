import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"
import CircularProgress from "@mui/material/CircularProgress"
// GLOBAL CUSTOM COMPONENT
import { H6 } from "components/Typography"
// DUMMY CUSTOM DATA
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { level1s } from "dvhcvn"

// ==============================================================
interface Props {
  handleBlur: any
  handleChange: any
  values: any
  touched: any
  errors: any
  setFieldValue: any
}
// ==============================================================

export default function ShippingForm({
  values,
  errors,
  touched,
  handleBlur,
  handleChange,
  setFieldValue,
}: Props) {
  const { t } = useTranslation()
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)
  const [provinces, setProvinces] = useState<Array<any>>([])
  const [districts, setDistricts] = useState<Array<any>>([])
  const [wards, setWards] = useState<Array<any>>([])

  // Initialize provinces from dvhcvn
  useEffect(() => {
    setLoadingProvinces(true)
    try {
      setProvinces(Array.isArray(level1s) ? level1s : [])
    } finally {
      setLoadingProvinces(false)
    }
  }, [])

  useEffect(() => {
    const selected = values?.shipping_province
    if (!selected) {
      setDistricts([])
      setFieldValue("shipping_district", null)
      setWards([])
      setFieldValue("shipping_ward", null)
      return
    }
    setLoadingDistricts(true)
    try {
      console.log(selected)
      const next = Array.isArray(selected?.children) ? selected.children : []
      setDistricts(next)
    } finally {
      setLoadingDistricts(false)
      setFieldValue("shipping_district", null)
      setWards([])
      setFieldValue("shipping_ward", null)
    }
  }, [values.shipping_province])

  useEffect(() => {
    const selected = values?.shipping_district
    if (!selected) {
      setWards([])
      setFieldValue("shipping_ward", null)
      return
    }
    setLoadingWards(true)
    try {
      const next = Array.isArray(selected?.children) ? selected.children : []
      setWards(next)
    } finally {
      setLoadingWards(false)
      setFieldValue("shipping_ward", null)
    }
  }, [values.shipping_district])
  return (
    <Card sx={{ mb: 4, p: 3 }}>
      <H6 mb={2}>{t("Shipping Address")}</H6>

      <Grid container rowSpacing={0} columnSpacing={4}>
        <Grid item sm={6} xs={12}>
          <TextField
            fullWidth
            sx={{ mb: 2 }}
            label={t("Last Name") as string}
            onBlur={handleBlur}
            name="shipping_last_name"
            onChange={handleChange}
            value={values.shipping_last_name}
            required
            autoComplete="family-name"
            error={!!touched.shipping_last_name && !!errors.shipping_last_name}
            helperText={t(
              ((touched.shipping_last_name &&
                errors.shipping_last_name) as string) || ""
            )}
          />
        </Grid>
        <Grid item sm={6} xs={12}>
          <TextField
            fullWidth
            sx={{ mb: 2 }}
            label={t("First Name") as string}
            onBlur={handleBlur}
            name="shipping_first_name"
            onChange={handleChange}
            value={values.shipping_first_name}
            autoComplete="given-name"
            error={
              !!touched.shipping_first_name && !!errors.shipping_first_name
            }
            helperText={t(
              ((touched.shipping_first_name &&
                errors.shipping_first_name) as string) || ""
            )}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <TextField
            fullWidth
            sx={{ mb: 2 }}
            onBlur={handleBlur}
            required
            label={t("Phone Number") as string}
            onChange={handleChange}
            name="shipping_contact"
            value={values.shipping_contact}
            autoComplete="tel"
            error={!!touched.shipping_contact && !!errors.shipping_contact}
            helperText={t(
              ((touched.shipping_contact &&
                errors.shipping_contact) as string) || ""
            )}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <TextField
            fullWidth
            type="email"
            sx={{ mb: 2 }}
            onBlur={handleBlur}
            name="shipping_email"
            label={t("Email Address") as string}
            onChange={handleChange}
            value={values.shipping_email}
            required
            autoComplete="email"
            error={!!touched.shipping_email && !!errors.shipping_email}
            helperText={t(
              ((touched.shipping_email && errors.shipping_email) as string) ||
                ""
            )}
          />
        </Grid>
        <Grid item sm={6} xs={12}>
          <TextField
            fullWidth
            label={t("Address") as string}
            onBlur={handleBlur}
            onChange={handleChange}
            name="shipping_address1"
            value={values.shipping_address1}
            autoComplete="address-line1"
            error={!!touched.shipping_address1 && !!errors.shipping_address1}
            helperText={t(
              ((touched.shipping_address1 &&
                errors.shipping_address1) as string) || ""
            )}
            required
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <Autocomplete
            fullWidth
            sx={{ mb: 2 }}
            options={provinces}
            value={values.shipping_province}
            getOptionLabel={(option: any) => option?.name || ""}
            onChange={(_, value) => setFieldValue("shipping_province", value)}
            renderInput={(params) => (
              <TextField
                label={t("Province / City") as string}
                placeholder={t("Select Province or City") as string}
                required
                {...params}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingProvinces ? <CircularProgress size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                error={
                  !!touched.shipping_province && !!errors.shipping_province
                }
                helperText={t(
                  ((touched.shipping_province &&
                    errors.shipping_province) as string) || ""
                )}
              />
            )}
          />
        </Grid>
        <Grid item sm={6} xs={12}>
          <Autocomplete
            fullWidth
            sx={{ mb: 2 }}
            options={districts}
            value={values.shipping_district}
            getOptionLabel={(option: any) => option?.name || ""}
            onChange={(_, value) => setFieldValue("shipping_district", value)}
            disabled={!values.shipping_province}
            renderInput={(params) => (
              <TextField
                label={t("Quận / Huyện") as string}
                placeholder={t("Select District") as string}
                {...params}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingDistricts ? <CircularProgress size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                error={
                  !!touched.shipping_district && !!errors.shipping_district
                }
                helperText={t(
                  ((touched.shipping_district &&
                    errors.shipping_district) as string) || ""
                )}
              />
            )}
          />
        </Grid>
        <Grid item sm={6} xs={12}>
          <Autocomplete
            fullWidth
            options={wards}
            value={values.shipping_ward}
            getOptionLabel={(option: any) => option?.name || ""}
            onChange={(_, value) => setFieldValue("shipping_ward", value)}
            disabled={!values.shipping_district}
            renderInput={(params) => (
              <TextField
                label={t("Phường / Xã") as string}
                placeholder={t("Select Ward") as string}
                {...params}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingWards ? <CircularProgress size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                error={!!touched.shipping_ward && !!errors.shipping_ward}
                helperText={t(
                  ((touched.shipping_ward && errors.shipping_ward) as string) ||
                    ""
                )}
              />
            )}
          />
        </Grid>
      </Grid>
    </Card>
  )
}
