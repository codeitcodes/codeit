<h1 align="center">
  <a href="https://codeit.codes"><img src="/icons/app-favicon.png" height="100" width="100"></a>
  <br>
  Codeit
</h1>
<p align="center">
  <h3 align="center">  
    Mobile code editor connected to Git
  </h3>
</p>

<p align="center">
  <a href="https://codeit.codes"><img src="/icons/social/tryit.svg" width="32" height="26"></a>
  <a href="https://discord.gg/47RFy3Vfmg"><img src="/icons/social/discordapp.svg" width="26" height="26"></a>
  <a href="https://twitter.com/codeitcodes"><img src="/icons/social/twitter.svg" width="36" height="26"></a>
</p>

<h2>Features</h2>
<ul>
  <li>Uses blazing-fast web APIs. <a href="#details">More technical details below.</a></li>
  <li>Framework-free. Only library is PrismJS, for syntax highlighting.</li>
  <li>PWA support. Weighs 70% less than regular apps, can be installed and works offline.</li>
  <li>Autosaving down to the character helps you pick up right where you left off. Code, scroll and caret positions, and location in your repos.</li>
  <li>Supports 275 lanugages. Most common languages are preloaded by default, with uncommon languages loaded dynamically.</li>
  <li>Codeit is built for Chrome on Android, Windows, macOS and Linux, as well as Safari on iOS.</li>
</ul>

<h2 id="details">Technical details</h2>

<h3>The Codeit Editor</h3>

The editor utilizes:

<ul>
  
  <li>The <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable"><code>contenteditable</code> API</a>, to enable editing the actual highlighted HTML. Compare this to other code editors, such as Visual Studio Code, Atom, or CodeMirror, which use an invisible overlaid textarea on top of the highlighted HTML, and constantly synchronize the textarea and DOM. Codeit's approach might be more preformant, as no synchronizing between textarea and DOM is required.</li>
  
  <li>The <a href="https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver"><code>MutationObserver</code> API</a>, to quickly detect changes in the DOM without an event listener. Changes from JavaScript will be detected automatically by the editor, without the need to run an <code>update</code> function.</li>
  
  <li>The <a href="https://developer.mozilla.org/en-US/docs/Web/API/Range"><code>Range</code> API</a>, for optimized parsing of the DOM. Using the <code>contenteditable</code> API could have included a caveat, as by default, the browser reparses the entire DOM after every change. However, using the Range API has been proven succesful to optimize DOM parsing by directing the browser to parse only what has actually changed.</li>
  
</ul>

The editor is <a href="/lib">fully standalone</a>, and is a library by itself. It includes multiple custom <a href="/lib">plugins</a> and <a href="https://github.com/PrismJS/prism/tree/master/themes">themes</a>.

<h3>Security</h3>

When you log in to Git, Codeit recives an authuntication token from your Git hosting provider.
This token is saved on your device and is used to read and commit code.

When you edit a file, Codeit saves a local copy of the file on your device.
When you commit an edited file, it's local copy is deleted.

<h3>Privacy</h3>

We don't use cookies and don't collect any personal data.

To install Codeit, we ask for the bare minimum. If cookies are disabled, your browser will block Codeit from installing a Service Worker, which is absolutely necessary for the app to function. For this reason, we ask you enable cookies on the Codeit site.

<h2>Special Thanks</h2>
Codeit's logo was created by <a href="https://twitter.com/sandorqi">@sandorqi</a>.
