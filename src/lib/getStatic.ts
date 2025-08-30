import { GetServerSidePropsContext } from "next"

export const DEFAULT_CHANNEL = "default-channel"
export const DEFAULT_CHANNEL_SLUG = "vi"

export const DEFAULT_LOCALE = "vi"
export const DEFAULT_NATIONAL_LOCALE = "vi"

export const channels = [
  {
    slug: DEFAULT_CHANNEL_SLUG,
    channel: DEFAULT_CHANNEL,
    nationalLocale: DEFAULT_NATIONAL_LOCALE,
    locales: ["vi", "en", "pl", "fr", "de", "ja", "es"],
  },
]

export const getContext = (
  ctx?: ContextModel | GetServerSidePropsContext
): ContextModel => {
  return { params: { channel: DEFAULT_CHANNEL, locale: DEFAULT_LOCALE } }
}

export interface ContextModel<T = Record<string, string>> {
  params: { locale: string; channel: string } & T
}
