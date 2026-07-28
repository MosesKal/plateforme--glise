import Script from "next/script"

interface GoogleAnalyticsProps {
  measurementId: string
}

const GA4_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/

/**
 * Charge Google Analytics 4 après l'hydratation de l'application.
 *
 * Le composant reste volontairement limité au layout du site public afin
 * d'exclure le backoffice des statistiques d'audience.
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!GA4_MEASUREMENT_ID_PATTERN.test(measurementId)) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  )
}
