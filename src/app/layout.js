export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Meta tags and other head elements */}
        <meta name="google-site-verification" content="9s0WMcA06MrZhscNsNP8jo4oEXm6Umy3qU-OxPxqiJc" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        <link id="favicon" rel="shortcut icon" href="/favicon.svg" />
        <title>Techdoc</title>
        <link
          rel="stylesheet"
          href="https://unicons.iconscout.com/release/v2.1.9/css/unicons.css"
        />
        {/* Place your scripts here if necessary */}
      </head>
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        {children}
        <script type="module" src="/src/index.jsx"></script>
        <a style={{ display: 'none' }} href="https://techdoc.walkover.in"></a>
        {/* Include additional scripts if needed */}
      </body>
    </html>
  );
}
