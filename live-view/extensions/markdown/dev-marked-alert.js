(function(i, n) {
  typeof exports == "object" && typeof module < "u" ? module.exports = n() : typeof define == "function" && define.amd ? define(n) : (i = typeof globalThis < "u" ? globalThis : i || self, i.markedAlert = n())
})(this, function() {
  "use strict";
  const i = [{
    type: "note",
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M11 7H13V9H11V7ZM11 11H13V17H11V11ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"></path> </svg>'
  }, {
    type: "tip",
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M9 21C9 21.55 9.45 22 10 22H14C14.55 22 15 21.55 15 21V20H9V21ZM12 2C8.14 2 5 5.14 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.14 15.86 2 12 2ZM14.85 13.1L14 13.7V16H10V13.7L9.15 13.1C7.8 12.16 7 10.63 7 9C7 6.24 9.24 4 12 4C14.76 4 17 6.24 17 9C17 10.63 16.2 12.16 14.85 13.1Z" fill="currentColor"></path> </svg>'
  }, {
    type: "important",
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16ZM16 17H8V11C8 8.52 9.51 6.5 12 6.5C14.49 6.5 16 8.52 16 11V17Z" fill="currentColor"></path> </svg>'
  }, {
    type: "warning",
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> <path d="M0 0h24v24H0V0z" fill="none"></path> <g xmlns="http://www.w3.org/2000/svg" fill="currentColor"> <path d="M10.1283 5.05809C10.9277 3.6473 13.0723 3.6473 13.8717 5.05809L21.2493 18.0661C21.4222 18.3709 21.5083 18.7127 21.4994 19.0582C21.4904 19.4038 21.3866 19.7412 21.1981 20.0377C21.0096 20.3341 20.7429 20.5795 20.4238 20.7499C20.1048 20.9203 19.7443 21.0099 19.3776 21.01H4.62239C4.25568 21.0099 3.89524 20.9203 3.57619 20.7499C3.25715 20.5795 2.99038 20.3341 2.80189 20.0377C2.6134 19.7412 2.50961 19.4038 2.50064 19.0582C2.49166 18.7127 2.57781 18.3709 2.75069 18.0661L10.1283 5.05809ZM12.2669 5.86637C12.2409 5.821 12.2024 5.7831 12.1554 5.75668C12.1084 5.73026 12.0547 5.71631 12 5.71631C11.9453 5.71631 11.8916 5.73026 11.8446 5.75668C11.7976 5.7831 11.7591 5.821 11.7331 5.86637L4.35552 18.8744C4.33081 18.9179 4.31846 18.9667 4.3197 19.016C4.32094 19.0654 4.33571 19.1136 4.36258 19.156C4.38946 19.1983 4.42751 19.2334 4.47304 19.2578C4.51857 19.2822 4.57002 19.295 4.62239 19.2951H19.3776C19.43 19.295 19.4814 19.2822 19.527 19.2578C19.5725 19.2334 19.6105 19.1983 19.6374 19.156C19.6643 19.1136 19.6791 19.0654 19.6803 19.016C19.6815 18.9667 19.6692 18.9179 19.6445 18.8744L12.2669 5.86637Z"></path> <path d="M12.8111 13.293V10.4348C12.8111 10.2074 12.7207 9.98933 12.5599 9.82853C12.3991 9.66773 12.181 9.57739 11.9536 9.57739C11.7262 9.57739 11.5081 9.66773 11.3473 9.82853C11.1865 9.98933 11.0962 10.2074 11.0962 10.4348V13.293C11.0962 13.5204 11.1865 13.7385 11.3473 13.8993C11.5081 14.0601 11.7262 14.1504 11.9536 14.1504C12.181 14.1504 12.3991 14.0601 12.5599 13.8993C12.7207 13.7385 12.8111 13.5204 12.8111 13.293Z"></path> <path d="M12.762 17.2454C12.9764 17.031 13.0969 16.7402 13.0969 16.437C13.0969 16.1337 12.9764 15.843 12.762 15.6285C12.5476 15.4141 12.2569 15.2937 11.9536 15.2937C11.6504 15.2937 11.3596 15.4141 11.1452 15.6285C10.9308 15.843 10.8104 16.1337 10.8104 16.437C10.8104 16.7402 10.9308 17.031 11.1452 17.2454C11.3596 17.4598 11.6504 17.5802 11.9536 17.5802C12.2569 17.5802 12.5476 17.4598 12.762 17.2454Z"></path> </g> </svg>'
  }, {
    type: "caution",
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M0 0h24v24H0V0z" fill="none"></path><g fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z"></path><path d="M12 17.25C11.6685 17.25 11.3505 17.1183 11.1161 16.8839C10.8817 16.6495 10.75 16.3315 10.75 16C10.75 15.6685 10.8817 15.3505 11.1161 15.1161C11.3505 14.8817 11.6685 14.75 12 14.75C12.3315 14.75 12.6495 14.8817 12.8839 15.1161C13.1183 15.3505 13.25 15.6685 13.25 16C13.25 16.3315 13.1183 16.6495 12.8839 16.8839C12.6495 17.1183 12.3315 17.25 12 17.25Z"></path><path d="M13 8C13 7.45 12.55 7 12 7C11.45 7 11 7.45 11 8V12C11 12.55 11.45 13 12 13C12.55 13 13 12.55 13 12V8Z"></path></g> </svg>'
  }];

  function n(a) {
    return a.length ? Object.values([...i, ...a].reduce((s, r) => (s[r.type] = r, s), {})) : i
  }

  function h(a) {
    return `^(?:\\[\\!${a.toUpperCase()}\\])s*? ?`
  }

  function f(a) {
    return a.slice(0, 1).toUpperCase() + a.slice(1).toLowerCase()
  }

  function m(a = {}) {
    const {
      className: s = "markdown-alert",
      variants: r = []
    } = a, g = n(r);
    return {
      walkTokens(e) {
        var t, p, d, v;
        if (e.type !== "blockquote") return;
        const o = g.find(({
          type: c
        }) => new RegExp(h(c)).test(e.text));
        if (o) {
          const {
            type: c,
            icon: Z,
            title: w = f(c),
            titleClassName: x = `${s}-title`
          } = o;
          Object.assign(e, {
            type: "alert",
            meta: {
              className: s,
              variant: c,
              icon: Z,
              title: w,
              titleClassName: x
            }
          });
          const l = (t = e.tokens) == null ? void 0 : t[0],
            u = (p = l.raw) == null ? void 0 : p.replace(new RegExp(h(c)), "").trim();
          u ? (l.tokens = this.Lexer.lexInline(u), (d = e.tokens) == null || d.splice(0, 1, l)) : (v = e.tokens) == null || v.shift()
        }
      },
      extensions: [{
        name: "alert",
        level: "block",
        renderer({
          meta: e,
          tokens: o = []
        }) {
          let t = `<div class="${e.className} ${e.className}-${e.variant}"> `;
          return t += `<p class="${e.titleClassName}">`, t += e.icon, t += e.title, t += `</p> `, t += this.parser.parse(o), t += `</div> `, t
        }
      }]
    }
  }
  return m
});
