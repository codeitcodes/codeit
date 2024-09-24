(function(h,p){typeof exports=="object"&&typeof module<"u"?module.exports=p():typeof define=="function"&&define.amd?define(p):(h=typeof globalThis<"u"?globalThis:h||self,h.markedFootnote=p())})(this,function(){"use strict";function h(t,c){const n={type:"footnotes",raw:c,rawItems:[],items:[]};return{name:"footnote",level:"block",childTokens:["content"],tokenizer(r){t.hasFootnotes||(this.lexer.tokens.push(n),t.tokens=this.lexer.tokens,t.hasFootnotes=!0,n.rawItems=[],n.items=[]);const e=/^\[\^([^\]\n]+)\]:(?:[ \t]+|[\n]*?|$)([^\n]*?(?:\n|$)(?:\n*?[ ]{4,}[^\n]*)*)/.exec(r);if(e){const[o,f,u=""]=e;let l=u.split(`
`).reduce((i,s)=>i+`
`+s.replace(/^(?:[ ]{4}|[\t])/,""),"");const d=l.trimEnd().split(`
`).pop();l+=d&&/^[ \t]*?[>\-*][ ]|[`]{3,}$|^[ \t]*?[|].+[|]$/.test(d)?`

`:"";const a={type:"footnote",raw:o,label:f,refs:[],content:this.lexer.blockTokens(l)};return n.rawItems.push(a),a}},renderer(){return""}}}function p(t,c=!1){let n=0;return{name:"footnoteRef",level:"inline",tokenizer(r){const e=/^\[\^([^\]\n]+)\]/.exec(r);if(e){const[o,f]=e,u=this.lexer.tokens[0],l=u.rawItems.filter(s=>s.label===f);if(!l.length)return;const d=l[0],a=u.items.filter(s=>s.label===f)[0],i={type:"footnoteRef",raw:o,id:"",label:f};return a?(i.id=a.refs[0].id,a.refs.push(i)):(n++,i.id=String(n),d.refs.push(i),u.items.push(d)),i}},renderer({id:r,label:e}){n=0;const o=encodeURIComponent(e);return`<sup><a id="${t}ref-${o}" href="#${t+o}" data-${t}ref aria-describedby="${t}label">${c?`[${r}]`:r}</a></sup>`}}}function $(t){return{name:"footnotes",renderer({raw:c,items:n=[]}){if(n.length===0)return"";const r=n.reduce((o,{label:f,content:u,refs:l})=>{const d=encodeURIComponent(f),a=this.parser.parse(u).trimEnd(),i=a.endsWith("</p>");let s=`<li id="${t+d}">
`;return s+=i?a.replace(/<\/p>$/,""):a,l.forEach((b,m)=>{s+=` <a href="#${t}ref-${d}" data-${t}backref aria-label="Back to reference ${f}">${m>0?`↩<sup>${m+1}</sup>`:"↩"}</a>`}),s+=i?`</p>
`:`
`,s+=`</li>
`,o+s},"");let e=`<section class="footnotes" data-footnotes>
`;return e+=`<h2 id="${t}label" class="sr-only">${c.trimEnd()}</h2>
`,e+=`<ol>
${r}</ol>
`,e+=`</section>
`,e}}}function k(t={}){const{prefixId:c="footnote-",description:n="Footnotes",refMarkers:r}=t,e={hasFootnotes:!1,tokens:[]};return{extensions:[h(e,n),p(c,r),$(c)],walkTokens(o){o.type==="footnotes"&&e.tokens.indexOf(o)===0&&o.items.length&&(e.tokens[0]={type:"space",raw:""},e.tokens.push(o)),e.hasFootnotes&&(e.hasFootnotes=!1)}}}return k});
