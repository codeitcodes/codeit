var toggle = document.querySelector('.toggle'),
    codedit = document.querySelector('cd'),
    iframe = document.querySelector('iframe');

toggle.onclick = () => {
  codedit.classList.toggle('open');
}

function updateFrame(html) {
  iframe.contentDocument.querySelector('html').innerHTML = html;
}
