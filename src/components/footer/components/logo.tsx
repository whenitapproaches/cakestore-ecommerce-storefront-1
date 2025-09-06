import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import AppStore from "./app-store";
import Image from "components/BazaarImage";
import { Paragraph } from "components/Typography";
// API
import { storeSettingsApi } from "lib/api";

export default function LogoSection() {
  const [aboutDescription, setAboutDescription] = useState<string>("");

  useEffect(() => {
    const fetchAboutDescription = async () => {
      try {
        const response = await storeSettingsApi.getByKeys("footer-about-description");
        const aboutSetting = response.data.items?.find((item: any) => item.key === "footer-about-description");
        if (aboutSetting?.value) {
          setAboutDescription(aboutSetting.value);
        }
      } catch (error) {
        console.error("Failed to fetch footer about description:", error);
      }
    };

    fetchAboutDescription();
  }, []);

  return (
    <Fragment>
      <Link href="/">
        <Image mb={2.5} src="/assets/images/logo.svg" alt="logo" />
      </Link>

      <Paragraph mb={2.5} color="grey.500">
        {aboutDescription || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Auctor libero id et, in gravida. Sit diam duis mauris nulla cursus. Erat et lectus vel ut sollicitudin elit at amet."}
      </Paragraph>

    </Fragment>
  );
}
