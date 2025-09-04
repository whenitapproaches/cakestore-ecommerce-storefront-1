"use client";

export function useChannels() {
  // Fallback channel/locale until real channel context is provided
  return {
    locale: "en",
    channel: "default",
  };
}


