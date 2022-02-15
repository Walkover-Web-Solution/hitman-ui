export const scripts = {
  gtmHead: `<!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-TRB9SPS');</script>
  <!-- End Google Tag Manager -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-10785208426"></script>
  <script> gtag('event', 'conversion', {'send_to': 'AW-10785208426/1tMmCIC6loYDEOrw5JYo'}); </script>`,

  gtmBody: `<!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TRB9SPS"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->`,

  feedioWidget: '<!-- <script src="https://wgt.feedio.ai/"></script> -->',

  factorsAi: `<script>
  (function(c){var s=document.createElement("script");s.type="text/javascript";if(s.readyState){s.onreadystatechange=function(){if(s.readyState=="loaded"||s.readyState=="complete"){s.onreadystatechange=null;c()}}}else{s.onload=function(){c()}}s.src="https://app.factors.ai/assets/factors.js";s.async=true;d=!!document.body?document.body:document.head;d.appendChild(s)})(function(){factors.init("x4qf4nb1ov16cdj036oiufxlvid3wnt3")})
  </script>`
}
