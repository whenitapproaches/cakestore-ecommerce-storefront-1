"use client"

import { FC } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"

interface QuantityStepperProps {
  quantity: number
  onQuantityChange: (quantity: number) => void
  min?: number
  max?: number
  disabled?: boolean
}

const QuantityStepper: FC<QuantityStepperProps> = ({
  quantity,
  onQuantityChange,
  min = 1,
  max = 99,
  disabled = false
}) => {
  const handleDecrease = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1)
    }
  }

  const handleIncrease = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    // Allow empty input to quickly type; fallback to min on blur
    if (value === "") {
      onQuantityChange(min)
      return
    }
    const next = parseInt(value, 10)
    if (!Number.isNaN(next)) {
      const clamped = Math.max(min, Math.min(max, next))
      onQuantityChange(clamped)
    }
  }

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value
    const next = parseInt(value, 10)
    if (Number.isNaN(next)) {
      onQuantityChange(min)
      return
    }
    const clamped = Math.max(min, Math.min(max, next))
    if (clamped !== quantity) onQuantityChange(clamped)
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      border="1px solid"
      borderColor="grey.300"
      borderRadius="50px"
      bgcolor="white"
      overflow="hidden"
      sx={{
        width: "fit-content",
        "& .MuiButton-root": {
          minWidth: "auto",
          borderRadius: 0,
          border: "none",
          px: 2,
          py: 1.5,
          color: "grey.600",
          "&:hover": {
            bgcolor: "grey.100",
          },
          "&:disabled": {
            color: "grey.400",
            bgcolor: "transparent",
          },
        },
      }}
    >
      {/* Decrease Button */}
      <Button
        onClick={handleDecrease}
        disabled={disabled || quantity <= min}
        sx={{
          borderTopLeftRadius: "50px",
          borderBottomLeftRadius: "50px",
        }}
      >
        <RemoveIcon fontSize="small" />
      </Button>

      {/* Quantity Display */}
      <Box
        px={3}
        py={1.5}
        borderLeft="1px solid"
        borderRight="1px solid"
        borderColor="grey.300"
        bgcolor="white"
        minWidth={60}
        textAlign="center"
      >
        <TextField
          value={Number.isFinite(quantity) ? quantity : ""}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={disabled}
          type="number"
          inputProps={{ min, max, inputMode: "numeric", pattern: "[0-9]*" }}
          variant="standard"
          InputProps={{ disableUnderline: true }}
          sx={{
            width: 60,
            "& input": {
              textAlign: "center",
              fontWeight: 500,
              color: "text.primary",
              p: 0,
            },
            // Hide native number input steppers
            "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
              WebkitAppearance: "none",
              margin: 0,
            },
            "& input[type=number]": {
              MozAppearance: "textfield",
            },
          }}
        />
      </Box>

      {/* Increase Button */}
      <Button
        onClick={handleIncrease}
        disabled={disabled || quantity >= max}
        sx={{
          borderTopRightRadius: "50px",
          borderBottomRightRadius: "50px",
        }}
      >
        <AddIcon fontSize="small" />
      </Button>
    </Box>
  )
}

export default QuantityStepper
