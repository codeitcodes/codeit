var toggle = document.querySelector('.toggle'),
    codedit = document.querySelector('cd'),
    iframe = document.querySelector('iframe'),
    error = document.querySelector('.error');

toggle.onclick = () => {
  codedit.classList.toggle('open');
}

if (localStorage.getItem('code')) {
  // If code's in storage, show it
  codedit.innerHTML = escapeHTML(localStorage.getItem('code'));
  codedit.classList.add('open');
}

function updateFrame(html) {
  // Update iframe
  iframe.contentDocument.querySelector('html').innerHTML = html;
  
  // Run all <script> tags
  iframe.contentDocument.querySelectorAll('script').forEach(script => {
    // Try running their code. If there's an error, display it in the console
    try {
      iframe.contentWindow.eval(script.innerHTML);
    } catch(e) { error.innerHTML = e; }
  })
  
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
