var toggle = document.querySelector('.toggle'),
    codedit = document.querySelector('cd'),
    iframe = document.querySelector('iframe');

toggle.onclick = () => {
  codedit.classList.toggle('open');
}

if (localStorage.getItem('code')) {
  // If code's in storage, show it
  codedit.innerHTML = localStorage.getItem('code');
}

function updateFrame(html) {
  iframe.contentDocument.querySelector('html').innerHTML = html;
  // Set new localStorage value
  localStorage.setItem('code', html);
}
