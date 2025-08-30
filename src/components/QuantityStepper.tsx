"use client"

import { FC } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
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
        <Typography
          variant="body1"
          fontWeight={500}
          color="text.primary"
          sx={{ userSelect: "none" }}
        >
          {quantity}
        </Typography>
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
