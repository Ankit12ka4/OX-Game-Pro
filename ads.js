document.addEventListener("DOMContentLoaded", function () {
  let adContainer = document.createElement("div");
  adContainer.className = "ad-banner";
  adContainer.innerHTML = `
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXX"
      crossorigin="anonymous"></script>
    <ins class="adsbygoogle"
         style="display:inline-block;width:300px;height:50px"
         data-ad-client="ca-pub-XXXXXXXXXXXXXX"
         data-ad-slot="1234567890"></ins>
    <script>
         (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
  `;
  document.body.appendChild(adContainer);
});