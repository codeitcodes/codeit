<h1 id="details">Technical details</h2>

<h3>The Codeit Editor</h3>

The editor utilizes:

<ul>
  
  <li>The <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable"><code>contenteditable</code> API</a>, to enable editing the highlighted HTML. Compare this to other code editors, such as Visual Studio Code, Atom, or CodeMirror, which use an invisible overlaid textarea on top of the highlighted HTML, and constantly synchronize the textarea and DOM. Codeit's approach is more performant, as synchronisation between textarea and DOM, and code buffering, are not required.</li>
  
  <li>The <a href="https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver"><code>MutationObserver</code> API</a>, to quickly detect changes in the DOM without an event listener. Changes from JavaScript will be detected automatically by the editor, without the need to run an <code>update</code> function.</li>
  
  <li>The <a href="https://developer.mozilla.org/en-US/docs/Web/API/Range"><code>Range</code> API</a>, for optimized parsing of the DOM. Using the <code>contenteditable</code> API includes a caveat, as the browser reparses the entire DOM after every change. However, using the Range API optimizes DOM parsing by directing the browser to parse only what's actually changed. This approach works for files up to 1000 lines in length. After that, code buffering is required.</li>
  
</ul>

The editor is <a href="/lib">fully standalone</a>, and is a library by itself. It includes multiple custom <a href="/lib">plugins</a> and <a href="https://github.com/PrismJS/prism/tree/master/themes">themes</a>.

<h3>Security</h3>

When you log in to Git, Codeit recives an authuntication token from your Git hosting provider.
This token is saved on your device and is used to read and commit code.

When you edit a file, Codeit saves a local copy of the file on your device.
When you commit an edited file, its local copy is deleted.

<h3>Privacy</h3>

Codeit dosen't collect data. Your code stays on your device.
Codeit uses [Plausible](https://plausible.io) to get stats. [See the stats.](https://plausible.io/codeit.codes)

If cookies are disabled, your browser will block Codeit from installing a Service Worker, which is necessary for the app to function. For this reason, we ask you enable cookies on the Codeit site.
