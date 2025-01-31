
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=window,e$4=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$3=Symbol(),n$5=new WeakMap;class o$3{constructor(t,e,n){if(this._$cssResult$=!0,n!==s$3)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$4&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=n$5.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&n$5.set(s,t));}return t}toString(){return this.cssText}}const r$2=t=>new o$3("string"==typeof t?t:t+"",void 0,s$3),i$2=(t,...e)=>{const n=1===t.length?t[0]:e.reduce(((e,s,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[n+1]),t[0]);return new o$3(n,t,s$3)},S$1=(s,n)=>{e$4?s.adoptedStyleSheets=n.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):n.forEach((e=>{const n=document.createElement("style"),o=t$2.litNonce;void 0!==o&&n.setAttribute("nonce",o),n.textContent=e.cssText,s.appendChild(n);}));},c$1=e$4?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$2(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var s$2;const e$3=window,r$1=e$3.trustedTypes,h$1=r$1?r$1.emptyScript:"",o$2=e$3.reactiveElementPolyfillSupport,n$4={toAttribute(t,i){switch(i){case Boolean:t=t?h$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,i){let s=t;switch(i){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t);}catch(t){s=null;}}return s}},a$1=(t,i)=>i!==t&&(i==i||t==t),l$2={attribute:!0,type:String,converter:n$4,reflect:!1,hasChanged:a$1},d$1="finalized";class u$1 extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu();}static addInitializer(t){var i;this.finalize(),(null!==(i=this.h)&&void 0!==i?i:this.h=[]).push(t);}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((i,s)=>{const e=this._$Ep(s,i);void 0!==e&&(this._$Ev.set(e,s),t.push(e));})),t}static createProperty(t,i=l$2){if(i.state&&(i.attribute=!1),this.finalize(),this.elementProperties.set(t,i),!i.noAccessor&&!this.prototype.hasOwnProperty(t)){const s="symbol"==typeof t?Symbol():"__"+t,e=this.getPropertyDescriptor(t,s,i);void 0!==e&&Object.defineProperty(this.prototype,t,e);}}static getPropertyDescriptor(t,i,s){return {get(){return this[i]},set(e){const r=this[t];this[i]=e,this.requestUpdate(t,r,s);},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||l$2}static finalize(){if(this.hasOwnProperty(d$1))return !1;this[d$1]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const s of i)this.createProperty(s,t[s]);}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(i){const s=[];if(Array.isArray(i)){const e=new Set(i.flat(1/0).reverse());for(const i of e)s.unshift(c$1(i));}else void 0!==i&&s.push(c$1(i));return s}static _$Ep(t,i){const s=i.attribute;return !1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}_$Eu(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)));}addController(t){var i,s;(null!==(i=this._$ES)&&void 0!==i?i:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(s=t.hostConnected)||void 0===s||s.call(t));}removeController(t){var i;null===(i=this._$ES)||void 0===i||i.splice(this._$ES.indexOf(t)>>>0,1);}_$Eg(){this.constructor.elementProperties.forEach(((t,i)=>{this.hasOwnProperty(i)&&(this._$Ei.set(i,this[i]),delete this[i]);}));}createRenderRoot(){var t;const s=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return S$1(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostConnected)||void 0===i?void 0:i.call(t)}));}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostDisconnected)||void 0===i?void 0:i.call(t)}));}attributeChangedCallback(t,i,s){this._$AK(t,s);}_$EO(t,i,s=l$2){var e;const r=this.constructor._$Ep(t,s);if(void 0!==r&&!0===s.reflect){const h=(void 0!==(null===(e=s.converter)||void 0===e?void 0:e.toAttribute)?s.converter:n$4).toAttribute(i,s.type);this._$El=t,null==h?this.removeAttribute(r):this.setAttribute(r,h),this._$El=null;}}_$AK(t,i){var s;const e=this.constructor,r=e._$Ev.get(t);if(void 0!==r&&this._$El!==r){const t=e.getPropertyOptions(r),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(s=t.converter)||void 0===s?void 0:s.fromAttribute)?t.converter:n$4;this._$El=r,this[r]=h.fromAttribute(i,t.type),this._$El=null;}}requestUpdate(t,i,s){let e=!0;void 0!==t&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||a$1)(this[t],i)?(this._$AL.has(t)||this._$AL.set(t,i),!0===s.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,s))):e=!1),!this.isUpdatePending&&e&&(this._$E_=this._$Ej());}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,i)=>this[i]=t)),this._$Ei=void 0);let i=!1;const s=this._$AL;try{i=this.shouldUpdate(s),i?(this.willUpdate(s),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostUpdate)||void 0===i?void 0:i.call(t)})),this.update(s)):this._$Ek();}catch(t){throw i=!1,this._$Ek(),t}i&&this._$AE(s);}willUpdate(t){}_$AE(t){var i;null===(i=this._$ES)||void 0===i||i.forEach((t=>{var i;return null===(i=t.hostUpdated)||void 0===i?void 0:i.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t);}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return !0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,i)=>this._$EO(i,this[i],t))),this._$EC=void 0),this._$Ek();}updated(t){}firstUpdated(t){}}u$1[d$1]=!0,u$1.elementProperties=new Map,u$1.elementStyles=[],u$1.shadowRootOptions={mode:"open"},null==o$2||o$2({ReactiveElement:u$1}),(null!==(s$2=e$3.reactiveElementVersions)&&void 0!==s$2?s$2:e$3.reactiveElementVersions=[]).push("1.6.3");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var t$1;const i$1=window,s$1=i$1.trustedTypes,e$2=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,o$1="$lit$",n$3=`lit$${(Math.random()+"").slice(9)}$`,l$1="?"+n$3,h=`<${l$1}>`,r=document,u=()=>r.createComment(""),d=t=>null===t||"object"!=typeof t&&"function"!=typeof t,c=Array.isArray,v=t=>c(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]),a="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${a}(?:([^\\s"'>=/]+)(${a}*=${a}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,w=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x=w(1),T=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),E=new WeakMap,C=r.createTreeWalker(r,129,null,!1);function P(t,i){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e$2?e$2.createHTML(i):i}const V=(t,i)=>{const s=t.length-1,e=[];let l,r=2===i?"<svg>":"",u=f;for(let i=0;i<s;i++){const s=t[i];let d,c,v=-1,a=0;for(;a<s.length&&(u.lastIndex=a,c=u.exec(s),null!==c);)a=u.lastIndex,u===f?"!--"===c[1]?u=_:void 0!==c[1]?u=m:void 0!==c[2]?(y.test(c[2])&&(l=RegExp("</"+c[2],"g")),u=p):void 0!==c[3]&&(u=p):u===p?">"===c[0]?(u=null!=l?l:f,v=-1):void 0===c[1]?v=-2:(v=u.lastIndex-c[2].length,d=c[1],u=void 0===c[3]?p:'"'===c[3]?$:g):u===$||u===g?u=p:u===_||u===m?u=f:(u=p,l=void 0);const w=u===p&&t[i+1].startsWith("/>")?" ":"";r+=u===f?s+h:v>=0?(e.push(d),s.slice(0,v)+o$1+s.slice(v)+n$3+w):s+n$3+(-2===v?(e.push(void 0),i):w);}return [P(t,r+(t[s]||"<?>")+(2===i?"</svg>":"")),e]};class N{constructor({strings:t,_$litType$:i},e){let h;this.parts=[];let r=0,d=0;const c=t.length-1,v=this.parts,[a,f]=V(t,i);if(this.el=N.createElement(a,e),C.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes);}for(;null!==(h=C.nextNode())&&v.length<c;){if(1===h.nodeType){if(h.hasAttributes()){const t=[];for(const i of h.getAttributeNames())if(i.endsWith(o$1)||i.startsWith(n$3)){const s=f[d++];if(t.push(i),void 0!==s){const t=h.getAttribute(s.toLowerCase()+o$1).split(n$3),i=/([.?@])?(.*)/.exec(s);v.push({type:1,index:r,name:i[2],strings:t,ctor:"."===i[1]?H:"?"===i[1]?L:"@"===i[1]?z:k});}else v.push({type:6,index:r});}for(const i of t)h.removeAttribute(i);}if(y.test(h.tagName)){const t=h.textContent.split(n$3),i=t.length-1;if(i>0){h.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)h.append(t[s],u()),C.nextNode(),v.push({type:2,index:++r});h.append(t[i],u());}}}else if(8===h.nodeType)if(h.data===l$1)v.push({type:2,index:r});else {let t=-1;for(;-1!==(t=h.data.indexOf(n$3,t+1));)v.push({type:7,index:r}),t+=n$3.length-1;}r++;}}static createElement(t,i){const s=r.createElement("template");return s.innerHTML=t,s}}function S(t,i,s=t,e){var o,n,l,h;if(i===T)return i;let r=void 0!==e?null===(o=s._$Co)||void 0===o?void 0:o[e]:s._$Cl;const u=d(i)?void 0:i._$litDirective$;return (null==r?void 0:r.constructor)!==u&&(null===(n=null==r?void 0:r._$AO)||void 0===n||n.call(r,!1),void 0===u?r=void 0:(r=new u(t),r._$AT(t,s,e)),void 0!==e?(null!==(l=(h=s)._$Co)&&void 0!==l?l:h._$Co=[])[e]=r:s._$Cl=r),void 0!==r&&(i=S(t,r._$AS(t,i.values),r,e)),i}class M{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var i;const{el:{content:s},parts:e}=this._$AD,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:r).importNode(s,!0);C.currentNode=o;let n=C.nextNode(),l=0,h=0,u=e[0];for(;void 0!==u;){if(l===u.index){let i;2===u.type?i=new R(n,n.nextSibling,this,t):1===u.type?i=new u.ctor(n,u.name,u.strings,this,t):6===u.type&&(i=new Z(n,this,t)),this._$AV.push(i),u=e[++h];}l!==(null==u?void 0:u.index)&&(n=C.nextNode(),l++);}return C.currentNode=r,o}v(t){let i=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class R{constructor(t,i,s,e){var o;this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cp=null===(o=null==e?void 0:e.isConnected)||void 0===o||o;}get _$AU(){var t,i;return null!==(i=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==i?i:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===(null==t?void 0:t.nodeType)&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S(this,t,i),d(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==T&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):v(t)?this.T(t):this._(t);}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t));}_(t){this._$AH!==A&&d(this._$AH)?this._$AA.nextSibling.data=t:this.$(r.createTextNode(t)),this._$AH=t;}g(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this._$AC(t):(void 0===e.el&&(e.el=N.createElement(P(e.h,e.h[0]),this.options)),e);if((null===(i=this._$AH)||void 0===i?void 0:i._$AD)===o)this._$AH.v(s);else {const t=new M(o,this),i=t.u(this.options);t.v(s),this.$(i),this._$AH=t;}}_$AC(t){let i=E.get(t.strings);return void 0===i&&E.set(t.strings,i=new N(t)),i}T(t){c(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const o of t)e===i.length?i.push(s=new R(this.k(u()),this.k(u()),this,this.options)):s=i[e],s._$AI(o),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){var s;for(null===(s=this._$AP)||void 0===s||s.call(this,!1,!0,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){var i;void 0===this._$AM&&(this._$Cp=t,null===(i=this._$AP)||void 0===i||i.call(this,t));}}class k{constructor(t,i,s,e,o){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,i=this,s,e){const o=this.strings;let n=!1;if(void 0===o)t=S(this,t,i,0),n=!d(t)||t!==this._$AH&&t!==T,n&&(this._$AH=t);else {const e=t;let l,h;for(t=o[0],l=0;l<o.length-1;l++)h=S(this,e[s+l],i,l),h===T&&(h=this._$AH[l]),n||(n=!d(h)||h!==this._$AH[l]),h===A?t=A:t!==A&&(t+=(null!=h?h:"")+o[l+1]),this._$AH[l]=h;}n&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"");}}class H extends k{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}const I=s$1?s$1.emptyScript:"";class L extends k{constructor(){super(...arguments),this.type=4;}j(t){t&&t!==A?this.element.setAttribute(this.name,I):this.element.removeAttribute(this.name);}}class z extends k{constructor(t,i,s,e,o){super(t,i,s,e,o),this.type=5;}_$AI(t,i=this){var s;if((t=null!==(s=S(this,t,i,0))&&void 0!==s?s:A)===T)return;const e=this._$AH,o=t===A&&e!==A||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==A&&(e===A||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){var i,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==s?s:this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t);}}const B=i$1.litHtmlPolyfillSupport;null==B||B(N,R),(null!==(t$1=i$1.litHtmlVersions)&&void 0!==t$1?t$1:i$1.litHtmlVersions=[]).push("2.8.0");const D=(t,i,s)=>{var e,o;const n=null!==(e=null==s?void 0:s.renderBefore)&&void 0!==e?e:i;let l=n._$litPart$;if(void 0===l){const t=null!==(o=null==s?void 0:s.renderBefore)&&void 0!==o?o:null;n._$litPart$=l=new R(i.insertBefore(u(),t),t,void 0,null!=s?s:{});}return l._$AI(t),l};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var l,o;class s extends u$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(i,this.renderRoot,this.renderOptions);}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0);}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1);}render(){return T}}s.finalized=!0,s._$litElement$=!0,null===(l=globalThis.litElementHydrateSupport)||void 0===l||l.call(globalThis,{LitElement:s});const n$2=globalThis.litElementPolyfillSupport;null==n$2||n$2({LitElement:s});(null!==(o=globalThis.litElementVersions)&&void 0!==o?o:globalThis.litElementVersions=[]).push("3.3.3");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e$1=e=>n=>"function"==typeof n?((e,n)=>(customElements.define(e,n),n))(e,n):((e,n)=>{const{kind:t,elements:s}=n;return {kind:t,elements:s,finisher(n){customElements.define(e,n);}}})(e,n);

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const i=(i,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(n){n.createProperty(e.key,i);}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this));},finisher(n){n.createProperty(e.key,i);}},e=(i,e,n)=>{e.constructor.createProperty(n,i);};function n$1(n){return (t,o)=>void 0!==o?e(n,t,o):i(n,t)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function t(t){return n$1({...t,state:!0})}

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var n;null!=(null===(n=window.HTMLSlotElement)||void 0===n?void 0:n.prototype.assignedElements)?(o,n)=>o.assignedElements(n):(o,n)=>o.assignedNodes(n).filter((o=>o.nodeType===Node.ELEMENT_NODE));

const cardStyles = i$2`
  :host {
    --default-spacing: 16px;
    --default-height: 64px;
  }

  ha-card {
    padding: 16px;
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
  }

  .item-frame {
    width: 100%;
    height: var(--item-height, var(--default-height));
  }

  .main-box {
    height: 100%;
    padding: 8px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .name {
    font-weight: bold;
    margin-bottom: 4px;
  }

  .stock {
    font-size: 14px;
  }

  .minimum {
    font-size: 12px;
    opacity: 0.8;
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
`;

const CARD_NAME$1 = "inventree-card";
class InventreeCard extends s {
  getStockClass(item) {
    if (item.in_stock <= 0) return 'out-of-stock';
    if (item.in_stock < item.minimum_stock) return 'low-stock';
    return 'good-stock';
  }
  sortItems(items) {
    if (!this._config) return items;
    const {
      sort_by = 'name',
      sort_direction = 'asc'
    } = this._config;
    return [...items].sort((a, b) => {
      let comparison = 0;
      switch (sort_by) {
        case 'stock':
          comparison = a.in_stock - b.in_stock;
          break;
        case 'minimum':
          comparison = a.minimum_stock - b.minimum_stock;
          break;
        case 'name':
        default:
          comparison = a.name.localeCompare(b.name);
          break;
      }
      return sort_direction === 'asc' ? comparison : -comparison;
    });
  }
  _handleItemClick(item) {
    console.log('Item clicked:', item);
  }
  getCardSize() {
    var _a, _b;
    if (!this._config) return 1;
    let size = this._config.show_header ? 1 : 0;
    const itemCount = ((_b = (_a = this.hass) === null || _a === void 0 ? void 0 : _a.states[this._config.entity]) === null || _b === void 0 ? void 0 : _b.state) ? JSON.parse(this.hass.states[this._config.entity].state).length : 0;
    const columns = this._config.columns || 2;
    const rows = Math.ceil(itemCount / columns);
    size += rows * 2;
    return size;
  }
  static getStubConfig() {
    return {
      type: `custom:${CARD_NAME$1}`,
      entity: "",
      show_header: true,
      show_low_stock: true
    };
  }
  setConfig(config) {
    if (!config.entity) {
      throw new Error("Please define an entity");
    }
    this._config = config;
    this.requestUpdate();
  }
  render() {
    var _a, _b;
    if (!this._config || !this.hass) {
      return x`<div>Invalid configuration</div>`;
    }
    const state = this.hass.states[this._config.entity];
    if (!state) {
      return x`<div>Entity not found: ${this._config.entity}</div>`;
    }
    // Get grid spacing and item height from config with defaults
    const gridSpacing = (_a = this._config.grid_spacing) !== null && _a !== void 0 ? _a : 16;
    const itemHeight = (_b = this._config.item_height) !== null && _b !== void 0 ? _b : 64;
    console.log('Card render: State retrieved', {
      entityId: state.entity_id,
      state: state,
      parsedState: JSON.parse(state.state)
    });
    let items;
    try {
      items = JSON.parse(state.state);
      if (!Array.isArray(items)) {
        console.error('State is not an array:', items);
        return x`<div>Invalid state format</div>`;
      }
    } catch (e) {
      console.error('Failed to parse state:', e);
      return x`<div>Invalid state format</div>`;
    }
    const sortedItems = this.sortItems(items);
    return x`
            <ha-card>
                ${this._config.show_header ? x`
                    <div class="card-header">
                        ${this._config.title || 'Inventory'}
                    </div>
                ` : ''}
                <div class="grid" 
                    style="
                        --columns: ${this._config.columns || 2};
                        --grid-spacing: ${gridSpacing}px;
                        --item-height: ${itemHeight}px;
                    "
                >
                    ${sortedItems.map(item => {
      var _a;
      return x`
                        <div class="item-frame">
                            <div class="main-box ${this.getStockClass(item)}">
                                <div class="name">${item.name}</div>
                                <div class="stock">
                                    In Stock: ${item.in_stock}
                                </div>
                                ${((_a = this._config) === null || _a === void 0 ? void 0 : _a.show_minimum) ? x`
                                    <div class="minimum">Minimum: ${item.minimum_stock}</div>
                                ` : ''}
                            </div>
                        </div>
                    `;
    })}
                </div>
            </ha-card>
        `;
  }
}
InventreeCard.styles = cardStyles;
__decorate([n$1({
  attribute: false
})], InventreeCard.prototype, "hass", void 0);
__decorate([t()], InventreeCard.prototype, "_config", void 0);
customElements.define(CARD_NAME$1, InventreeCard);

// Card constants
const CARD_NAME = "inventree-card";
const EDITOR_NAME = `${CARD_NAME}-editor`;
// Form schema
const SCHEMA = [{
  name: "entity",
  label: "Entity",
  selector: {
    entity: {
      domain: ["sensor"]
    }
  }
}, {
  name: "title",
  label: "Card Title",
  selector: {
    text: {}
  }
}, {
  name: "show_header",
  label: "Show Header",
  selector: {
    boolean: {}
  }
}, {
  name: "show_minimum",
  label: "Show Minimum Stock",
  selector: {
    boolean: {}
  }
}, {
  name: "show_low_stock",
  label: "Show Low Stock Warning",
  selector: {
    boolean: {}
  }
}, {
  name: "columns",
  label: "Number of Columns",
  selector: {
    number: {
      min: 1,
      max: 4,
      step: 1,
      mode: "slider"
    }
  }
}, {
  name: "compact_view",
  label: "Compact View",
  selector: {
    boolean: {}
  }
}, {
  name: "sort_by",
  label: "Sort By",
  selector: {
    select: {
      options: [{
        value: "name",
        label: "Name"
      }, {
        value: "stock",
        label: "Stock Level"
      }, {
        value: "minimum",
        label: "Minimum Stock"
      }]
    }
  }
}, {
  name: "sort_direction",
  label: "Sort Direction",
  selector: {
    select: {
      options: [{
        value: "asc",
        label: "Ascending"
      }, {
        value: "desc",
        label: "Descending"
      }]
    }
  }
}, {
  name: "grid_spacing",
  label: "Grid Spacing",
  selector: {
    number: {
      min: 8,
      max: 32,
      step: 4,
      mode: "slider"
    }
  }
}, {
  name: "item_height",
  label: "Item Height",
  selector: {
    number: {
      min: 32,
      max: 96,
      step: 8,
      mode: "slider"
    }
  }
}, {
  name: "enable_quick_add",
  label: "Enable Quick Add",
  selector: {
    boolean: {}
  }
}, {
  name: "show_history",
  label: "Show History",
  selector: {
    boolean: {}
  }
}, {
  name: "show_stock_warning",
  label: "Show Stock Warning",
  selector: {
    boolean: {}
  }
}];

const editorStyles = i$2`
  .editor-container {
    padding: 16px;
  }
  
  .form-row {
    display: flex;
    align-items: center;
    padding: 8px 0;
  }

  .form-row label {
    flex: 1;
    padding-right: 8px;
  }

  .form-row ha-switch {
    --mdc-theme-secondary: var(--switch-checked-color);
  }

  .form-row ha-textfield {
    width: 100%;
  }
`;

// Add module-level logging
console.log('🔧 Editor Module: Start loading');
let InventreeCardEditor = class InventreeCardEditor extends s {
  constructor() {
    super();
    console.log('🔧 Editor Constructor Called');
  }
  connectedCallback() {
    super.connectedCallback();
    console.log('🔧 Editor Connected');
  }
  setConfig(config) {
    console.log('📝 Editor setConfig:', config);
    // Create a deep copy of the config to prevent reference issues
    this._config = JSON.parse(JSON.stringify(config));
    console.log('📝 Editor merged config:', this._config);
  }
  _valueChanged(ev) {
    if (!this._config) return;
    const target = ev.detail.target;
    const value = ev.detail.value;
    console.log('📝 Editor Value Changed:', {
      target,
      value
    });
    // Create a new config object with the updated value
    const newConfig = Object.assign(Object.assign({}, this._config), {
      [target.configValue]: value
    });
    // Update internal state
    this._config = newConfig;
    // Dispatch the event with the full config
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: {
        config: newConfig
      }
    }));
  }
  render() {
    console.log('📝 Editor Render:', {
      hass: !!this.hass,
      config: this._config,
      schema: SCHEMA
    });
    if (!this.hass || !this._config) {
      return A;
    }
    return x`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${SCHEMA}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `;
  }
};
InventreeCardEditor.styles = editorStyles;
__decorate([n$1({
  attribute: false
})], InventreeCardEditor.prototype, "hass", void 0);
__decorate([t()], InventreeCardEditor.prototype, "_config", void 0);
InventreeCardEditor = __decorate([e$1(EDITOR_NAME)], InventreeCardEditor);
// Remove the duplicate registration at the bottom
console.log('🔧 Editor Module: Loading complete');

const now = new Date().toISOString();
const mockEntity = {
  entity_id: 'sensor.inventree_stock',
  state: JSON.stringify([{
    name: "Test Item 1",
    in_stock: 5,
    minimum_stock: 10
  }, {
    name: "Test Item 2",
    in_stock: 15,
    minimum_stock: 5
  }, {
    name: "Test Item 3",
    in_stock: 0,
    minimum_stock: 3
  }]),
  attributes: {
    friendly_name: "InvenTree Stock"
  },
  last_changed: now,
  last_updated: now,
  context: {
    id: "1",
    user_id: null,
    parent_id: null
  }
};
// Create a simpler mock that focuses on what we actually need
const mockHass = {
  states: {
    'sensor.inventree_stock': mockEntity
  },
  services: {},
  callService: async (domain, service, data) => {
    console.log('Service called:', {
      domain,
      service,
      data
    });
  },
  auth: {
    data: {
      hassUrl: 'http://localhost:8123',
      clientId: 'mock-client-id',
      expires: 1234567890,
      refresh_token: 'mock-refresh-token',
      access_token: 'mock-access-token',
      expires_in: 1800
    }
  },
  connection: {
    haVersion: '2024.1.0',
    connected: true
  },
  connected: true,
  themes: {
    default_theme: 'default',
    themes: {}
  },
  selectedTheme: null,
  panels: {},
  panelUrl: 'lovelace',
  dockedSidebar: true,
  moreInfoEntityId: '',
  user: {
    id: '1',
    name: 'Dev User',
    is_admin: true,
    is_owner: true,
    credentials: [],
    mfa_modules: []
  },
  language: 'en',
  selectedLanguage: null,
  locale: {
    language: 'en',
    number_format: 'decimal_comma'
  },
  resources: {},
  localize: () => '',
  translationMetadata: {
    fragments: [],
    translations: {}
  },
  config: {
    components: [],
    location_name: 'Home',
    latitude: 0,
    longitude: 0,
    elevation: 0,
    time_zone: 'UTC',
    unit_system: {
      length: 'm',
      mass: 'kg',
      temperature: '°C',
      volume: 'L'
    },
    version: '0.0.0',
    config_dir: '',
    allowlist_external_dirs: [],
    allowlist_external_urls: []
  }
};
// Debug log
console.log('Mock HASS initialized:', {
  entity: mockEntity,
  parsedState: JSON.parse(mockEntity.state)
});
const initialConfig = {
  type: 'custom:inventree-card',
  entity: 'sensor.inventree_stock',
  title: 'Test Inventory',
  show_header: true,
  show_low_stock: true,
  show_minimum: true,
  columns: 2
};

class HaForm extends HTMLElement {
  static get properties() {
    return {
      hass: {
        type: Object
      },
      data: {
        type: Object
      },
      schema: {
        type: Array
      },
      computeLabel: {
        type: Function
      },
      computeHelper: {
        type: Function
      }
    };
  }
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({
      mode: 'open'
    });
  }
  set schema(schema) {
    this._schema = schema;
    this._render();
  }
  set data(data) {
    this._data = data;
    this._render();
  }
  _render() {
    if (!this._schema || !this._data) return;
    this._shadowRoot.innerHTML = `
            <style>
                .form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .field {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                label {
                    font-weight: 500;
                }
                input, select {
                    padding: 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                input[type="checkbox"] {
                    width: 20px;
                    height: 20px;
                }
            </style>
            <div class="form">
                ${this._schema.map(field => `
                    <div class="field">
                        <label>${field.label}</label>
                        ${this._renderField(field)}
                    </div>
                `).join('')}
            </div>
        `;
    this._addEventListeners();
  }
  _addEventListeners() {
    const inputs = Array.from(this._shadowRoot.querySelectorAll('input, select'));
    inputs.forEach(element => {
      var _a;
      const input = element;
      const name = input.getAttribute('name');
      if (!name) return;
      const field = (_a = this._schema) === null || _a === void 0 ? void 0 : _a.find(f => f.name === name);
      if (!field) return;
      input.addEventListener('change', e => {
        var _a, _b;
        const target = e.target;
        let value = target.value;
        // Type conversion
        if ((_a = field.selector) === null || _a === void 0 ? void 0 : _a.boolean) {
          value = target.checked;
        } else if ((_b = field.selector) === null || _b === void 0 ? void 0 : _b.number) {
          value = Number(value);
        }
        this.dispatchEvent(new CustomEvent('value-changed', {
          detail: {
            target: {
              configValue: field.name
            },
            value
          }
        }));
      });
    });
  }
  _renderField(field) {
    var _a, _b, _c, _d, _e, _f;
    const value = (_b = (_a = this._data) === null || _a === void 0 ? void 0 : _a[field.name]) !== null && _b !== void 0 ? _b : '';
    if ((_c = field.selector) === null || _c === void 0 ? void 0 : _c.boolean) {
      return `
                <input type="checkbox" 
                       name="${field.name}" 
                       ${value ? 'checked' : ''}>
            `;
    }
    if ((_d = field.selector) === null || _d === void 0 ? void 0 : _d.number) {
      const {
        min = 0,
        max = 100,
        step = 1
      } = field.selector.number;
      return `
                <input type="number" 
                       name="${field.name}" 
                       value="${value}"
                       min="${min}"
                       max="${max}"
                       step="${step}">
            `;
    }
    if ((_f = (_e = field.selector) === null || _e === void 0 ? void 0 : _e.select) === null || _f === void 0 ? void 0 : _f.options) {
      const options = field.selector.select.options.map(opt => `
                    <option value="${opt.value}" 
                            ${value === opt.value ? 'selected' : ''}>
                        ${opt.label}
                    </option>
                `).join('');
      return `<select name="${field.name}">${options}</select>`;
    }
    // Default to text input
    return `
            <input type="text" 
                   name="${field.name}" 
                   value="${value}">
        `;
  }
}
class HaSwitch extends HTMLElement {
  constructor() {
    super();
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.style.margin = '8px';
    this.appendChild(input);
  }
}
class HaTextfield extends HTMLElement {
  constructor() {
    super();
    const input = document.createElement('input');
    input.type = 'text';
    input.style.padding = '4px';
    input.style.margin = '8px';
    this.appendChild(input);
  }
}
class HaCard extends HTMLElement {
  constructor() {
    super();
    this.style.display = 'block';
    this.style.background = 'white';
    this.style.borderRadius = '8px';
    this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    this.style.margin = '8px';
    this.style.padding = '16px';
  }
}
// Register components
customElements.define('ha-form', HaForm);
customElements.define('ha-switch', HaSwitch);
customElements.define('ha-textfield', HaTextfield);
customElements.define('ha-card', HaCard);
console.log('Registered ha-form successfully');

// Keep track of current config with deep copy
let currentConfig = JSON.parse(JSON.stringify(initialConfig));
// Add at the top, after imports
console.log('🔧 Available custom elements:', customElements.get('inventree-card-editor'));
// Initialize when DOM is ready
window.addEventListener('load', () => {
  var _a, _b;
  console.log('🔧 Window loaded, custom elements:', customElements.get('inventree-card-editor'));
  // Initialize card
  const cardElement = document.createElement(CARD_NAME$1);
  cardElement.setConfig(currentConfig);
  cardElement.hass = mockHass;
  (_a = document.getElementById('demo')) === null || _a === void 0 ? void 0 : _a.appendChild(cardElement);
  // Initialize editor with verification
  console.log('🔧 Creating editor...');
  const editorElement = document.createElement('inventree-card-editor');
  console.log('🔧 Editor created:', {
    element: editorElement,
    constructor: editorElement.constructor.name,
    prototype: Object.getPrototypeOf(editorElement)
  });
  editorElement.hass = mockHass;
  // Update how we handle the editor configuration
  if (editorElement instanceof InventreeCardEditor) {
    editorElement.setConfig(currentConfig);
    editorElement.addEventListener('config-changed', ev => {
      const customEvent = ev;
      // Create a deep copy of the new config
      currentConfig = JSON.parse(JSON.stringify(customEvent.detail.config));
      console.log('Config updated:', currentConfig);
      // Update the card with the new config
      cardElement.setConfig(currentConfig);
    });
  }
  (_b = document.getElementById('editor')) === null || _b === void 0 ? void 0 : _b.appendChild(editorElement);
});
console.info('🎴 InvenTree Card Dev: Registration complete');
//# sourceMappingURL=index.js.map
