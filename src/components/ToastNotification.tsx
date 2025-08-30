"use client"

import { FC, useEffect, useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { keyframes } from "@mui/system"

// Animation keyframes
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`

interface ToastNotificationProps {
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

const ToastNotification: FC<ToastNotificationProps> = ({
  message,
  isVisible,
  onClose,
  duration = 3000
}) => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setTimeout(onClose, 300) // Wait for slide out animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible && !isAnimating) return null

  return (
    <Box
      position="fixed"
      zIndex={9999}
      sx={{
        // Desktop: center-right
        top: { xs: "auto", md: "50%" },
        right: { xs: 16, md: 20 },
        bottom: { xs: 16, md: "auto" },
        transform: { xs: "none", md: "translateY(-50%)" },
        animation: isAnimating && isVisible 
          ? `${slideIn} 0.3s ease-out forwards`
          : isAnimating && !isVisible 
          ? `${slideOut} 0.3s ease-in forwards`
          : "none",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        bgcolor="success.main"
        color="white"
        px={3}
        py={2}
        borderRadius={2}
        boxShadow={3}
        minWidth={280}
        maxWidth={350}
      >
        <CheckCircleIcon sx={{ fontSize: 24 }} />
        <Typography variant="body2" fontWeight={500}>
          {message}
        </Typography>
      </Box>
    </Box>
  )
}

export default ToastNotification
