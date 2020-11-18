var toggle = document.querySelector('.toggle'),
    codedit = document.querySelector('cd'),
    iframe = document.querySelector('iframe');

toggle.onclick = () => {
  codedit.classList.toggle('open');
}

if (localStorage.getItem('code')) {
  // If code's in storage, show it
  codedit.innerHTML = escapeHTML(localStorage.getItem('code'));
  codedit.classList.add('open');
}

function updateFrame(html) {
  if (html) {
    iframe.contentDocument.querySelector('html').innerHTML = html;
  }
  else {
    iframe.contentDocument.querySelector('html').innerHTML = "What's a programmer's favorite place? The Foo Bar.<style>@font-face{font-family:'San Francisco';font-style:normal;font-weight: 400;src:url('https://bassets.github.io/SFProText.woff2') format('woff2');}body{font-family:'San Francisco',sans-serif;display:grid;place-content:center;text-align:center;font-size:24px;color:#c8c8c8;background:radial-gradient(#2f3341,#1a1c24);}</style>";
  }
  // Set new localStorage value
  localStorage.setItem('code', html);
}

function escapeHTML(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
