// layout.js
import Head from 'next/head';
import { NextScript } from 'next/document';
import Script from 'next/script';
import "../src/components/auth/login.scss";
import "../src/components/auth/auth.scss";
import "../src/components/collectionVersions/collectionVersions.scss"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />

        <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
        <link id="favicon" rel="shortcut icon" href="%PUBLIC_URL%/favicon.svg" />

        <title>Techdoc</title>
        <script src="https://kit.fontawesome.com/ee59879289.js" crossOrigin="anonymous"></script>
        <link rel="stylesheet" href="https://unicons.iconscout.com/release/v2.1.9/css/unicons.css" />
      </Head>
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="root">{children}</div>

        <Script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js" strategy="beforeInteractive" />
        <Script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js" strategy="beforeInteractive" />
        <Script src="https://code.jquery.com/jquery-3.1.1.min.js" strategy="beforeInteractive" />
        <NextScript />
        <Script>
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('serviceWorker.js', () => {
                navigator.serviceWorker
                  .register('./serviceWorker.js')
                  .then((reg) => {
                    console.log('Worker Registered')
                  })
                  .catch((err) => {
                    console.log('Error in service worker registration.')
                  })
              })
            }
          `}
        </Script>
      </body>
    </html>
  );
}
