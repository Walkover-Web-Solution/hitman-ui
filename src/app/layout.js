import Head from 'next/head';

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <meta name="google-site-verification" content="9s0WMcA06MrZhscNsNP8jo4oEXm6Umy3qU-OxPxqiJc" />
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        <link id="favicon" rel="shortcut icon" href="/favicon.svg" />
        <title>Techdoc</title>
        <link rel="stylesheet" href="https://unicons.iconscout.com/release/v2.1.9/css/unicons.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof module === 'object') {
                window.module = module;
                module = undefined;
              }
            `,
          }}
        />
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.module) module = window.module;
            `,
          }}
        />
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
        <script src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
      </Head>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <div id="root">{children}</div>
      <script type="module" src="/src/index.jsx"></script>
      <a style={{ display: 'none' }} href="https://techdoc.walkover.in"></a>
    </>
  );
}