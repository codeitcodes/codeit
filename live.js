var toggle = document.querySelector('.toggle'),
    codedit = document.querySelector('cd'),
    iframe = document.querySelector('iframe');

toggle.onclick = () => {
  codedit.classList.toggle('open');
}
