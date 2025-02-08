const t={mode:!0,custom_path:!0,local_path:!0,enable_bulk_import:!0},e={show_header:!0,show_low_stock:!0,show_minimum:!0,columns:2,sort_by:"name",sort_direction:"asc",compact_view:!1,enable_quick_add:!1,show_history:!1,grid_spacing:16,item_height:64,layout:{min_height:50,max_height:500,transparent:!1},display:{show_image:!0,show_name:!0,show_stock:!0,show_description:!1,show_parameters:!1,show_buttons:!0,image_only:!1},style:{background:void 0,image_size:50,spacing:10},thumbnails:{mode:"auto",custom_path:"",local_path:"/local/inventree_thumbs",enable_bulk_import:!1}},i="inventree-card",s=`custom:${i}`,n=`${i}-editor`,o=[{name:"entity",label:"Entity",selector:{entity:{domain:"sensor"}}},{name:"title",label:"Card Title",selector:{text:{}}},{name:"show_header",label:"Show Header",selector:{boolean:{}}},{name:"show_minimum",label:"Show Minimum Stock",selector:{boolean:{}}},{name:"show_low_stock",label:"Show Low Stock Warning",selector:{boolean:{}}},{name:"columns",label:"Number of Columns",selector:{number:{min:1,max:6,step:1}}},{name:"compact_view",label:"Compact View",selector:{boolean:{}}},{name:"sort_by",label:"Sort By",selector:{select:{options:[{value:"name",label:"Name"},{value:"stock",label:"Stock Level"},{value:"minimum",label:"Minimum Stock"}]}}},{name:"sort_direction",label:"Sort Direction",selector:{select:{options:[{value:"asc",label:"Ascending"},{value:"desc",label:"Descending"}]}}},{name:"grid_spacing",label:"Grid Spacing",selector:{number:{min:4,max:48,step:4}}},{name:"item_height",label:"Item Height",selector:{number:{min:32,max:200,step:8}}},{name:"enable_quick_add",label:"Enable Quick Add",selector:{boolean:{}}},{name:"show_history",label:"Show History",selector:{boolean:{}}},{name:"show_stock_warning",label:"Show Stock Warning",selector:{boolean:{}}},{name:"enable_print_labels",label:"Enable Label Printing",selector:{boolean:{}}},{name:"layout",label:"Layout Settings",type:"expandable",schema:[{name:"min_height",label:"Minimum Height",selector:{number:{min:0,max:1e3,step:10}}},{name:"max_height",label:"Maximum Height",selector:{number:{min:0,max:2e3,step:10}}},{name:"transparent",label:"Transparent Background",selector:{boolean:{}}}]},{name:"display",label:"Display Options",type:"expandable",schema:[{name:"show_image",label:"Show Images",selector:{boolean:{}}},{name:"show_name",label:"Show Names",selector:{boolean:{}}},{name:"show_stock",label:"Show Stock Levels",selector:{boolean:{}}},{name:"show_description",label:"Show Descriptions",selector:{boolean:{}}},{name:"show_parameters",label:"Show Parameters",selector:{boolean:{}}},{name:"show_buttons",label:"Show Action Buttons",selector:{boolean:{}}},{name:"image_only",label:"Image Only Mode",selector:{boolean:{}}}]},{name:"style",label:"Style Settings",type:"expandable",schema:[{name:"background",label:"Background Color",selector:{text:{}}},{name:"image_size",label:"Image Size",selector:{number:{min:20,max:500,step:5}}},{name:"spacing",label:"Element Spacing",selector:{number:{min:0,max:50,step:2}}}]},{name:"thumbnails",label:"Thumbnail Settings",type:"expandable",schema:[{name:"mode",label:"Path Mode",selector:{select:{options:[{value:"auto",label:"Automatic (Local)"},{value:"manual",label:"Manual (Custom Path)"}]}}},{name:"local_path",label:"Local Path Override",selector:{text:{}},description:"Default: /local/inventree_thumbs"},{name:"custom_path",label:"Custom Path",selector:{text:{}},description:"Used when Path Mode is set to Manual"},{name:"enable_bulk_import",label:"Enable Bulk Import",selector:{boolean:{}},description:"Allow using custom images for thumbnails"}].filter((e=>Object.keys(t).includes(e.name)))}];function a(t,e,i,s){var n,o=arguments.length,a=o<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,s);else for(var r=t.length-1;r>=0;r--)(n=t[r])&&(a=(o<3?n(a):o>3?n(e,i,a):n(e,i))||a);return o>3&&a&&Object.defineProperty(e,i,a),a}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const r=window,l=r.ShadowRoot&&(void 0===r.ShadyCSS||r.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,c=Symbol(),d=new WeakMap;class u{constructor(t,e,i){if(this._$cssResult$=!0,i!==c)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(l&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=d.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&d.set(e,t))}return t}toString(){return this.cssText}}const h=(t,...e)=>{const i=1===t.length?t[0]:e.reduce(((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1]),t[0]);return new u(i,t,c)},p=l?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new u("string"==typeof t?t:t+"",void 0,c))(e)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var m;const g=window,b=g.trustedTypes,v=b?b.emptyScript:"",_=g.reactiveElementPolyfillSupport,f={toAttribute(t,e){switch(e){case Boolean:t=t?v:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},y=(t,e)=>e!==t&&(e==e||t==t),$={attribute:!0,type:String,converter:f,reflect:!1,hasChanged:y},w="finalized";class A extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(t){var e;this.finalize(),(null!==(e=this.h)&&void 0!==e?e:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((e,i)=>{const s=this._$Ep(i,e);void 0!==s&&(this._$Ev.set(s,i),t.push(s))})),t}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,s=this.getPropertyDescriptor(t,i,e);void 0!==s&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(s){const n=this[t];this[e]=s,this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||$}static finalize(){if(this.hasOwnProperty(w))return!1;this[w]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(p(t))}else void 0!==t&&e.push(p(t));return e}static _$Ep(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}_$Eu(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)))}addController(t){var e,i;(null!==(e=this._$ES)&&void 0!==e?e:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$ES)||void 0===e||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])}))}createRenderRoot(){var t;const e=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,e)=>{l?t.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):e.forEach((e=>{const i=document.createElement("style"),s=r.litNonce;void 0!==s&&i.setAttribute("nonce",s),i.textContent=e.cssText,t.appendChild(i)}))})(e,this.constructor.elementStyles),e}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)}))}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)}))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$EO(t,e,i=$){var s;const n=this.constructor._$Ep(t,i);if(void 0!==n&&!0===i.reflect){const o=(void 0!==(null===(s=i.converter)||void 0===s?void 0:s.toAttribute)?i.converter:f).toAttribute(e,i.type);this._$El=t,null==o?this.removeAttribute(n):this.setAttribute(n,o),this._$El=null}}_$AK(t,e){var i;const s=this.constructor,n=s._$Ev.get(t);if(void 0!==n&&this._$El!==n){const t=s.getPropertyOptions(n),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(i=t.converter)||void 0===i?void 0:i.fromAttribute)?t.converter:f;this._$El=n,this[n]=o.fromAttribute(e,t.type),this._$El=null}}requestUpdate(t,e,i){let s=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||y)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,e)=>this[e]=t)),this._$Ei=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)})),this.update(i)):this._$Ek()}catch(t){throw e=!1,this._$Ek(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$ES)||void 0===e||e.forEach((t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,e)=>this._$EO(e,this[e],t))),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var k;A[w]=!0,A.elementProperties=new Map,A.elementStyles=[],A.shadowRootOptions={mode:"open"},null==_||_({ReactiveElement:A}),(null!==(m=g.reactiveElementVersions)&&void 0!==m?m:g.reactiveElementVersions=[]).push("1.6.3");const x=window,S=x.trustedTypes,C=S?S.createPolicy("lit-html",{createHTML:t=>t}):void 0,E="$lit$",O=`lit$${(Math.random()+"").slice(9)}$`,j="?"+O,P=`<${j}>`,N=document,U=()=>N.createComment(""),T=t=>null===t||"object"!=typeof t&&"function"!=typeof t,H=Array.isArray,M="[ \t\n\f\r]",z=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,I=/-->/g,R=/>/g,L=RegExp(`>|${M}(?:([^\\s"'>=/]+)(${M}*=${M}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),D=/'/g,B=/"/g,V=/^(?:script|style|textarea|title)$/i,J=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),q=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),F=new WeakMap,K=N.createTreeWalker(N,129,null,!1);function Z(t,e){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==C?C.createHTML(e):e}const Y=(t,e)=>{const i=t.length-1,s=[];let n,o=2===e?"<svg>":"",a=z;for(let e=0;e<i;e++){const i=t[e];let r,l,c=-1,d=0;for(;d<i.length&&(a.lastIndex=d,l=a.exec(i),null!==l);)d=a.lastIndex,a===z?"!--"===l[1]?a=I:void 0!==l[1]?a=R:void 0!==l[2]?(V.test(l[2])&&(n=RegExp("</"+l[2],"g")),a=L):void 0!==l[3]&&(a=L):a===L?">"===l[0]?(a=null!=n?n:z,c=-1):void 0===l[1]?c=-2:(c=a.lastIndex-l[2].length,r=l[1],a=void 0===l[3]?L:'"'===l[3]?B:D):a===B||a===D?a=L:a===I||a===R?a=z:(a=L,n=void 0);const u=a===L&&t[e+1].startsWith("/>")?" ":"";o+=a===z?i+P:c>=0?(s.push(r),i.slice(0,c)+E+i.slice(c)+O+u):i+O+(-2===c?(s.push(void 0),e):u)}return[Z(t,o+(t[i]||"<?>")+(2===e?"</svg>":"")),s]};class G{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let n=0,o=0;const a=t.length-1,r=this.parts,[l,c]=Y(t,e);if(this.el=G.createElement(l,i),K.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(s=K.nextNode())&&r.length<a;){if(1===s.nodeType){if(s.hasAttributes()){const t=[];for(const e of s.getAttributeNames())if(e.endsWith(E)||e.startsWith(O)){const i=c[o++];if(t.push(e),void 0!==i){const t=s.getAttribute(i.toLowerCase()+E).split(O),e=/([.?@])?(.*)/.exec(i);r.push({type:1,index:n,name:e[2],strings:t,ctor:"."===e[1]?it:"?"===e[1]?nt:"@"===e[1]?ot:et})}else r.push({type:6,index:n})}for(const e of t)s.removeAttribute(e)}if(V.test(s.tagName)){const t=s.textContent.split(O),e=t.length-1;if(e>0){s.textContent=S?S.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],U()),K.nextNode(),r.push({type:2,index:++n});s.append(t[e],U())}}}else if(8===s.nodeType)if(s.data===j)r.push({type:2,index:n});else{let t=-1;for(;-1!==(t=s.data.indexOf(O,t+1));)r.push({type:7,index:n}),t+=O.length-1}n++}}static createElement(t,e){const i=N.createElement("template");return i.innerHTML=t,i}}function Q(t,e,i=t,s){var n,o,a,r;if(e===q)return e;let l=void 0!==s?null===(n=i._$Co)||void 0===n?void 0:n[s]:i._$Cl;const c=T(e)?void 0:e._$litDirective$;return(null==l?void 0:l.constructor)!==c&&(null===(o=null==l?void 0:l._$AO)||void 0===o||o.call(l,!1),void 0===c?l=void 0:(l=new c(t),l._$AT(t,i,s)),void 0!==s?(null!==(a=(r=i)._$Co)&&void 0!==a?a:r._$Co=[])[s]=l:i._$Cl=l),void 0!==l&&(e=Q(t,l._$AS(t,e.values),l,s)),e}class X{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:i},parts:s}=this._$AD,n=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:N).importNode(i,!0);K.currentNode=n;let o=K.nextNode(),a=0,r=0,l=s[0];for(;void 0!==l;){if(a===l.index){let e;2===l.type?e=new tt(o,o.nextSibling,this,t):1===l.type?e=new l.ctor(o,l.name,l.strings,this,t):6===l.type&&(e=new at(o,this,t)),this._$AV.push(e),l=s[++r]}a!==(null==l?void 0:l.index)&&(o=K.nextNode(),a++)}return K.currentNode=N,n}v(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class tt{constructor(t,e,i,s){var n;this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cp=null===(n=null==s?void 0:s.isConnected)||void 0===n||n}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===(null==t?void 0:t.nodeType)&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),T(t)?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==q&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):(t=>H(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]))(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==W&&T(this._$AH)?this._$AA.nextSibling.data=t:this.$(N.createTextNode(t)),this._$AH=t}g(t){var e;const{values:i,_$litType$:s}=t,n="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=G.createElement(Z(s.h,s.h[0]),this.options)),s);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===n)this._$AH.v(i);else{const t=new X(n,this),e=t.u(this.options);t.v(i),this.$(e),this._$AH=t}}_$AC(t){let e=F.get(t.strings);return void 0===e&&F.set(t.strings,e=new G(t)),e}T(t){H(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const n of t)s===e.length?e.push(i=new tt(this.k(U()),this.k(U()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cp=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class et{constructor(t,e,i,s,n){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,s){const n=this.strings;let o=!1;if(void 0===n)t=Q(this,t,e,0),o=!T(t)||t!==this._$AH&&t!==q,o&&(this._$AH=t);else{const s=t;let a,r;for(t=n[0],a=0;a<n.length-1;a++)r=Q(this,s[i+a],e,a),r===q&&(r=this._$AH[a]),o||(o=!T(r)||r!==this._$AH[a]),r===W?t=W:t!==W&&(t+=(null!=r?r:"")+n[a+1]),this._$AH[a]=r}o&&!s&&this.j(t)}j(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class it extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===W?void 0:t}}const st=S?S.emptyScript:"";class nt extends et{constructor(){super(...arguments),this.type=4}j(t){t&&t!==W?this.element.setAttribute(this.name,st):this.element.removeAttribute(this.name)}}class ot extends et{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){var i;if((t=null!==(i=Q(this,t,e,0))&&void 0!==i?i:W)===q)return;const s=this._$AH,n=t===W&&s!==W||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==W&&(s===W||n);n&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this._$AH.handleEvent(t)}}class at{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const rt=x.litHtmlPolyfillSupport;null==rt||rt(G,tt),(null!==(k=x.litHtmlVersions)&&void 0!==k?k:x.litHtmlVersions=[]).push("2.8.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var lt,ct;class dt extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{var s,n;const o=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:e;let a=o._$litPart$;if(void 0===a){const t=null!==(n=null==i?void 0:i.renderBefore)&&void 0!==n?n:null;o._$litPart$=a=new tt(e.insertBefore(U(),t),t,void 0,null!=i?i:{})}return a._$AI(t),a})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1)}render(){return q}}dt.finalized=!0,dt._$litElement$=!0,null===(lt=globalThis.litElementHydrateSupport)||void 0===lt||lt.call(globalThis,{LitElement:dt});const ut=globalThis.litElementPolyfillSupport;null==ut||ut({LitElement:dt}),(null!==(ct=globalThis.litElementVersions)&&void 0!==ct?ct:globalThis.litElementVersions=[]).push("3.3.3");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ht=t=>e=>"function"==typeof e?((t,e)=>(customElements.define(t,e),e))(t,e):((t,e)=>{const{kind:i,elements:s}=e;return{kind:i,elements:s,finisher(e){customElements.define(t,e)}}})(t,e)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */,pt=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(i){i.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}};function mt(t){return(e,i)=>void 0!==i?((t,e,i)=>{e.constructor.createProperty(i,t)})(t,e,i):pt(t,e)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */}function gt(t){return mt({...t,state:!0})}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var bt;null===(bt=window.HTMLSlotElement)||void 0===bt||bt.prototype.assignedElements;const vt=h`
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

    .item-frame.image-only {
        border: none;
        background: transparent;
        min-height: auto;
        padding: 0;
    }

    .image-only .image-container {
        margin: 0;
    }

    .parameters {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 8px;
    }

    .parameter {
        font-size: 0.9em;
        padding: 2px 6px;
        background: var(--secondary-background-color);
        border-radius: 4px;
    }

    .transparent {
        background: transparent !important;
    }

    .transparent .main-box {
        background: transparent !important;
    }

    .transparent .button-container {
        background: transparent !important;
    }

    .transparent .out-of-stock {
        background-color: rgba(219, 68, 55, 0.7) !important;
    }

    .transparent .low-stock {
        background-color: rgba(255, 167, 38, 0.7) !important;
    }

    .transparent .good-stock {
        background-color: rgba(67, 160, 71, 0.7) !important; 
    }
`
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */,_t=1;class ft{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const yt="important",$t=" !"+yt,wt=(t=>(...e)=>({_$litDirective$:t,values:e}))(class extends ft{constructor(t){var e;if(super(t),t.type!==_t||"style"!==t.name||(null===(e=t.strings)||void 0===e?void 0:e.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce(((e,i)=>{const s=t[i];return null==s?e:e+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`}),"")}update(t,[e]){const{style:i}=t.element;if(void 0===this.ht){this.ht=new Set;for(const t in e)this.ht.add(t);return this.render(e)}this.ht.forEach((t=>{null==e[t]&&(this.ht.delete(t),t.includes("-")?i.removeProperty(t):i[t]="")}));for(const t in e){const s=e[t];if(null!=s){this.ht.add(t);const e="string"==typeof s&&s.endsWith($t);t.includes("-")||e?i.setProperty(t,e?s.slice(0,-11):s,e?yt:""):i[t]=s}}return q}});class At{static getThumbnailPath(t,i){const s=Object.assign(Object.assign({},e.thumbnails),i.thumbnails||{});if(console.warn("🖼️ Thumbnail Service:",{config:s,item_thumbnail:t.thumbnail,mode:s.mode,custom_path:s.custom_path,local_path:s.local_path}),"auto"===s.mode&&t.thumbnail)return console.warn("🖼️ Using auto mode:",t.thumbnail),t.thumbnail;if("manual"===s.mode&&s.custom_path){const e=`${s.custom_path}/part_${t.pk}.png`;return console.warn("🖼️ Using manual mode:",e),e}return console.warn("🖼️ No valid path found!"),""}}class kt{static getStockClass(t){return t.in_stock<=0?"out-of-stock":t.in_stock<t.minimum_stock?"low-stock":"good-stock"}}const xt=(t,e)=>{var i,s;const n=e.layout||{};console.debug("Card render - Layout settings:",{layout:n,transparent:n.transparent,fullConfig:e});if(!t.states[e.entity])return J`<div>Entity not found: ${e.entity}</div>`;const o=null!==(i=e.grid_spacing)&&void 0!==i?i:16,a=null!==(s=e.item_height)&&void 0!==s?s:64;let r=((t,e)=>{var i,s,n;console.debug("🔍 Starting parseState for:",e);const o=t.states[e];if(!o)return console.warn("❌ No state found for:",e),[];if(console.debug("📦 Raw state data:",o),null===(i=o.attributes)||void 0===i?void 0:i.items)return console.debug("📦 Found items in attributes"),o.attributes.items;if(null===(s=o.attributes)||void 0===s?void 0:s.stock)return console.debug("📦 Found stock in attributes"),o.attributes.stock;if("string"==typeof o.state&&o.state.startsWith("["))try{const t=JSON.parse(o.state);if(Array.isArray(t))return console.debug("📦 Parsed state into array"),t}catch(t){console.warn("❌ Failed to parse state as JSON:",t)}return(null===(n=o.attributes)||void 0===n?void 0:n.name)?(console.debug("📦 Constructing single item from attributes"),[{pk:o.attributes.pk||o.attributes.id||0,name:o.attributes.name,in_stock:Number(o.state)||0,minimum_stock:o.attributes.minimum_stock||0,image:o.attributes.image||null,thumbnail:o.attributes.thumbnail||null,active:o.attributes.active||!0,assembly:o.attributes.assembly||!1,category:o.attributes.category||0,category_name:o.attributes.category_name||"",component:o.attributes.component||!1,description:o.attributes.description||"",full_name:o.attributes.full_name||o.attributes.name||"",IPN:o.attributes.IPN||"",purchaseable:o.attributes.purchaseable||!1,salable:o.attributes.salable||!1,total_in_stock:Number(o.state)||0,unallocated_stock:Number(o.state)||0,allocated_to_build_orders:o.attributes.allocated_to_build_orders||0,allocated_to_sales_orders:o.attributes.allocated_to_sales_orders||0,building:o.attributes.building||0,ordering:o.attributes.ordering||0}]):(console.warn("❌ No valid items found in state or attributes"),[])})(t,e.entity);return console.debug("🎴 Card: Parsed items:",r),e.sort_by&&(r=[...r].sort(((t,i)=>{let s=0;switch(e.sort_by){case"stock":s=t.in_stock-i.in_stock;break;case"minimum":s=t.minimum_stock-i.minimum_stock;break;default:s=t.name.localeCompare(i.name)}return"asc"===e.sort_direction?s:-s}))),J`
        <ha-card style=${wt({background:n.transparent?"transparent !important":null})}>
            ${e.show_header?J`
                <div class="card-header">
                    ${e.title||"Inventory"}
                </div>
            `:""}
            <div class="grid" 
                style=${wt({"--columns":e.columns||2,"--grid-spacing":`${o}px`,"--item-height":`${a}px`})}
            >
                ${r.length>0?r.map((i=>((t,e,i)=>{const s=i.display||{},n=i.style||{},o=i.layout||{};console.debug("Item render - Layout settings:",{layout:o,transparent:o.transparent,item:t.name});const a=At.getThumbnailPath(t,i),r=kt.getStockClass(t);if(s.image_only)return J`
            <div class="item-frame image-only" 
                style=${wt({background:n.background||"transparent",padding:"0"})}
            >
                ${t.thumbnail&&s.show_image?J`
                    <div class="image-container" 
                        style=${wt({height:`${n.image_size||50}px`,width:`${n.image_size||50}px`})}
                    >
                        <img src="${a}" alt="${t.name}" loading="lazy" />
                    </div>
                `:""}
            </div>
        `;const l=t.in_stock<t.minimum_stock,c=o.transparent?"transparent":"",d=async i=>{console.debug("Adjusting stock:",{item:t.name,amount:i});try{await e.callService("inventree","adjust_stock",{name:t.name,quantity:i})}catch(t){console.error("Failed to adjust stock:",t)}};return J`
        <div class="item-frame ${l&&i.show_low_stock?"low-stock":""} 
                               ${i.compact_view?"compact":""} 
                               ${c}"
            style=${wt({background:o.transparent?"transparent !important":null,gap:`${n.spacing||10}px`})}
        >
            <div class="main-box ${r}"
                style=${wt({background:o.transparent?"transparent !important":null})}
            >
                <div class="content">
                    ${t.thumbnail&&s.show_image?J`
                        <div class="image-container">
                            <img src="${a}" alt="${t.name}" loading="lazy" />
                        </div>
                    `:""}
                    
                    ${s.show_name?J`
                        <div class="name">${t.full_name||t.name}</div>
                    `:""}

                    ${s.show_description&&t.description?J`
                        <div class="description">${t.description}</div>
                    `:""}

                    ${s.show_stock?J`
                        <div class="stock-info">
                            <div class="stock">In Stock: ${t.in_stock}</div>
                            ${t.allocated_to_build_orders>0?J`
                                <div class="allocated">Allocated: ${t.allocated_to_build_orders}</div>
                            `:""}
                            ${t.ordering>0?J`
                                <div class="ordering">On Order: ${t.ordering}</div>
                            `:""}
                        </div>
                    `:""}

                    ${s.show_parameters&&t.parameters?J`
                        <div class="parameters">
                            ${t.parameters.map((t=>J`
                                <div class="parameter">
                                    ${t.template_detail.name}: ${t.template_detail.data||""}
                                </div>
                            `))}
                        </div>
                    `:""}
                </div>
            </div>

            ${s.show_buttons?J`
                <div class="button-container">
                    ${i.enable_quick_add?J`
                        <button class="adjust-button minus" @click=${()=>d(-1)}>-1</button>
                        <div class="quick-add">
                            ${[1,5,10].map((t=>J`
                                <button class="adjust-button plus" @click=${()=>d(t)}>
                                    +${t}
                                </button>
                            `))}
                        </div>
                    `:""}
                    ${i.enable_print_labels?J`
                        <button class="adjust-button print" @click=${async()=>{console.debug("Printing label:",{item_id:t.pk,name:t.name});try{await e.callService("inventree","print_label",{item_id:t.pk,template_id:2,plugin:"zebra"})}catch(t){console.error("Failed to print label:",t)}}}>🖨️</button>
                    `:""}
                </div>
            `:""}
        </div>
    `})(i,t,e))):J`<div>No items to display</div>`}
            </div>
        </ha-card>
    `};console.info("InvenTree Card: Starting initialization");let St=class extends dt{static async getConfigElement(){return console.debug("InvenTree Card: Loading editor..."),void 0===customElements.get(n)&&await Promise.resolve().then((function(){return Nt})),console.debug("InvenTree Card: Editor loaded"),document.createElement(n)}static getStubConfig(){return Object.assign({type:`custom:${i}`,entity:""},JSON.parse(JSON.stringify(e)))}setConfig(t){if(!t.entity)throw new Error("Please define an entity");console.debug("🎴 Card: Setting config:",t);const s=JSON.parse(JSON.stringify(e)),n=Object.assign(Object.assign(Object.assign({},s),JSON.parse(JSON.stringify(t))),{type:`custom:${i}`,layout:Object.assign(Object.assign({},s.layout),t.layout||{}),display:Object.assign(Object.assign({},s.display),t.display||{}),style:Object.assign(Object.assign({},s.style),t.style||{}),thumbnails:Object.assign(Object.assign({},s.thumbnails),t.thumbnails||{})});console.debug("🎴 Card: Merged config:",n),this._config=n,this.requestUpdate()}shouldUpdate(t){if(!this._config)return!1;if(t.has("_config"))return console.debug("🎴 Card: Config changed, updating",this._config),!0;const e=((t,e,i)=>{var s,n;if(console.debug("shouldUpdate - Checking updates for:",i),!i)return console.debug("shouldUpdate - No entityId provided"),!1;const o=null===(s=null==e?void 0:e.states[i])||void 0===s?void 0:s.state,a=null===(n=null==t?void 0:t.states[i])||void 0===n?void 0:n.state;console.debug("shouldUpdate - Old state:",o),console.debug("shouldUpdate - New state:",a);const r=o!==a;return console.debug("shouldUpdate - Should update?",r),r})(this.hass,t.get("hass"),this._config.entity);return console.debug("🎴 Card: Should update?",e,{config:this._config,entity:this._config.entity}),e}render(){return this._config&&this.hass?xt(this.hass,this._config):J``}getCardSize(){var t,e;if(!this._config)return 1;const i=null===(e=null===(t=this.hass)||void 0===t?void 0:t.states[this._config.entity])||void 0===e?void 0:e.state;if(!i)return 1;try{const t=JSON.parse(i),e=Math.ceil(t.length/(this._config.columns||2));return console.debug("🎴 Card: Calculated size:",e),e}catch(t){return console.warn("🎴 Card: Failed to calculate size:",t),1}}};var Ct,Et;St.styles=vt,a([mt({attribute:!1})],St.prototype,"hass",void 0),a([gt()],St.prototype,"_config",void 0),St=a([ht(i)],St),console.info("InvenTree Card: Class defined"),console.info("InvenTree Card: Registration complete"),function(t){t.language="language",t.system="system",t.comma_decimal="comma_decimal",t.decimal_comma="decimal_comma",t.space_comma="space_comma",t.none="none"}(Ct||(Ct={})),function(t){t.language="language",t.system="system",t.am_pm="12",t.twenty_four="24"}(Et||(Et={}));var Ot=function(t,e,i,s){s=s||{},i=null==i?{}:i;var n=new Event(e,{bubbles:void 0===s.bubbles||s.bubbles,cancelable:Boolean(s.cancelable),composed:void 0===s.composed||s.composed});return n.detail=i,t.dispatchEvent(n),n};const jt=h`
  ha-form {
    display: block;
    padding: 16px;
  }
`;let Pt=class extends dt{setConfig(t){this._config=Object.assign(Object.assign(Object.assign({},e),t),{thumbnails:Object.assign(Object.assign({},e.thumbnails),t.thumbnails||{})})}_handleValueChanged(t){var i,n,o,a;if(!this._config)return;if(console.debug("Value changed event:",t.detail),(null===(i=t.detail)||void 0===i?void 0:i.value)&&!(null===(n=t.detail)||void 0===n?void 0:n.path)){const i=t.detail.value,n=Object.assign(Object.assign(Object.assign({},this._config),i),{type:s,layout:Object.assign(Object.assign({},e.layout),i.layout),display:Object.assign(Object.assign({},e.display),i.display),style:Object.assign(Object.assign({},e.style),i.style),thumbnails:Object.assign(Object.assign({},e.thumbnails),i.thumbnails)});return console.debug("Full config update:",{oldConfig:this._config,newConfig:n}),void Ot(this,"config-changed",{config:n})}const r=null===(o=t.detail)||void 0===o?void 0:o.path,l=null===(a=t.detail)||void 0===a?void 0:a.value;if(!r)return void console.warn("Invalid value-changed event:",t.detail);let c=Object.assign({},this._config);if(r.includes(".")){const[t,i]=r.split(".");console.debug(`Updating nested config: ${t}.${i} =`,l),c=Object.assign(Object.assign({},c),{[t]:Object.assign(Object.assign(Object.assign({},e[t]),c[t]),{[i]:l})})}else console.debug(`Updating top-level config: ${r} =`,l),c=Object.assign(Object.assign({},c),{[r]:l});console.debug("Config update:",{path:r,value:l,oldConfig:this._config,newConfig:c}),Ot(this,"config-changed",{config:c})}render(){return this.hass&&this._config?J`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${o}
                .computeLabel=${t=>t.name}
                @value-changed=${this._handleValueChanged}
            ></ha-form>
        `:W}};Pt.styles=jt,a([mt({attribute:!1})],Pt.prototype,"hass",void 0),a([gt()],Pt.prototype,"_config",void 0),Pt=a([ht(n)],Pt);var Nt=Object.freeze({__proto__:null,get InventreeCardEditor(){return Pt}});console.info("InvenTree Card: Starting registration..."),customElements.get(i)||(console.info(`InvenTree Card: Registering ${i}`),customElements.define(i,St)),window.customCards=window.customCards||[],window.customCards.push({type:s,name:"InvenTree Card",description:"Display and manage InvenTree inventory",preview:!0}),console.info("InvenTree Card: Registration complete");
//# sourceMappingURL=inventree-card.js.map
