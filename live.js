var toggle = document.querySelector('.toggle'),
    codedit = document.querySelector('cd'),
    html = document.querySelector('cd textarea'),
    iframe = document.querySelector('iframe');

toggle.onclick = () => {
  codedit.classList.toggle('open');
}

function updateIframe() {
  iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html.value);
}
