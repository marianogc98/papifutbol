import Script from 'next/script'

export default function Umami() {
  return (
    <Script
      src="http://umami-acow40co400sw4gw0w0w8w0o.72.60.4.182.sslip.io/script.js"
      data-website-id="63c8f8ab-dc65-41e3-b1e2-a9dbd2d4d47c"
      strategy="afterInteractive"
    />
  )
}

