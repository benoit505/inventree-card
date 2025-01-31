const t="inventree-card",e=`custom:${t}`,i=`${t}-editor`,o={type:e,entity:"",title:"Inventory",show_header:!0,show_low_stock:!0,show_minimum:!0,columns:2,compact_view:!1,sort_by:"name",sort_direction:"asc",grid_spacing:16,item_height:64,enable_quick_add:!1,show_history:!1,show_stock_warning:!1},s=[{name:"entity",label:"Entity",selector:{entity:{domain:"sensor"}}},{name:"title",label:"Card Title",selector:{text:{}}},{name:"show_header",label:"Show Header",selector:{boolean:{}}},{name:"show_minimum",label:"Show Minimum Stock",selector:{boolean:{}}},{name:"show_low_stock",label:"Show Low Stock Warning",selector:{boolean:{}}},{name:"columns",label:"Number of Columns",selector:{number:{min:1,max:6,step:1}}},{name:"compact_view",label:"Compact View",selector:{boolean:{}}},{name:"sort_by",label:"Sort By",selector:{select:{options:[{value:"name",label:"Name"},{value:"stock",label:"Stock Level"},{value:"minimum",label:"Minimum Stock"}]}}},{name:"sort_direction",label:"Sort Direction",selector:{select:{options:[{value:"asc",label:"Ascending"},{value:"desc",label:"Descending"}]}}},{name:"grid_spacing",label:"Grid Spacing",selector:{number:{min:4,max:48,step:4}}},{name:"item_height",label:"Item Height",selector:{number:{min:32,max:200,step:8}}},{name:"enable_quick_add",label:"Enable Quick Add",selector:{boolean:{}}},{name:"show_history",label:"Show History",selector:{boolean:{}}},{name:"show_stock_warning",label:"Show Stock Warning",selector:{boolean:{}}}];function n(t,e,i,o){var s,n=arguments.length,r=n<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(r=(n<3?s(r):n>3?s(e,i,r):s(e,i))||r);return n>3&&r&&Object.defineProperty(e,i,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const r=window,a=r.ShadowRoot&&(void 0===r.ShadyCSS||r.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,l=Symbol(),c=new WeakMap;class d{constructor(t,e,i){if(this._$cssResult$=!0,i!==l)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(a&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=c.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&c.set(e,t))}return t}toString(){return this.cssText}}const h=(t,...e)=>{const i=1===t.length?t[0]:e.reduce(((e,i,o)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[o+1]),t[0]);return new d(i,t,l)},u=a?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new d("string"==typeof t?t:t+"",void 0,l))(e)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var p;const m=window,v=m.trustedTypes,g=v?v.emptyScript:"",f=m.reactiveElementPolyfillSupport,_={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},b=(t,e)=>e!==t&&(e==e||t==t),$={attribute:!0,type:String,converter:_,reflect:!1,hasChanged:b},y="finalized";class A extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(t){var e;this.finalize(),(null!==(e=this.h)&&void 0!==e?e:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((e,i)=>{const o=this._$Ep(i,e);void 0!==o&&(this._$Ev.set(o,i),t.push(o))})),t}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,o=this.getPropertyDescriptor(t,i,e);void 0!==o&&Object.defineProperty(this.prototype,t,o)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(o){const s=this[t];this[e]=o,this.requestUpdate(t,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||$}static finalize(){if(this.hasOwnProperty(y))return!1;this[y]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(u(t))}else void 0!==t&&e.push(u(t));return e}static _$Ep(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}_$Eu(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)))}addController(t){var e,i;(null!==(e=this._$ES)&&void 0!==e?e:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$ES)||void 0===e||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])}))}createRenderRoot(){var t;const e=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,e)=>{a?t.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):e.forEach((e=>{const i=document.createElement("style"),o=r.litNonce;void 0!==o&&i.setAttribute("nonce",o),i.textContent=e.cssText,t.appendChild(i)}))})(e,this.constructor.elementStyles),e}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)}))}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)}))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$EO(t,e,i=$){var o;const s=this.constructor._$Ep(t,i);if(void 0!==s&&!0===i.reflect){const n=(void 0!==(null===(o=i.converter)||void 0===o?void 0:o.toAttribute)?i.converter:_).toAttribute(e,i.type);this._$El=t,null==n?this.removeAttribute(s):this.setAttribute(s,n),this._$El=null}}_$AK(t,e){var i;const o=this.constructor,s=o._$Ev.get(t);if(void 0!==s&&this._$El!==s){const t=o.getPropertyOptions(s),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(i=t.converter)||void 0===i?void 0:i.fromAttribute)?t.converter:_;this._$El=s,this[s]=n.fromAttribute(e,t.type),this._$El=null}}requestUpdate(t,e,i){let o=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||b)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,i))):o=!1),!this.isUpdatePending&&o&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,e)=>this[e]=t)),this._$Ei=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)})),this.update(i)):this._$Ek()}catch(t){throw e=!1,this._$Ek(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$ES)||void 0===e||e.forEach((t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,e)=>this._$EO(e,this[e],t))),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var w;A[y]=!0,A.elementProperties=new Map,A.elementStyles=[],A.shadowRootOptions={mode:"open"},null==f||f({ReactiveElement:A}),(null!==(p=m.reactiveElementVersions)&&void 0!==p?p:m.reactiveElementVersions=[]).push("1.6.3");const S=window,x=S.trustedTypes,E=x?x.createPolicy("lit-html",{createHTML:t=>t}):void 0,k="$lit$",C=`lit$${(Math.random()+"").slice(9)}$`,O="?"+C,N=`<${O}>`,P=document,U=()=>P.createComment(""),T=t=>null===t||"object"!=typeof t&&"function"!=typeof t,H=Array.isArray,j="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,M=/-->/g,I=/>/g,z=RegExp(`>|${j}(?:([^\\s"'>=/]+)(${j}*=${j}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),L=/'/g,D=/"/g,B=/^(?:script|style|textarea|title)$/i,V=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),J=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),W=new WeakMap,F=P.createTreeWalker(P,129,null,!1);function K(t,e){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==E?E.createHTML(e):e}const Y=(t,e)=>{const i=t.length-1,o=[];let s,n=2===e?"<svg>":"",r=R;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,d=0;for(;d<i.length&&(r.lastIndex=d,l=r.exec(i),null!==l);)d=r.lastIndex,r===R?"!--"===l[1]?r=M:void 0!==l[1]?r=I:void 0!==l[2]?(B.test(l[2])&&(s=RegExp("</"+l[2],"g")),r=z):void 0!==l[3]&&(r=z):r===z?">"===l[0]?(r=null!=s?s:R,c=-1):void 0===l[1]?c=-2:(c=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?z:'"'===l[3]?D:L):r===D||r===L?r=z:r===M||r===I?r=R:(r=z,s=void 0);const h=r===z&&t[e+1].startsWith("/>")?" ":"";n+=r===R?i+N:c>=0?(o.push(a),i.slice(0,c)+k+i.slice(c)+C+h):i+C+(-2===c?(o.push(void 0),e):h)}return[K(t,n+(t[i]||"<?>")+(2===e?"</svg>":"")),o]};class Z{constructor({strings:t,_$litType$:e},i){let o;this.parts=[];let s=0,n=0;const r=t.length-1,a=this.parts,[l,c]=Y(t,e);if(this.el=Z.createElement(l,i),F.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(o=F.nextNode())&&a.length<r;){if(1===o.nodeType){if(o.hasAttributes()){const t=[];for(const e of o.getAttributeNames())if(e.endsWith(k)||e.startsWith(C)){const i=c[n++];if(t.push(e),void 0!==i){const t=o.getAttribute(i.toLowerCase()+k).split(C),e=/([.?@])?(.*)/.exec(i);a.push({type:1,index:s,name:e[2],strings:t,ctor:"."===e[1]?et:"?"===e[1]?ot:"@"===e[1]?st:tt})}else a.push({type:6,index:s})}for(const e of t)o.removeAttribute(e)}if(B.test(o.tagName)){const t=o.textContent.split(C),e=t.length-1;if(e>0){o.textContent=x?x.emptyScript:"";for(let i=0;i<e;i++)o.append(t[i],U()),F.nextNode(),a.push({type:2,index:++s});o.append(t[e],U())}}}else if(8===o.nodeType)if(o.data===O)a.push({type:2,index:s});else{let t=-1;for(;-1!==(t=o.data.indexOf(C,t+1));)a.push({type:7,index:s}),t+=C.length-1}s++}}static createElement(t,e){const i=P.createElement("template");return i.innerHTML=t,i}}function G(t,e,i=t,o){var s,n,r,a;if(e===J)return e;let l=void 0!==o?null===(s=i._$Co)||void 0===s?void 0:s[o]:i._$Cl;const c=T(e)?void 0:e._$litDirective$;return(null==l?void 0:l.constructor)!==c&&(null===(n=null==l?void 0:l._$AO)||void 0===n||n.call(l,!1),void 0===c?l=void 0:(l=new c(t),l._$AT(t,i,o)),void 0!==o?(null!==(r=(a=i)._$Co)&&void 0!==r?r:a._$Co=[])[o]=l:i._$Cl=l),void 0!==l&&(e=G(t,l._$AS(t,e.values),l,o)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:i},parts:o}=this._$AD,s=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:P).importNode(i,!0);F.currentNode=s;let n=F.nextNode(),r=0,a=0,l=o[0];for(;void 0!==l;){if(r===l.index){let e;2===l.type?e=new X(n,n.nextSibling,this,t):1===l.type?e=new l.ctor(n,l.name,l.strings,this,t):6===l.type&&(e=new nt(n,this,t)),this._$AV.push(e),l=o[++a]}r!==(null==l?void 0:l.index)&&(n=F.nextNode(),r++)}return F.currentNode=P,s}v(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class X{constructor(t,e,i,o){var s;this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=o,this._$Cp=null===(s=null==o?void 0:o.isConnected)||void 0===s||s}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===(null==t?void 0:t.nodeType)&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=G(this,t,e),T(t)?t===q||null==t||""===t?(this._$AH!==q&&this._$AR(),this._$AH=q):t!==this._$AH&&t!==J&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):(t=>H(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]))(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==q&&T(this._$AH)?this._$AA.nextSibling.data=t:this.$(P.createTextNode(t)),this._$AH=t}g(t){var e;const{values:i,_$litType$:o}=t,s="number"==typeof o?this._$AC(t):(void 0===o.el&&(o.el=Z.createElement(K(o.h,o.h[0]),this.options)),o);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===s)this._$AH.v(i);else{const t=new Q(s,this),e=t.u(this.options);t.v(i),this.$(e),this._$AH=t}}_$AC(t){let e=W.get(t.strings);return void 0===e&&W.set(t.strings,e=new Z(t)),e}T(t){H(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,o=0;for(const s of t)o===e.length?e.push(i=new X(this.k(U()),this.k(U()),this,this.options)):i=e[o],i._$AI(s),o++;o<e.length&&(this._$AR(i&&i._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cp=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class tt{constructor(t,e,i,o,s){this.type=1,this._$AH=q,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,o){const s=this.strings;let n=!1;if(void 0===s)t=G(this,t,e,0),n=!T(t)||t!==this._$AH&&t!==J,n&&(this._$AH=t);else{const o=t;let r,a;for(t=s[0],r=0;r<s.length-1;r++)a=G(this,o[i+r],e,r),a===J&&(a=this._$AH[r]),n||(n=!T(a)||a!==this._$AH[r]),a===q?t=q:t!==q&&(t+=(null!=a?a:"")+s[r+1]),this._$AH[r]=a}n&&!o&&this.j(t)}j(t){t===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===q?void 0:t}}const it=x?x.emptyScript:"";class ot extends tt{constructor(){super(...arguments),this.type=4}j(t){t&&t!==q?this.element.setAttribute(this.name,it):this.element.removeAttribute(this.name)}}class st extends tt{constructor(t,e,i,o,s){super(t,e,i,o,s),this.type=5}_$AI(t,e=this){var i;if((t=null!==(i=G(this,t,e,0))&&void 0!==i?i:q)===J)return;const o=this._$AH,s=t===q&&o!==q||t.capture!==o.capture||t.once!==o.once||t.passive!==o.passive,n=t!==q&&(o===q||s);s&&this.element.removeEventListener(this.name,this,o),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this._$AH.handleEvent(t)}}class nt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){G(this,t)}}const rt=S.litHtmlPolyfillSupport;null==rt||rt(Z,X),(null!==(w=S.litHtmlVersions)&&void 0!==w?w:S.litHtmlVersions=[]).push("2.8.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var at,lt;class ct extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{var o,s;const n=null!==(o=null==i?void 0:i.renderBefore)&&void 0!==o?o:e;let r=n._$litPart$;if(void 0===r){const t=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:null;n._$litPart$=r=new X(e.insertBefore(U(),t),t,void 0,null!=i?i:{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1)}render(){return J}}ct.finalized=!0,ct._$litElement$=!0,null===(at=globalThis.litElementHydrateSupport)||void 0===at||at.call(globalThis,{LitElement:ct});const dt=globalThis.litElementPolyfillSupport;null==dt||dt({LitElement:ct}),(null!==(lt=globalThis.litElementVersions)&&void 0!==lt?lt:globalThis.litElementVersions=[]).push("3.3.3");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ht=t=>e=>"function"==typeof e?((t,e)=>(customElements.define(t,e),e))(t,e):((t,e)=>{const{kind:i,elements:o}=e;return{kind:i,elements:o,finisher(e){customElements.define(t,e)}}})(t,e)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */,ut=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(i){i.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}};function pt(t){return(e,i)=>void 0!==i?((t,e,i)=>{e.constructor.createProperty(i,t)})(t,e,i):ut(t,e)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */}function mt(t){return pt({...t,state:!0})}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var vt;null===(vt=window.HTMLSlotElement)||void 0===vt||vt.prototype.assignedElements;const gt=h`
    :host {
        --default-spacing: 16px;
        --default-height: 64px;
        display: block;
    }
    
    ha-card {
        height: auto;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .card-header {
        padding: var(--default-spacing);
        font-size: 16px;
        font-weight: bold;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(var(--columns, 2), 1fr);
        gap: var(--grid-spacing, var(--default-spacing));
        padding: var(--grid-spacing, var(--default-spacing));
        overflow-y: auto;
        box-sizing: border-box;
        min-height: 0;
    }

    .item-frame {
        width: 100%;
        min-height: var(--item-height, var(--default-height));
        height: auto;
        background: var(--card-background-color);
        border-radius: 12px;
        border: 1px solid var(--divider-color);
        transition: all 0.2s ease-in-out;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
    }

    .main-box {
        flex: 1;
        padding: 12px;
        border-radius: 12px 12px 0 0;
        display: flex;
        flex-direction: column;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .item-frame.compact {
        padding: 8px;
        gap: 8px;
    }

    .main-box:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .button-container {
        padding: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        background: var(--card-background-color);
        border-radius: 0 0 12px 12px;
        position: relative;
        z-index: 2;
    }

    .quick-add {
        display: flex;
        gap: 4px;
    }

    .adjust-button {
        min-width: 36px;
        height: 36px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
    }

    .adjust-button.minus {
        color: var(--error-color);
        border-color: var(--error-color);
    }

    .adjust-button.plus {
        color: var(--success-color);
        border-color: var(--success-color);
    }

    .adjust-button:hover {
        background: var(--secondary-background-color);
        transform: translateY(-1px);
    }

    .name {
        font-size: 1.1em;
        font-weight: 500;
    }

    .stock {
        font-weight: 500;
        margin: 8px 0;
    }

    .minimum {
        font-size: 0.9em;
        opacity: 0.8;
    }

    .history {
        margin-top: 8px;
        padding: 8px;
        background: var(--secondary-background-color);
        border-radius: 4px;
        text-align: center;
    }

    .item-frame.low-stock {
        border-color: var(--error-color);
        box-shadow: 0 0 0 1px var(--error-color);
    }

    .item-frame.warning {
        border-color: var(--warning-color);
        box-shadow: 0 0 0 1px var(--warning-color);
    }

    .out-of-stock {
        background-color: var(--error-color, #db4437);
        color: var(--text-primary-color, white);
    }

    .low-stock {
        background-color: var(--warning-color, #ffa726);
        color: var(--text-primary-color, white);
    }

    .good-stock {
        background-color: var(--success-color, #43a047);
        color: var(--text-primary-color, white);
    }

    .image-container {
        width: 100%;
        height: 120px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        border-radius: 8px;
        background: var(--secondary-background-color);
        margin-bottom: 8px;
    }

    .image-container img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        transition: transform 0.2s ease-in-out;
    }

    .image-container img:hover {
        transform: scale(1.05);
    }
`,ft=(t,e)=>{var i,o;console.debug("🎴 Card: Starting render with config:",e);if(!t.states[e.entity])return V`<div>Entity not found: ${e.entity}</div>`;const s=null!==(i=e.grid_spacing)&&void 0!==i?i:16,n=null!==(o=e.item_height)&&void 0!==o?o:64;let r=((t,e)=>{var i,o,s;console.debug("🔍 Starting parseState for:",e);const n=t.states[e];if(!n)return console.warn("❌ No state found for:",e),[];if(console.debug("📦 Raw state data:",n),null===(i=n.attributes)||void 0===i?void 0:i.items)return console.debug("📦 Found items in attributes"),n.attributes.items;if(null===(o=n.attributes)||void 0===o?void 0:o.stock)return console.debug("📦 Found stock in attributes"),n.attributes.stock;if("string"==typeof n.state&&n.state.startsWith("["))try{const t=JSON.parse(n.state);if(Array.isArray(t))return console.debug("📦 Parsed state into array"),t}catch(t){console.warn("❌ Failed to parse state as JSON:",t)}return(null===(s=n.attributes)||void 0===s?void 0:s.name)?(console.debug("📦 Constructing single item from attributes"),[{name:n.attributes.name,in_stock:Number(n.state)||0,minimum_stock:n.attributes.minimum_stock||0}]):(console.warn("❌ No valid items found in state or attributes"),[])})(t,e.entity);return console.debug("🎴 Card: Parsed items:",r),e.sort_by&&(r=[...r].sort(((t,i)=>{let o=0;switch(e.sort_by){case"stock":o=t.in_stock-i.in_stock;break;case"minimum":o=t.minimum_stock-i.minimum_stock;break;default:o=t.name.localeCompare(i.name)}return"asc"===e.sort_direction?o:-o}))),V`
        <ha-card>
            ${e.show_header?V`
                <div class="card-header">
                    ${e.title||"Inventory"}
                </div>
            `:""}
            <div class="grid" 
                style="
                    --columns: ${e.columns||2};
                    --grid-spacing: ${s}px;
                    --item-height: ${n}px;
                "
            >
                ${r.length>0?r.map((i=>((t,e,i)=>{const o=t.in_stock<t.minimum_stock,s=async i=>{console.debug("Adjusting stock:",{item:t.name,amount:i});try{await e.callService("inventree","adjust_stock",{name:t.name,quantity:i})}catch(t){console.error("Failed to adjust stock:",t)}};return V`
        <div class="item-frame ${o&&i.show_low_stock?"low-stock":""} ${i.compact_view?"compact":""}">
            <div class="main-box ${(t=>t.in_stock<=0?"out-of-stock":t.in_stock<t.minimum_stock?"low-stock":"good-stock")(t)}">
                <div class="content">
                    ${t.thumbnail?V`
                        <div class="image-container">
                            <img 
                                src="${t.thumbnail}" 
                                alt="${t.name}"
                                loading="lazy"
                                @error=${t=>{t.target.style.display="none"}}
                            />
                        </div>
                    `:""}
                    <div class="name">${t.name}</div>
                    <div class="stock">
                        In Stock: ${t.in_stock}
                    </div>
                    ${i.show_minimum?V`
                        <div class="minimum">Minimum: ${t.minimum_stock}</div>
                    `:""}
                    ${i.show_history?V`
                        <div class="history">
                            📊 History placeholder
                        </div>
                    `:""}
                </div>
            </div>
            ${i.enable_quick_add?V`
                <div class="button-container">
                    <button class="adjust-button minus" @click=${()=>s(-1)}>-1</button>
                    <div class="quick-add">
                        ${[1,5,10].map((t=>V`
                            <button class="adjust-button plus" @click=${()=>s(t)}>
                                +${t}
                            </button>
                        `))}
                    </div>
                </div>
            `:""}
        </div>
    `})(i,t,e))):V`<div>No items to display</div>`}
            </div>
        </ha-card>
    `};console.info("InvenTree Card: Starting initialization");let _t=class extends ct{static async getConfigElement(){return console.debug("InvenTree Card: Loading editor..."),void 0===customElements.get(i)&&await Promise.resolve().then((function(){return wt})),console.debug("InvenTree Card: Editor loaded"),document.createElement(i)}static getStubConfig(){return Object.assign({type:`custom:${t}`,entity:""},JSON.parse(JSON.stringify(o)))}setConfig(e){if(!e.entity)throw new Error("Please define an entity");console.debug("🎴 Card: Setting config:",e);const i=JSON.parse(JSON.stringify(o)),s=Object.assign(Object.assign(Object.assign({},i),JSON.parse(JSON.stringify(e))),{type:`custom:${t}`});console.debug("🎴 Card: Merged config:",s),this._config=s,this.requestUpdate()}shouldUpdate(t){if(!this._config)return!1;if(t.has("_config"))return console.debug("🎴 Card: Config changed, updating",this._config),!0;const e=((t,e,i)=>{var o,s;if(console.debug("shouldUpdate - Checking updates for:",i),!i)return console.debug("shouldUpdate - No entityId provided"),!1;const n=null===(o=null==e?void 0:e.states[i])||void 0===o?void 0:o.state,r=null===(s=null==t?void 0:t.states[i])||void 0===s?void 0:s.state;console.debug("shouldUpdate - Old state:",n),console.debug("shouldUpdate - New state:",r);const a=n!==r;return console.debug("shouldUpdate - Should update?",a),a})(this.hass,t.get("hass"),this._config.entity);return console.debug("🎴 Card: Should update?",e,{config:this._config,entity:this._config.entity}),e}render(){return this._config&&this.hass?ft(this.hass,this._config):V``}getCardSize(){var t,e;if(!this._config)return 1;const i=null===(e=null===(t=this.hass)||void 0===t?void 0:t.states[this._config.entity])||void 0===e?void 0:e.state;if(!i)return 1;try{const t=JSON.parse(i),e=Math.ceil(t.length/(this._config.columns||2));return console.debug("🎴 Card: Calculated size:",e),e}catch(t){return console.warn("🎴 Card: Failed to calculate size:",t),1}}};var bt,$t;_t.styles=gt,n([pt({attribute:!1})],_t.prototype,"hass",void 0),n([mt()],_t.prototype,"_config",void 0),_t=n([ht(t)],_t),console.info("InvenTree Card: Class defined"),console.info("InvenTree Card: Registration complete"),function(t){t.language="language",t.system="system",t.comma_decimal="comma_decimal",t.decimal_comma="decimal_comma",t.space_comma="space_comma",t.none="none"}(bt||(bt={})),function(t){t.language="language",t.system="system",t.am_pm="12",t.twenty_four="24"}($t||($t={}));const yt=h`
  ha-form {
    display: block;
    padding: 16px;
  }
`;let At=class extends ct{setConfig(t){console.debug("📝 Editor: Initial config:",t),this._config=JSON.parse(JSON.stringify(t))}_handleValueChanged(t){if(!this._config)return;t.stopPropagation();const e=Object.assign(Object.assign({},this._config),t.detail.value);console.debug("📝 Editor Value Changed:",{oldConfig:this._config,newValue:t.detail.value,newConfig:e}),function(t,e,i,o){o=o||{},i=null==i?{}:i;var s=new Event(e,{bubbles:void 0===o.bubbles||o.bubbles,cancelable:Boolean(o.cancelable),composed:void 0===o.composed||o.composed});s.detail=i,t.dispatchEvent(s)}(this,"config-changed",{config:e})}render(){return this.hass&&this._config?V`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${s}
                .computeLabel=${t=>t.name}
                @value-changed=${this._handleValueChanged}
            ></ha-form>
        `:q}};At.styles=yt,n([pt({attribute:!1})],At.prototype,"hass",void 0),n([mt()],At.prototype,"_config",void 0),At=n([ht(i)],At);var wt=Object.freeze({__proto__:null,get InventreeCardEditor(){return At}});console.info("InvenTree Card: Starting registration..."),customElements.get(t)||(console.info(`InvenTree Card: Registering ${t}`),customElements.define(t,_t)),window.customCards=window.customCards||[],window.customCards.push({type:e,name:"InvenTree Card",description:"Display and manage InvenTree inventory",preview:!0}),console.info("InvenTree Card: Registration complete");
//# sourceMappingURL=inventree-card.js.map
