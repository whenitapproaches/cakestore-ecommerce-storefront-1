import { PropsWithChildren } from "react"
import PageStepper from "./page-stepper"
import ShopLayout1 from "components/layouts/shop-layout-1"

export default function Layout({ children }: PropsWithChildren) {
  return (
    <ShopLayout1>
      <PageStepper>{children}</PageStepper>
    </ShopLayout1>
  )
}
