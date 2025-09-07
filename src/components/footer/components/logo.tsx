import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import AppStore from "./app-store";
import Image from "components/BazaarImage";
import { Paragraph, H4 } from "components/Typography";
// API
import { storeSettingsApi } from "lib/api";

export default function LogoSection() {
  const [storeSettings, setStoreSettings] = useState<{
    shopName: string;
    aboutDescription: string;
  }>({
    shopName: "",
    aboutDescription: ""
  });

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const response = await storeSettingsApi.getByKeys(["shop-name", "footer-about-description"]);
        const settings = response.data.items || [];
        
        const shopNameSetting = settings.find((item: any) => item.key === "shop-name");
        const aboutSetting = settings.find((item: any) => item.key === "footer-about-description");
        
        setStoreSettings({
          shopName: shopNameSetting?.value || "",
          aboutDescription: aboutSetting?.value || ""
        });
      } catch (error) {
        console.error("Failed to fetch store settings:", error);
      }
    };

    fetchStoreSettings();
  }, []);

  return (
    <Fragment>
      <Link href="/">
        <Image width="200px" mb={2.5} src="/assets/images/logos/logo.jpg" alt="logo" />
      </Link>

      {storeSettings.shopName && (
        <H4 mb={1.5} color="grey.900">
          {storeSettings.shopName}
        </H4>
      )}

      <Paragraph mb={2.5} color="grey.700">
        {storeSettings.aboutDescription || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Auctor libero id et, in gravida. Sit diam duis mauris nulla cursus. Erat et lectus vel ut sollicitudin elit at amet."}
      </Paragraph>

    </Fragment>
  );
}
