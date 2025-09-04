"use client"

import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemText from "@mui/material/ListItemText"

type Variant = {
  id: string | number
  name: string
}

type Props = {
  open: boolean
  variants: Variant[]
  onClose: () => void
  onSelect: (variantId: string) => void
}

export default function VariantSelectDialog({ open, variants, onClose, onSelect }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select a variant</DialogTitle>
      <DialogContent dividers>
        <List>
          {variants.map((v) => (
            <ListItem key={String(v.id)} disableGutters disablePadding>
              <ListItemButton onClick={() => onSelect(String(v.id))}>
                <ListItemText primary={v.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}


