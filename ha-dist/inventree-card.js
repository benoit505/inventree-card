class e{constructor(){this.debugMode=!1,this.verboseMode=!1,this.logLevel="error",this._userDebugSettings={categorySettings:{},subsystemSettings:{}},this.debugCategories={api:{enabled:!1,subsystems:{calls:!1,responses:!1,errors:!1,fallbacks:!1,throttling:!1}},parameters:{enabled:!1,subsystems:{updates:!1,conditions:!1,filtering:!1,actions:!1}},websocket:{enabled:!1,subsystems:{connection:!1,messages:!1,events:!1,plugin:!1,subscriptions:!1,authentication:!1}},layouts:{enabled:!1,subsystems:{rendering:!1,filtering:!1,updates:!1}},rendering:{enabled:!1,subsystems:{updates:!1,performance:!1,cycle:!1,debounce:!1}},cache:{enabled:!1,subsystems:{hits:!1,misses:!1,pruning:!1,performance:!1}},card:{enabled:!1,subsystems:{initialization:!1,lifecycle:!1,rendering:!1,updates:!1}},diagnostics:{enabled:!1,subsystems:{performance:!1,memory:!1,errors:!1}}},this._logSequence=0,this._recentLogs=new Map,this._dedupeTimeWindow=2e3,this._maxDuplicatesPerWindow=1,setTimeout((()=>{try{Promise.resolve().then((function(){return Ce})).then((e=>{this._cache=e.CacheService.getInstance(),console.info("Logger: Successfully initialized CacheService after delay")}))}catch(e){console.warn("Logger: Could not initialize CacheService, using built-in deduplication")}}),100)}static getInstance(){return e.instance||(e.instance=new e),e.instance}isEnabled(e,t){var i;return!(!this.verboseMode&&!this.anyCategoryEnabled())&&(!!this.debugCategories[e]&&(!!this.verboseMode||!!this.debugCategories[e].enabled&&(!t||!0===(null===(i=this.debugCategories[e].subsystems)||void 0===i?void 0:i[t]))))}anyCategoryEnabled(){return Object.keys(this.debugCategories).some((e=>this.debugCategories[e].enabled))}getNextSequence(){return++this._logSequence}setDebug(e){this.debugMode=e,this._userDebugSettings.debugEnabled=e,e?this.logLevel="debug":(this.logLevel="error",this.verboseMode=!1),console.info("Logger debug mode "+(e?"ENABLED":"DISABLED"))}setVerboseMode(e){e&&!this.debugMode&&this.setDebug(!0),this.verboseMode=e,this._userDebugSettings.verboseEnabled=e,console.info("Logger verbose mode "+(e?"ENABLED - ALL categories will log":"DISABLED - only selected categories will log"))}setDebugConfig(e){var t,i,r,a,s,o,n,c,l,d,h,u,p,g,v,m,f;if(!e)return;const b=null!==(t=this._userDebugSettings.debugEnabled)&&void 0!==t?t:e.debug;this.setDebug(b||!1),void 0!==this._userDebugSettings.verboseEnabled?this.setVerboseMode(this._userDebugSettings.verboseEnabled):void 0!==e.debug_verbose?this.setVerboseMode(e.debug_verbose):!e.debug||this.anyCategoryEnabled()||e.debug_api||e.debug_parameters||e.debug_websocket||e.debug_layouts||e.debug_rendering||e.debug_cache||e.debug_card||e.debug_diagnostics||this.setVerboseMode(!0),this.setCategoryDebug("api",null!==(r=null!==(i=this._userDebugSettings.categorySettings.api)&&void 0!==i?i:e.debug_api)&&void 0!==r&&r),this.setCategoryDebug("parameters",null!==(s=null!==(a=this._userDebugSettings.categorySettings.parameters)&&void 0!==a?a:e.debug_parameters)&&void 0!==s&&s),this.setCategoryDebug("websocket",null!==(n=null!==(o=this._userDebugSettings.categorySettings.websocket)&&void 0!==o?o:e.debug_websocket)&&void 0!==n&&n),this.setCategoryDebug("layouts",null!==(l=null!==(c=this._userDebugSettings.categorySettings.layouts)&&void 0!==c?c:e.debug_layouts)&&void 0!==l&&l),this.setCategoryDebug("rendering",null!==(h=null!==(d=this._userDebugSettings.categorySettings.rendering)&&void 0!==d?d:e.debug_rendering)&&void 0!==h&&h),this.setCategoryDebug("cache",null!==(p=null!==(u=this._userDebugSettings.categorySettings.cache)&&void 0!==u?u:e.debug_cache)&&void 0!==p&&p),this.setCategoryDebug("card",null!==(v=null!==(g=this._userDebugSettings.categorySettings.card)&&void 0!==g?g:e.debug_card)&&void 0!==v&&v),this.setCategoryDebug("diagnostics",null!==(f=null!==(m=this._userDebugSettings.categorySettings.diagnostics)&&void 0!==m?m:e.debug_diagnostics)&&void 0!==f&&f),e.debug_hierarchical&&this.processHierarchicalConfig(e.debug_hierarchical),console.info(`Logger configuration: \n      Debug mode: ${this.debugMode} (controls debug UI view)\n      Verbose mode: ${this.verboseMode} (logs everything when true)\n      API: ${this.formatSystemStatus("api")}\n      Parameters: ${this.formatSystemStatus("parameters")}\n      WebSocket: ${this.formatSystemStatus("websocket")}\n      Layouts: ${this.formatSystemStatus("layouts")}\n      Rendering: ${this.formatSystemStatus("rendering")}\n      Cache: ${this.formatSystemStatus("cache")}\n      Card: ${this.formatSystemStatus("card")}\n      Diagnostics: ${this.formatSystemStatus("diagnostics")}\n    `)}processHierarchicalConfig(e){if(e)for(const t in e)if(this.debugCategories[t]){const i=e[t];if("boolean"==typeof i){this.setCategoryDebug(t,i);continue}if("object"==typeof i&&("enabled"in i&&this.setCategoryDebug(t,i.enabled),i.subsystems&&"object"==typeof i.subsystems))for(const e in i.subsystems)this.setSubsystemDebug(t,e,!!i.subsystems[e])}}formatSystemStatus(e){if(!this.debugCategories[e])return"Not configured";if(!this.debugCategories[e].enabled)return"Disabled";const t=this.debugCategories[e].subsystems,i=Object.keys(t).filter((e=>t[e])).join(", ");return i?`Enabled with subsystems: ${i}`:"Enabled (no subsystems)"}setLogLevel(e){this.logLevel=e}setCategoryDebug(e,t){this.debugCategories[e]&&(this.debugCategories[e].enabled=t,this._userDebugSettings.categorySettings[e]=t)}setSubsystemDebug(e,t,i){this.debugCategories[e]&&(this.debugCategories[e].subsystems||(this.debugCategories[e].subsystems={}),this.debugCategories[e].subsystems[t]=i,this._userDebugSettings.subsystemSettings[e]||(this._userDebugSettings.subsystemSettings[e]={}),this._userDebugSettings.subsystemSettings[e][t]=i)}isDuplicate(e){const t=Date.now(),i=this._recentLogs.get(e);return!!(i&&t-i<this._dedupeTimeWindow)||(this._recentLogs.set(e,t),this._logSequence%10==0&&this.pruneRecentLogs(),!1)}pruneRecentLogs(){const e=Date.now();for(const[t,i]of this._recentLogs.entries())e-i>this._dedupeTimeWindow&&this._recentLogs.delete(t)}log(e,t,i,...r){i&&(i instanceof Error||"object"!=typeof i||Array.isArray(i))&&(r=[i,...r],i={});const a=i&&"object"==typeof i?i.category:void 0,s=i&&"object"==typeof i?i.subsystem:void 0,o=i&&"object"==typeof i&&i.level||"debug",n=i&&"object"==typeof i?i.performance:void 0;if(a&&!this.isEnabled(a,s))return;if(!a&&!this.debugMode)return;if("none"===this.logLevel)return;if("error"===this.logLevel&&"error"!==o)return;if("warn"===this.logLevel&&"error"!==o&&"warn"!==o)return;const c=`${e}:${a||"main"}:${s||""}:${t}`;if(this.isDuplicate(c))return;const l=this.getNextSequence(),d=Date.now().toString(),h=a?s?`${e}:${a}:${s}`:`${e}:${a}`:e;if("trace"===o){if(console.groupCollapsed(`[${d}][${l}][${h}] ${t}`),r.length>0&&console.log(...r),n){const{startTime:e,duration:t}=n;t?console.log(`⏱️ Duration: ${t.toFixed(2)}ms`):e&&console.log(`⏱️ Elapsed: ${(Date.now()-e).toFixed(2)}ms`)}console.groupEnd()}else if(console.log(`🔍 [${d}][${l}][${h}] ${t}`,...r),n){const{startTime:e,duration:t}=n;t?console.log(`⏱️ [${d}][${l}][${h}] Duration: ${t.toFixed(2)}ms`):e&&console.log(`⏱️ [${d}][${l}][${h}] Elapsed: ${(Date.now()-e).toFixed(2)}ms`)}}info(e,t,...i){const r=i.length>0&&"object"==typeof i[0]&&!Array.isArray(i[0])?i.shift():{};if("none"===this.logLevel||"error"===this.logLevel||"warn"===this.logLevel)return;const a=null==r?void 0:r.category,s=null==r?void 0:r.subsystem;if(a&&!this.isEnabled(a,s))return;const o=(null===performance||void 0===performance?void 0:performance.now().toFixed(2))||Date.now(),n=this.getNextSequence(),c=a?s?`${e}:${a}:${s}`:`${e}:${a}`:e;if(console.info(`ℹ️ [${o}][${n}][${c}] ${t}`,...i),null==r?void 0:r.performance){const{startTime:e,duration:t}=r.performance;t?console.info(`⏱️ [${o}][${n}][${c}] Duration: ${t.toFixed(2)}ms`):e&&console.info(`⏱️ [${o}][${n}][${c}] Elapsed: ${(Date.now()-e).toFixed(2)}ms`)}}warn(e,t,...i){const r=i.length>0&&"object"==typeof i[0]&&!Array.isArray(i[0])?i.shift():{};if("none"===this.logLevel||"error"===this.logLevel)return;const a=null==r?void 0:r.category,s=null==r?void 0:r.subsystem,o=(null===performance||void 0===performance?void 0:performance.now().toFixed(2))||Date.now(),n=this.getNextSequence(),c=a?s?`${e}:${a}:${s}`:`${e}:${a}`:e;console.warn(`⚠️ [${o}][${n}][${c}] ${t}`,...i)}error(e,t,...i){const r=i.length>0?i[0]:void 0,a=r instanceof Error||r&&"object"==typeof r&&"stack"in r||"string"==typeof r||!r||"object"!=typeof r||Array.isArray(r)?{}:i.shift();if("none"===this.logLevel)return;const s=null==a?void 0:a.category,o=null==a?void 0:a.subsystem,n=(null===performance||void 0===performance?void 0:performance.now().toFixed(2))||Date.now(),c=this.getNextSequence(),l=s?o?`${e}:${s}:${o}`:`${e}:${s}`:e;console.error(`❌ [${n}][${c}][${l}] ${t}`,...i)}startPerformance(e){return Date.now()}endPerformance(e,t,i,r){const a=Date.now()-i;this.log(e,t,Object.assign(Object.assign({},r),{performance:{duration:a}}))}resetDebugConfig(){this.debugMode=!1,this.logLevel="error";for(const e in this.debugCategories){this.debugCategories[e].enabled=!1;for(const t in this.debugCategories[e].subsystems)this.debugCategories[e].subsystems[t]=!1}this._recentLogs.clear(),console.info("Logger debug settings reset - all logging disabled")}setEnabled(e,t){this.setCategoryDebug(e,t)}getSystemsStatus(){const e={};for(const t in this.debugCategories){const i=this.debugCategories[t];e[t]={enabled:i.enabled,subsystems:Object.assign({},i.subsystems)}}return e}getSubsystems(e){return this.debugCategories[e]?Object.keys(this.debugCategories[e].subsystems):[]}isCategoryEnabled(e){return this.isEnabled(e)}}let t=Object.assign({},{useReduxForParts:!1,useReduxForParameters:!1,useReduxForRendering:!1,useReduxForCard:!1,useReduxForWebSocket:!1,useReduxRenderingService:!1,useReduxParameterService:!1,useBaseLayoutAdapter:!1,useConnectedComponents:!1});const i=e.getInstance();function r(e,r){const a=t[e];t[e]=r,a!==r&&i.log("FeatureFlags",`Feature flag '${e}' changed from ${a} to ${r}`,{category:"migration",subsystem:"feature-flags"})}function a(e){return t[e]}function s(){return Object.assign({},t)}const o="inventree-card",n="inventree-card-editor";function c(e,t,i,r){var a,s=arguments.length,o=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(a=e[n])&&(o=(s<3?a(o):s>3?a(t,i,o):a(t,i))||o);return s>3&&o&&Object.defineProperty(t,i,o),o}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const l=window,d=l.ShadowRoot&&(void 0===l.ShadyCSS||l.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,h=Symbol(),u=new WeakMap;class p{constructor(e,t,i){if(this._$cssResult$=!0,i!==h)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(d&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=u.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&u.set(t,e))}return e}toString(){return this.cssText}}const g=(e,...t)=>{const i=1===e.length?e[0]:t.reduce(((t,i,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[r+1]),e[0]);return new p(i,e,h)},v=d?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new p("string"==typeof e?e:e+"",void 0,h))(t)})(e):e
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var m;const f=window,b=f.trustedTypes,y=b?b.emptyScript:"",_=f.reactiveElementPolyfillSupport,w={toAttribute(e,t){switch(t){case Boolean:e=e?y:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},$=(e,t)=>t!==e&&(t==t||e==e),k={attribute:!0,type:String,converter:w,reflect:!1,hasChanged:$},x="finalized";class S extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(e){var t;this.finalize(),(null!==(t=this.h)&&void 0!==t?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach(((t,i)=>{const r=this._$Ep(i,t);void 0!==r&&(this._$Ev.set(r,i),e.push(r))})),e}static createProperty(e,t=k){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){const i="symbol"==typeof e?Symbol():"__"+e,r=this.getPropertyDescriptor(e,i,t);void 0!==r&&Object.defineProperty(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){return{get(){return this[t]},set(r){const a=this[e];this[t]=r,this.requestUpdate(e,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||k}static finalize(){if(this.hasOwnProperty(x))return!1;this[x]=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),void 0!==e.h&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const e=this.properties,t=[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)];for(const i of t)this.createProperty(i,e[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(v(e))}else void 0!==e&&t.push(v(e));return t}static _$Ep(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}_$Eu(){var e;this._$E_=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(e=this.constructor.h)||void 0===e||e.forEach((e=>e(this)))}addController(e){var t,i;(null!==(t=this._$ES)&&void 0!==t?t:this._$ES=[]).push(e),void 0!==this.renderRoot&&this.isConnected&&(null===(i=e.hostConnected)||void 0===i||i.call(e))}removeController(e){var t;null===(t=this._$ES)||void 0===t||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])}))}createRenderRoot(){var e;const t=null!==(e=this.shadowRoot)&&void 0!==e?e:this.attachShadow(this.constructor.shadowRootOptions);return((e,t)=>{d?e.adoptedStyleSheets=t.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet)):t.forEach((t=>{const i=document.createElement("style"),r=l.litNonce;void 0!==r&&i.setAttribute("nonce",r),i.textContent=t.cssText,e.appendChild(i)}))})(t,this.constructor.elementStyles),t}connectedCallback(){var e;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostConnected)||void 0===t?void 0:t.call(e)}))}enableUpdating(e){}disconnectedCallback(){var e;null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostDisconnected)||void 0===t?void 0:t.call(e)}))}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$EO(e,t,i=k){var r;const a=this.constructor._$Ep(e,i);if(void 0!==a&&!0===i.reflect){const s=(void 0!==(null===(r=i.converter)||void 0===r?void 0:r.toAttribute)?i.converter:w).toAttribute(t,i.type);this._$El=e,null==s?this.removeAttribute(a):this.setAttribute(a,s),this._$El=null}}_$AK(e,t){var i;const r=this.constructor,a=r._$Ev.get(e);if(void 0!==a&&this._$El!==a){const e=r.getPropertyOptions(a),s="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==(null===(i=e.converter)||void 0===i?void 0:i.fromAttribute)?e.converter:w;this._$El=a,this[a]=s.fromAttribute(t,e.type),this._$El=null}}requestUpdate(e,t,i){let r=!0;void 0!==e&&(((i=i||this.constructor.getPropertyOptions(e)).hasChanged||$)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),!0===i.reflect&&this._$El!==e&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(e,i))):r=!1),!this.isUpdatePending&&r&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((e,t)=>this[t]=e)),this._$Ei=void 0);let t=!1;const i=this._$AL;try{t=this.shouldUpdate(i),t?(this.willUpdate(i),null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostUpdate)||void 0===t?void 0:t.call(e)})),this.update(i)):this._$Ek()}catch(e){throw t=!1,this._$Ek(),e}t&&this._$AE(i)}willUpdate(e){}_$AE(e){var t;null===(t=this._$ES)||void 0===t||t.forEach((e=>{var t;return null===(t=e.hostUpdated)||void 0===t?void 0:t.call(e)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){void 0!==this._$EC&&(this._$EC.forEach(((e,t)=>this._$EO(t,this[t],e))),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var C;S[x]=!0,S.elementProperties=new Map,S.elementStyles=[],S.shadowRootOptions={mode:"open"},null==_||_({ReactiveElement:S}),(null!==(m=f.reactiveElementVersions)&&void 0!==m?m:f.reactiveElementVersions=[]).push("1.6.3");const P=window,E=P.trustedTypes,I=E?E.createPolicy("lit-html",{createHTML:e=>e}):void 0,T="$lit$",D=`lit$${(Math.random()+"").slice(9)}$`,A="?"+D,R=`<${A}>`,L=document,M=()=>L.createComment(""),F=e=>null===e||"object"!=typeof e&&"function"!=typeof e,N=Array.isArray,U="[ \t\n\f\r]",V=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,W=/>/g,z=RegExp(`>|${U}(?:([^\\s"'>=/]+)(${U}*=${U}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,B=/"/g,H=/^(?:script|style|textarea|title)$/i,q=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),G=Symbol.for("lit-noChange"),J=Symbol.for("lit-nothing"),K=new WeakMap,Y=L.createTreeWalker(L,129,null,!1);function Q(e,t){if(!Array.isArray(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==I?I.createHTML(t):t}const X=(e,t)=>{const i=e.length-1,r=[];let a,s=2===t?"<svg>":"",o=V;for(let t=0;t<i;t++){const i=e[t];let n,c,l=-1,d=0;for(;d<i.length&&(o.lastIndex=d,c=o.exec(i),null!==c);)d=o.lastIndex,o===V?"!--"===c[1]?o=O:void 0!==c[1]?o=W:void 0!==c[2]?(H.test(c[2])&&(a=RegExp("</"+c[2],"g")),o=z):void 0!==c[3]&&(o=z):o===z?">"===c[0]?(o=null!=a?a:V,l=-1):void 0===c[1]?l=-2:(l=o.lastIndex-c[2].length,n=c[1],o=void 0===c[3]?z:'"'===c[3]?B:j):o===B||o===j?o=z:o===O||o===W?o=V:(o=z,a=void 0);const h=o===z&&e[t+1].startsWith("/>")?" ":"";s+=o===V?i+R:l>=0?(r.push(n),i.slice(0,l)+T+i.slice(l)+D+h):i+D+(-2===l?(r.push(void 0),t):h)}return[Q(e,s+(e[i]||"<?>")+(2===t?"</svg>":"")),r]};class Z{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let a=0,s=0;const o=e.length-1,n=this.parts,[c,l]=X(e,t);if(this.el=Z.createElement(c,i),Y.currentNode=this.el.content,2===t){const e=this.el.content,t=e.firstChild;t.remove(),e.append(...t.childNodes)}for(;null!==(r=Y.nextNode())&&n.length<o;){if(1===r.nodeType){if(r.hasAttributes()){const e=[];for(const t of r.getAttributeNames())if(t.endsWith(T)||t.startsWith(D)){const i=l[s++];if(e.push(t),void 0!==i){const e=r.getAttribute(i.toLowerCase()+T).split(D),t=/([.?@])?(.*)/.exec(i);n.push({type:1,index:a,name:t[2],strings:e,ctor:"."===t[1]?ae:"?"===t[1]?oe:"@"===t[1]?ne:re})}else n.push({type:6,index:a})}for(const t of e)r.removeAttribute(t)}if(H.test(r.tagName)){const e=r.textContent.split(D),t=e.length-1;if(t>0){r.textContent=E?E.emptyScript:"";for(let i=0;i<t;i++)r.append(e[i],M()),Y.nextNode(),n.push({type:2,index:++a});r.append(e[t],M())}}}else if(8===r.nodeType)if(r.data===A)n.push({type:2,index:a});else{let e=-1;for(;-1!==(e=r.data.indexOf(D,e+1));)n.push({type:7,index:a}),e+=D.length-1}a++}}static createElement(e,t){const i=L.createElement("template");return i.innerHTML=e,i}}function ee(e,t,i=e,r){var a,s,o,n;if(t===G)return t;let c=void 0!==r?null===(a=i._$Co)||void 0===a?void 0:a[r]:i._$Cl;const l=F(t)?void 0:t._$litDirective$;return(null==c?void 0:c.constructor)!==l&&(null===(s=null==c?void 0:c._$AO)||void 0===s||s.call(c,!1),void 0===l?c=void 0:(c=new l(e),c._$AT(e,i,r)),void 0!==r?(null!==(o=(n=i)._$Co)&&void 0!==o?o:n._$Co=[])[r]=c:i._$Cl=c),void 0!==c&&(t=ee(e,c._$AS(e,t.values),c,r)),t}class te{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;const{el:{content:i},parts:r}=this._$AD,a=(null!==(t=null==e?void 0:e.creationScope)&&void 0!==t?t:L).importNode(i,!0);Y.currentNode=a;let s=Y.nextNode(),o=0,n=0,c=r[0];for(;void 0!==c;){if(o===c.index){let t;2===c.type?t=new ie(s,s.nextSibling,this,e):1===c.type?t=new c.ctor(s,c.name,c.strings,this,e):6===c.type&&(t=new ce(s,this,e)),this._$AV.push(t),c=r[++n]}o!==(null==c?void 0:c.index)&&(s=Y.nextNode(),o++)}return Y.currentNode=L,a}v(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class ie{constructor(e,t,i,r){var a;this.type=2,this._$AH=J,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cp=null===(a=null==r?void 0:r.isConnected)||void 0===a||a}get _$AU(){var e,t;return null!==(t=null===(e=this._$AM)||void 0===e?void 0:e._$AU)&&void 0!==t?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===(null==e?void 0:e.nodeType)&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ee(this,e,t),F(e)?e===J||null==e||""===e?(this._$AH!==J&&this._$AR(),this._$AH=J):e!==this._$AH&&e!==G&&this._(e):void 0!==e._$litType$?this.g(e):void 0!==e.nodeType?this.$(e):(e=>N(e)||"function"==typeof(null==e?void 0:e[Symbol.iterator]))(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==J&&F(this._$AH)?this._$AA.nextSibling.data=e:this.$(L.createTextNode(e)),this._$AH=e}g(e){var t;const{values:i,_$litType$:r}=e,a="number"==typeof r?this._$AC(e):(void 0===r.el&&(r.el=Z.createElement(Q(r.h,r.h[0]),this.options)),r);if((null===(t=this._$AH)||void 0===t?void 0:t._$AD)===a)this._$AH.v(i);else{const e=new te(a,this),t=e.u(this.options);e.v(i),this.$(t),this._$AH=e}}_$AC(e){let t=K.get(e.strings);return void 0===t&&K.set(e.strings,t=new Z(e)),t}T(e){N(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const a of e)r===t.length?t.push(i=new ie(this.k(M()),this.k(M()),this,this.options)):i=t[r],i._$AI(a),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,t);e&&e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){var t;void 0===this._$AM&&(this._$Cp=e,null===(t=this._$AP)||void 0===t||t.call(this,e))}}class re{constructor(e,t,i,r,a){this.type=1,this._$AH=J,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=a,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=J}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,i,r){const a=this.strings;let s=!1;if(void 0===a)e=ee(this,e,t,0),s=!F(e)||e!==this._$AH&&e!==G,s&&(this._$AH=e);else{const r=e;let o,n;for(e=a[0],o=0;o<a.length-1;o++)n=ee(this,r[i+o],t,o),n===G&&(n=this._$AH[o]),s||(s=!F(n)||n!==this._$AH[o]),n===J?e=J:e!==J&&(e+=(null!=n?n:"")+a[o+1]),this._$AH[o]=n}s&&!r&&this.j(e)}j(e){e===J?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=e?e:"")}}class ae extends re{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===J?void 0:e}}const se=E?E.emptyScript:"";class oe extends re{constructor(){super(...arguments),this.type=4}j(e){e&&e!==J?this.element.setAttribute(this.name,se):this.element.removeAttribute(this.name)}}class ne extends re{constructor(e,t,i,r,a){super(e,t,i,r,a),this.type=5}_$AI(e,t=this){var i;if((e=null!==(i=ee(this,e,t,0))&&void 0!==i?i:J)===G)return;const r=this._$AH,a=e===J&&r!==J||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,s=e!==J&&(r===J||a);a&&this.element.removeEventListener(this.name,this,r),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(t=this.options)||void 0===t?void 0:t.host)&&void 0!==i?i:this.element,e):this._$AH.handleEvent(e)}}class ce{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){ee(this,e)}}const le=P.litHtmlPolyfillSupport;null==le||le(Z,ie),(null!==(C=P.litHtmlVersions)&&void 0!==C?C:P.litHtmlVersions=[]).push("2.8.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var de,he;class ue extends S{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;const i=super.createRenderRoot();return null!==(e=(t=this.renderOptions).renderBefore)&&void 0!==e||(t.renderBefore=i.firstChild),i}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{var r,a;const s=null!==(r=null==i?void 0:i.renderBefore)&&void 0!==r?r:t;let o=s._$litPart$;if(void 0===o){const e=null!==(a=null==i?void 0:i.renderBefore)&&void 0!==a?a:null;s._$litPart$=o=new ie(t.insertBefore(M(),e),e,void 0,null!=i?i:{})}return o._$AI(e),o})(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),null===(e=this._$Do)||void 0===e||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),null===(e=this._$Do)||void 0===e||e.setConnected(!1)}render(){return G}}ue.finalized=!0,ue._$litElement$=!0,null===(de=globalThis.litElementHydrateSupport)||void 0===de||de.call(globalThis,{LitElement:ue});const pe=globalThis.litElementPolyfillSupport;null==pe||pe({LitElement:ue}),(null!==(he=globalThis.litElementVersions)&&void 0!==he?he:globalThis.litElementVersions=[]).push("3.3.3");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ge=e=>t=>"function"==typeof t?((e,t)=>(customElements.define(e,t),t))(e,t):((e,t)=>{const{kind:i,elements:r}=t;return{kind:i,elements:r,finisher(t){customElements.define(e,t)}}})(e,t)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */,ve=(e,t)=>"method"===t.kind&&t.descriptor&&!("value"in t.descriptor)?{...t,finisher(i){i.createProperty(t.key,e)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:t.key,initializer(){"function"==typeof t.initializer&&(this[t.key]=t.initializer.call(this))},finisher(i){i.createProperty(t.key,e)}},me=(e,t,i)=>{t.constructor.createProperty(i,e)};function fe(e){return(t,i)=>void 0!==i?((e,t,i)=>{t.constructor.createProperty(i,e)})(e,t,i):ve(e,t)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */}function be(e){return fe({...e,state:!0})}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var ye;null===(ye=window.HTMLSlotElement)||void 0===ye||ye.prototype.assignedElements;class _e{constructor(t,i=!1){if(this._componentId="unknown",this.timeouts=new Map,this.intervals=new Map,this.animationFrames=new Map,this.components=new Map,this.timeoutCounter=0,this.intervalCounter=0,this.animFrameCounter=0,this.isDestroying=!1,this.throttleMap=new Map,this.throttleTime=50,this.logger=e.getInstance(),this.debugEnabled=!1,_e.instance||(this.logger=e.getInstance(),this.debugEnabled=!1,_e.instance=this),t)return this._componentId=t,_e.instance.registerComponent(t,i),_e.instance;{const e=`TimerManager-${Date.now()}-${Math.floor(1e3*Math.random())}`;return this._componentId=e,console.warn(`TimerManager: No component ID provided, using generated ID: ${e}`),_e.instance.registerComponent(e,i),_e.instance}}static hasInstance(){return!!_e.instance}static getInstance(e,t=!1){return _e.instance||(_e.instance=new _e("GlobalTimerManager",!0),console.log("TimerManager: Created new GlobalTimerManager instance")),e&&(_e.instance.registerComponent(e,t),t&&console.log(`TimerManager: Component ${e} registered with GlobalTimerManager`)),_e.instance}setDebug(e){this.debugEnabled=e}registerComponent(e,t=!1){try{const i=e||`AnonymousComponent-${Date.now()}`;return e||console.warn(`TimerManager: Empty component ID provided, using generated ID: ${i}`),this.components.has(i)||(this.components.set(i,{timeouts:new Set,intervals:new Set,animationFrames:new Set,isActive:!0}),t&&this.logger.log("TimerManager",`Registered component: ${i}`)),this.setDebug(t),this}catch(t){return console.error(`TimerManager: Error registering component ${e}:`,t),this.components.set(e||"error-component",{timeouts:new Set,intervals:new Set,animationFrames:new Set,isActive:!0}),this}}deregisterComponent(e){const t=this.components.get(e);t&&(t.isActive=!1,t.timeouts.forEach((e=>{window.clearTimeout(e),this.timeouts.delete(e)})),t.intervals.forEach((e=>{window.clearInterval(e),this.intervals.delete(e)})),t.animationFrames.forEach((e=>{window.cancelAnimationFrame(e),this.animationFrames.delete(e)})),this.components.delete(e),this.logger.log("TimerManager",`Deregistered component: ${e}`))}setTimeout(e,t,i,r){let a,s,o;"function"==typeof e?(a=this._componentId,s=e,o=t,r=i):(a=e,s=t,o=i);let n=this.components.get(a);if(!(n&&n.isActive||(console.warn(`[TimerManager] Cannot create timeout for component "${a}" - component not registered or inactive. Auto-registering for safety. Stack trace:`,(new Error).stack),this.registerComponent(a,!0),n=this.components.get(a),n&&n.isActive)))return console.error(`[TimerManager] Failed to auto-register component "${a}". Using fallback timeout.`),window.setTimeout(s,o);if(r){const e=`${a}:${r}`,t=this.throttleMap.get(e),i=Date.now();if(t&&i-t.lastCreated<this.throttleTime)return this.debugEnabled&&this.logger.log("TimerManager",`Throttled timeout ${r} for ${a}, reusing existing timer ${t.value}`),t.value}this.timeoutCounter++;const c=window.setTimeout((()=>{this.timeouts.delete(c);const e=this.components.get(a);if(e&&e.timeouts.delete(c),r){const e=`${a}:${r}`;this.throttleMap.delete(e)}try{s()}catch(e){this.logger.error("TimerManager",`Error in timeout callback (${r||c}): ${e}`)}}),o);if(this.timeouts.set(c,{componentId:a,label:r,startTime:Date.now()}),n.timeouts.add(c),r){const e=`${a}:${r}`;this.throttleMap.set(e,{lastCreated:Date.now(),value:c})}return this.debugEnabled&&this.logger.log("TimerManager",`Created timeout ${c} (${r||"unnamed"}) with delay ${o}ms for component ${a}`),c}clearTimeout(e){try{const t=this.timeouts.get(e);if(!t)return!1;window.clearTimeout(e);const i=this.components.get(t.componentId);if(i&&i.timeouts.delete(e),t.label){const e=`${t.componentId}:${t.label}`;this.throttleMap.delete(e)}if(this.timeouts.delete(e),this.debugEnabled){const i=Date.now()-(t.startTime||0);this.logger.log("TimerManager",`Cleared timeout ${e} (${t.label||"unnamed"}) after ${i}ms`)}return!0}catch(t){console.error(`Error clearing timeout ${e}:`,t);try{return window.clearTimeout(e),!0}catch(e){return!1}}}setInterval(e,t,i,r){let a,s,o;"function"==typeof e?(a=this._componentId,s=e,o=t,r=i):(a=e,s=t,o=i),o=o||1e3;let n=this.components.get(a);if(!(n&&n.isActive||(console.warn(`[TimerManager] Cannot create interval for component "${a}" - component not registered or inactive. Auto-registering for safety. Stack trace:`,(new Error).stack),this.registerComponent(a,!0),n=this.components.get(a),n&&n.isActive)))return console.error(`[TimerManager] Failed to auto-register component "${a}". Using fallback interval.`),window.setInterval(s,o);if(r){const e=`${a}:${r}`,t=this.throttleMap.get(e);if(t)return this.debugEnabled&&this.logger.log("TimerManager",`Interval ${r} already exists for ${a}, reusing existing interval ${t.value}`),t.value}this.intervalCounter++;const c=window.setInterval((()=>{try{s()}catch(e){this.logger.error("TimerManager",`Error in interval callback (${r||c}): ${e}`)}}),o);if(this.intervals.set(c,{componentId:a,label:r,startTime:Date.now()}),n.intervals.add(c),r){const e=`${a}:${r}`;this.throttleMap.set(e,{lastCreated:Date.now(),value:c})}return this.debugEnabled&&this.logger.log("TimerManager",`Created interval ${c} (${r||"unnamed"}) with delay ${o}ms for component ${a}`),c}clearInterval(e){const t=this.intervals.get(e);if(!t)return!1;window.clearInterval(e);const i=this.components.get(t.componentId);if(i&&i.intervals.delete(e),t.label){const e=`${t.componentId}:${t.label}`;this.throttleMap.delete(e)}if(this.intervals.delete(e),this.debugEnabled){const i=Date.now()-(t.startTime||0);this.logger.log("TimerManager",`Cleared interval ${e} (${t.label||"unnamed"}) after running for ${i}ms`)}return!0}requestAnimationFrame(e,t,i){const r=this.components.get(e);if(!r||!r.isActive)return this.logger.warn("TimerManager",`Cannot create animation frame for unregistered/inactive component: ${e}`),0;this.animFrameCounter++;const a=window.requestAnimationFrame((e=>{this.animationFrames.delete(a),r.animationFrames.delete(a);try{t(e)}catch(e){this.logger.error("TimerManager",`Error in animation frame callback (${i||a}): ${e}`)}}));return this.animationFrames.set(a,{componentId:e,label:i,startTime:Date.now()}),r.animationFrames.add(a),this.debugEnabled&&this.logger.log("TimerManager",`Requested animation frame ${a} (${i||"unnamed"}) for component ${e}`),a}cancelAnimationFrame(e){const t=this.animationFrames.get(e);if(!t)return!1;window.cancelAnimationFrame(e);const i=this.components.get(t.componentId);if(i&&i.animationFrames.delete(e),this.animationFrames.delete(e),this.debugEnabled){const i=Date.now()-(t.startTime||0);this.logger.log("TimerManager",`Cancelled animation frame ${e} (${t.label||"unnamed"}) after ${i}ms`)}return!0}clearComponentTimers(e){const t=this.components.get(e);if(!t)return 0;let i=0;t.timeouts.forEach((e=>{window.clearTimeout(e),this.timeouts.delete(e),i++})),t.timeouts.clear(),t.intervals.forEach((e=>{window.clearInterval(e),this.intervals.delete(e),i++})),t.intervals.clear(),t.animationFrames.forEach((e=>{window.cancelAnimationFrame(e),this.animationFrames.delete(e),i++})),t.animationFrames.clear();for(const[t,i]of this.throttleMap.entries())t.startsWith(`${e}:`)&&this.throttleMap.delete(t);return this.debugEnabled&&i>0&&this.logger.log("TimerManager",`Cleared ${i} timers for component ${e}`),i}clearAll(){const e=this.timeouts.size+this.intervals.size+this.animationFrames.size;return this.timeouts.forEach(((e,t)=>window.clearTimeout(t))),this.timeouts.clear(),this.intervals.forEach(((e,t)=>window.clearInterval(t))),this.intervals.clear(),this.animationFrames.forEach(((e,t)=>window.cancelAnimationFrame(t))),this.animationFrames.clear(),this.components.forEach((e=>{e.timeouts.clear(),e.intervals.clear(),e.animationFrames.clear()})),this.throttleMap.clear(),this.debugEnabled&&e>0&&this.logger.log("TimerManager",`Cleared all timers (${e} total)`),e}getStats(){return{timeouts:this.timeouts.size,intervals:this.intervals.size,component:this._componentId}}getActiveTimers(){const e={total:this.timeouts.size+this.intervals.size+this.animationFrames.size,timeouts:this.timeouts.size,intervals:this.intervals.size,animationFrames:this.animationFrames.size,byComponent:{}};return this.components.forEach(((t,i)=>{e.byComponent[i]={timeouts:t.timeouts.size,intervals:t.intervals.size,animationFrames:t.animationFrames.size,total:t.timeouts.size+t.intervals.size+t.animationFrames.size}})),e}}_e.getInstance();const we={ENTITY_DATA:3e4,PARAMETER:6e4,RENDER_DEDUP:300,WS_DEDUP:500,CONDITION:2e3,FALLBACK:6e4};var $e;!function(e){e.ENTITY="entity",e.PARAMETER="parameter",e.RENDER="render",e.WEBSOCKET="websocket",e.CONDITION="condition",e.GENERAL="general"}($e||($e={}));class ke{constructor(){this.cache=new Map,this._fallbackValues=new Map,this._missCallbacks=new Map,this._pruneIntervalId=null,this._isDestroyed=!1,this.logger=e.getInstance(),this.timers=new _e("CacheService",!0),this._startPruneInterval()}_startPruneInterval(){if(!this._isDestroyed&&null===this._pruneIntervalId)try{this._pruneIntervalId=this.timers.setInterval((()=>{this._isDestroyed||this.prune()}),6e4,"cache-prune-interval"),this.logger.log("Cache","Prune interval started",{category:"cache"})}catch(e){console.error("Failed to start cache prune interval:",e),this.logger.error("Cache",`Failed to start prune interval: ${e}`,{category:"cache"})}}static getInstance(){return ke.instance||(ke.instance=new ke),ke.instance}set(e,t,i=we.FALLBACK,r=$e.GENERAL){i===we.FALLBACK&&(e.startsWith("entity-data:")?i=we.ENTITY_DATA:e.startsWith("param:")||e.startsWith("parameter:")?i=we.PARAMETER:e.startsWith("render:")?i=we.RENDER_DEDUP:e.startsWith("ws-")?i=we.WS_DEDUP:e.startsWith("condition:")&&(i=we.CONDITION));const a=Date.now()+i;this.cache.set(e,{value:t,expires:a,category:r}),this.logger.log("Cache",`Set ${e}, expires in ${i}ms`,{category:"cache",subsystem:r})}get(e,t=!0){const i=this.cache.get(e);if(i){if(!(i.expires<Date.now()))return t&&this._fallbackValues.set(e,i.value),this.logger.log("Cache",`Hit: ${e}`,{category:"cache",subsystem:i.category}),i.value;if(this.cache.delete(e),this.logger.log("Cache",`Miss: ${e} (expired)`,{category:"cache",subsystem:i.category}),this._handleCacheMiss(e),t&&this._fallbackValues.has(e)){const t=this._fallbackValues.get(e);return this.logger.log("Cache",`Using fallback for ${e} (expired)`,{category:"cache"}),t}}else if(this.logger.log("Cache",`Miss: ${e} (not found)`,{category:"cache"}),this._handleCacheMiss(e),t&&this._fallbackValues.has(e)){const t=this._fallbackValues.get(e);return this.logger.log("Cache",`Using fallback for ${e}`,{category:"cache"}),t}}_handleCacheMiss(e){if(this._missCallbacks.has(e)){const t=this._missCallbacks.get(e);t&&(this.logger.log("Cache",`Executing miss callback for ${e}`,{category:"cache"}),t().then((t=>{if(void 0!==t){let i=we.FALLBACK;e.startsWith("entity-data:")&&(i=we.ENTITY_DATA),this.set(e,t,i),this.logger.log("Cache",`Miss callback successfully updated ${e}`,{category:"cache"})}})).catch((t=>{this.logger.error("Cache",`Error in miss callback for ${e}: ${t}`,{category:"cache"})})))}}registerMissCallback(e,t){this._missCallbacks.set(e,t),this.logger.log("Cache",`Registered miss callback for ${e}`,{category:"cache"})}setFallback(e,t){this._fallbackValues.set(e,t),this.logger.log("Cache",`Set fallback value for ${e}`,{category:"cache"})}has(e){const t=this.cache.get(e);return!!t&&(!(t.expires<Date.now())||(this.cache.delete(e),!1))}updateTTL(e,t){const i=this.cache.get(e);if(!i)return!1;const r=Date.now()+t;return this.cache.set(e,Object.assign(Object.assign({},i),{expires:r})),this.logger.log("Cache",`Updated TTL for ${e}, new expiry in ${t}ms`,{category:"cache"}),!0}refreshEntityCache(e){const t=`entity-data:${e}`;return this.updateTTL(t,we.ENTITY_DATA)}delete(e){const t=this.cache.get(e);this.cache.delete(e),t?this.logger.log("Cache",`Deleted ${e}`,{category:"cache",subsystem:t.category}):this.logger.log("Cache",`Attempted to delete non-existent key: ${e}`,{category:"cache"})}prune(){const e=Date.now();let t=0;const i={};for(const[r,a]of this.cache.entries())if(a.expires<e){this.cache.delete(r),t++;const e=a.category||$e.GENERAL;i[e]=(i[e]||0)+1}if(t>0){const e=Object.entries(i).map((([e,t])=>`${e}: ${t}`)).join(", ");this.logger.log("Cache",`Pruned ${t} expired entries (${e})`,{category:"cache"})}}clear(){const e=this.cache.size;this.cache.clear(),this._fallbackValues.clear(),this.logger.log("Cache",`Cleared ${e} entries`,{category:"cache"})}getStats(){const e=Date.now();let t=0;const i={};for(const[r,a]of this.cache.entries()){const r=a.category||$e.GENERAL;i[r]=(i[r]||0)+1,a.expires<e&&t++}return{size:this.cache.size,expired:t,byCategory:i,fallbackCount:this._fallbackValues.size}}getKeys(){return Array.from(this.cache.keys())}clearPattern(e){let t=0;const i=[];for(const r of this.cache.keys())r.includes(e)&&(i.push(r),t++);for(const e of i){const t=this.cache.get(e);this.cache.delete(e),t&&this.logger.log("Cache",`Deleted ${e} by pattern match`,{category:"cache",subsystem:t.category})}return this.logger.log("Cache",`Cleared ${t} entries matching pattern: ${e}`,{category:"cache"}),t}clearEntityCache(){return this.clearPattern("entity-data:")}clearConditionCache(){return this.clearPattern("condition:")}clearRenderCache(){return this.clearPattern("render:")}clearWebSocketCache(){return this.clearPattern("ws-")+this.clearPattern("websocket:")}destroy(){this._isDestroyed=!0,this.timers&&this.timers.clearAll(),this._pruneIntervalId=null,this.clear(),this.logger.log("Cache","Cache service destroyed and resources released",{category:"cache"})}}var xe,Se,Ce=Object.freeze({__proto__:null,DEFAULT_TTL:we,get CacheCategory(){return $e},CacheService:ke});!function(e){e.INTERVAL="interval",e.FIXED_TIMES="fixed-times",e.CRON="cron"}(xe||(xe={}));class Pe{constructor(){this._idleRenderTime=3e4,this._renderCallbacks=[],this.cache=ke.getInstance(),this._wsDebounceTimerId=null,this._idleTimerId=null,this._schedulerTimerId=null,this._pendingRenderTimers=new Map,this._wsUpdateQueue=new Set,this._wsUpdateDebounceTime=100,this._maxRenderFrequency=10,this._lastRenderTime=0,this._pendingRenders=new Set,this._scheduledJobs=new Map,this._schedulerEnabled=!1,this._schedulerInterval=1e3,this._renderTimings=[],this._maxStoredTimings=50,this.logger=e.getInstance();try{const e=`RenderingService-${Date.now()}-${Math.floor(1e3*Math.random())}`;this.timers=new _e(e,!0),this.logger.log("RenderingService",`Initialized with ID ${e}`),this.timers&&this.startScheduler()}catch(e){console.error("Error initializing RenderingService and TimerManager:",e),this.timers=new _e("RenderingService-fallback",!0),this.logger.error("RenderingService","Error during initialization, using fallback timer manager",e)}}static getInstance(){return Pe.instance||(Pe.instance=new Pe),Pe.instance}setupRendering(e){var t,i,r,a;if(this.logger.log("Rendering","Setup with config",{category:"rendering",subsystem:"updates"},e),this._idleRenderTime=1e3*(e.idle_render_time||30),this.logger.log("Rendering",`Idle render time: ${this._idleRenderTime/1e3}s`,{category:"rendering",subsystem:"config"}),null===(i=null===(t=e.performance)||void 0===t?void 0:t.rendering)||void 0===i?void 0:i.maxRenderFrequency){const t=e.performance.rendering.maxRenderFrequency;this._maxRenderFrequency=Math.max(1,Math.min(30,t))}this.logger.log("Rendering",`Max render frequency: ${this._maxRenderFrequency}/s`,{category:"rendering",subsystem:"config"}),(null===(a=null===(r=e.performance)||void 0===r?void 0:r.rendering)||void 0===a?void 0:a.debounceTime)&&(this._wsUpdateDebounceTime=e.performance.rendering.debounceTime),this.logger.log("Rendering",`WebSocket debounce time: ${this._wsUpdateDebounceTime}ms`,{category:"rendering",subsystem:"config"}),window.addEventListener("inventree-parameter-updated",(e=>{const t=e.detail;this.handleWebSocketUpdate(t)})),this.startIdleTimer(),this.addScheduledJob({id:"idle-render-trigger",mode:xe.INTERVAL,enabled:!0,interval:this._idleRenderTime,description:"Trigger idle render to refresh data",callback:()=>{this.notifyRenderCallbacks(),this.logger.log("Rendering","Scheduled idle render triggered",{category:"rendering",subsystem:"performance"})}})}handleWebSocketUpdate(e){if(!e||!e.part_id||!e.parameter_name)return;const t=`${e.part_id}:${e.parameter_name}`;this._wsUpdateQueue.add(t),null!==this._wsDebounceTimerId&&(this.timers.clearTimeout(this._wsDebounceTimerId),this._wsDebounceTimerId=null),this._wsDebounceTimerId=this.timers.setTimeout((()=>{if(this._wsUpdateQueue.size>0){this.logger.log("Rendering",`Processing ${this._wsUpdateQueue.size} WebSocket parameter updates`,{category:"rendering",subsystem:"updates"});const e=`ws-update:${Array.from(this._wsUpdateQueue).sort().join("|")}`;if(this.cache.has(e))return this.logger.log("Rendering","Skipping redundant batch update - identical to recent batch",{category:"rendering",subsystem:"updates"}),void this._wsUpdateQueue.clear();this.cache.set(e,!0,300),this.notifyRenderCallbacks(),this._wsUpdateQueue.clear()}this._wsDebounceTimerId=null}),this._wsUpdateDebounceTime,"websocket-update-debounce")}startIdleTimer(){if(null===this._idleTimerId){if(!this.timers){console.warn("Cannot start idle timer - TimerManager not initialized"),this.logger.warn("Rendering","Cannot start idle timer - TimerManager not initialized",{category:"rendering",subsystem:"idle"});try{this.timers=new _e("RenderingService",!0)}catch(e){return console.error("Failed to initialize TimerManager in startIdleTimer:",e),void window.setTimeout((()=>{this.executeIdleRender()}),this._idleRenderTime)}}try{this._idleTimerId=this.timers.setTimeout((()=>{this._idleTimerId=null,this.executeIdleRender()}),this._idleRenderTime,"idle-render-timer")}catch(e){console.error("Error in startIdleTimer:",e),window.setTimeout((()=>{this.executeIdleRender()}),this._idleRenderTime)}}else this.logger.log("Rendering","Idle timer already active, not creating a new one",{category:"rendering",subsystem:"idle"})}executeIdleRender(e=!0){this.logger.log("Rendering","Idle render timer triggered",{category:"rendering",subsystem:"idle"}),this.notifyRenderCallbacks(),e&&this.startIdleTimer()}restartIdleTimer(){this.logger.log("Rendering","Restarting idle render timer",{category:"rendering",subsystem:"idle"}),null!==this._idleTimerId&&(this.timers.clearTimeout(this._idleTimerId),this._idleTimerId=null),this.startIdleTimer()}registerRenderCallback(e){return this._renderCallbacks.push(e),()=>{const t=this._renderCallbacks.indexOf(e);-1!==t&&this._renderCallbacks.splice(t,1)}}notifyRenderCallbacks(){const e=Date.now(),t=e-this._lastRenderTime,i=1e3/this._maxRenderFrequency;if(t<i){const r=`render-${e}-${Math.random().toString(36).substring(2,9)}`;this._pendingRenders.add(r),this._pendingRenderTimers.has(r)&&this.timers.clearTimeout(this._pendingRenderTimers.get(r));const a=this.timers.setTimeout((()=>{this._pendingRenders.delete(r),this._pendingRenderTimers.delete(r),this.executeRenderCallbacks()}),i-t,`throttled-render-${r}`);return this._pendingRenderTimers.set(r,a),void this.logger.log("Rendering",`Throttling render request (${t}ms since last render, min interval: ${i}ms)`,{category:"rendering",subsystem:"throttling"})}this.executeRenderCallbacks()}executeRenderCallbacks(){this._lastRenderTime=Date.now();for(const e of this._renderCallbacks)try{e()}catch(e){this.logger.error("Rendering",`Error in render callback: ${e}`)}}forceRender(){this.executeRenderCallbacks()}shouldRender(e,t){const i=`render:${e}:${t}`;return this.cache.has(i)?(this.logger.log("Rendering",`Skipping redundant render for ${e} - no changes detected`,{category:"rendering",subsystem:"deduplication"}),!1):(this.cache.set(i,!0,we.RENDER_DEDUP,$e.RENDER),!0)}notifyRenderComplete(){this._lastRenderTime=Date.now(),this._pendingRenders.size>0&&this.logger.log("Rendering",`${this._pendingRenders.size} pending renders after completion`,{category:"rendering",subsystem:"updates"})}startScheduler(){null!==this._schedulerTimerId&&(this.timers.clearInterval(this._schedulerTimerId),this._schedulerTimerId=null),this._schedulerEnabled=!0,this._schedulerTimerId=this.timers.setInterval((()=>{this.processScheduledJobs()}),this._schedulerInterval,"job-scheduler"),this.logger.log("Rendering","Scheduler started",{category:"rendering",subsystem:"scheduler"})}stopScheduler(){null!==this._schedulerTimerId&&(this.timers.clearInterval(this._schedulerTimerId),this._schedulerTimerId=null),this._schedulerEnabled=!1,this.logger.log("Rendering","Scheduler stopped",{category:"rendering",subsystem:"scheduler"})}processScheduledJobs(){if(!this._schedulerEnabled)return;const e=new Date;for(const[t,i]of this._scheduledJobs){if(!i.enabled)continue;if(this.shouldRunJob(i,e))try{i.lastRun=e.getTime(),i.nextRun=this.calculateNextRunTime(i,e),this.logger.log("Rendering",`Running scheduled job: ${i.id} - ${i.description||"No description"}`,{category:"rendering",subsystem:"scheduler"}),i.callback()}catch(e){this.logger.error("Rendering",`Error running scheduled job ${i.id}: ${e}`,{category:"rendering",subsystem:"scheduler"})}}}shouldRunJob(e,t){if(e.mode===xe.INTERVAL)return!!e.interval&&(!e.lastRun||t.getTime()-e.lastRun>=e.interval);if(e.mode===xe.FIXED_TIMES){if(!e.times||0===e.times.length)return!1;const i=t.getHours(),r=t.getMinutes(),a=`${i.toString().padStart(2,"0")}:${r.toString().padStart(2,"0")}`;return e.times.includes(a)}return e.mode===xe.CRON&&(!!e.cronExpression&&this.evaluateCronExpression(e.cronExpression,t))}evaluateCronExpression(e,t){const i=e.split(" ");if(5!==i.length)throw new Error(`Invalid cron expression: ${e} - expected 5 parts`);const[r,a,s,o,n]=i,c=t.getMinutes(),l=t.getHours(),d=t.getDate(),h=t.getMonth()+1,u=t.getDay();return this.matchesCronPart(r,c,0,59)&&this.matchesCronPart(a,l,0,23)&&this.matchesCronPart(s,d,1,31)&&this.matchesCronPart(o,h,1,12)&&this.matchesCronPart(n,u,0,6)}matchesCronPart(e,t,i,r){if("*"===e)return!0;if(e.includes(",")){const i=e.split(",").map((e=>parseInt(e,10)));return i.includes(t)}if(e.includes("-")){const[i,r]=e.split("-").map((e=>parseInt(e,10)));return t>=i&&t<=r}if(e.includes("/")){const[r,a]=e.split("/"),s=parseInt(a,10);if("*"===r)return(t-i)%s==0;if(r.includes("-")){const[e,i]=r.split("-").map((e=>parseInt(e,10)));return t>=e&&t<=i&&(t-e)%s==0}}return parseInt(e,10)===t}calculateNextRunTime(e,t){return e.mode===xe.INTERVAL&&e.interval?t.getTime()+e.interval:t.getTime()+6e4}addScheduledJob(e){this._scheduledJobs.set(e.id,e),this.logger.log("Rendering",`Added scheduled job: ${e.id} - ${e.description||"No description"}`,{category:"rendering",subsystem:"scheduler"})}removeScheduledJob(e){const t=this._scheduledJobs.delete(e);return this.logger.log("Rendering",`Removed scheduled job: ${e} - Success: ${t}`,{category:"rendering",subsystem:"scheduler"}),t}updateScheduledJob(e,t){const i=this._scheduledJobs.get(e);return!!i&&(Object.assign(i,t),this.logger.log("Rendering",`Updated scheduled job: ${e}`,{category:"rendering",subsystem:"scheduler"}),!0)}getScheduledJobs(){return Array.from(this._scheduledJobs.values())}getScheduledJob(e){return this._scheduledJobs.get(e)}destroy(){const e=this.timers.getActiveTimers(),t=e.timeouts,i=e.intervals;this.timers.clearAll(),this._wsDebounceTimerId=null,this._idleTimerId=null,this._schedulerTimerId=null,this._pendingRenderTimers.clear(),this._schedulerEnabled=!1,this._pendingRenders.clear(),this.logger.log("Rendering",`Service destroyed, cleared ${t} timeouts, ${i} intervals`,{category:"rendering",subsystem:"updates"})}getTimerStats(){return this.timers.getStats()}getTimerDetails(){return this.timers.getActiveTimers()}getRenderingState(){const e=Date.now();return{lastRenderTime:this._lastRenderTime,timeSinceLastRender:e-this._lastRenderTime,pendingRenders:this._pendingRenders.size,maxRenderFrequency:this._maxRenderFrequency}}getIdleTimerStatus(){return{active:null!==this._idleTimerId,timeRemaining:0}}getSchedulerStatus(){const e=this._schedulerEnabled,t=this._scheduledJobs.size,i=Array.from(this._scheduledJobs.values()).filter((e=>e.enabled&&void 0!==e.nextRun)).sort(((e,t)=>(e.nextRun||0)-(t.nextRun||0))).slice(0,5).map((e=>({id:e.id,description:e.description,nextRun:e.nextRun||0})));return{active:e,jobCount:t,nextJobs:i}}trackRenderTiming(e){try{e.timestamp||(e.timestamp=Date.now()),this._renderTimings.push(e),this._renderTimings.length>this._maxStoredTimings&&this._renderTimings.shift(),this.logger.log("Rendering",`Render timing for ${e.component}: prep=${e.preparationTime}ms, parts=${e.filteredParts}`,{category:"rendering",subsystem:"performance"})}catch(e){this.logger.error("Rendering",`Error tracking render timing: ${e}`,{category:"rendering",subsystem:"performance"})}}getRenderTimings(){return[...this._renderTimings]}}class Ee{constructor(){this._webSocketData=new Map,this._apiData=new Map,this._hassData=new Map,this._lastUpdateMap=new Map,this._prioritySource="hass",this._hass=null,this._requiredEntities=new Set,this._parameterCache=new Map,this._lastParameterUpdate=0,this.PARAMETER_UPDATE_FREQUENCY=100,this.logger=e.getInstance(),this._initialDataLoaded=new Map,this.logger.log("State","Initialized central state management",{category:"state"})}static getInstance(){return Ee.instance||(Ee.instance=new Ee),Ee.instance}setPriorityDataSource(e){const t=this._prioritySource;this._prioritySource=e,this.logger.log("State",`Data source priority changed from ${t} to ${e}`,{category:"card",subsystem:"lifecycle"}),this.triggerRefresh()}trackLastUpdate(e,t){if(!t)return;const i=`${e}:${t}`,r=Date.now();this._lastUpdateMap.set(i,r),this.logger.log("State",`Tracked update from ${e} for ${t}`,{category:"state",subsystem:"updates"})}getLastUpdate(e,t){const i=`${e}:${t}`;return this._lastUpdateMap.get(i)||0}setWebSocketData(e,t){const i=t.map((e=>Object.assign(Object.assign({},e),{source:"websocket"})));this._webSocketData.set(e,i),this.trackLastUpdate("websocket",e),this.logger.log("State",`WebSocket data set for ${e} with ${i.length} items`,{category:"state",subsystem:"updates"})}setApiData(e,t){const i=t.map((e=>Object.assign(Object.assign({},e),{source:"api"})));this._apiData.set(e,i),this.trackLastUpdate("api",e),this.logger.log("State",`API data set for ${e} with ${i.length} items`,{category:"state",subsystem:"updates"})}setHassData(e,t){const i=t.map((e=>Object.assign(Object.assign({},e),{source:"hass"})));this._hassData.set(e,i),this.trackLastUpdate("hass",e),this.logger.log("State",`HASS data set for ${e} with ${i.length} items`,{category:"state",subsystem:"updates"})}registerEntityOfInterest(e){e&&(this._requiredEntities.add(e),this.logger.log("State",`Registered interest in entity ${e}`,{category:"state",subsystem:"entities"}))}setHass(e){if(e){this._hass=e;for(const t of this._requiredEntities)if(e.states[t])try{const i=e.states[t];i&&i.attributes&&i.attributes.items&&(this.setHassData(t,i.attributes.items),this.markInitialDataLoaded(t),this.trackLastUpdate("hass",t),this.logger.log("State",`Loaded initial data for ${t} from HASS`,{category:"card",subsystem:"updates"}))}catch(e){this.logger.error("State",`Failed to load initial data for ${t}: ${e}`,{category:"card",subsystem:"updates"})}}}getWebSocketData(e){return this._webSocketData.get(e)||[]}getApiData(e){return this._apiData.get(e)||[]}getHassData(e){return this._hassData.get(e)||[]}getNewestData(e){if(!e)return[];let t="none";if(!this.isInitialDataLoaded(e)){const i=this.getHassData(e);if(i.length>0)return t="hass",this.markInitialDataLoaded(e),i}switch(this._prioritySource){case"websocket":{const i=this.getWebSocketData(e);if(i.length>0)return t="websocket",i;const r=this.getApiData(e);if(r.length>0)return t="api",r;const a=this.getHassData(e);if(a.length>0)return t="hass",a;break}case"api":{const i=this.getApiData(e);if(i.length>0)return t="api",i;const r=this.getWebSocketData(e);if(r.length>0)return t="websocket",r;const a=this.getHassData(e);if(a.length>0)return t="hass",a;break}case"hass":{const i=this.getHassData(e);if(i.length>0)return t="hass",i;const r=this.getWebSocketData(e);if(r.length>0)return t="websocket",r;const a=this.getApiData(e);if(a.length>0)return t="api",a;break}}return"none"!==t&&this.logger.log("State",`Using ${t} data for ${e}`,{category:"card",subsystem:"data"}),[]}updateParameter(e,t,i){var r;let a;for(const[t,i]of this._hassData.entries()){const r=i.find((t=>t.pk===e));if(r){a=t;break}}if(!a){this.logger.log("State",`Part ${e} not found in any entity, storing parameter ${t} in orphaned parts collection`,{category:"state",subsystem:"updates"});const a="orphaned_parts";this._parameterCache.has(a)||this._parameterCache.set(a,new Map);const s=`${e}:${t}`;null===(r=this._parameterCache.get(a))||void 0===r||r.set(s,i);const o=new CustomEvent("inventree-parameter-updated",{detail:{part_id:e,parameter_name:t,value:i,source:"state-update-orphaned"},bubbles:!0,composed:!0});return void window.dispatchEvent(o)}this.updateParameterInSource(this._webSocketData,a,e,t,i),this.updateParameterInSource(this._apiData,a,e,t,i),this.updateParameterInSource(this._hassData,a,e,t,i),this._updateParameterCache(a,e,t,i);const s=new CustomEvent("inventree-parameter-updated",{detail:{part_id:e,parameter_name:t,value:i,source:"state-update"},bubbles:!0,composed:!0});window.dispatchEvent(s)}updateParameterInSource(e,t,i,r,a){const s=e.get(t);if(!s)return;const o=s.find((e=>e.pk===i));if(!o||!o.parameters)return;const n=o.parameters.find((e=>{var t,i;return(null===(i=null===(t=e.template_detail)||void 0===t?void 0:t.name)||void 0===i?void 0:i.toLowerCase())===r.toLowerCase()}));n&&(n.data=a)}_updateParameterCache(e,t,i,r){var a;this._parameterCache.has(e)||this._parameterCache.set(e,new Map);const s=`${t}:${i}`;null===(a=this._parameterCache.get(e))||void 0===a||a.set(s,r)}getParameterValue(e,t,i){const r=this._parameterCache.get(e);if(r){const e=`${t}:${i}`,a=r.get(e);if(void 0!==a)return a}const a=this._parameterCache.get("orphaned_parts");if(a){const e=`${t}:${i}`,r=a.get(e);if(void 0!==r)return r}return null}findEntityForPart(e){for(const t of this._requiredEntities){const i=this._hassData.get(t)||[],r=this._apiData.get(t)||[],a=this._webSocketData.get(t)||[];if(i.some((t=>t.pk===e)))return t;if(r.some((t=>t.pk===e)))return t;if(a.some((t=>t.pk===e)))return t}const t=this._parameterCache.get("orphaned_parts");if(t)for(const i of t.keys())if(i.startsWith(`${e}:`))return"orphaned_parts"}clearCache(){this.logger.log("State","Clearing all cached data",{category:"card",subsystem:"cache"}),this._webSocketData.clear(),this._apiData.clear(),this._parameterCache.clear(),this._lastUpdateMap.clear();const e=Array.from(this._initialDataLoaded.keys());this._initialDataLoaded.clear(),this._repopulateParametersFromHass(e),window.dispatchEvent(new CustomEvent("inventree-cache-cleared")),this.logger.log("State",`Cleared caches and repopulated parameters from HASS for ${e.length} entities`,{category:"card",subsystem:"cache"})}_repopulateParametersFromHass(e){var t;if(!this._hass)return;let i=0;for(const r of e){this.markInitialDataLoaded(r);const e=this.getHassData(r);for(const a of e)if(a.parameters)for(const e of a.parameters)(null===(t=e.template_detail)||void 0===t?void 0:t.name)&&(this._updateParameterCache(r,a.pk,e.template_detail.name,e.data),i++);this.trackLastUpdate("hass",r)}this.logger.log("State",`Repopulated ${i} parameters from HASS data`,{category:"card",subsystem:"cache"})}unregisterEntityOfInterest(e){e&&(this._requiredEntities.delete(e),this._webSocketData.delete(e),this._apiData.delete(e),this._hassData.delete(e),this.logger.log("State",`Unregistered interest in entity ${e}`,{category:"state",subsystem:"entities"}))}getTrackedEntities(){return Array.from(this._requiredEntities)}triggerRefresh(){window.dispatchEvent(new CustomEvent("inventree-force-refresh"))}getParameterValueFromPart(e,t){if(!e||!t)return null;if(!e.parameters||!Array.isArray(e.parameters)||0===e.parameters.length)return null;const i=e.parameters.find((e=>{var i,r;return(null===(r=null===(i=e.template_detail)||void 0===i?void 0:i.name)||void 0===r?void 0:r.toLowerCase())===t.toLowerCase()}));return i&&void 0!==i.data?i.data:null}isDirectPartReference(e){return!(!e||"string"!=typeof e)&&(e.startsWith("part:")&&e.substring(5).includes(":"))}async getParameterValueWithDirectReference(e){if(!this.isDirectPartReference(e))return null;const t=e.split(":");if(t.length>=3){const e=parseInt(t[1],10),i=t[2];if(isNaN(e))return null;const r=this._findPartById(e);if(r)return this.getParameterValueFromPart(r,i)}return null}_findPartById(e){const t=this.getTrackedEntities();for(const i of t){const t=this.getNewestData(i).find((t=>t.pk===e));if(t)return t}return null}async findParameterInAllEntities(e,t){const i=this.findEntityForPart(e);if(i&&"orphaned_parts"!==i)return this.getParameterValue(i,e,t);if("orphaned_parts"===i){const i=this._parameterCache.get("orphaned_parts");if(i){const r=`${e}:${t}`,a=i.get(r);if(void 0!==a)return a}}const r=this.findParameterInWebSocketData(e,t);if(null!==r)return r;const a=this.findParameterInApiData(e,t);if(null!==a)return a;const s=this.findParameterInHassData(e,t);return null!==s?s:null}findParameterInWebSocketData(e,t){for(const[i,r]of this._webSocketData.entries()){const i=r.find((t=>t.pk===e));if(i)return this.getParameterValueFromPart(i,t)}return null}findParameterInApiData(e,t){for(const[i,r]of this._apiData.entries()){const i=r.find((t=>t.pk===e));if(i)return this.getParameterValueFromPart(i,t)}return null}findParameterInHassData(e,t){var i;for(const[i,r]of this._hassData.entries()){const i=r.find((t=>t.pk===e));if(i)return this.getParameterValueFromPart(i,t)}if(this._hass)for(const r of this._requiredEntities){const a=this._hass.states[r];if(null===(i=null==a?void 0:a.attributes)||void 0===i?void 0:i.items){const i=a.attributes.items.find((t=>t.pk===e));if(i)return this.getParameterValueFromPart(i,t)}}return null}storeOrphanedParameter(e,t,i){var r;const a="orphaned_parts";this._parameterCache.has(a)||this._parameterCache.set(a,new Map);const s=`${e}:${t}`;null===(r=this._parameterCache.get(a))||void 0===r||r.set(s,i),this.logger.log("State",`Stored orphaned parameter ${t}=${i} for part ${e}`,{category:"state",subsystem:"orphaned"})}isOrphanedPart(e){return"orphaned_parts"===this.findEntityForPart(e)}getOrphanedPartIds(){const e=this._parameterCache.get("orphaned_parts");if(!e)return[];const t=new Set;for(const i of e.keys()){const e=i.split(":")[0],r=parseInt(e,10);isNaN(r)||t.add(r)}return Array.from(t)}getOrphanedPartParameters(e){const t=this._parameterCache.get("orphaned_parts");if(!t)return null;const i={};let r=!1;for(const[a,s]of t.entries()){const[t,o]=a.split(":");parseInt(t,10)===e&&o&&(i[o]=s,r=!0)}return r?i:null}getFilteredParts(e){return this.getNewestData(e)}getActionButtons(e,t){return e&&t&&Array.isArray(t)&&0!==t.length?("string"==typeof e||!e.pk||String(e.pk),t.filter((t=>{if(!t)return!1;if(t.condition&&t.condition.parameter){const i=t.condition.parameter,r=this.getParameterValueFromPart(e,i);if(null===r&&"exists"!==t.condition.operator&&"is_empty"!==t.condition.operator)return!1;if(!(null===r||void 0===t.condition.value||"true"!==String(r).toLowerCase()&&"false"!==String(r).toLowerCase()||"true"!==String(t.condition.value).toLowerCase()&&"false"!==String(t.condition.value).toLowerCase()))switch(t.condition.operator){case"equals":return String(r).toLowerCase()===String(t.condition.value).toLowerCase();case"not_equals":return String(r).toLowerCase()!==String(t.condition.value).toLowerCase()}switch(t.condition.operator){case"exists":return null!==r;case"is_empty":return null===r||""===r;case"equals":return r===t.condition.value;case"not_equals":return r!==t.condition.value;case"contains":return null==r?void 0:r.includes(t.condition.value);case"greater_than":return Number(r)>Number(t.condition.value);case"less_than":return Number(r)<Number(t.condition.value);default:return!1}}return!0})).map((t=>({label:t.label||"Action",icon:t.icon||"mdi:check",onClick:()=>{this.logger.log("State",`Action button clicked: ${t.label}`,{category:"actions",subsystem:"parameters"}),window.dispatchEvent(new CustomEvent("inventree-action-click",{detail:{part:e,action:t,parameter:t.parameter||"",value:t.value||""}}))}})))):[]}isInitialDataLoaded(e){return this._initialDataLoaded.get(e)||!1}markInitialDataLoaded(e){this._initialDataLoaded.set(e,!0)}}class Ie{static getInstance(){return Ie.instance||(Ie.instance=new Ie),Ie.instance}constructor(){this._hass=null,this._entityCallbacks=new Map,this._subscriptions=new Map,this._entitySubscriptions=new Map,this._lastHassUpdate=0,this.HASS_UPDATE_DEBOUNCE=5e3,this._healthCheckInterval=null,this._directApi=null,this._logger=e.getInstance(),this._state=Ee.getInstance(),this._logger.info("WebSocket","Service initialized",{category:"websocket",subsystem:"service"})}setHass(e){this._logger.log("WebSocket","Setting HASS instance",{category:"websocket",subsystem:"hass"}),this._hass!==e&&(this._hass=e,this._state.setHass(e),this._processHassEntities(e.states))}subscribeToEntity(e,t){this._logger.log("WebSocket",`Subscribing to entity: ${e}`,{category:"websocket",subsystem:"entities"}),this._entityCallbacks.has(e)||this._entityCallbacks.set(e,[]);return this._entityCallbacks.get(e).push(t),this._state.registerEntityOfInterest(e),()=>{this._logger.log("WebSocket",`Unsubscribing from entity: ${e}`,{category:"websocket",subsystem:"entities"});const i=this._entityCallbacks.get(e);if(i){const r=i.indexOf(t);-1!==r&&i.splice(r,1),0===i.length&&(this._entityCallbacks.delete(e),this._state.unregisterEntityOfInterest(e))}}}updateHass(e){this._logger.log("WebSocket","Processing HASS state update",{category:"websocket",subsystem:"hass"}),this._hass=e,this._state.setHass(e),this._processHassEntities(e.states)}_processHassEntities(e){if(!e)return;this._logger.log("WebSocket",`Processing ${Object.keys(e).length} HASS entities`,{category:"websocket",subsystem:"entities"});const t=this._state.getTrackedEntities();this._logger.info("WebSocket",`Found ${t.length} tracked entities`,{category:"websocket",subsystem:"entities"});for(const i of t){const t=e[i];if(t)try{let e=[];if(t.attributes&&Array.isArray(t.attributes.items))e=t.attributes.items,this._logger.info("WebSocket",`Found parts data in entity.attributes.items for ${i}`,{category:"websocket",subsystem:"parts"});else if("string"==typeof t.state)try{const r=JSON.parse(t.state);Array.isArray(r)?(e=r,this._logger.info("WebSocket",`Found parts data in entity.state JSON for ${i}`,{category:"websocket",subsystem:"parts"})):r&&"object"==typeof r&&(e=[r],this._logger.info("WebSocket",`Found single part data in entity.state JSON for ${i}`,{category:"websocket",subsystem:"parts"}))}catch(r){!isNaN(parseInt(t.state))&&t.attributes&&Array.isArray(t.attributes.items)?(e=t.attributes.items,this._logger.info("WebSocket",`Found parts data in entity.attributes.items for ${i} with count state`,{category:"websocket",subsystem:"parts"})):this._logger.warn("WebSocket",`Unable to parse state for ${i}: ${r}`,{category:"websocket",subsystem:"parsing"})}if(this._logger.info("WebSocket",`Processed entity ${i}: found ${e.length} parts`,{category:"websocket",subsystem:"parts"}),e.length>0){const t=e.map((e=>Object.assign(Object.assign({},e),{source:"hass"})));if(this._state.setHassData(i,t),this._state.markInitialDataLoaded(i),this._logger.info("WebSocket",`Updated state data for ${i} with ${t.length} parts`,{category:"websocket",subsystem:"parts"}),this._entityCallbacks.has(i)){const e=this._entityCallbacks.get(i);this._logger.log("WebSocket",`Notifying ${e.length} callbacks for ${i}`,{category:"websocket",subsystem:"callbacks"});for(const t of e)try{t()}catch(e){this._logger.error("WebSocket",`Error in entity callback for ${i}: ${e}`,{category:"websocket",subsystem:"callbacks"})}}}else this._logger.warn("WebSocket",`No parts data found for entity ${i}`,{category:"websocket",subsystem:"parts"})}catch(e){this._logger.error("WebSocket",`Error processing entity ${i}: ${e}`,{category:"websocket",subsystem:"entities"})}else this._logger.warn("WebSocket",`Tracked entity not found in HASS states: ${i}`,{category:"websocket",subsystem:"entities"})}}refreshAllEntities(){this._hass&&(this._logger.log("WebSocket","Forcing refresh of all tracked entities",{category:"websocket",subsystem:"entities"}),this._processHassEntities(this._hass.states))}reset(){this._logger.log("WebSocket","Resetting WebSocket service state",{category:"websocket",subsystem:"service"}),this._entityCallbacks.clear()}getDiagnostics(){return{trackedEntities:this._state.getTrackedEntities(),registeredCallbacks:Array.from(this._entityCallbacks.entries()).map((([e,t])=>({entity:e,callbackCount:t.length})))}}isConnected(){return!!this._hass}getConnectionStatus(){return{isConnected:this.isConnected(),isDeprecated:!0}}getApiStatus(){return{failureCount:0,usingFallback:!1,recentSuccess:!0}}setDirectApi(e){this._directApi=e,this._logger.log("WebSocket",(e?"Set":"Cleared")+" Direct API reference (STUB IMPLEMENTATION)",{category:"websocket",subsystem:"integration"})}getDirectApi(){return this._directApi}}class Te{constructor(t,i){this.fallbackEnabled=!1,this.lastApiCall=0,this.MIN_API_CALL_INTERVAL=100,this.apiCallCount=0,this.fallbackCount=0,this._debugInterval=null,this.apiTotalTime=0,this.apiCallSuccesses=0,this.apiCallFailures=0,this.parameterService=null,this._sentNotifications=new Set,this._parameterValues=new Map,this.logger=e.getInstance();const r="https:"===window.location.protocol;if((t=t.trim()).endsWith("/")&&(t=t.slice(0,-1)),t.endsWith("/api")&&(t=t.slice(0,-4)),t.startsWith("http://http//")||t.startsWith("https://http//")?t=t.replace(/^(https?:\/\/)http\/\//,"$1"):t.match(/^https?:\/\//)||(t=`http://${t}`),r&&t.startsWith("http:"))try{const e=new URL(t);this.apiUrl=`//${e.host}`,this.useHttps=!1}catch(e){this.apiUrl=t,this.useHttps=!1}else this.apiUrl=t,this.useHttps=t.startsWith("https:");this.apiKey=i,this.fallbackEnabled=!1,this.testConnection(!0),this._debugInterval&&clearInterval(this._debugInterval),this._debugInterval=setInterval((()=>{const e=this.getPerformanceStats();(e.failures>5||e.fallbackCalls>0)&&this.logger.log("API",`Status: Fallback ${this.fallbackEnabled?"ENABLED":"DISABLED"}, API calls: ${this.apiCallCount}, Fallback calls: ${this.fallbackCount}`,{category:"api",subsystem:"calls"})}),3e5)}setParameterService(e){this.parameterService=e}async getParameterValue(e,t,i){this.logger.log("API",`Parameter request for part ${e}, parameter ${t}`,{category:"api",subsystem:"calls"});Date.now()-this.lastApiCall<this.MIN_API_CALL_INTERVAL&&(this.logger.log("API",`Rate limiting for ${t} - waiting ${this.MIN_API_CALL_INTERVAL}ms before proceeding`,{category:"api",subsystem:"calls"}),await new Promise((e=>setTimeout(e,this.MIN_API_CALL_INTERVAL))),this.logger.log("API",`Rate limit wait complete, proceeding with API call for ${t}`,{category:"api",subsystem:"calls"})),this.lastApiCall=Date.now();try{this.apiCallCount++;const i=performance.now();this.logger.log("API",`Starting API call #${this.apiCallCount}: Requesting parameter ${t} for part ${e}`,{category:"api",subsystem:"calls"});let r=this.apiUrl;r.endsWith("/")||(r+="/");const a=`${r}api/part/parameter/?part=${e}`;this.logger.log("API",`Making request to ${a}`,{category:"api",subsystem:"calls"});const s=new Headers;s.append("Authorization",`Token ${this.apiKey}`),s.append("Accept","application/json"),s.append("Content-Type","application/json");const o=await fetch(a,{method:"GET",headers:s,mode:"cors"});if(!o.ok)return console.error(`[API-5] ❌ HTTP error ${o.status} from ${a}`),this.apiCallFailures++,this.logger.error("API",`HTTP error ${o.status} from ${a}`,{category:"api",subsystem:"errors"}),null;const n=await o.json(),c=performance.now();this.apiTotalTime+=c-i,this.apiCallSuccesses++,this.logger.log("API",`API Call #${this.apiCallCount} succeeded in ${Math.round(c-i)}ms. Found ${n.length} parameters.`,{category:"api",subsystem:"responses"});const l=n.find((e=>{var i;const r=null===(i=e.template_detail)||void 0===i?void 0:i.name;return r&&r.toLowerCase()===t.toLowerCase()}));return l?(this.logger.log("API",`Found parameter ${t} = ${l.data}`,{category:"api",subsystem:"responses"}),this.parameterService&&(this.parameterService.syncApiDataToEntityState(e,t,l.data),this.logger.log("API",`Synced parameter ${t} = ${l.data} to entity state`,{category:"api",subsystem:"responses"})),this.notifyParameterChanged(e,t,l.data),l.data):(console.warn(`[API-9] ❓ Parameter ${t} not found in response`),this.logger.log("API","Available parameters in response:",{category:"api",subsystem:"responses"}),n.forEach((e=>{var t;this.logger.log("API",`   - ${null===(t=e.template_detail)||void 0===t?void 0:t.name}: ${e.data}`,{category:"api",subsystem:"responses"})})),null)}catch(e){return console.error("[API-ERROR] ❌ Error fetching parameter:",e),this.apiCallFailures++,this.logger.error("API",`Error fetching parameter: ${e}`,{category:"api",subsystem:"errors"}),null}}getFallbackParameterValue(e,t){if(this.fallbackCount++,this.logger.log("API",`Fallback #${this.fallbackCount}: Using fallback data for parameter ${e}`,{category:"api"}),!this.fallbackEnabled||!t)return null;try{if(Array.isArray(t))for(const i of t)if(i.parameters){const t=i.parameters.find((t=>{var i,r;return(null===(r=null===(i=t.template_detail)||void 0===i?void 0:i.name)||void 0===r?void 0:r.toLowerCase())===e.toLowerCase()}));if(t)return t.data}return null}catch(e){return null}}setFallbackEnabled(e){this.fallbackEnabled=e}async testConnection(e=!1){try{let t="";t=this.apiUrl.endsWith("/")?`${this.apiUrl}api/`:`${this.apiUrl}/api/`,e||console.log(`🔌 Testing API connection to: ${t}`);const i=new Headers;i.append("Authorization",`Token ${this.apiKey}`),i.append("Accept","application/json"),i.append("Content-Type","application/json");try{const r=await fetch(t,{method:"GET",headers:i,mode:"cors"});if(r.ok){e||console.log("✅ API: Connection test successful");const t=new Headers;t.append("Authorization",`Token ${this.apiKey}`),t.append("Accept","application/json"),t.append("Content-Type","application/json");const i=this.apiUrl.endsWith("/")?`${this.apiUrl}api/part/parameter/?limit=1`:`${this.apiUrl}/api/part/parameter/?limit=1`,r=await fetch(i,{method:"GET",headers:t,mode:"cors"});return r.ok||(console.warn(`⚠️ API: Parameter API test failed with status ${r.status}. Enabling fallback mode.`),this.setFallbackEnabled(!0)),!0}console.warn(`⚠️ API: Connection test failed with status ${r.status}`);try{const e=await r.text();console.warn(`⚠️ API: Error response: ${e}`)}catch(e){}return this.setFallbackEnabled(!0),!1}catch(e){return console.warn("⚠️ API: Connection test error:",e),this.setFallbackEnabled(!0),!0}}catch(e){return console.warn("⚠️ API: Unexpected error during connection test:",e),this.setFallbackEnabled(!0),!1}}getApiStats(){return{apiCalls:this.apiCallCount,fallbackCalls:this.fallbackCount}}getApiUrl(){return this.apiUrl}async testBasicAuth(e,t){try{let i="";i=this.apiUrl.endsWith("/")?`${this.apiUrl}api/`:`${this.apiUrl}/api/`,this.logger.log("API",`Testing basic auth to: ${i}`,{category:"api"});const r=btoa(`${e}:${t}`),a=await fetch(i,{method:"GET",headers:{Authorization:`Basic ${r}`,Accept:"application/json"},mode:"cors"});return a.ok?(this.logger.log("API","Basic auth test successful",{category:"api"}),!0):(this.logger.log("API",`Basic auth test failed with status ${a.status}`,{category:"api"}),!1)}catch(e){return this.logger.error("API","Basic auth test error:",{category:"api"},e),!1}}async getPartParameters(e){try{let t=this.apiUrl;"https:"===window.location.protocol&&t.startsWith("http:")&&(t=t.replace(/^http:/,"//")),t.endsWith("/")||(t+="/"),t.startsWith("//")&&(t=`${window.location.protocol}${t}`);const i=`${t}api/part/${e}/`;this.logger.log("API",`Requesting part data from ${i}`,{category:"api"});const r=await fetch(i,{headers:{Authorization:`Token ${this.apiKey}`,Accept:"application/json"},mode:"cors"});if(!r.ok)return this.logger.error("API",`HTTP error ${r.status} from ${i}`,{category:"api"}),[];const a=await r.json();return a.parameters?(this.logger.log("API",`Received parameters for part ${e}:`,{category:"api"},a.parameters),a.parameters):(this.logger.log("API","Part data does not include parameters, will need a secondary request",{category:"api"}),[])}catch(e){return this.logger.error("API","Error fetching part:",{category:"api"},e),[]}}async testBasicAuthWithEndpoint(e,t,i){try{let r="";r=this.apiUrl.endsWith("/")?`${this.apiUrl}api/${i}`:`${this.apiUrl}/api/${i}`,console.log(`🔌 Testing basic auth to: ${r}`);const a=btoa(`${e}:${t}`),s=await fetch(r,{method:"GET",headers:{Authorization:`Basic ${a}`,Accept:"application/json"},mode:"cors"});if(s.ok){console.log("✅ API: Basic auth test successful");return await s.json()}return console.log(`❌ API: Basic auth test failed with status ${s.status}`),!1}catch(e){return console.error("❌ API: Basic auth test error:",e),!1}}async testConnectionExactFormat(e=!0){try{const t=`${this.apiUrl.endsWith("/")?this.apiUrl.slice(0,-1):this.apiUrl}/api/part/parameter/?part=145`;e||console.log(`🔌 Testing API with exact Postman format: ${t}`);const i={Authorization:`Token ${this.apiKey}`,Accept:"application/json","Content-Type":"application/json"};try{const r=await fetch(t,{method:"GET",headers:i,mode:"cors"});if(r.ok){await r.json();return await this.testParameterAPI(e),!0}return e||console.warn(`⚠️ API: Exact format test failed with status ${r.status}`),!1}catch(t){return e||console.warn("⚠️ API: Exact format test error:",t),!1}}catch(t){return e||console.warn("⚠️ API: Unexpected error during exact format test:",t),!1}}async testParameterAPI(e=!0){try{const t=`${this.apiUrl.endsWith("/")?this.apiUrl.slice(0,-1):this.apiUrl}/api/part/parameter/?part=145`;e||console.log(`🔌 Testing parameter API: ${t}`);const i={Authorization:`Token ${this.apiKey}`,Accept:"application/json","Content-Type":"application/json"},r=await fetch(t,{method:"GET",headers:i,mode:"cors"});if(r.ok){await r.json();return this.setFallbackEnabled(!1),!0}return e||console.warn(`⚠️ API: Parameter API test failed with status ${r.status}`),!1}catch(t){return e||console.warn("⚠️ API: Parameter API test error:",t),!1}}destroy(){this._debugInterval&&(clearInterval(this._debugInterval),this._debugInterval=null)}logApiStats(){this.logger.log("API",`Stats: Direct API calls: ${this.apiCallCount}, Fallback calls: ${this.fallbackCount}, Fallback ${this.fallbackEnabled?"ENABLED":"DISABLED"}`,{category:"api"})}async updateParameterDirectly(e,t,i){try{const e=`${this.apiUrl.endsWith("/")?this.apiUrl.slice(0,-1):this.apiUrl}/api/part/parameter/${t}/`;this.logger.log("API",`Updating parameter ${t} to ${i}`,{category:"api"});const r=await fetch(e,{method:"PATCH",headers:{Authorization:`Token ${this.apiKey}`,Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({data:i})});if(r.ok)return this.logger.log("API","Parameter update successful",{category:"api"}),!0;this.logger.error("API",`Parameter update failed with status ${r.status}`,{category:"api"});try{const e=await r.text();this.logger.error("API",`Error response: ${e}`,{category:"api"})}catch(e){this.logger.error("API","Could not read error response",{category:"api"})}return!1}catch(e){return this.logger.error("API","Parameter update error:",{category:"api"},e),!1}}getPerformanceStats(){const e=this.apiCallSuccesses>0?Math.round(this.apiTotalTime/this.apiCallSuccesses):0;return{apiCalls:this.apiCallCount,successes:this.apiCallSuccesses,failures:this.apiCallFailures,fallbackCalls:this.fallbackCount,avgCallTime:e}}getLastKnownParameterValue(e,t){return this._parameterValues.get(`${e}:${t}`)||""}updateLastKnownParameterValue(e,t,i){this._parameterValues.set(`${e}:${t}`,i)}notifyParameterChanged(e,t,i){const r=`${e}:${t}:${i}`;if(this._sentNotifications.has(r))return void this.logger.log("API",`Skipping duplicate notification for ${t}=${i}`,{category:"api"});this._sentNotifications.add(r),setTimeout((()=>{this._sentNotifications.delete(r)}),2e3);const a=new CustomEvent("inventree-parameter-changed",{detail:{partId:e,parameter:t,value:i,source:"direct-api"},bubbles:!0,composed:!0});this.logger.log("API",`Notifying about parameter change - part ${e}, parameter ${t}, value ${i}`,{category:"api"}),window.dispatchEvent(a),window.dispatchEvent(new CustomEvent("inventree-api-update",{detail:{source:"api"}}))}isFallbackEnabled(){return this.fallbackEnabled}resetRateLimiting(){this.logger.log("API","Resetting rate limiting",{category:"api"}),this.lastApiCall=0}async updateParameter(e,t,i){this.logger.log("API",`Updating parameter ${t} to ${i} for part ${e}`,{category:"api",subsystem:"update"});try{Date.now()-this.lastApiCall<this.MIN_API_CALL_INTERVAL&&(this.logger.log("API",`Rate limiting for update - waiting ${this.MIN_API_CALL_INTERVAL}ms`,{category:"api",subsystem:"throttle"}),await new Promise((e=>setTimeout(e,this.MIN_API_CALL_INTERVAL)))),this.lastApiCall=Date.now(),this.apiCallCount++;let r=this.apiUrl;r.endsWith("/")||(r+="/");const a=`${r}api/part/parameter/?part=${e}`,s=new Headers;s.append("Authorization",`Token ${this.apiKey}`),s.append("Accept","application/json"),s.append("Content-Type","application/json");const o=await fetch(a,{method:"GET",headers:s,mode:"cors"});if(!o.ok)return this.logger.error("API",`HTTP error ${o.status} fetching parameter data`,{category:"api",subsystem:"update"}),this.apiCallFailures++,!1;const n=(await o.json()).find((e=>{var i;const r=null===(i=e.template_detail)||void 0===i?void 0:i.name;return r&&r.toLowerCase()===t.toLowerCase()}));if(!n)return this.logger.warn("API",`Parameter ${t} not found for part ${e}`,{category:"api",subsystem:"update"}),!1;const c=`${r}api/part/parameter/${n.pk}/`,l=await fetch(c,{method:"PATCH",headers:s,body:JSON.stringify({data:i}),mode:"cors"});if(!l.ok)return this.logger.error("API",`HTTP error ${l.status} updating parameter ${t}`,{category:"api",subsystem:"update"}),this.apiCallFailures++,!1;await l.json();return this.apiCallSuccesses++,this.logger.log("API",`Successfully updated parameter ${t} to ${i} for part ${e}`,{category:"api",subsystem:"update"}),this.parameterService&&this.parameterService.syncApiDataToEntityState(e,t,i),this.notifyParameterChanged(e,t,i),!0}catch(e){return this.logger.error("API",`Error updating parameter: ${e}`,{category:"api",subsystem:"update"}),this.apiCallFailures++,!1}}async fetchParameterData(e,t){this.logger.log("API",`Fetching parameter data for part ${e}${t?` parameter ${t}`:""}`,{category:"api",subsystem:"fetch"});try{t?await this.getParameterValue(e,t):await this.getParameterValue(e,""),this.logger.log("API",`Successfully fetched parameter data for part ${e}`,{category:"api",subsystem:"fetch"})}catch(e){this.logger.error("API",`Error fetching parameter data: ${e}`,{category:"api",subsystem:"fetch"})}}isApiConnected(){return!this.fallbackEnabled&&""!==this.apiUrl&&""!==this.apiKey}}class De{constructor(){this._cache=new Map}get(e){const t=this._cache.get(e);if(t&&!(Date.now()-t.timestamp>5e3))return t.value;t&&this._cache.delete(e)}set(e,t,i=5e3){this._cache.set(e,{value:t,timestamp:Date.now()})}clear(){this._cache.clear()}get size(){return this._cache.size}get keys(){return Array.from(this._cache.keys())}clearPattern(e){let t=0;for(const i of this.keys)i.startsWith(e)&&(this._cache.delete(i),t++);return t}}class Ae{constructor(t){this.directApi=null,this._config=null,this._strictWebSocketMode=!1,this._isWebSocketCall=!1,this._hass=t,this.cache=new De,this.logger=e.getInstance(),Ae.instance=this,window.addEventListener("inventree-cache-cleared",(()=>{this.handleCacheCleared()}))}static getInstance(){if(!Ae.instance)throw new Error("ParameterService not initialized! Call initialize() first.");return Ae.instance}static initialize(e){return Ae.instance?Ae.instance._hass=e:Ae.instance=new Ae(e),Ae.instance}static hasInstance(){return null!==Ae.instance}setConfig(e){this._config=e}diagnosticDump(){this.logger.log("Parameters","=== Parameter Service Diagnostic Dump ===",{category:"parameters",subsystem:"diagnostics"}),this.logger.log("Parameters",`Condition Cache Entries: ${this.cache.keys.length}`,{category:"parameters",subsystem:"cache"}),this.logger.log("Parameters",`Recently Changed Parameters Count: ${Ae.recentlyChangedParameters.size}`,{category:"parameters",subsystem:"activity"}),this.logger.log("Parameters","=== End Diagnostic Dump ===",{category:"parameters",subsystem:"diagnostics"})}clearCache(){this.cache.clear(),this.logger.log("ParameterService","All caches cleared")}markParameterChanged(e){const t=this.cache.clearPattern(`param:${e}`);this.logger.log("ParameterService",`Cleared ${t} cache entries for parameter ${e}`)}matchesConditionSyncVersion(e,t){try{if(!e||!t||!t.parameter)return!1;let i=null;if(this.isDirectPartReference(t.parameter)){const e=Ee.getInstance(),r=t.parameter.split(":");if(3===r.length){const t=Number(r[1]),a=r[2];if(!isNaN(t)&&a){const r=`direct-ref:${t}:${a}`,s=this.cache.get(r);if(void 0!==s)i=s;else for(const s of e.getTrackedEntities())if(i=e.getParameterValue(s,t,a),null!==i){this.cache.set(r,i);break}}}}else i=this.getParameterValueFromPart(e,t.parameter);return this.checkValueMatch(i,t)}catch(e){return!1}}processConditions(e,t){if(!t||0===t.length)return{};const i={};for(const r of t)r.parameter&&r.operator&&this.matchesConditionSyncVersion(e,r)&&this.applyAction(i,r.action,r.action_value);return i}async matchesCondition(e,t){if(!e||!t||!t.parameter)return!1;const i=`condition:${e.pk}:${t.parameter}:${t.operator}:${t.value||""}`,r=this.cache.get(i);if(void 0!==r)return r;try{let r=null;r=this.isDirectPartReference(t.parameter)?await this.getParameterValueWithDirectReference(t.parameter):this.getParameterValueFromPart(e,t.parameter);const a=this.checkValueMatch(r,t);return this.cache.set(i,a,1e4),a}catch(e){return!1}}checkValueMatch(e,t){return null==e?"is_empty"===t.operator:this.compareValues(e,t.value||"",t.operator)}compareValues(e,t,i,r=!1){if(null==e)return"is_empty"===i;const a=String(e),s=t;if(!("true"!==a.toLowerCase()&&"false"!==a.toLowerCase()||"true"!==s.toLowerCase()&&"false"!==s.toLowerCase())){if("equals"===i)return a.toLowerCase()===s.toLowerCase();if("not_equals"===i)return a.toLowerCase()!==s.toLowerCase()}switch(i){case"equals":return a===s;case"not_equals":return a!==s;case"contains":return a.includes(s);case"greater_than":return Number(e)>Number(t);case"less_than":return Number(e)<Number(t);case"exists":return!0;case"is_empty":return!e;default:return!1}}applyAction(e,t,i){if(!t||!i)return;const r=i;switch(t){case"highlight":e.highlight=r;break;case"text_color":e.textColor=r;break;case"border":e.border=r;break;case"icon":e.icon=r;break;case"badge":e.badge=r;break;case"sort":e.sort=r;break;case"filter":e.filter=r;break;case"show_section":e.showSection=r;break;case"priority":e.priority=r}}getActionButtons(e,t,i){return i&&0!==i.length?i.filter((e=>"string"==typeof e?"button"===e:"object"==typeof e&&e&&"type"in e&&"button"===e.type)):[]}shouldShowPart(e){if(!this._config||!this._config.parameters||!this._config.parameters.enabled)return!0;const t=this._config.parameters.conditions;if(!t||0===t.length)return!0;const i=t.filter((e=>"filter"===e.action));if(0===i.length)return!0;const r=i.filter((e=>"show"===e.action_value));if(r.length>0){let t=!1;for(const i of r)if(this.matchesConditionSyncVersion(e,i)){t=!0;break}if(!t)return!1}const a=i.filter((e=>"hide"===e.action_value));for(const t of a)if(this.matchesConditionSyncVersion(e,t))return!1;return!0}isDirectPartReference(e){return!(!e||"string"!=typeof e)&&(e.startsWith("part:")&&3===e.split(":").length)}getParameterValueFromPart(e,t){return Ee.getInstance().getParameterValueFromPart(e,t)}async getParameterValueWithDirectReference(e){if(!this.isDirectPartReference(e))return null;try{const t=e.split(":");if(3!==t.length)return null;const i=Number(t[1]),r=t[2];if(isNaN(i)||!r)return null;const a=`direct-ref:${i}:${r}`,s=this.cache.get(a);if(void 0!==s)return s;const o=Ee.getInstance(),n=await o.findParameterInAllEntities(i,r);if(null!==n)return this.cache.set(a,n),n;if(this.directApi&&this.isApiConnected()){const e=await this.directApi.getParameterValue(i,r);if(null!==e)return this.cache.set(a,e),e}return null}catch(e){return null}}findEntityForPart(e){return Ee.getInstance().findEntityForPart(e)||null}storeOrphanedParameter(e,t,i){Ee.getInstance().storeOrphanedParameter(e,t,i)}isOrphanedPart(e){return Ee.getInstance().isOrphanedPart(e)}getOrphanedPartIds(){return Ee.getInstance().getOrphanedPartIds()}getOrphanedPartParameters(e){return Ee.getInstance().getOrphanedPartParameters(e)}findParameterInWebSocketData(e,t){return Ee.getInstance().findParameterInWebSocketData(e,t)}findParameterInApiData(e,t){return Ee.getInstance().findParameterInApiData(e,t)}findParameterInHassData(e,t){return Ee.getInstance().findParameterInHassData(e,t)}async findParameterInAllEntities(e,t){return Ee.getInstance().findParameterInAllEntities(e,t)}updateHass(e){this._hass=e}isApiConnected(){return!!this.directApi&&this.directApi.isApiConnected()}setDirectApi(e){this.directApi=e}async updateParameter(e,t,i){if(!e||!t)return!1;try{return this.directApi&&this.isApiConnected()?await this.directApi.updateParameter(e.pk,t,i):(this.storeOrphanedParameter(e.pk,t,i),!0)}catch(e){return!1}}async fetchParameterData(e,t){if(e){this.logger.log("ParameterService",`Forwarding fetchParameterData to API for part ${e}${t?` parameter ${t}`:""}`,{category:"parameters",subsystem:"fetch"});try{this.directApi&&this.isApiConnected()?await this.directApi.fetchParameterData(e,t):this.logger.warn("ParameterService",`Cannot fetch parameter data: API not available for part ${e}`,{category:"parameters",subsystem:"fetch"})}catch(e){this.logger.error("ParameterService",`Error fetching parameter data: ${e}`,{category:"parameters",subsystem:"fetch"})}}else this.logger.error("ParameterService","Cannot fetch parameter data: Missing part ID",{category:"parameters",subsystem:"fetch"})}syncApiDataToEntityState(e,t,i){if(!e||!t)return void this.logger.warn("ParameterService","Cannot sync API data: Missing part ID or parameter name",{category:"parameters",subsystem:"sync"});const r=this.findEntityForPart(e);if(r){this.logger.log("ParameterService",`Syncing parameter ${t}=${i} for part ${e} to entity ${r}`,{category:"parameters",subsystem:"sync"});Ee.getInstance().updateParameter(e,t,i),Ae.markParameterChanged(r,t)}else this.logger.warn("ParameterService",`Cannot sync API data: No entity found for part ${e}`,{category:"parameters",subsystem:"sync"}),this.storeOrphanedParameter(e,t,i)}async getParameterFromEntity(e,t){if(!e||!t)return this.logger.warn("ParameterService","Cannot get parameter from entity: Missing entity ID or parameter name",{category:"parameters",subsystem:"entity"}),null;const i=Ee.getInstance().getNewestData(e);if(!i||0===i.length)return this.logger.warn("ParameterService",`No data found for entity ${e}`,{category:"parameters",subsystem:"entity"}),null;for(const e of i){const i=this.getParameterValueFromPart(e,t);if(null!==i)return i}return null}compareFilterValues(e,t,i){if(null==e)return"is_empty"===i;const r=String(e).toLowerCase(),a=t.toLowerCase();if(!("true"!==r&&"false"!==r||"true"!==a&&"false"!==a)){if("eq"===i||"equals"===i)return r===a;if("neq"===i||"not_equals"===i)return r!==a}switch(i){case"eq":case"equals":return r===a;case"neq":case"not_equals":return r!==a;case"contains":return r.includes(a);case"gt":case"greater_than":return Number(e)>Number(t);case"lt":case"less_than":return Number(e)<Number(t);case"exists":return!0;case"is_empty":return!e;default:return!1}}static markParameterChanged(e,t){const i=`${e}:${t}`;Ae.recentlyChangedParameters.add(i),setTimeout((()=>Ae.recentlyChangedParameters.delete(i)),5e3)}static wasRecentlyChanged(e,t){return Ae.recentlyChangedParameters.has(`${e}:${t}`)}clearConditionCache(){this.cache.clearPattern("condition:")}async checkCondition(e,t){return this.matchesCondition(t,e)}setStrictWebSocketMode(e){this._strictWebSocketMode=e}markAsWebSocketCall(){this._isWebSocketCall=!0}clearWebSocketCallMark(){this._isWebSocketCall=!1}isWebSocketCall(){return this._isWebSocketCall}handleCacheCleared(){this.logger.log("Parameters","Responding to cache cleared event",{category:"parameters",subsystem:"cache"}),this.cache.clear(),this.clearConditionCache(),this.logger.log("Parameters","Parameter service caches cleared",{category:"parameters",subsystem:"cache"})}}Ae.instance=null,Ae.recentlyChangedParameters=new Set;class Re{static getInstance(){return Re._instance||(Re._instance=new Re),Re._instance}constructor(){this._connections=new Map,this._openCallbacks=new Map,this._messageCallbacks=new Map,this._keepAliveTimers=new Map,this._reconnectTimers=new Map,this._errorCounts=new Map,this._logger=e.getInstance(),this._processingMessages=new Set,this._connectionStats=new Map,this._logger.log("WebSocketManager","Initialized singleton instance (STUB)")}getConnection(e,t,i){return null}addOpenCallback(e,t){}addMessageCallback(e,t){}removeCallbacks(e,t,i){}closeConnection(e){}closeAllConnections(){}handleOpen(e,t){}handleMessage(e,t){}_handleBasicMessage(e,t){}handleError(e,t){}handleClose(e,t){}setupKeepAlive(e){}destroy(){}isConnected(e){return!1}getStats(){return{activeConnections:0,connections:{}}}_recordActivity(e,t){}getEnhancedStats(){return this.getStats()}}!function(e){e.DISCONNECTED="disconnected",e.CONNECTING="connecting",e.CONNECTED="connected",e.RECONNECTING="reconnecting",e.FAILED="failed",e.CLOSING="closing"}(Se||(Se={}));class Le{static getInstance(){return Le.instance||(Le.instance=new Le),Le.instance}constructor(){this._config=null,this._connection=null,this._connectionId=null,this._isConnected=!1,this._messageCallbacks=[],this.cache=ke.getInstance(),this._errorCount=0,this._url="",this._debug=!1,this._disconnecting=!1,this._autoReconnect=!0,this._reconnectInterval=5e3,this._connectionState=Se.DISCONNECTED,this._lastConnectionAttempt=0,this._connectionAttempts=0,this._maxReconnectDelay=3e5,this._minReconnectDelay=1e3,this._cooldownPeriod=2e3,this._lastStateChangeTime=0,this._lastSuccessfulConnection=0,this._lastPingResponse=0,this._pongMissed=0,this._maxPongMissed=3,this._messageCount=0,this._lastMessageTime=0,this._processingMessages=new Set,this._pingInterval=3e4,this._pingIntervalId=null,this._pingTimeout=1e4,this._pingTimeoutId=null,this._lastPingSent=0,this._pingTimeoutCheckInterval=1e3,this._messageDebounceTime=50,this._messageDebounceQueue=new Map,this._webSocketManager=Re.getInstance(),this._logger=e.getInstance(),this.timers=new _e("WebSocketPlugin"),this._logger.log("WebSocket","🔌 WebSocketPlugin initialized",{category:"websocket",subsystem:"plugin"})}configure(e){this._config=e,this._url=e.url,this._debug=!!e.debug,this._autoReconnect=!1!==e.autoReconnect,e.reconnectInterval&&(this._reconnectInterval=e.reconnectInterval),e.messageDebounce&&(this._messageDebounceTime=e.messageDebounce),this._logger.log("WebSocket",`Configured WebSocket plugin with URL: ${e.url}`,{category:"websocket",subsystem:"plugin"})}_setConnectionState(e){const t=this._connectionState;if(t===e)return;if({[Se.DISCONNECTED]:[Se.CONNECTING],[Se.CONNECTING]:[Se.CONNECTED,Se.FAILED,Se.DISCONNECTED],[Se.CONNECTED]:[Se.DISCONNECTED,Se.CLOSING],[Se.RECONNECTING]:[Se.CONNECTING,Se.DISCONNECTED,Se.FAILED],[Se.FAILED]:[Se.RECONNECTING,Se.DISCONNECTED],[Se.CLOSING]:[Se.DISCONNECTED]}[t].includes(e))switch(this._connectionState=e,this._lastStateChangeTime=Date.now(),this._logger.log("WebSocket",`Connection state changed: ${t} -> ${e}`,{category:"websocket",subsystem:"state"}),e){case Se.CONNECTED:this._lastSuccessfulConnection=Date.now(),this._errorCount=0,this._connectionAttempts=0,this._startPingInterval(),window.dispatchEvent(new CustomEvent("inventree-websocket-connected"));break;case Se.DISCONNECTED:this._clearAllTimers(),this._stopPingInterval();break;case Se.FAILED:this._errorCount++,this._autoReconnect&&this._errorCount<20&&(this._setConnectionState(Se.RECONNECTING),this._scheduleReconnect())}else this._logger.warn("WebSocket",`Invalid state transition from ${t} to ${e}`,{category:"websocket",subsystem:"state"})}_clearAllTimers(){this.timers.clearAll()}connect(){var e;if(!this._url||!(null===(e=this._config)||void 0===e?void 0:e.enabled))return void this._logger.warn("WebSocket","Cannot connect - plugin disabled or URL not provided",{category:"websocket",subsystem:"plugin"});if(this._connectionState===Se.CONNECTING||this._connectionState===Se.CONNECTED)return void this._logger.log("WebSocket",`Already ${this._connectionState}, not initiating new connection`,{category:"websocket",subsystem:"plugin"});const t=Date.now()-this._lastConnectionAttempt;if(t<this._cooldownPeriod)return this._logger.log("WebSocket",`Connection attempt too soon (${t}ms since last attempt), enforcing cooldown`,{category:"websocket",subsystem:"plugin"}),void this.timers.setTimeout((()=>{this.connect()}),this._cooldownPeriod-t,"connection-cooldown");this._lastConnectionAttempt=Date.now(),this._connectionAttempts++;try{this._setConnectionState(Se.CONNECTING),this._logger.log("WebSocket",`Connecting to InvenTree WebSocket at ${this._url} (attempt #${this._connectionAttempts})`,{category:"websocket",subsystem:"plugin"}),this._connection=new WebSocket(this._url),this.timers.setTimeout((()=>{this._connectionState===Se.CONNECTING&&(this._logger.warn("WebSocket","Connection attempt timed out after 10 seconds",{category:"websocket",subsystem:"plugin"}),this._closeConnection(),this._setConnectionState(Se.FAILED))}),1e4,"connection-timeout"),this._connection.onopen=this._onConnectionOpen.bind(this),this._connection.onmessage=this._onConnectionMessage.bind(this),this._connection.onerror=this._onConnectionError.bind(this),this._connection.onclose=this._onConnectionClose.bind(this)}catch(e){this._logger.error("WebSocket",`Error creating WebSocket: ${e}`,{category:"websocket",subsystem:"plugin"}),this._setConnectionState(Se.FAILED)}}_onConnectionOpen(e){this._logger.log("WebSocket",`Successfully connected to InvenTree WebSocket server: ${this._url}`,{category:"websocket"}),this._setConnectionState(Se.CONNECTED),this._startPingInterval()}_onConnectionMessage(e){this._lastMessageTime=Date.now(),this._messageCount++;try{const t=JSON.parse(e.data);if("pong"===t.type||"message"===t.type&&"pong"===t.action)return void(this._lastPingResponse=Date.now());const i=t.id||`msg-${Date.now()}-${this._messageCount}`;if(this._processingMessages.has(i))return;this._processingMessages.add(i),this._debouncedProcessMessage(t,i),this.timers.setTimeout((()=>{this._processingMessages.delete(i)}),500,`message-cleanup-${i}`)}catch(e){this._logger.error("WebSocket",`Error processing message: ${e}`,{category:"websocket",subsystem:"message"})}}_debouncedProcessMessage(e,t){const i=`${e.model||"unknown"}:${e.id||e.parent_id||"unknown"}:${e.action||e.type||"unknown"}`;if(this._messageDebounceQueue.has(i)){const e=this._messageDebounceQueue.get(i);this.timers.clearTimeout(e.timerId)}const r=this.timers.setTimeout((()=>{this._debug&&this._logger.log("WebSocket",`Processing debounced message: ${i}`,{category:"websocket",subsystem:"debounce"}),this._notifyMessageCallbacks(e),this._messageDebounceQueue.delete(i)}),this._messageDebounceTime,`message-debounce-${i}`);this._messageDebounceQueue.set(i,{message:e,timerId:r})}_notifyMessageCallbacks(e){for(const t of this._messageCallbacks)try{t(e)}catch(e){this._logger.error("WebSocket",`Error in message callback: ${e}`,{category:"websocket",subsystem:"callback"})}}_onConnectionError(e){this._logger.error("WebSocket",`WebSocket error event triggered - error count: ${this._errorCount+1}`,{category:"websocket",subsystem:"error"}),this._errorCount++,this._connectionState!==Se.DISCONNECTED&&this._setConnectionState(Se.FAILED)}_onConnectionClose(e){var t;this._logger.log("WebSocket",`Connection closed, code=${e.code}, reason='${e.reason||"Unknown reason"}'`,{category:"websocket",subsystem:"connection"});const i=this._connectionState===Se.CLOSING||this._disconnecting;this._connection=null,this._isConnected=!1,window.dispatchEvent(new CustomEvent("inventree-websocket-disconnected")),!i&&this._autoReconnect&&this._connectionState!==Se.DISCONNECTED&&(null===(t=this._config)||void 0===t?void 0:t.enabled)?(this._setConnectionState(Se.RECONNECTING),this._scheduleReconnect()):this._setConnectionState(Se.DISCONNECTED)}_closeConnection(){try{this._connection&&(this._setConnectionState(Se.CLOSING),this._connection.close())}catch(e){this._logger.error("WebSocket",`Error closing connection: ${e}`,{category:"websocket",subsystem:"connection"})}this._connection=null,this._isConnected=!1}_startPingInterval(){this._stopPingInterval(),this._pingIntervalId=this.timers.setInterval((()=>{this._sendPing()}),this._pingInterval,"websocket-ping-interval"),this._pingTimeoutId=this.timers.setInterval((()=>{this._checkPingTimeout()}),this._pingTimeoutCheckInterval,"websocket-ping-timeout-check")}_stopPingInterval(){this._pingIntervalId&&(this.timers.clearInterval(this._pingIntervalId),this._pingIntervalId=null),this._pingTimeoutId&&(this.timers.clearInterval(this._pingTimeoutId),this._pingTimeoutId=null)}_sendPing(){if(this._connectionState===Se.CONNECTED&&this._connection)try{this._lastPingSent=Date.now();const e={type:"ping",time:this._lastPingSent};this._connection.send(JSON.stringify(e)),this._debug&&this._logger.log("WebSocket","Ping sent",{category:"websocket",subsystem:"ping"})}catch(e){this._logger.error("WebSocket",`Error sending ping: ${e}`,{category:"websocket",subsystem:"ping"})}}_checkPingTimeout(){if(!this._connection||this._connectionState!==Se.CONNECTED)return;const e=Date.now();if(0===this._lastPingSent)return;e-this._lastPingSent>this._pingTimeout&&this._lastPingResponse<this._lastPingSent&&(this._pongMissed++,this._logger.warn("WebSocket",`Ping timeout detected! Pongs missed: ${this._pongMissed}/${this._maxPongMissed}`,{category:"websocket",subsystem:"ping"}),this._pongMissed>=this._maxPongMissed&&(this._logger.error("WebSocket",`Maximum missed pongs (${this._maxPongMissed}) reached, closing zombie connection`,{category:"websocket",subsystem:"ping"}),this._closeConnection(),this._setConnectionState(Se.DISCONNECTED),this._scheduleReconnect(),this._pongMissed=0))}sendPing(){return!(this._connectionState!==Se.CONNECTED||!this._connection)&&(this._sendPing(),!0)}_scheduleReconnect(e=!1){if(this._connectionState!==Se.RECONNECTING)return;let t=Math.min(this._maxReconnectDelay,this._minReconnectDelay*Math.pow(1.5,this._connectionAttempts-1));const i=.2*t;t=t-i+Math.random()*i*2,this._logger.log("WebSocket",`Scheduling reconnect in ${Math.round(t)}ms (attempt #${this._connectionAttempts+1})`,{category:"websocket",subsystem:"reconnect"}),this.timers.setTimeout((()=>{this._connectionState===Se.RECONNECTING&&this.connect()}),t,e?"force-reconnect":"reconnect-delay")}disconnect(){this._disconnecting=!0,this._clearAllTimers(),this._closeConnection(),this.timers.setTimeout((()=>{this._disconnecting=!1,this._setConnectionState(Se.DISCONNECTED)}),100,"disconnect-complete")}onMessage(e){return this._messageCallbacks.push(e),()=>{const t=this._messageCallbacks.indexOf(e);-1!==t&&this._messageCallbacks.splice(t,1)}}_processMessage(e){"PartParameter"===e.model&&this._handleParameterUpdate(e)}_handleParameterUpdate(e){if(!e.parent_id||!e.parameter_name||void 0===e.parameter_value)return void this._logger.warn("WebSocket","Incomplete parameter message",{category:"websocket",subsystem:"messages"});const t=e.parent_id,i=e.parameter_name,r=e.parameter_value,a=`param:${t}:${i}:${r}:${Date.now()}`;if(this._processingMessages.has(a))return;this._processingMessages.add(a),setTimeout((()=>{this._processingMessages.delete(a)}),5e3);Ee.getInstance().updateParameter(t,i,r);Pe.getInstance().forceRender(),this._logger.log("WebSocket",`Parameter updated: ${i}=${r} for part ${t}`,{category:"websocket",subsystem:"messages"}),window.dispatchEvent(new CustomEvent("inventree-parameter-updated",{detail:{part_id:t,parameter_name:i,value:r,source:"websocket-plugin"}})),window.dispatchEvent(new CustomEvent("inventree-parameter-changed",{detail:{parameter:i,value:r,source:"websocket-plugin"}}))}isConnected(){return this._connectionState===Se.CONNECTED}getStats(){return{connectionState:this._connectionState,isConnected:this.isConnected(),messageCount:this._messageCount,errorCount:this._errorCount,lastMessageTime:this._lastMessageTime,connectionAttempts:this._connectionAttempts,lastConnectionAttempt:this._lastConnectionAttempt,lastSuccessfulConnection:this._lastSuccessfulConnection,pingStatus:{lastPingResponse:this._lastPingResponse,missedPings:this._pongMissed}}}reset(){this._logger.log("WebSocket","Resetting WebSocket connection",{category:"websocket",subsystem:"control"}),this.disconnect(),this._errorCount=0,this._connectionAttempts=0,this._pongMissed=0,window.setTimeout((()=>{var e;(null===(e=this._config)||void 0===e?void 0:e.enabled)&&this.connect()}),1e3)}getTimerStats(){return this.timers.getStats()}sendMessage(e){if(this._connectionState!==Se.CONNECTED||!this._connection)return this._logger.warn("WebSocket","Cannot send message - not connected",{category:"websocket",subsystem:"message"}),!1;try{const t="string"==typeof e?e:JSON.stringify(e);return this._connection.send(t),this._debug&&this._logger.log("WebSocket",`Sent message: ${t}`,{category:"websocket",subsystem:"debug"}),!0}catch(e){return this._logger.error("WebSocket",`Error sending message: ${e}`,{category:"websocket",subsystem:"message"}),!1}}registerMessageCallback(e){this._messageCallbacks.includes(e)||this._messageCallbacks.push(e)}unregisterMessageCallback(e){const t=this._messageCallbacks.indexOf(e);-1!==t&&this._messageCallbacks.splice(t,1)}getDiagnostics(){var e;const t=Date.now();return{connected:this._connectionState===Se.CONNECTED,state:this._connectionState,url:this._url,enabled:!!(null===(e=this._config)||void 0===e?void 0:e.enabled),messageCount:this._messageCount,timeSinceLastMessage:t-this._lastMessageTime,connectionAttempts:this._connectionAttempts,timeSinceLastAttempt:t-this._lastConnectionAttempt,errorCount:this._errorCount,timeSinceLastPing:t-this._lastPingResponse,missedPongs:this._pongMissed,reconnectInterval:this._reconnectInterval,autoReconnect:this._autoReconnect,timers:this.timers.getStats(),processingMessages:Array.from(this._processingMessages)}}forceReconnect(){this._connectionState!==Se.CONNECTED&&this._connectionState!==Se.FAILED||(this.disconnect(),this.timers.setTimeout((()=>{this.connect()}),1e3,"force-reconnect"))}}class Me{static getInstance(){return Me.instance||(Me.instance=new Me),Me.instance}constructor(){this._hass=null,this._config=null,this._api=null,this._parameterService=null,this._lastSelectedEntity=null,this.cache=ke.getInstance(),this._renderingService=Pe.getInstance(),this.logger=e.getInstance(),this._webSocketPlugin=Le.getInstance(),this.logger.log("CardController","✅ Controller instance created",{category:"card",subsystem:"initialization"})}setConfig(e){var t;this.logger.log("CardController",`⚙️ Setting config... New config provided: ${!!e}`,{category:"card",subsystem:"configuration"}),this._config=e,this._hass?(this.logger.log("CardController","⚙️ Config set, HASS available, initializing services...",{category:"card",subsystem:"lifecycle"}),this.initializeServices()):this.logger.log("CardController","⚙️ Config set, HASS not yet available, delaying service init",{category:"card",subsystem:"lifecycle"}),e.entity&&e.entity!==this._lastSelectedEntity&&(this._lastSelectedEntity=e.entity,this.logger.log("CardController",`⚙️ Entity changed to: ${e.entity}`,{category:"card",subsystem:"configuration"}),this._hass&&this.loadEntityData(e.entity)),(null===(t=e.direct_api)||void 0===t?void 0:t.enabled)&&this._renderingService.setupRendering(e.direct_api)}setHass(e){var t;if(!e)return;this._hass=e;Ee.getInstance().setHass(e),this._config?(this.logger.log("CardController","⚙️ Config set, HASS available, initializing services...",{category:"card",subsystem:"lifecycle"}),this.initializeServices()):this.logger.log("CardController","⚙️ HASS available but config not yet set, waiting...",{category:"card",subsystem:"lifecycle"}),(null===(t=this._config)||void 0===t?void 0:t.entity)&&this.loadEntityData(this._config.entity)}initializeServices(){var e,t,i,r,a,s;if(this.logger.log("CardController","🔄 Initializing services",{category:"card",subsystem:"lifecycle"}),!this._hass)return void this.logger.warn("CardController","⚠️ Cannot initialize services: HASS not available",{category:"card",subsystem:"lifecycle"});Ee.getInstance().setHass(this._hass);try{this._parameterService||(Ae.hasInstance()?(this._parameterService=Ae.getInstance(),this.logger.log("CardController","🔧 Retrieved existing ParameterService singleton instance",{category:"card",subsystem:"services"})):(this._parameterService=Ae.initialize(this._hass),this.logger.log("CardController","🔧 Created new ParameterService instance",{category:"card",subsystem:"services"}))),this._parameterService&&this._config&&this._parameterService.setConfig(this._config)}catch(e){this.logger.error("CardController",`⚠️ Error initializing ParameterService: ${e}`,{category:"card",subsystem:"errors"})}this._renderingService=Pe.getInstance(),(null===(t=null===(e=this._config)||void 0===e?void 0:e.direct_api)||void 0===t?void 0:t.enabled)&&this._renderingService.setupRendering(this._config.direct_api),(null===(r=null===(i=this._config)||void 0===i?void 0:i.direct_api)||void 0===r?void 0:r.enabled)&&this.initializeApi(),(null===(s=null===(a=this._config)||void 0===a?void 0:a.direct_api)||void 0===s?void 0:s.enabled)&&"hass"!==this._config.direct_api.method&&this.initializeWebSocketPlugin(),this.logger.log("CardController","✅ Service initialization sequence complete",{category:"card",subsystem:"lifecycle"})}initializeApi(){var e,t;if(this.logger.log("CardController","🔌 Setting up Direct API connection",{category:"card",subsystem:"api"}),null===(t=null===(e=this._config)||void 0===e?void 0:e.direct_api)||void 0===t?void 0:t.enabled)if(this._config.direct_api.url&&this._config.direct_api.api_key)try{this._api=new Te(this._config.direct_api.url,this._config.direct_api.api_key),this._api&&this._parameterService&&(this._api.setParameterService(this._parameterService),this._parameterService.setDirectApi(this._api)),this.logger.log("CardController","✅ Direct API initialized",{category:"card",subsystem:"api"})}catch(e){this.logger.error("CardController",`❌ Error initializing Direct API: ${e}`,{category:"card",subsystem:"api"})}else this.logger.error("CardController","❌ Missing Direct API URL or API key in config",{category:"card",subsystem:"api"});else this.logger.warn("CardController","⚠️ Direct API not enabled in config",{category:"card",subsystem:"api"})}loadEntityData(e){if(!e||!this._hass)return;const t=Ee.getInstance();if(t.registerEntityOfInterest(e),t.isInitialDataLoaded(e))this.logger.log("CardController",`Initial data already loaded for ${e}`,{category:"card",subsystem:"data"});else if(this._hass.states[e]){const i=this._hass.states[e];i&&i.attributes&&i.attributes.items?(t.setHassData(e,i.attributes.items),t.markInitialDataLoaded(e),this.logger.log("CardController",`Loaded initial data for ${e} from HASS`,{category:"card",subsystem:"data"})):this.logger.warn("CardController",`Entity ${e} exists but has no items attribute`,{category:"card",subsystem:"data"})}else this.logger.warn("CardController",`Entity ${e} not found in HASS states`,{category:"card",subsystem:"data"})}getParts(){var e;if(!(null===(e=this._config)||void 0===e?void 0:e.entity))return[];return Ee.getInstance().getNewestData(this._config.entity)}getParameterService(){return this._parameterService}getRenderingService(){return this._renderingService}getWebSocketService(){return Ie.getInstance()}initializeWebSocketPlugin(){var e,t,i,r,a;if(!(null===(t=null===(e=this._config)||void 0===e?void 0:e.direct_api)||void 0===t?void 0:t.enabled))return void this.logger.log("CardController","Skipping WebSocketPlugin initialization (not enabled)",{category:"card",subsystem:"websocket"});const{websocket_url:s,api_key:o}=this._config.direct_api;let n=s;if(!n&&this._config.direct_api.url){n=(this._config.direct_api.url.endsWith("/")?this._config.direct_api.url.slice(0,-1):this._config.direct_api.url).replace(/^http/,"ws")+"/api/ws/",this.logger.log("CardController",`Constructed WebSocketPlugin URL: ${n} from API URL: ${this._config.direct_api.url}`,{category:"card",subsystem:"websocket"})}else n&&this.logger.log("CardController",`Using provided WebSocketPlugin URL: ${n}`,{category:"card",subsystem:"websocket"});if(!n)return void this.logger.error("CardController","❌ Cannot initialize WebSocketPlugin: No URL available",{category:"card",subsystem:"errors"});n.startsWith("ws://")||n.startsWith("wss://")||(n=n.replace(/^http:\/\//,"ws://").replace(/^https:\/\//,"wss://"),this.logger.log("CardController",`Fixed WebSocket URL protocol: ${n}`,{category:"card",subsystem:"websocket"})),this.logger.log("CardController",`🔌 Initializing WebSocketPlugin connection to ${n}`,{category:"card",subsystem:"websocket"});const c=Le.getInstance(),l=!!this._config.debug_websocket;let d=50;(null===(a=null===(r=null===(i=this._config.direct_api)||void 0===i?void 0:i.performance)||void 0===r?void 0:r.websocket)||void 0===a?void 0:a.messageDebounce)&&(d=this._config.direct_api.performance.websocket.messageDebounce),c.configure({url:n,enabled:!0,reconnectInterval:5e3,apiKey:o,debug:l,autoReconnect:!0,messageDebounce:d}),c.onMessage((e=>{this.handleWebSocketMessage(e)})),c.connect(),this.logger.log("CardController","✅ WebSocketPlugin configured and connection requested",{category:"card",subsystem:"websocket"})}handleWebSocketMessage(e){var t,i,r,a;if(this.logger.log("CardController",`📩 Received WebSocket message: ${JSON.stringify(e).substring(0,100)}...`,{category:"card",subsystem:"messages"}),("PartParameter"===e.model||"event"===e.type&&(null===(t=e.event)||void 0===t?void 0:t.includes("parameter")))&&this._parameterService){const t=e.parent_id||e.part_id||(null===(i=e.data)||void 0===i?void 0:i.parent_id),s=e.parameter_name||(null===(r=e.data)||void 0===r?void 0:r.parameter_name),o=e.parameter_value||e.value||(null===(a=e.data)||void 0===a?void 0:a.parameter_value);if(t&&s){const e=`ws-update:${t}:${s}:${o}`;if(this.cache.has(e))return void this.logger.log("CardController",`🔄 Skipping duplicate WebSocket update for ${t}:${s}`,{category:"card",subsystem:"messages"});this.cache.set(e,!0,200),this.logger.log("CardController",`📊 Parameter update via WebSocket: Part ${t}, ${s}=${o}`,{category:"card",subsystem:"parameters"});const i=Ee.getInstance();if(i.isDirectPartReference(`part:${t}:${s}`)&&this._parameterService.isApiConnected())return this.logger.log("CardController",`🔥 Fast path - using direct part reference for Part ${t}, ${s}`,{category:"card",subsystem:"optimization"}),i.getParameterValueWithDirectReference(`part:${t}:${s}`).then((e=>{null!==e&&this.logger.log("CardController",`✅ Fast path successful: Got ${s}=${e} for Part ${t}`,{category:"card",subsystem:"optimization"})})).catch((e=>{this.logger.error("CardController",`❌ Error in fast path update: ${e}`,{category:"card",subsystem:"errors"})})),void window.dispatchEvent(new CustomEvent("inventree-parameter-updated",{detail:{part_id:t,parameter_name:s,value:o,source:"websocket-plugin"}}));try{i.updateParameter(t,s,o),window.dispatchEvent(new CustomEvent("inventree-parameter-updated",{detail:{part_id:t,parameter_name:s,value:o,source:"websocket-plugin"}}))}catch(e){this.logger.warn("CardController",`Failed to update state for part ${t}: ${e}`,{category:"card",subsystem:"errors"}),i.storeOrphanedParameter(t,s,o)}}}}getWebSocketDiagnostics(){const e=Ie.getInstance(),t=Le.getInstance();return{hassWebSocketStatus:e.getConnectionStatus(),directApiStatus:e.getApiStatus(),webSocketPluginStats:t.getStats()}}subscribeToEntityChanges(e,t){return this.logger.log("CardController",`Subscribing to entity changes: ${e}`,{category:"websocket",subsystem:"subscription"}),this.getWebSocketService().subscribeToEntity(e,t)}getWebSocketPlugin(){return this._webSocketPlugin}resetApiFailures(){if(this._api)try{this._api.logApiStats(),this._api.apiCallFailures=0,this._api.fallbackCount=0,this._api.fallbackEnabled=!1,this.logger.log("CardController","Reset API failure counter and disabled fallback mode",{category:"api",subsystem:"diagnostics"}),this._api.logApiStats()}catch(e){this.logger.error("CardController",`Failed to reset API failures: ${e}`,{category:"api",subsystem:"diagnostics"})}else this.logger.warn("CardController","Cannot reset API failures: API instance not available",{category:"api",subsystem:"diagnostics"})}}function Fe(e){return`Minified Redux error #${e}; visit https://redux.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `}var Ne=(()=>"function"==typeof Symbol&&Symbol.observable||"@@observable")(),Ue=()=>Math.random().toString(36).substring(7).split("").join("."),Ve={INIT:`@@redux/INIT${Ue()}`,REPLACE:`@@redux/REPLACE${Ue()}`,PROBE_UNKNOWN_ACTION:()=>`@@redux/PROBE_UNKNOWN_ACTION${Ue()}`};function Oe(e){if("object"!=typeof e||null===e)return!1;let t=e;for(;null!==Object.getPrototypeOf(t);)t=Object.getPrototypeOf(t);return Object.getPrototypeOf(e)===t||null===Object.getPrototypeOf(e)}function We(e,t,i){if("function"!=typeof e)throw new Error(Fe(2));if("function"==typeof t&&"function"==typeof i||"function"==typeof i&&"function"==typeof arguments[3])throw new Error(Fe(0));if("function"==typeof t&&void 0===i&&(i=t,t=void 0),void 0!==i){if("function"!=typeof i)throw new Error(Fe(1));return i(We)(e,t)}let r=e,a=t,s=new Map,o=s,n=0,c=!1;function l(){o===s&&(o=new Map,s.forEach(((e,t)=>{o.set(t,e)})))}function d(){if(c)throw new Error(Fe(3));return a}function h(e){if("function"!=typeof e)throw new Error(Fe(4));if(c)throw new Error(Fe(5));let t=!0;l();const i=n++;return o.set(i,e),function(){if(t){if(c)throw new Error(Fe(6));t=!1,l(),o.delete(i),s=null}}}function u(e){if(!Oe(e))throw new Error(Fe(7));if(void 0===e.type)throw new Error(Fe(8));if("string"!=typeof e.type)throw new Error(Fe(17));if(c)throw new Error(Fe(9));try{c=!0,a=r(a,e)}finally{c=!1}return(s=o).forEach((e=>{e()})),e}u({type:Ve.INIT});return{dispatch:u,subscribe:h,getState:d,replaceReducer:function(e){if("function"!=typeof e)throw new Error(Fe(10));r=e,u({type:Ve.REPLACE})},[Ne]:function(){const e=h;return{subscribe(t){if("object"!=typeof t||null===t)throw new Error(Fe(11));function i(){const e=t;e.next&&e.next(d())}i();return{unsubscribe:e(i)}},[Ne](){return this}}}}}function ze(e){const t=Object.keys(e),i={};for(let r=0;r<t.length;r++){const a=t[r];"function"==typeof e[a]&&(i[a]=e[a])}const r=Object.keys(i);let a;try{!function(e){Object.keys(e).forEach((t=>{const i=e[t];if(void 0===i(void 0,{type:Ve.INIT}))throw new Error(Fe(12));if(void 0===i(void 0,{type:Ve.PROBE_UNKNOWN_ACTION()}))throw new Error(Fe(13))}))}(i)}catch(e){a=e}return function(e={},t){if(a)throw a;let s=!1;const o={};for(let a=0;a<r.length;a++){const n=r[a],c=i[n],l=e[n],d=c(l,t);if(void 0===d)throw t&&t.type,new Error(Fe(14));o[n]=d,s=s||d!==l}return s=s||r.length!==Object.keys(e).length,s?o:e}}function je(...e){return 0===e.length?e=>e:1===e.length?e[0]:e.reduce(((e,t)=>(...i)=>e(t(...i))))}var Be=Symbol.for("immer-nothing"),He=Symbol.for("immer-draftable"),qe=Symbol.for("immer-state");function Ge(e,...t){throw new Error(`[Immer] minified error nr: ${e}. Full error at: https://bit.ly/3cXEKWf`)}var Je=Object.getPrototypeOf;function Ke(e){return!!e&&!!e[qe]}function Ye(e){return!!e&&(Xe(e)||Array.isArray(e)||!!e[He]||!!e.constructor?.[He]||rt(e)||at(e))}var Qe=Object.prototype.constructor.toString();function Xe(e){if(!e||"object"!=typeof e)return!1;const t=Je(e);if(null===t)return!0;const i=Object.hasOwnProperty.call(t,"constructor")&&t.constructor;return i===Object||"function"==typeof i&&Function.toString.call(i)===Qe}function Ze(e,t){0===et(e)?Reflect.ownKeys(e).forEach((i=>{t(i,e[i],e)})):e.forEach(((i,r)=>t(r,i,e)))}function et(e){const t=e[qe];return t?t.type_:Array.isArray(e)?1:rt(e)?2:at(e)?3:0}function tt(e,t){return 2===et(e)?e.has(t):Object.prototype.hasOwnProperty.call(e,t)}function it(e,t,i){const r=et(e);2===r?e.set(t,i):3===r?e.add(i):e[t]=i}function rt(e){return e instanceof Map}function at(e){return e instanceof Set}function st(e){return e.copy_||e.base_}function ot(e,t){if(rt(e))return new Map(e);if(at(e))return new Set(e);if(Array.isArray(e))return Array.prototype.slice.call(e);const i=Xe(e);if(!0===t||"class_only"===t&&!i){const t=Object.getOwnPropertyDescriptors(e);delete t[qe];let i=Reflect.ownKeys(t);for(let r=0;r<i.length;r++){const a=i[r],s=t[a];!1===s.writable&&(s.writable=!0,s.configurable=!0),(s.get||s.set)&&(t[a]={configurable:!0,writable:!0,enumerable:s.enumerable,value:e[a]})}return Object.create(Je(e),t)}{const t=Je(e);if(null!==t&&i)return{...e};const r=Object.create(t);return Object.assign(r,e)}}function nt(e,t=!1){return lt(e)||Ke(e)||!Ye(e)||(et(e)>1&&(e.set=e.add=e.clear=e.delete=ct),Object.freeze(e),t&&Object.entries(e).forEach((([e,t])=>nt(t,!0)))),e}function ct(){Ge(2)}function lt(e){return Object.isFrozen(e)}var dt,ht={};function ut(e){const t=ht[e];return t||Ge(0),t}function pt(){return dt}function gt(e,t){t&&(ut("Patches"),e.patches_=[],e.inversePatches_=[],e.patchListener_=t)}function vt(e){mt(e),e.drafts_.forEach(bt),e.drafts_=null}function mt(e){e===dt&&(dt=e.parent_)}function ft(e){return dt={drafts_:[],parent_:dt,immer_:e,canAutoFreeze_:!0,unfinalizedDrafts_:0}}function bt(e){const t=e[qe];0===t.type_||1===t.type_?t.revoke_():t.revoked_=!0}function yt(e,t){t.unfinalizedDrafts_=t.drafts_.length;const i=t.drafts_[0];return void 0!==e&&e!==i?(i[qe].modified_&&(vt(t),Ge(4)),Ye(e)&&(e=_t(t,e),t.parent_||$t(t,e)),t.patches_&&ut("Patches").generateReplacementPatches_(i[qe].base_,e,t.patches_,t.inversePatches_)):e=_t(t,i,[]),vt(t),t.patches_&&t.patchListener_(t.patches_,t.inversePatches_),e!==Be?e:void 0}function _t(e,t,i){if(lt(t))return t;const r=t[qe];if(!r)return Ze(t,((a,s)=>wt(e,r,t,a,s,i))),t;if(r.scope_!==e)return t;if(!r.modified_)return $t(e,r.base_,!0),r.base_;if(!r.finalized_){r.finalized_=!0,r.scope_.unfinalizedDrafts_--;const t=r.copy_;let a=t,s=!1;3===r.type_&&(a=new Set(t),t.clear(),s=!0),Ze(a,((a,o)=>wt(e,r,t,a,o,i,s))),$t(e,t,!1),i&&e.patches_&&ut("Patches").generatePatches_(r,i,e.patches_,e.inversePatches_)}return r.copy_}function wt(e,t,i,r,a,s,o){if(Ke(a)){const o=_t(e,a,s&&t&&3!==t.type_&&!tt(t.assigned_,r)?s.concat(r):void 0);if(it(i,r,o),!Ke(o))return;e.canAutoFreeze_=!1}else o&&i.add(a);if(Ye(a)&&!lt(a)){if(!e.immer_.autoFreeze_&&e.unfinalizedDrafts_<1)return;_t(e,a),t&&t.scope_.parent_||"symbol"==typeof r||!Object.prototype.propertyIsEnumerable.call(i,r)||$t(e,a)}}function $t(e,t,i=!1){!e.parent_&&e.immer_.autoFreeze_&&e.canAutoFreeze_&&nt(t,i)}var kt={get(e,t){if(t===qe)return e;const i=st(e);if(!tt(i,t))return function(e,t,i){const r=Ct(t,i);return r?"value"in r?r.value:r.get?.call(e.draft_):void 0}(e,i,t);const r=i[t];return e.finalized_||!Ye(r)?r:r===St(e.base_,t)?(Et(e),e.copy_[t]=It(r,e)):r},has:(e,t)=>t in st(e),ownKeys:e=>Reflect.ownKeys(st(e)),set(e,t,i){const r=Ct(st(e),t);if(r?.set)return r.set.call(e.draft_,i),!0;if(!e.modified_){const r=St(st(e),t),a=r?.[qe];if(a&&a.base_===i)return e.copy_[t]=i,e.assigned_[t]=!1,!0;if(function(e,t){return e===t?0!==e||1/e==1/t:e!=e&&t!=t}(i,r)&&(void 0!==i||tt(e.base_,t)))return!0;Et(e),Pt(e)}return e.copy_[t]===i&&(void 0!==i||t in e.copy_)||Number.isNaN(i)&&Number.isNaN(e.copy_[t])||(e.copy_[t]=i,e.assigned_[t]=!0),!0},deleteProperty:(e,t)=>(void 0!==St(e.base_,t)||t in e.base_?(e.assigned_[t]=!1,Et(e),Pt(e)):delete e.assigned_[t],e.copy_&&delete e.copy_[t],!0),getOwnPropertyDescriptor(e,t){const i=st(e),r=Reflect.getOwnPropertyDescriptor(i,t);return r?{writable:!0,configurable:1!==e.type_||"length"!==t,enumerable:r.enumerable,value:i[t]}:r},defineProperty(){Ge(11)},getPrototypeOf:e=>Je(e.base_),setPrototypeOf(){Ge(12)}},xt={};function St(e,t){const i=e[qe];return(i?st(i):e)[t]}function Ct(e,t){if(!(t in e))return;let i=Je(e);for(;i;){const e=Object.getOwnPropertyDescriptor(i,t);if(e)return e;i=Je(i)}}function Pt(e){e.modified_||(e.modified_=!0,e.parent_&&Pt(e.parent_))}function Et(e){e.copy_||(e.copy_=ot(e.base_,e.scope_.immer_.useStrictShallowCopy_))}Ze(kt,((e,t)=>{xt[e]=function(){return arguments[0]=arguments[0][0],t.apply(this,arguments)}})),xt.deleteProperty=function(e,t){return xt.set.call(this,e,t,void 0)},xt.set=function(e,t,i){return kt.set.call(this,e[0],t,i,e[0])};function It(e,t){const i=rt(e)?ut("MapSet").proxyMap_(e,t):at(e)?ut("MapSet").proxySet_(e,t):function(e,t){const i=Array.isArray(e),r={type_:i?1:0,scope_:t?t.scope_:pt(),modified_:!1,finalized_:!1,assigned_:{},parent_:t,base_:e,draft_:null,copy_:null,revoke_:null,isManual_:!1};let a=r,s=kt;i&&(a=[r],s=xt);const{revoke:o,proxy:n}=Proxy.revocable(a,s);return r.draft_=n,r.revoke_=o,n}(e,t);return(t?t.scope_:pt()).drafts_.push(i),i}function Tt(e){if(!Ye(e)||lt(e))return e;const t=e[qe];let i;if(t){if(!t.modified_)return t.base_;t.finalized_=!0,i=ot(e,t.scope_.immer_.useStrictShallowCopy_)}else i=ot(e,!0);return Ze(i,((e,t)=>{it(i,e,Tt(t))})),t&&(t.finalized_=!1),i}var Dt=new class{constructor(e){this.autoFreeze_=!0,this.useStrictShallowCopy_=!1,this.produce=(e,t,i)=>{if("function"==typeof e&&"function"!=typeof t){const i=t;t=e;const r=this;return function(e=i,...a){return r.produce(e,(e=>t.call(this,e,...a)))}}let r;if("function"!=typeof t&&Ge(6),void 0!==i&&"function"!=typeof i&&Ge(7),Ye(e)){const a=ft(this),s=It(e,void 0);let o=!0;try{r=t(s),o=!1}finally{o?vt(a):mt(a)}return gt(a,i),yt(r,a)}if(!e||"object"!=typeof e){if(r=t(e),void 0===r&&(r=e),r===Be&&(r=void 0),this.autoFreeze_&&nt(r,!0),i){const t=[],a=[];ut("Patches").generateReplacementPatches_(e,r,t,a),i(t,a)}return r}Ge(1)},this.produceWithPatches=(e,t)=>{if("function"==typeof e)return(t,...i)=>this.produceWithPatches(t,(t=>e(t,...i)));let i,r;const a=this.produce(e,t,((e,t)=>{i=e,r=t}));return[a,i,r]},"boolean"==typeof e?.autoFreeze&&this.setAutoFreeze(e.autoFreeze),"boolean"==typeof e?.useStrictShallowCopy&&this.setUseStrictShallowCopy(e.useStrictShallowCopy)}createDraft(e){Ye(e)||Ge(8),Ke(e)&&(e=function(e){Ke(e)||Ge(10);return Tt(e)}(e));const t=ft(this),i=It(e,void 0);return i[qe].isManual_=!0,mt(t),i}finishDraft(e,t){const i=e&&e[qe];i&&i.isManual_||Ge(9);const{scope_:r}=i;return gt(r,t),yt(void 0,r)}setAutoFreeze(e){this.autoFreeze_=e}setUseStrictShallowCopy(e){this.useStrictShallowCopy_=e}applyPatches(e,t){let i;for(i=t.length-1;i>=0;i--){const r=t[i];if(0===r.path.length&&"replace"===r.op){e=r.value;break}}i>-1&&(t=t.slice(i+1));const r=ut("Patches").applyPatches_;return Ke(e)?r(e,t):this.produce(e,(e=>r(e,t)))}},At=Dt.produce;function Rt(e){return({dispatch:t,getState:i})=>r=>a=>"function"==typeof a?a(t,i,e):r(a)}Dt.produceWithPatches.bind(Dt),Dt.setAutoFreeze.bind(Dt),Dt.setUseStrictShallowCopy.bind(Dt),Dt.applyPatches.bind(Dt),Dt.createDraft.bind(Dt),Dt.finishDraft.bind(Dt);var Lt=Rt(),Mt=Rt,Ft="undefined"!=typeof window&&window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__:function(){if(0!==arguments.length)return"object"==typeof arguments[0]?je:je.apply(null,arguments)};function Nt(e,t){function i(...i){if(t){let r=t(...i);if(!r)throw new Error(ai(0));return{type:e,payload:r.payload,..."meta"in r&&{meta:r.meta},..."error"in r&&{error:r.error}}}return{type:e,payload:i[0]}}return i.toString=()=>`${e}`,i.type=e,i.match=t=>function(e){return Oe(e)&&"type"in e&&"string"==typeof e.type}(t)&&t.type===e,i}var Ut=class e extends Array{constructor(...t){super(...t),Object.setPrototypeOf(this,e.prototype)}static get[Symbol.species](){return e}concat(...e){return super.concat.apply(this,e)}prepend(...t){return 1===t.length&&Array.isArray(t[0])?new e(...t[0].concat(this)):new e(...t.concat(this))}};function Vt(e){return Ye(e)?At(e,(()=>{})):e}function Ot(e,t,i){return e.has(t)?e.get(t):e.set(t,i(t)).get(t)}var Wt=e=>t=>{setTimeout(t,e)},zt=e=>function(t){const{autoBatch:i=!0}=t??{};let r=new Ut(e);return i&&r.push(((e={type:"raf"})=>t=>(...i)=>{const r=t(...i);let a=!0,s=!1,o=!1;const n=new Set,c="tick"===e.type?queueMicrotask:"raf"===e.type?"undefined"!=typeof window&&window.requestAnimationFrame?window.requestAnimationFrame:Wt(10):"callback"===e.type?e.queueNotification:Wt(e.timeout),l=()=>{o=!1,s&&(s=!1,n.forEach((e=>e())))};return Object.assign({},r,{subscribe(e){const t=r.subscribe((()=>a&&e()));return n.add(e),()=>{t(),n.delete(e)}},dispatch(e){try{return a=!e?.meta?.RTK_autoBatch,s=!a,s&&(o||(o=!0,c(l))),r.dispatch(e)}finally{a=!0}}})})("object"==typeof i?i:void 0)),r};function jt(e){const t={},i=[];let r;const a={addCase(e,i){const r="string"==typeof e?e:e.type;if(!r)throw new Error(ai(28));if(r in t)throw new Error(ai(29));return t[r]=i,a},addMatcher:(e,t)=>(i.push({matcher:e,reducer:t}),a),addDefaultCase:e=>(r=e,a)};return e(a),[t,i,r]}function Bt(...e){return t=>e.some((e=>((e,t)=>(e=>e&&"function"==typeof e.match)(e)?e.match(t):e(t))(e,t)))}var Ht=["name","message","stack","code"],qt=class{constructor(e,t){this.payload=e,this.meta=t}_type},Gt=class{constructor(e,t){this.payload=e,this.meta=t}_type},Jt=e=>{if("object"==typeof e&&null!==e){const t={};for(const i of Ht)"string"==typeof e[i]&&(t[i]=e[i]);return t}return{message:String(e)}},Kt="External signal was aborted",Yt=(()=>{function e(e,t,i){const r=Nt(e+"/fulfilled",((e,t,i,r)=>({payload:e,meta:{...r||{},arg:i,requestId:t,requestStatus:"fulfilled"}}))),a=Nt(e+"/pending",((e,t,i)=>({payload:void 0,meta:{...i||{},arg:t,requestId:e,requestStatus:"pending"}}))),s=Nt(e+"/rejected",((e,t,r,a,s)=>({payload:a,error:(i&&i.serializeError||Jt)(e||"Rejected"),meta:{...s||{},arg:r,requestId:t,rejectedWithValue:!!a,requestStatus:"rejected",aborted:"AbortError"===e?.name,condition:"ConditionError"===e?.name}})));return Object.assign((function(e,{signal:o}={}){return(n,c,l)=>{const d=i?.idGenerator?i.idGenerator(e):((e=21)=>{let t="",i=e;for(;i--;)t+="ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW"[64*Math.random()|0];return t})(),h=new AbortController;let u,p;function g(e){p=e,h.abort()}o&&(o.aborted?g(Kt):o.addEventListener("abort",(()=>g(Kt)),{once:!0}));const v=async function(){let o;try{let s=i?.condition?.(e,{getState:c,extra:l});if(null!==(v=s)&&"object"==typeof v&&"function"==typeof v.then&&(s=await s),!1===s||h.signal.aborted)throw{name:"ConditionError",message:"Aborted due to condition callback returning false."};const m=new Promise(((e,t)=>{u=()=>{t({name:"AbortError",message:p||"Aborted"})},h.signal.addEventListener("abort",u)}));n(a(d,e,i?.getPendingMeta?.({requestId:d,arg:e},{getState:c,extra:l}))),o=await Promise.race([m,Promise.resolve(t(e,{dispatch:n,getState:c,extra:l,requestId:d,signal:h.signal,abort:g,rejectWithValue:(e,t)=>new qt(e,t),fulfillWithValue:(e,t)=>new Gt(e,t)})).then((t=>{if(t instanceof qt)throw t;return t instanceof Gt?r(t.payload,d,e,t.meta):r(t,d,e)}))])}catch(t){o=t instanceof qt?s(null,d,e,t.payload,t.meta):s(t,d,e)}finally{u&&h.signal.removeEventListener("abort",u)}var v;return i&&!i.dispatchConditionRejection&&s.match(o)&&o.meta.condition||n(o),o}();return Object.assign(v,{abort:g,requestId:d,arg:e,unwrap:()=>v.then(Qt)})}}),{pending:a,rejected:s,fulfilled:r,settled:Bt(s,r),typePrefix:e})}return e.withTypes=()=>e,e})();function Qt(e){if(e.meta&&e.meta.rejectedWithValue)throw e.payload;if(e.error)throw e.error;return e.payload}var Xt=Symbol.for("rtk-slice-createasyncthunk");function Zt(e,t){return`${e}/${t}`}function ei({creators:e}={}){const t=e?.asyncThunk?.[Xt];return function(e){const{name:i,reducerPath:r=i}=e;if(!i)throw new Error(ai(11));const a=("function"==typeof e.reducers?e.reducers(function(){function e(e,t){return{_reducerDefinitionType:"asyncThunk",payloadCreator:e,...t}}return e.withTypes=()=>e,{reducer:e=>Object.assign({[e.name]:(...t)=>e(...t)}[e.name],{_reducerDefinitionType:"reducer"}),preparedReducer:(e,t)=>({_reducerDefinitionType:"reducerWithPrepare",prepare:e,reducer:t}),asyncThunk:e}}()):e.reducers)||{},s=Object.keys(a),o={sliceCaseReducersByName:{},sliceCaseReducersByType:{},actionCreators:{},sliceMatchers:[]},n={addCase(e,t){const i="string"==typeof e?e:e.type;if(!i)throw new Error(ai(12));if(i in o.sliceCaseReducersByType)throw new Error(ai(13));return o.sliceCaseReducersByType[i]=t,n},addMatcher:(e,t)=>(o.sliceMatchers.push({matcher:e,reducer:t}),n),exposeAction:(e,t)=>(o.actionCreators[e]=t,n),exposeCaseReducer:(e,t)=>(o.sliceCaseReducersByName[e]=t,n)};function c(){const[t={},i=[],r]="function"==typeof e.extraReducers?jt(e.extraReducers):[e.extraReducers],a={...t,...o.sliceCaseReducersByType};return function(e,t){let i,[r,a,s]=jt(t);if(function(e){return"function"==typeof e}(e))i=()=>Vt(e());else{const t=Vt(e);i=()=>t}function o(e=i(),t){let o=[r[t.type],...a.filter((({matcher:e})=>e(t))).map((({reducer:e})=>e))];return 0===o.filter((e=>!!e)).length&&(o=[s]),o.reduce(((e,i)=>{if(i){if(Ke(e)){const r=i(e,t);return void 0===r?e:r}if(Ye(e))return At(e,(e=>i(e,t)));{const r=i(e,t);if(void 0===r){if(null===e)return e;throw Error("A case reducer on a non-draftable value must not return undefined")}return r}}return e}),e)}return o.getInitialState=i,o}(e.initialState,(e=>{for(let t in a)e.addCase(t,a[t]);for(let t of o.sliceMatchers)e.addMatcher(t.matcher,t.reducer);for(let t of i)e.addMatcher(t.matcher,t.reducer);r&&e.addDefaultCase(r)}))}s.forEach((r=>{const s=a[r],o={reducerName:r,type:Zt(i,r),createNotation:"function"==typeof e.reducers};!function(e){return"asyncThunk"===e._reducerDefinitionType}(s)?function({type:e,reducerName:t,createNotation:i},r,a){let s,o;if("reducer"in r){if(i&&!function(e){return"reducerWithPrepare"===e._reducerDefinitionType}(r))throw new Error(ai(17));s=r.reducer,o=r.prepare}else s=r;a.addCase(e,s).exposeCaseReducer(t,s).exposeAction(t,o?Nt(e,o):Nt(e))}(o,s,n):function({type:e,reducerName:t},i,r,a){if(!a)throw new Error(ai(18));const{payloadCreator:s,fulfilled:o,pending:n,rejected:c,settled:l,options:d}=i,h=a(e,s,d);r.exposeAction(t,h),o&&r.addCase(h.fulfilled,o);n&&r.addCase(h.pending,n);c&&r.addCase(h.rejected,c);l&&r.addMatcher(h.settled,l);r.exposeCaseReducer(t,{fulfilled:o||ri,pending:n||ri,rejected:c||ri,settled:l||ri})}(o,s,n,t)}));const l=e=>e,d=new Map,h=new WeakMap;let u;function p(e,t){return u||(u=c()),u(e,t)}function g(){return u||(u=c()),u.getInitialState()}function v(t,i=!1){function r(e){let a=e[t];return void 0===a&&i&&(a=Ot(h,r,g)),a}function a(t=l){const r=Ot(d,i,(()=>new WeakMap));return Ot(r,t,(()=>{const r={};for(const[a,s]of Object.entries(e.selectors??{}))r[a]=ti(s,t,(()=>Ot(h,t,g)),i);return r}))}return{reducerPath:t,getSelectors:a,get selectors(){return a(r)},selectSlice:r}}const m={name:i,reducer:p,actions:o.actionCreators,caseReducers:o.sliceCaseReducersByName,getInitialState:g,...v(r),injectInto(e,{reducerPath:t,...i}={}){const a=t??r;return e.inject({reducerPath:a,reducer:p},i),{...m,...v(a,!0)}}};return m}}function ti(e,t,i,r){function a(a,...s){let o=t(a);return void 0===o&&r&&(o=i()),e(o,...s)}return a.unwrapped=e,a}var ii=ei();function ri(){}function ai(e){return`Minified Redux Toolkit error #${e}; visit https://redux-toolkit.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `}const si=Yt("parts/fetchParts",(async(e,{rejectWithValue:t})=>{try{const t=await fetch(`/api/parts/${e}`);return{entityId:e,data:await t.json()}}catch(e){return t(e.message)}})),oi=ii({name:"parts",initialState:{items:{},loading:!1,error:null},reducers:{updatePart(e,t){const{entityId:i,part:r}=t.payload;e.items[i]||(e.items[i]=[]);const a=e.items[i].findIndex((e=>e.pk===r.pk));a>=0?e.items[i][a]=r:e.items[i].push(r)},clearParts(e,t){delete e.items[t.payload]}},extraReducers:e=>{e.addCase(si.pending,(e=>{e.loading=!0,e.error=null})).addCase(si.fulfilled,((e,t)=>{e.loading=!1;const{entityId:i,data:r}=t.payload;e.items[i]=r})).addCase(si.rejected,((e,t)=>{e.loading=!1,e.error=t.payload||"An error occurred"}))}});oi.actions;var ni=oi.reducer;const ci=ii({name:"parameters",initialState:{conditions:{},actions:{},loading:!1,error:null},reducers:{setConditions(e,t){const{entityId:i,conditions:r}=t.payload;e.conditions[i]=r},setActions(e,t){const{entityId:i,actions:r}=t.payload;e.actions[i]=r},setParameterLoading(e,t){e.loading=t.payload},setParameterError(e,t){e.error=t.payload}}});ci.actions;var li=ci.reducer;const di=ii({name:"ui",initialState:{activeView:"detail",selectedPartId:null,debug:{showDebugPanel:!1,activeTab:"data"},loading:!1},reducers:{setActiveView(e,t){e.activeView=t.payload},setSelectedPart(e,t){e.selectedPartId=t.payload},toggleDebugPanel(e){e.debug.showDebugPanel=!e.debug.showDebugPanel},setDebugTab(e,t){e.debug.activeTab=t.payload},setLoading(e,t){e.loading=t.payload}}});di.actions;var hi=di.reducer;const ui=ii({name:"counter",initialState:{value:0},reducers:{increment:e=>{e.value+=1},decrement:e=>{e.value-=1},incrementByAmount:(e,t)=>{e.value+=t.payload}}});ui.actions;var pi=ui.reducer;const gi=t=>t=>i=>{const r=e.getInstance();if(r.log("Redux",`Action dispatched: ${i.type}`,{category:"redux",subsystem:"middleware"}),"parts/fetchParts/fulfilled"===i.type){const{entityId:e,data:t}=i.payload,a=Ee.getInstance();if(t&&t.length>0&&t[0].source){switch(t[0].source){case"websocket":a.setWebSocketData(e,t);break;case"api":a.setApiData(e,t);break;case"hass":a.setHassData(e,t);break;default:a.setWebSocketData(e,t),a.setApiData(e,t),a.setHassData(e,t)}const i=`entity-data:${e}`;ke.getInstance().set(i,t),r.log("Redux",`Updated service data for entity ${e}`,{category:"redux",subsystem:"sync"})}}if("parameters/setConditions"===i.type){const{entityId:e,conditions:t}=i.payload;r.log("Redux",`Updated conditions for entity ${e}`,{category:"redux",subsystem:"parameters"})}return t(i)},vi=function(e){const t=function(e){const{thunk:t=!0,immutableCheck:i=!0,serializableCheck:r=!0,actionCreatorCheck:a=!0}=e??{};let s=new Ut;return t&&(function(e){return"boolean"==typeof e}(t)?s.push(Lt):s.push(Mt(t.extraArgument))),s},{reducer:i,middleware:r,devTools:a=!0,duplicateMiddlewareCheck:s=!0,preloadedState:o,enhancers:n}=e||{};let c,l;if("function"==typeof i)c=i;else{if(!Oe(i))throw new Error(ai(1));c=ze(i)}l="function"==typeof r?r(t):t();let d=je;a&&(d=Ft({trace:!1,..."object"==typeof a&&a}));const h=function(...e){return t=>(i,r)=>{const a=t(i,r);let s=()=>{throw new Error(Fe(15))};const o={getState:a.getState,dispatch:(e,...t)=>s(e,...t)},n=e.map((e=>e(o)));return s=je(...n)(a.dispatch),{...a,dispatch:s}}}(...l),u=zt(h);return We(c,o,d(..."function"==typeof n?n(u):u()))}({reducer:{parts:ni,parameters:li,ui:hi,counter:pi},middleware:e=>e().concat(gi)});class mi extends ue{constructor(){super(...arguments),this._stateSelectors=new Map,this._unsubscribe=null}connectedCallback(){super.connectedCallback(),vi?this._unsubscribe=vi.subscribe((()=>{const e=vi.getState();let t=!1;this._stateSelectors.forEach(((i,r)=>{const a=i(e);a!==this[r]&&(this[r]=a,t=!0)})),t&&this.requestUpdate()})):console.warn("Redux store not available, component will operate in non-Redux mode")}disconnectedCallback(){super.disconnectedCallback(),this._unsubscribe&&(this._unsubscribe(),this._unsubscribe=null)}connectToRedux(e,t){this._stateSelectors.set(e,t),vi&&(this[e]=t(vi.getState()))}dispatch(e){vi.dispatch(e)}}const fi=g`
    .grid-container {
        display: grid;
        width: 100%;
        box-sizing: border-box;
    }

    .grid-item {
        display: flex;
        flex-direction: column;
        background-color: var(--card-background-color, #fff);
        border-radius: 4px;
        overflow: hidden;
        box-shadow: var(--ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12));
        position: relative;
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .grid-item:hover {
        transform: translateY(-2px);
        box-shadow: var(--ha-card-box-shadow, 0px 3px 3px -2px rgba(0, 0, 0, 0.2), 0px 3px 4px 0px rgba(0, 0, 0, 0.14), 0px 1px 8px 0px rgba(0, 0, 0, 0.12));
    }

    .grid-item-content {
        display: flex;
        flex: 1;
        padding: 12px;
        overflow: hidden;
    }

    .grid-item-image {
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        margin-right: 12px;
    }

    .grid-item-image img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }

    .grid-item-details {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
    }

    .grid-item-name {
        font-size: 1.1rem;
        font-weight: 500;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .grid-item-stock {
        font-size: 0.9rem;
        margin-bottom: 4px;
    }

    .grid-item-description {
        font-size: 0.85rem;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .grid-item-category {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
    }

    .grid-item-parameters {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 4px;
        font-size: 0.85rem;
    }

    .grid-item-parameter {
        display: flex;
        justify-content: space-between;
    }

    .param-name {
        font-weight: 500;
        margin-right: 8px;
    }

    .param-value {
        font-family: monospace;
    }

    .grid-item-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        background-color: var(--secondary-background-color, #f5f5f5);
    }

    .parameter-actions {
        display: flex;
        gap: 4px;
    }

    .parameter-action-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px 8px;
        border: none;
        border-radius: 4px;
        background-color: var(--primary-color);
        color: var(--text-primary-color);
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.3s;
    }

    .parameter-action-button:hover {
        background-color: var(--primary-color-light);
    }

    .parameter-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        padding: 2px 6px;
        border-radius: 12px;
        background-color: var(--primary-color);
        color: var(--text-primary-color);
        font-size: 0.8rem;
        font-weight: 500;
        z-index: 1;
    }

    .parameter-icon {
        position: absolute;
        top: 8px;
        left: 8px;
        color: var(--primary-color);
        --mdc-icon-size: 24px;
        z-index: 1;
    }

    .no-parts {
        padding: 16px;
        text-align: center;
        color: var(--primary-text-color);
        font-style: italic;
    }

    @media (max-width: 600px) {
        .grid-container {
            grid-template-columns: repeat(2, 1fr) !important;
        }
    }

    @media (max-width: 400px) {
        .grid-container {
            grid-template-columns: 1fr !important;
        }
    }
`;let bi=class extends ue{constructor(){super(),this.parts=[],this._visualModifiers=new Map,this._actionButtons=new Map,this._filteredParts=[],this.logger=e.getInstance(),this._lastFilterTime=0,this._isFiltering=!1,this._shouldShowPartCache=new Map,this.SHOW_CACHE_TTL=1e4,this._lastFilteredPartsHash="",this._webSocketErrorCount=0,this._idleRenderTimerId=null,this._lastConditionsHash="",this._zombieStateCounter=0,this._recoveryCheckTimerId=null,this.timers=new _e("GridLayout",!0)}connectedCallback(){super.connectedCallback(),this._setupListeners(),this._recoveryCheckTimerId=this.timers.setInterval((()=>{this._checkAndRecoverState()}),1e4,"recovery-check-timer"),console.log("🔄 Grid Layout: Connected, initializing")}_setupListeners(){var e,t;this._cleanupListeners();switch((null===(t=null===(e=this.config)||void 0===e?void 0:e.direct_api)||void 0===t?void 0:t.method)||"polling"){case"websocket":this._setupWebSocketConnection();break;case"hass":this._setupEntityListener();break;default:this._setupParameterListener()}}_setupParameterListener(){this._paramChangeListener=e=>{this._handleParameterChange(e)},window.addEventListener("inventree-parameter-changed",this._paramChangeListener),console.log("📝 Grid Layout: Set up parameter change listener for polling method")}_setupEntityListener(){const e=e=>{var t;e.detail&&e.detail.entityId===(null===(t=this.config)||void 0===t?void 0:t.entity)&&(console.log("📝 Grid Layout: Received entity update event",e.detail),this.forceImmediateFilter())};window.addEventListener("inventree-entity-updated",e),this._entityUpdateListener=e,console.log("📝 Grid Layout: Set up entity update listener for HASS method")}_setupWebSocketConnection(){const{api:e}=this.config;if(!e)return console.warn("Cannot setup WebSocket: No API configuration available"),!1;try{this._cleanupListeners();const t=`${"https:"===window.location.protocol?"wss:":"ws:"}//${e.host}${e.port?`:${e.port}`:""}/ws/inventree/`;return this._webSocketConnection=new WebSocket(t),this._webSocketConnection.onopen=this._handleWebSocketOpen.bind(this),this._webSocketConnection.onmessage=this._handleWebSocketMessage.bind(this),this._webSocketConnection.onerror=e=>{console.error("WebSocket error:",e)},this._webSocketConnection.onclose=e=>{console.log("WebSocket connection closed",e),setTimeout((()=>{this.isConnected&&this._setupWebSocketConnection()}),5e3)},!0}catch(e){return console.error("Error setting up WebSocket connection:",e),!1}}_setupIdleRenderTimer(){var e,t;const i=(null===(t=null===(e=this.config)||void 0===e?void 0:e.direct_api)||void 0===t?void 0:t.idle_render_time)||60,r=Math.max(1e3*i,1e4);console.log(`📝 Grid Layout: Setting up idle render timer with interval ${i} seconds`),null!==this._idleRenderTimerId&&this.timers.clearInterval(this._idleRenderTimerId),this._idleRenderTimerId=this.timers.setInterval((()=>{console.log("📝 Grid Layout: Performing idle refresh"),this.forceImmediateFilter()}),r,"idle-render-timer")}_handleWebSocketOpen(e){var t,i;console.log("📝 Grid Layout: WebSocket connection established"),this._webSocketErrorCount=0,(null===(i=null===(t=this.config)||void 0===t?void 0:t.direct_api)||void 0===i?void 0:i.api_key)&&this._sendWebSocketAuthentication(),this._sendWebSocketSubscription()}_sendWebSocketAuthentication(){var e,t;if(!this._webSocketConnection||this._webSocketConnection.readyState!==WebSocket.OPEN)return;const i={type:"authenticate",token:null===(t=null===(e=this.config)||void 0===e?void 0:e.direct_api)||void 0===t?void 0:t.api_key};this._webSocketConnection.send(JSON.stringify(i)),console.log("📝 Grid Layout: Sent WebSocket authentication")}_sendWebSocketSubscription(){if(!this._webSocketConnection||this._webSocketConnection.readyState!==WebSocket.OPEN)return;this._webSocketConnection.send(JSON.stringify({type:"subscribe",events:["part_partparameter.saved"]})),console.log("📝 Grid Layout: Subscribed to parameter events")}_handleWebSocketMessage(e){var t,i,r;try{const a=JSON.parse(e.data);if("ping"!==a.type&&"pong"!==a.type&&"echo"!==a.type&&console.log(`📝 Grid Layout: Received WebSocket message type: ${a.type}`),"event"===a.type&&"part_partparameter.saved"===a.event){console.log("📝 Grid Layout: Received parameter update via WebSocket",a.data),this._parameterService&&this._parameterService.markAsWebSocketCall();const{parameter_name:e,parameter_value:r,parent_id:s}=a.data;!!(null===(t=this.config)||void 0===t?void 0:t.entity)&&(null===(i=this._parameterService)||void 0===i?void 0:i.findEntityForPart(s))===this.config.entity&&console.log(`📝 Grid Layout: Update is for part ${s} in our entity, refreshing`),this.forceImmediateFilter(),this._notifyParameterChanged(s,e,r),this._parameterService&&this._parameterService.clearWebSocketCallMark()}else"ping"===a.type&&"server"===a.source?(null===(r=this._webSocketConnection)||void 0===r?void 0:r.readyState)===WebSocket.OPEN&&this._webSocketConnection.send(JSON.stringify({type:"pong",source:"client",time:Date.now()/1e3})):"welcome"===a.type&&console.log("📝 Grid Layout: Connected to InvenTree WebSocket Server:",a)}catch(t){console.error("📝 Grid Layout: Error handling WebSocket message",t,e.data)}}_notifyParameterChanged(e,t,i){var r;const a=new CustomEvent("inventree-parameter-changed",{detail:{entityId:null===(r=this.config)||void 0===r?void 0:r.entity,partId:e,parameter:t,value:i,source:"websocket"},bubbles:!0,composed:!0});window.dispatchEvent(a)}_cleanupListeners(){if(this._paramChangeListener&&(window.removeEventListener("inventree-parameter-changed",this._paramChangeListener),this._paramChangeListener=void 0),this._entityUpdateListener&&(window.removeEventListener("inventree-entity-updated",this._entityUpdateListener),this._entityUpdateListener=void 0),this._webSocketConnection){try{this._webSocketConnection.close()}catch(e){console.error("Error closing WebSocket connection",e)}this._webSocketConnection=void 0}null!==this._idleRenderTimerId&&(this.timers.clearInterval(this._idleRenderTimerId),this._idleRenderTimerId=null)}disconnectedCallback(){super.disconnectedCallback(),this._cleanupListeners(),this.timers.clearAll(),console.log("📝 Grid Layout: Disconnected, cleaned up listeners and timers")}_haveConditionsChanged(){var e,t;if(!(null===(t=null===(e=this.config)||void 0===e?void 0:e.parameters)||void 0===t?void 0:t.conditions))return!1;const i=JSON.stringify(this.config.parameters.conditions);return this._lastConditionsHash!==i&&(this._lastConditionsHash=i,!0)}_handleParameterChange(e){var t,i,r;const a=e;if(!a.detail)return;const s="websocket"===(null===(i=null===(t=this.config)||void 0===t?void 0:t.direct_api)||void 0===i?void 0:i.method);a.detail.entityId!==(null===(r=this.config)||void 0===r?void 0:r.entity)&&"direct-api"!==a.detail.source||s&&"websocket"!==a.detail.source||(console.log(`🔔 Grid Layout: Parameter ${a.detail.parameter} changed, forcing filter`),this.forceImmediateFilter())}forceImmediateFilter(){console.log("🔄 Grid Layout: Force immediate filter requested"),this._lastFilteredPartsHash="",this._filterParts(!0)}_filterParts(e=!1){var t;if(!this._isFiltering||e){this._isFiltering=!0,this._lastFilterTime=Date.now();try{this.logger.log("Grid Layout",`Delegating filtering to BaseLayout (${(null===(t=this.parts)||void 0===t?void 0:t.length)||0} parts)`,{category:"layouts",subsystem:"filtering"}),this.requestUpdate()}catch(e){this.logger.error("Grid Layout","Error during filtering delegation:",e,{category:"layouts",subsystem:"errors"})}finally{setTimeout((()=>{this._isFiltering=!1}),200)}}}_updateVisualModifiers(){var e,t,i,r;if(!this._parameterService||!this.parts||!(null===(t=null===(e=this.config)||void 0===e?void 0:e.parameters)||void 0===t?void 0:t.enabled))return this._visualModifiers=new Map,void(this._actionButtons=new Map);const a="websocket"===(null===(r=null===(i=this.config)||void 0===i?void 0:i.direct_api)||void 0===r?void 0:r.method);this.parts.forEach((e=>{a&&this._parameterService.markAsWebSocketCall(),this._visualModifiers.set(e.pk,this._parameterService.processConditions(e,this.config.parameters.conditions));const t=Ee.getInstance();this._actionButtons.set(e.pk,t.getActionButtons(e,this.config.parameters.actions||[])),a&&this._parameterService.clearWebSocketCallMark()}))}updated(e){var t,i;if(super.updated(e),e.has("parts")&&this.logger.log("Grid Layout",`PARTS CHANGED: Grid Layout now has ${(null===(t=this.parts)||void 0===t?void 0:t.length)||0} parts`,null===(i=this.parts)||void 0===i?void 0:i.slice(0,3).map((e=>`${e.pk}: ${e.name}`)),{category:"layouts",subsystem:"updates"}),e.has("hass")||e.has("config")||e.has("parts")){const t=Array.from(e.keys()).join(", ");this.logger.log("Grid Layout",`Updated: changed props=${t}`,{category:"layouts",subsystem:"updates"})}(e.has("parts")||e.has("config"))&&this._updateVisualModifiers()}_getContainerStyle(e){const t=this._visualModifiers.get(e)||{},i=[];return t.highlight&&i.push(`background-color: ${t.highlight}`),t.border&&i.push(`border: 2px solid ${t.border}`),"high"===t.priority?(i.push("transform: scale(1.05)"),i.push("z-index: 10")):"low"===t.priority&&i.push("opacity: 0.8"),i.join(";")}_getTextStyle(e){const t=this._visualModifiers.get(e)||{};return t.textColor?`color: ${t.textColor}`:""}_handleImageError(e){const t=e.target;t.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",t.alt="No image"}getButtonConfig(){var e,t,i,r,a;let s=[];switch(null!==(i=null===(t=null===(e=this.config)||void 0===e?void 0:e.buttons)||void 0===t?void 0:t.preset)&&void 0!==i?i:"default"){case"bulk":s=[{type:"increment",value:10,label:"+10"},{type:"decrement",value:10,label:"-10"}];break;case"precise":s=[{type:"increment",value:.1,label:"+0.1"},{type:"decrement",value:.1,label:"-0.1"}];break;case"full":s=[{type:"increment",value:1,style:"icon",icon:"mdi:plus"},{type:"decrement",value:1,style:"icon",icon:"mdi:minus"},{type:"locate",style:"icon",icon:"mdi:map-marker"},{type:"print",style:"icon",icon:"mdi:printer"}];break;case"custom":s=(null===(a=null===(r=this.config)||void 0===r?void 0:r.buttons)||void 0===a?void 0:a.custom_buttons)||[];break;default:s=[{type:"increment",value:1,label:"+1"},{type:"decrement",value:1,label:"-1"}]}return s}_checkAndRecoverState(){var e,t,i,r,a,s;if("websocket"===(null===(t=null===(e=this.config)||void 0===e?void 0:e.direct_api)||void 0===t?void 0:t.method)&&(!this.parts||0===this.parts.length)){console.log("🔄 Grid Layout: Recovery check running - no parts detected");const e=this.closest("inventree-card");if(e){const t=null===(i=e.getParts)||void 0===i?void 0:i.call(e);t&&t.length>0&&(console.log(`🚨 Grid Layout: RECOVERY - Found ${t.length} parts in parent, using those`),this.parts=[...t],this._filterParts(!0),this.requestUpdate())}if((null===(r=this.config)||void 0===r?void 0:r.entity)&&this.hass&&(!this.parts||0===this.parts.length)){const e=this.hass.states[this.config.entity];(null===(s=null===(a=null==e?void 0:e.attributes)||void 0===a?void 0:a.items)||void 0===s?void 0:s.length)>0&&(console.log(`🚨 Grid Layout: RECOVERY - Found ${e.attributes.items.length} parts in entity, using those`),this.parts=[...e.attributes.items],this._filterParts(!0),this.requestUpdate())}}}render(){var e,t,i;if(!this.hass||!this.config)return q``;this.logger.log("Grid Layout",`Render: Using ${this._filteredParts.length} filtered parts from BaseLayout`,{category:"layouts",subsystem:"rendering"});const r=this._filteredParts;if(0===r.length)return q`
                <div class="no-parts">
                    <div class="title">${this.config.title||(null===(t=null===(e=this.hass.states[this.config.entity])||void 0===e?void 0:e.attributes)||void 0===t?void 0:t.friendly_name)||"Inventory"}</div>
                    <div class="message">
                        No parts match the current filter conditions
                    </div>
                </div>
            `;this._zombieStateCounter=0;const a=this.config.columns||3,s=this.config.grid_spacing||8;this.config.item_height;const o=`${(null===(i=this.config.style)||void 0===i?void 0:i.image_size)||50}%`;return q`
            <div class="grid-container" style="${`\n            grid-template-columns: repeat(${a}, 1fr);\n            gap: ${s}px;\n        `}">
                ${r.map((e=>{var t,i,r,a,s,n,c,l,d,h,u,p;const g=e._filtered_out?"opacity: 0.3; filter: grayscale(100%);":"",v=`${this._getContainerStyle(e.pk)}; ${g}`;return q`
                        <div class="grid-item" style="${v}">
                            <div class="grid-item-content">
                                ${!1!==(null===(t=this.config.display)||void 0===t?void 0:t.show_image)?q`
                                    <div class="grid-item-image" style="width: ${o}; max-width: ${o};">
                                        <img 
                                            src="${e.thumbnail||"/local/inventree-card/placeholder.png"}" 
                                            alt="${e.name}"
                                            @error=${this._handleImageError}
                                            style="width: 100%; height: 100%; object-fit: contain;"
                                        >
                                    </div>
                                `:""}
                                
                                <div class="grid-item-details" style="width: ${!1!==(null===(i=this.config.display)||void 0===i?void 0:i.show_image)?`calc(100% - ${o})`:"100%"};">
                                    ${!1!==(null===(r=this.config.display)||void 0===r?void 0:r.show_name)?q`
                                        <div class="grid-item-name" style="${this._getTextStyle(e.pk)}">${e.name}</div>
                                    `:""}
                                    
                                    ${!1!==(null===(a=this.config.display)||void 0===a?void 0:a.show_stock)?q`
                                        <div class="grid-item-stock" style="${this._getTextStyle(e.pk)}">
                                            Stock: ${e.in_stock||0}
                                        </div>
                                    `:""}
                                    
                                    ${!0===(null===(s=this.config.display)||void 0===s?void 0:s.show_description)&&e.description?q`
                                        <div class="grid-item-description" style="${this._getTextStyle(e.pk)}">
                                            ${e.description}
                                        </div>
                                    `:""}
                                    
                                    ${!0===(null===(n=this.config.display)||void 0===n?void 0:n.show_category)&&e.category_name?q`
                                        <div class="grid-item-category" style="${this._getTextStyle(e.pk)}">
                                            ${e.category_name}
                                        </div>
                                    `:""}

                                    <!-- Parameters section -->
                                    ${!0===(null===(c=this.config.display)||void 0===c?void 0:c.show_parameters)&&e.parameters&&e.parameters.length>0?q`
                                        <div class="grid-item-parameters">
                                            ${e.parameters.map((t=>{var i,r;return q`
                                                <div class="grid-item-parameter">
                                                    <span class="param-name" style="${this._getTextStyle(e.pk)}">${(null===(i=t.template_detail)||void 0===i?void 0:i.name)||"Parameter"}</span>
                                                    <span class="param-value" style="${this._getTextStyle(e.pk)}">${t.data} ${(null===(r=t.template_detail)||void 0===r?void 0:r.units)||""}</span>
                                                </div>
                                            `}))}
                                        </div>
                                    `:""}
                                </div>
                            </div>
                            
                            <div class="grid-item-actions">
                                ${!1!==(null===(l=this.config.display)||void 0===l?void 0:l.show_buttons)?q`
                                    <inventree-part-buttons
                            .hass=${this.hass}
                            .config=${this.config}
                                        .partData=${e}
                                    ></inventree-part-buttons>
                                `:""}
                                
                                ${(this._actionButtons.get(e.pk)||[]).length>0?q`
                                    <div class="parameter-actions">
                                        ${(this._actionButtons.get(e.pk)||[]).map((e=>q`
                                            <button 
                                                class="parameter-action-button"
                                                @click=${e.onClick}
                                                title="${e.label}"
                                            >
                                                ${e.icon?q`<ha-icon icon="${e.icon}"></ha-icon>`:e.label}
                                            </button>
                                        `))}
                                    </div>
                                `:""}
                            </div>
                            
                            ${(null===(d=this._visualModifiers.get(e.pk))||void 0===d?void 0:d.badge)?q`
                                <div class="parameter-badge">${null===(h=this._visualModifiers.get(e.pk))||void 0===h?void 0:h.badge}</div>
                            `:""}
                            
                            ${(null===(u=this._visualModifiers.get(e.pk))||void 0===u?void 0:u.icon)?q`
                                <ha-icon icon="${null===(p=this._visualModifiers.get(e.pk))||void 0===p?void 0:p.icon}" class="parameter-icon"></ha-icon>
                            `:""}
                            
                            ${e._filtered_out?q`
                                <div class="filtered-badge">
                                    <ha-icon icon="mdi:filter-remove"></ha-icon>
                                    <span>Filtered Out</span>
                                </div>
                            `:""}
                    </div>
                    `}))}
            </div>
        `}_handleResetFilters(){this._shouldShowPartCache.clear(),this._filteredParts=[...this.parts],this._lastFilteredPartsHash="",this.requestUpdate(),console.log("🔄 Grid Layout: Filters reset manually")}};bi.hasInitializedApi=!1,bi.styles=[fi],c([fe({attribute:!1})],bi.prototype,"hass",void 0),c([fe({attribute:!1})],bi.prototype,"config",void 0),c([fe({attribute:!1})],bi.prototype,"parts",void 0),c([be()],bi.prototype,"_visualModifiers",void 0),c([be()],bi.prototype,"_parameterService",void 0),c([be()],bi.prototype,"_actionButtons",void 0),c([be()],bi.prototype,"_filteredParts",void 0),bi=c([ge("inventree-grid-layout")],bi);const yi=g`
    .detail-container {
        display: flex;
        flex-direction: column;
        padding: 16px;
        background-color: var(--card-background-color, #fff);
        border-radius: var(--ha-card-border-radius, 4px);
        box-shadow: var(--ha-card-box-shadow, none);
    }

    .detail-header {
        display: flex;
        flex-direction: column;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        padding-bottom: 8px;
    }

    .detail-header h2 {
        margin: 0 0 8px 0;
        font-size: 1.5rem;
        font-weight: 500;
    }

    .category {
        font-size: 0.9rem;
        color: var(--secondary-text-color);
    }

    .detail-content {
        display: flex;
        flex-direction: row;
        gap: 16px;
    }

    .image-section {
        flex: 0 0 auto;
        width: 150px;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--secondary-background-color, #f0f0f0);
        border-radius: 4px;
        overflow: hidden;
    }

    .image-section img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }

    .info-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .stock-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 8px;
        background-color: var(--secondary-background-color, #f0f0f0);
        border-radius: 4px;
    }

    .stock-info.low-stock {
        background-color: var(--warning-color, #ffa726);
        color: var(--text-primary-color, #fff);
    }

    .stock-level, .minimum-stock, .pending-adjustment {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .label {
        font-weight: 500;
        min-width: 80px;
    }

    .value {
        font-weight: 400;
    }

    .low-stock-indicator {
        background-color: var(--error-color, #f44336);
        color: var(--text-primary-color, #fff);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.8rem;
        margin-left: auto;
    }

    .pending-adjustment .positive {
        color: var(--success-color, #4caf50);
    }

    .pending-adjustment .negative {
        color: var(--error-color, #f44336);
    }

    .description {
        margin-top: 8px;
    }

    .description p {
        margin: 0;
        color: var(--primary-text-color);
    }

    .action-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
    }

    .parameter-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
    }

    .parameter-action-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px 8px;
        border: none;
        border-radius: 4px;
        background-color: var(--primary-color);
        color: var(--text-primary-color);
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.3s;
    }

    .parameter-action-button:hover {
        background-color: var(--primary-color-light);
    }

    .parameters-section {
        margin-top: 16px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
        padding-top: 8px;
    }

    .parameters-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
    }

    .parameters-header h3 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 500;
    }

    .parameters-content {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 8px;
        margin-top: 8px;
    }

    .parameter-item {
        display: flex;
        flex-direction: column;
        padding: 8px;
        background-color: var(--secondary-background-color, #f0f0f0);
        border-radius: 4px;
    }

    .parameter-name {
        font-weight: 500;
        margin-bottom: 4px;
    }

    .parameter-value {
        font-family: monospace;
    }

    .stock-adjust-section {
        margin-top: 16px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
        padding-top: 8px;
    }

    .stock-adjust-form {
        display: flex;
        gap: 8px;
        margin-top: 8px;
    }

    .stock-adjust-form input {
        flex: 1;
        padding: 4px 8px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
    }

    .stock-adjust-form button {
        padding: 4px 8px;
        border: none;
        border-radius: 4px;
        background-color: var(--primary-color);
        color: var(--text-primary-color);
        cursor: pointer;
    }

    /* Responsive adjustments */
    @media (max-width: 600px) {
        .detail-content {
            flex-direction: column;
        }

        .image-section {
            width: 100%;
            height: auto;
            aspect-ratio: 1;
            max-height: 200px;
        }
    }
`;class _i extends ue{constructor(){super(),this._filteredParts=[],this._isLoading=!1,this._filteringCache={},this.logger=e.getInstance(),this.cache=ke.getInstance(),this._renderDebounceTimerId=null,this.RENDER_DEBOUNCE_TIME=100,this._lastRenderedHash="",this._boundHandlers=[],this._renderUnsubscribe=null,this._lastRender=0,this._lastUpdateRequestTimestamp=0,console.log("🔧 BaseLayout constructor started");const t=`BaseLayout-${Date.now()}-${Math.floor(1e3*Math.random())}`;try{this.timers=new _e(t,!0),console.log("✅ TimerManager initialized successfully:",t)}catch(e){console.error("❌ Error initializing TimerManager:",e),this.timers=new _e("BaseLayout-fallback",!1)}try{const t=Me.getInstance();console.log("✅ CardController instance obtained");try{this._renderingService=t.getRenderingService(),console.log("✅ RenderingService obtained:",!!this._renderingService)}catch(e){console.error("❌ Error getting RenderingService:",e),this._renderingService=Pe.getInstance(),console.log("⚠️ Using fallback RenderingService instance")}try{this.logger=e.getInstance(),console.log("✅ Logger initialized")}catch(e){console.error("❌ Error initializing Logger:",e)}}catch(t){console.error("❌ Error getting CardController:",t),this._renderingService=Pe.getInstance(),this.logger=e.getInstance(),console.log("⚠️ Using fallback service instances")}try{this._parameterService=this._safeGetParameterService(),console.log("✅ ParameterService initialization attempted:",!!this._parameterService)}catch(e){console.error("❌ Error initializing ParameterService:",e)}try{this._registerCacheMissCallbacks(),console.log("✅ Cache miss callbacks registered")}catch(e){console.error("❌ Error registering cache callbacks:",e)}console.log("🔧 BaseLayout constructor completed")}_registerCacheMissCallbacks(){if(!this.entity)return;const e=`entity-data:${this.entity}`;this.cache.registerMissCallback(e,(async()=>{this.logger.log("Layout",`Cache miss callback triggered for ${e}`,{category:"layouts",subsystem:"cache"});const t=Ee.getInstance().getNewestData(this.entity);if(t&&t.length>0)return this.logger.log("Layout",`Cache miss recovery found ${t.length} parts for ${this.entity}`,{category:"layouts",subsystem:"cache"}),t;const i=Me.getInstance().getParts();return i&&i.length>0?(this.logger.log("Layout",`Cache miss recovery found ${i.length} parts from controller`,{category:"layouts",subsystem:"cache"}),i):void 0}))}_safeGetParameterService(){try{this.logger||(this.logger=e.getInstance());try{const e=Me.getInstance().getParameterService();if(e)return this.logger.log("BaseLayout","Retrieved ParameterService from CardController",{category:"layouts"}),e}catch(e){this.logger.warn("BaseLayout","Could not get CardController, falling back to direct ParameterService",{category:"layouts"})}if(Ae.hasInstance&&Ae.hasInstance())try{const e=Ae.getInstance();return this.logger.log("BaseLayout","Successfully got ParameterService from getInstance",{category:"layouts"}),e}catch(e){this.logger.error("BaseLayout",`Error getting ParameterService: ${e}`,{category:"layouts"})}return}catch(e){return void console.error("BaseLayout: Error in _safeGetParameterService:",e)}}async _loadData(){var e,t,i;if(!this.config||!this.entity)return;if(this._isLoading)return void this.logger.log("Layout","Skipping data load - already in progress",{category:"layouts"});this._isLoading=!0;const r=this._computePartsHash(this._filteredParts),a=`entity-data:${this.entity}`,s=this.cache.get(a);if(s&&s.length>0){this.logger.log("Layout",`Found ${s.length} parts in cache for ${this.entity}`,{category:"layouts",subsystem:"cache"}),this.cache.setFallback(a,s);let t=s;(null===(e=this.config.parameters)||void 0===e?void 0:e.enabled)&&this._parameterService&&(t=await this._applyParameterFiltering(s));return this._computePartsHash(t)!==r?(this._filteredParts=t,this.logger.log("Layout",`Using cached data: ${t.length} parts after filtering`,{category:"layouts",subsystem:"cache"})):this.logger.log("Layout","Cached data unchanged, skipping update",{category:"layouts",subsystem:"cache"}),void(this._isLoading=!1)}const o=(null===(t=this.config.direct_api)||void 0===t?void 0:t.method)||"polling",n=Ee.getInstance();let c=[];switch(o){case"websocket":c=n.getWebSocketData(this.entity);break;case"polling":c=n.getApiData(this.entity);break;default:c=n.getHassData(this.entity)}if(c&&0!==c.length||(c=n.getNewestData(this.entity),this.logger.log("Layout",`Falling back to newest data - got ${c.length} parts`,{category:"layouts"})),!c||0===c.length){c=Me.getInstance().getParts(),this.logger.log("Layout",`Falling back to controller data - got ${c.length} parts`,{category:"layouts"})}(!c||0===c.length)&&this.parts&&this.parts.length>0&&(c=[...this.parts],this.logger.log("Layout",`Using directly passed parts data - got ${c.length} parts`,{category:"layouts"})),c&&c.length>0?this.logger.log("Layout",`Part data preview: First part is ${c[0].name||"unnamed"} (${c[0].pk})`,{category:"layouts"}):(this.logger.log("Layout",`No parts data found anywhere! Entity: ${this.entity}`,{category:"layouts"}),this.logger.log("Layout",`Diagnostics check: Controller has ${Me.getInstance().getParts().length} parts`,{category:"layouts"}),this.logger.log("Layout",`Diagnostics check: State manager has ${Ee.getInstance().getNewestData(this.entity).length} parts for ${this.entity}`,{category:"layouts"}),this.logger.log("Layout",`Diagnostics check: Incoming this.parts = ${this.parts?this.parts.length:"undefined"} parts`,{category:"layouts"})),c&&c.length>0&&(this.cache.set(a,c,we.ENTITY_DATA,$e.ENTITY),this.cache.setFallback(a,c),this.logger.log("Layout",`Cached ${c.length} parts for entity ${this.entity} with TTL ${we.ENTITY_DATA}ms`,{category:"layouts",subsystem:"cache"})),this.logger.log("Layout",`Got ${c.length} parts from ${o} source before filtering`,{category:"layouts"});let l=c;(null===(i=this.config.parameters)||void 0===i?void 0:i.enabled)&&this._parameterService&&(l=await this._applyParameterFiltering(c)),this.logger.log("Layout",`After filtering, have ${l.length} parts`,{category:"layouts"});this._computePartsHash(l)!==r?(this._filteredParts=l,this.logger.log("Layout",`Data changed, loaded ${c.length} parts (${l.length} after filtering) from ${o} source`,{category:"layouts"})):this.logger.log("Layout","Data unchanged, skipping update",{category:"layouts"}),this._isLoading=!1}async _applyParameterFiltering(e){var t,i,r,a;const s=null===(t=this.config)||void 0===t?void 0:t.parameters;if(!(null==s?void 0:s.enabled)||!s.conditions||0===s.conditions.length)return this.logger.log("BaseLayout",`Parameter filtering disabled or no conditions set, showing all ${e.length} parts`,{category:"layouts",subsystem:"filtering"}),e;if(this.logger.log("BaseLayout",`Starting parameter filtering with ${e.length} parts, part IDs: ${e.map((e=>e.pk)).join(", ")}`,{category:"layouts",subsystem:"filtering"}),s.conditions.length>0){const e=s.conditions.slice(0,3);for(const t of e)this.logger.log("BaseLayout",`Condition info: ${t.parameter} ${t.operator} ${t.value} => ${t.action_value}`,{category:"layouts",subsystem:"filtering"})}const o=JSON.stringify(e.map((e=>e.pk)).sort())+JSON.stringify(s.conditions);if(this._filteringCache[o])return this.logger.log("BaseLayout",`Using cached filtering results (${this._filteringCache[o].length} parts)`,{category:"layouts",subsystem:"filtering"}),this._filteringCache[o];const n=this._parameterService;if(!n)return this.logger.warn("BaseLayout","Parameter service not available, showing all parts",{category:"layouts",subsystem:"filtering"}),e;try{s.conditions.some((e=>e.parameter.startsWith("part:")))&&(this.logger.log("BaseLayout","Clearing direct reference condition caches before filtering",{category:"layouts",subsystem:"filtering"}),n.clearConditionCache())}catch(e){this.logger.warn("BaseLayout",`Error clearing condition cache: ${e}`,{category:"layouts",subsystem:"filtering"})}const c=s.conditions.filter((e=>"filter"===e.action&&"show"===e.action_value)),l=s.conditions.filter((e=>"filter"===e.action&&"hide"===e.action_value));this.logger.log("BaseLayout",`Found ${c.length} show conditions and ${l.length} hide conditions`,{category:"layouts",subsystem:"filtering"});const d=!0===(null===(i=this.config)||void 0===i?void 0:i.show_debug)||!0===(null===(a=null===(r=this.config)||void 0===r?void 0:r.parameters)||void 0===a?void 0:a.show_debug);return(async()=>{const t=[];for(const i of e){this.logger.log("BaseLayout",`Filtering part: ${i.pk} ${i.name||"unnamed"}`,{category:"layouts",subsystem:"filtering-detail"});let e=!0;if(c.length>0){e=!1;for(const t of c){const r=await n.checkCondition(t,i);if(d&&this.logger.log("BaseLayout",`SHOW condition: Part ${i.pk} (${i.name}) ${r?"MATCHES":"does NOT match"} condition ${t.parameter} ${t.operator} ${t.value}`,{category:"layouts",subsystem:"filtering-detail"}),r){e=!0;break}}if(!e){this.logger.log("BaseLayout",`Part ${i.pk} filtered out - did not match any SHOW conditions`,{category:"layouts",subsystem:"filtering-detail"});continue}}if(l.length>0)for(const t of l){const r=await n.checkCondition(t,i);if(d&&this.logger.log("BaseLayout",`HIDE condition: Part ${i.pk} (${i.name}) ${r?"MATCHES":"does NOT match"} condition ${t.parameter} ${t.operator} ${t.value}`,{category:"layouts",subsystem:"filtering-detail"}),r){e=!1,this.logger.log("BaseLayout",`Part ${i.pk} filtered out - matched a HIDE condition`,{category:"layouts",subsystem:"filtering-detail"});break}}e&&(this.logger.log("BaseLayout",`Part ${i.pk} kept - passed all filter conditions`,{category:"layouts",subsystem:"filtering-detail"}),t.push(i))}return t})().then((t=>{var i,r;this._filteringCache[o]=t,this.logger.log("BaseLayout",`Filtered ${e.length} parts down to ${t.length}`,{category:"layouts",subsystem:"filtering"});const a=!0===(null===(r=null===(i=this.config)||void 0===i?void 0:i.parameters)||void 0===r?void 0:r.allow_empty_filter);return 0!==t.length||a?t:(this.logger.log("BaseLayout","No parts matched filters and empty filter is not allowed, showing all parts",{category:"layouts",subsystem:"filtering"}),e)})).catch((t=>(this.logger.error("BaseLayout","Error during parameter filtering:",t,{category:"layouts",subsystem:"filtering"}),e)))}_applyParameterFilteringSync(e){var t,i,r,a;if(!(null===(i=null===(t=this.config)||void 0===t?void 0:t.parameters)||void 0===i?void 0:i.enabled)||!this._parameterService)return e;if(!this.config.parameters.conditions||0===this.config.parameters.conditions.length)return e;this.logger.log("Layout",`Sync filtering ${e.length} parts`,{category:"layouts",subsystem:"filtering"});const s=this.config.parameters.conditions.filter((e=>"filter"===e.action));if(0===s.length)return e;const o=s.filter((e=>"show"===e.action_value)),n=s.filter((e=>"hide"===e.action_value));this.logger.log("Layout",`Sync: ${o.length} show, ${n.length} hide conditions`,{category:"layouts",subsystem:"filtering"});let c=[...e];o.length>0&&(c=c.filter((e=>{const t=o.filter((e=>{var t;return!(null===(t=this._parameterService)||void 0===t?void 0:t.isDirectPartReference(e.parameter))}));return t.some((t=>{var i;return null===(i=this._parameterService)||void 0===i?void 0:i.matchesConditionSyncVersion(e,t)}))}))),n.length>0&&(c=c.filter((e=>{const t=n.filter((e=>{var t;return!(null===(t=this._parameterService)||void 0===t?void 0:t.isDirectPartReference(e.parameter))}));return!t.some((t=>{var i;return null===(i=this._parameterService)||void 0===i?void 0:i.matchesConditionSyncVersion(e,t)}))})));const l=!0===(null===(a=null===(r=this.config)||void 0===r?void 0:r.parameters)||void 0===a?void 0:a.allow_empty_filter);return 0===c.length&&e.length>0&&!l?(this.logger.warn("Layout","⚠️ Sync filtering removed all parts - using fallback",{category:"layouts",subsystem:"filtering"}),e):c}getParts(){if(!this.entity)return[];return Ee.getInstance().getNewestData(this.entity)}async refreshData(){await this._loadData(),this.requestUpdate()}_computePartsHash(e){return e&&0!==e.length?e.map((e=>`${e.pk}:${e.in_stock||0}:${e.name}`)).join("|"):"empty"}subscribeToState(){const e=(e,t)=>{let i=null;const r=r=>{null!==i&&(this.timers.clearTimeout(i),i=null),i=this.timers.setTimeout((()=>{t()}),this.RENDER_DEBOUNCE_TIME,`event-debounce-${e}`)};window.addEventListener(e,r),this._boundHandlers.push({event:e,handler:r})};e("inventree-parameter-updated",(()=>{this.logger.log("Layout","Parameter update detected, reloading data",{category:"layouts"}),this._loadData(),this.requestUpdate()})),window.addEventListener("inventree-parameter-updated",(e=>{var t,i;const r=e;this.logger.log("Layout",`Parameter update detected from ${(null===(t=r.detail)||void 0===t?void 0:t.source)||"unknown"}`,{category:"layouts"}),"websocket-plugin"===(null===(i=r.detail)||void 0===i?void 0:i.source)&&(this._loadData(),this.requestUpdate())})),e("inventree-entity-updated",(()=>{this._loadData(),this.requestUpdate()})),e("inventree-force-refresh",(()=>{this._loadData(),this.requestUpdate()})),this.logger.log("Layout","Subscribed to state events with debouncing",{category:"layouts"})}connectedCallback(){super.connectedCallback(),this._parameterService||(this._parameterService=this._safeGetParameterService(),this._parameterService?this.logger.log("BaseLayout","Successfully got ParameterService in connectedCallback",{category:"layouts"}):(this.logger.warn("BaseLayout","ParameterService not available during connectedCallback, will retry later",{category:"layouts"}),this._scheduleParameterServiceRetry())),this._renderUnsubscribe=this._renderingService.registerRenderCallback((()=>this.requestUpdate())),this.subscribeToState(),this._loadData()}_scheduleParameterServiceRetry(e=1){if(e>5)return void this.logger.error("BaseLayout","Failed to get ParameterService after multiple attempts",{category:"layouts"});const t=Math.min(500*e,2e3);this.timers.setTimeout((()=>{this.logger.log("BaseLayout",`Retry attempt ${e} to get ParameterService`,{category:"layouts"}),this._parameterService=this._safeGetParameterService(),this._parameterService?(this.logger.log("BaseLayout",`Successfully got ParameterService on retry attempt ${e}`,{category:"layouts"}),this.hass&&this._parameterService&&this._parameterService.updateHass(this.hass),this._loadData(),this.requestUpdate()):this._scheduleParameterServiceRetry(e+1)}),t,`retry-get-parameter-service-${e}`)}disconnectedCallback(){super.disconnectedCallback(),this._boundHandlers.forEach((({event:e,handler:t})=>{window.removeEventListener(e,t)})),this._boundHandlers=[],this._renderUnsubscribe&&(this._renderUnsubscribe(),this._renderUnsubscribe=null),null!==this._renderDebounceTimerId&&(this.timers.clearTimeout(this._renderDebounceTimerId),this._renderDebounceTimerId=null),this.logger.log("Layout","Cleaning up all timers in BaseLayout",{category:"layouts",subsystem:"timers"}),this.timers.clearAll()}requestUpdate(){try{this._lastUpdateRequestTimestamp=Date.now();const e=performance.now();this._renderingService.forceRender();const t=this._filteredParts||[],i=Math.round(performance.now()-e);this.reportRenderTiming(i,t.length),this.logger.log("BaseLayout",`Update requested with ${t.length} parts, preparation: ${i}ms`,{category:"rendering",subsystem:"updates"})}catch(e){this.logger.error("BaseLayout",`Error requesting update: ${e}`,{category:"rendering",subsystem:"error"})}}reportRenderTiming(e,t){try{const i=Date.now(),r=this._lastRender?i-this._lastRender:0;this._lastRender=i;const a=this._lastUpdateRequestTimestamp?i-this._lastUpdateRequestTimestamp:0,s={component:this.tagName.toLowerCase(),partCount:t,preparationTime:e,timeSinceLastRender:r,requestToRenderTime:a,filteredParts:t};this.logger.log("BaseLayout",`Render timing: ${JSON.stringify(s)}`,{category:"performance",subsystem:"rendering"}),this._renderingService.trackRenderTiming(s),this.dispatchEvent(new CustomEvent("render-timing",{bubbles:!0,composed:!0,detail:s}))}catch(e){this.logger.error("BaseLayout",`Error reporting render timing: ${e}`,{category:"performance",subsystem:"error"})}}_updateVisualModifiers(){}async updateFilteredParts(){var e,t;const i=this.parts||[],r=(null===(t=null===(e=this.config)||void 0===e?void 0:e.parameters)||void 0===t?void 0:t.conditions)||[];this.logger.log("Layout",`🔍 BaseLayout: Filtering ${i.length} parts with ${r.length} conditions`,{category:"layouts"});const a=Ae.getInstance(),s=Pe.getInstance();let o=[...i];if(!r||0===r.length)return this.logger.log("Layout",`🔧 DEBUG: No conditions, showing all ${i.length} parts`,{category:"layouts"}),void(this._filteredParts=o);const n=r.filter((e=>"filter"===e.action&&"show"===e.action_value));if(n.length>0){const e=[];for(const t of i)for(const i of n)if(a.isDirectPartReference(i.parameter)){const r=await a.getParameterValueWithDirectReference(i.parameter);if(a.checkValueMatch(r,i)){e.push(t.pk);break}}else{if(await a.matchesCondition(t,i)){e.push(t.pk);break}}o=o.filter((t=>e.includes(t.pk)))}this.logger.log("Layout",`🔍 BaseLayout: Filtered down to ${o.length} parts`,{category:"layouts"}),this._filteredParts=o,s.notifyRenderComplete()}}c([fe({attribute:!1})],_i.prototype,"hass",void 0),c([fe({attribute:!1})],_i.prototype,"config",void 0),c([fe({type:String})],_i.prototype,"entity",void 0),c([fe({type:Array})],_i.prototype,"parts",void 0),c([be()],_i.prototype,"_filteredParts",void 0),c([be()],_i.prototype,"_isLoading",void 0);let wi=class extends _i{constructor(){super(...arguments),this._showParameters=!0,this._showStockAdjust=!1,this._pendingStockAdjustments=new Map,this._displayedStock=new Map,this._visualModifiers={},this._actionButtons=[]}firstUpdated(){this._updateDisplayedStock(),this._updateVisualModifiers()}updated(e){super.updated(e),(e.has("item")||e.has("config"))&&(this._updateDisplayedStock(),this._updateVisualModifiers())}_updateDisplayedStock(){this.item&&(this._displayedStock.has(this.item.pk)||this._displayedStock.set(this.item.pk,this.item.in_stock))}_updateVisualModifiers(){var e,t;if(!this.item||!this._parameterService||!(null===(t=null===(e=this.config)||void 0===e?void 0:e.parameters)||void 0===t?void 0:t.enabled))return this._visualModifiers={},void(this._actionButtons=[]);this._visualModifiers=this._parameterService.processConditions(this.item,this.config.parameters.conditions),Ee.getInstance(),this._actionButtons=this._parameterService.getActionButtons(`${this.item.pk}`,"",this.config.parameters.actions),this.config.parameters.collapsed_by_default&&(this._showParameters=!1),"show"===this._visualModifiers.showSection?this._showParameters=!0:"hide"===this._visualModifiers.showSection&&(this._showParameters=!1)}_getContainerStyle(){if(!this._visualModifiers)return"";const e=[];return this._visualModifiers.highlight&&e.push(`background-color: ${this._visualModifiers.highlight}`),this._visualModifiers.border&&e.push(`border: 2px solid ${this._visualModifiers.border}`),e.join(";")}_getTextStyle(){return this._visualModifiers&&this._visualModifiers.textColor?`color: ${this._visualModifiers.textColor}`:""}_handleImageError(e){e.target.src="/local/inventree-card/placeholder.png"}render(){var e;if(!this.item)return q`<div class="not-found">Item not found</div>`;const t=(null===(e=this.config)||void 0===e?void 0:e.display)||{},i=(this._displayedStock.get(this.item.pk)||this.item.in_stock)+(this._pendingStockAdjustments.get(this.item.pk)||0),r=void 0!==this.item.minimum_stock&&i<=this.item.minimum_stock;return q`
            <div class="detail-container" style="${this._getContainerStyle()}">
                <!-- Header section with name and category -->
                ${!1!==t.show_name?q`
                    <div class="detail-header">
                        <h2 style="${this._getTextStyle()}">${this.item.name}</h2>
                        ${t.show_category&&this.item.category_name?q`
                            <div class="category">${this.item.category_name}</div>
                        `:""}
                    </div>
                `:""}
                
                <div class="detail-content">
                    <!-- Image section -->
                    ${!1!==t.show_image&&this.item.thumbnail?q`
                        <div class="image-section">
                            <img 
                                src="${this.item.thumbnail}" 
                                alt="${this.item.name}" 
                                @error=${this._handleImageError}
                            />
                        </div>
                    `:""}
                    
                    <div class="info-section">
                        <!-- Stock information -->
                        ${!1!==t.show_stock?q`
                            <div class="stock-info ${r?"low-stock":""}">
                                <div class="stock-level">
                                    <span class="label">In Stock:</span>
                                    <span class="value">${i} ${this.item.units||""}</span>
                                    ${r?q`
                                        <span class="low-stock-warning">Low Stock</span>
                                    `:""}
                                </div>
                            </div>
                        `:""}
                    </div>
                </div>
            </div>
        `}};wi.styles=[yi],c([fe({attribute:!1})],wi.prototype,"item",void 0),c([be()],wi.prototype,"_showParameters",void 0),c([be()],wi.prototype,"_showStockAdjust",void 0),c([be()],wi.prototype,"_pendingStockAdjustments",void 0),c([be()],wi.prototype,"_displayedStock",void 0),c([be()],wi.prototype,"_visualModifiers",void 0),c([be()],wi.prototype,"_actionButtons",void 0),wi=c([ge("inventree-detail-layout")],wi);const $i=g`
    :host {
        display: block;
    }

    .list-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 100%;
    }

    .list-item {
        display: flex;
        align-items: center;
        background-color: var(--card-background-color, #fff);
        border-radius: 4px;
        overflow: hidden;
        box-shadow: var(--ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12));
        position: relative;
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        padding: 4px;
    }

    .list-item:hover {
        transform: translateY(-1px);
        box-shadow: var(--ha-card-box-shadow, 0px 3px 3px -2px rgba(0, 0, 0, 0.2), 0px 3px 4px 0px rgba(0, 0, 0, 0.14), 0px 1px 8px 0px rgba(0, 0, 0, 0.12));
    }

    .list-item-image {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin-right: 8px;
        overflow: hidden;
        background-color: var(--secondary-background-color, #f5f5f5);
        border-radius: 2px;
        flex-shrink: 0;
    }

    .list-item-image img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .list-item-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0; /* Ensures text truncation works properly */
        padding: 0 4px;
        overflow: hidden;
    }

    .list-item-name {
        font-size: 0.95rem;
        font-weight: 500;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .list-item-stock {
        font-size: 0.85rem;
        margin-bottom: 2px;
    }

    .list-item-description {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        margin-bottom: 2px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
    }

    .list-item-category {
        font-size: 0.75rem;
        color: var(--secondary-text-color);
        margin-bottom: 2px;
    }

    /* Parameters display in list view */
    .list-item-parameters {
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-top: 2px;
        font-size: 0.8rem;
    }

    .list-item-parameter {
        display: flex;
        justify-content: space-between;
    }

    .param-name {
        font-weight: 500;
        margin-right: 8px;
    }

    .param-value {
        font-family: monospace;
    }

    .list-item-actions {
        display: flex;
        align-items: center;
        padding: 0 4px;
        margin-left: auto;
        flex-shrink: 0;
    }

    /* Parameter badge and icon */
    .parameter-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        padding: 1px 4px;
        border-radius: 8px;
        background-color: var(--primary-color);
        color: var(--text-primary-color);
        font-size: 0.7rem;
        font-weight: 500;
        z-index: 1;
    }

    .parameter-icon {
        position: absolute;
        top: 4px;
        left: 4px;
        color: var(--primary-color);
        --mdc-icon-size: 16px;
        z-index: 1;
    }

    /* Parameter action buttons */
    .parameter-actions {
        display: flex;
        gap: 2px;
    }

    .parameter-action-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2px 4px;
        border: none;
        border-radius: 4px;
        background-color: var(--primary-color);
        color: var(--text-primary-color);
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.3s;
    }

    .parameter-action-button:hover {
        background-color: var(--primary-color-light);
    }

    .no-parts {
        padding: 32px;
        text-align: center;
        color: var(--primary-text-color);
        font-style: italic;
    }

    .empty-message {
        padding: 1rem;
        text-align: center;
        color: var(--primary-text-color);
        font-style: italic;
    }

    .error-hint {
        margin-top: 8px;
        color: var(--error-color, red);
        font-size: 0.9rem;
        opacity: 0.8;
    }

    @media (max-width: 600px) {
        .list-item {
            flex-direction: row; /* Keep row layout even on mobile */
        }
        
        .list-item-image {
            margin-right: 8px;
        }
        
        .list-item-actions {
            padding: 0 4px;
        }
    }
`;let ki=class extends _i{constructor(){super(),this._visualModifiers=new Map,this._actionButtons=new Map,console.log("🧩 List Layout created with ID:",this.id||"unknown"),console.log("🔍 List Layout initialization details:",{renderingService:!!this._renderingService,timers:!!this.timers,parameterService:!!this._parameterService,logger:!!this.logger,cache:!!this.cache});try{if(!this._renderingService){console.error("❌ RenderingService was not initialized in BaseLayout constructor");const e=Me.getInstance();this._renderingService=e.getRenderingService(),console.log("🛠️ After manual initialization:",{renderingService:!!this._renderingService})}}catch(e){console.error("❌ Error during list-layout service initialization:",e)}}connectedCallback(){console.log("🔄 List Layout connectedCallback - BEFORE super.connectedCallback()"),console.log("🔍 Services before super.connectedCallback():",{renderingService:!!this._renderingService,timers:!!this.timers,parameterService:!!this._parameterService}),super.connectedCallback(),console.log("🔄 List Layout connectedCallback - AFTER super.connectedCallback()"),console.log("🔍 Services after super.connectedCallback():",{renderingService:!!this._renderingService,timers:!!this.timers,parameterService:!!this._parameterService,renderUnsubscribe:!!this._renderUnsubscribe}),this._loadData(),this.requestUpdate()}updated(e){var t,i,r,a;console.log("🔄 List Layout updated - BEFORE super.updated()"),console.log("🔍 Current state before super.updated():",{filteredPartsCount:(null===(t=this._filteredParts)||void 0===t?void 0:t.length)||0,hasHass:!!this.hass,hasConfig:!!this.config,changedPropsKeys:Array.from(e.keys()).join(", "),entity:this.entity,parts:(null===(i=this.parts)||void 0===i?void 0:i.length)||0}),super.updated(e),console.log("🔄 List Layout updated - AFTER super.updated()"),console.log("🔍 Current state after super.updated():",{filteredPartsCount:(null===(r=this._filteredParts)||void 0===r?void 0:r.length)||0,hasHass:!!this.hass,hasConfig:!!this.config,changedPropsKeys:Array.from(e.keys()).join(", "),entity:this.entity,parts:(null===(a=this.parts)||void 0===a?void 0:a.length)||0}),this._filteredParts.length>0&&this._updateVisualModifiers()}_updateVisualModifiers(){var e,t,i,r,a;if(console.log("🔄 Updating visual modifiers:",{parameterService:!!this._parameterService,filteredPartsCount:(null===(e=this._filteredParts)||void 0===e?void 0:e.length)||0,parametersEnabled:!!(null===(i=null===(t=this.config)||void 0===t?void 0:t.parameters)||void 0===i?void 0:i.enabled)}),!this._parameterService||!this._filteredParts||!(null===(a=null===(r=this.config)||void 0===r?void 0:r.parameters)||void 0===a?void 0:a.enabled))return this._visualModifiers=new Map,void(this._actionButtons=new Map);this.logger.log("ListLayout",`Updating visual modifiers for ${this._filteredParts.length} parts`,{category:"layouts",subsystem:"visual-effects"}),this._filteredParts.forEach((e=>{var t,i,r,a;this._visualModifiers.set(e.pk,this._parameterService.processConditions(e,(null===(i=null===(t=this.config)||void 0===t?void 0:t.parameters)||void 0===i?void 0:i.conditions)||[]));const s=Ee.getInstance();this._actionButtons.set(e.pk,s.getActionButtons(e,(null===(a=null===(r=this.config)||void 0===r?void 0:r.parameters)||void 0===a?void 0:a.actions)||[]))}))}render(){var e,t,i,r,a,s,o,n,c,l,d,h,u;if(console.log("🖌️ List Layout render called with:",{hasHass:!!this.hass,hasConfig:!!this.config,hasEntity:!!this.entity,filteredPartsCount:(null===(e=this._filteredParts)||void 0===e?void 0:e.length)||0,partsCount:(null===(t=this.parts)||void 0===t?void 0:t.length)||0,renderingService:!!this._renderingService,parameterService:!!this._parameterService}),!this.hass||!this.config)return this._renderTestPattern();console.log("🧩 Rendering List Layout:",{filteredPartsCount:(null===(i=this._filteredParts)||void 0===i?void 0:i.length)||0,entity:this.entity});const p=this._parameterService?"available":"unavailable";this.logger&&this.logger.log("ListLayout",`🔍 Rendering with ${this._filteredParts.length} filtered parts, entity: ${this.entity||"none"}, ParameterService: ${p}`,{category:"layouts"});const g=this.hass&&this.entity?this.hass.states[this.entity]:void 0,v=(null===(a=null===(r=null==g?void 0:g.attributes)||void 0===r?void 0:r.items)||void 0===a?void 0:a.length)||0;if(0===this._filteredParts.length&&v>0){if(console.log("⚠️ Filtered parts empty but entity has parts - attempting recovery"),this.logger&&this.logger.log("ListLayout",`⚠️ Filtered parts empty but entity has ${v} parts - forcing data reload`,{category:"layouts"}),this._filteredParts=(null===(s=null==g?void 0:g.attributes)||void 0===s?void 0:s.items)||[],0===this._filteredParts.length){const e=Me.getInstance();this._filteredParts=e.getParts(),console.log("🔄 Tried loading parts from controller:",(null===(o=this._filteredParts)||void 0===o?void 0:o.length)||0)}0===this._filteredParts.length&&this.parts&&Array.isArray(this.parts)&&this.parts.length>0&&(this._filteredParts=Array.from(this.parts),console.log("🔄 Tried loading parts from props:",(null===(n=this._filteredParts)||void 0===n?void 0:n.length)||0))}if(0===this._filteredParts.length)return console.log("⚠️ List Layout has no parts to display"),this.logger&&this.logger.log("ListLayout",`⚠️ No parts to display - entity: ${this.entity||"none"}, raw parts: ${v}`,{category:"layouts"}),this._renderNoPartsView(v);const m=(null===(l=null===(c=this.config)||void 0===c?void 0:c.style)||void 0===l?void 0:l.image_size)?parseInt(String(this.config.style.image_size)):50,f=Math.max(Math.round(m/4),12);return q`
            <div class="list-container">
                ${this._filteredParts.map((e=>this._renderPartWithSize(e,f)))}
                ${0===this._filteredParts.length?q`
                    <div class="empty-message">
                        No items to display
                        ${(null===(h=null===(d=this.config)||void 0===d?void 0:d.parameters)||void 0===h?void 0:h.enabled)&&v>0?q`
                            <div class="error-hint">
                                (Parameter filtering may be active - ${v} items available)
                            </div>
                        `:""}
                    </div>
                `:""}
                ${(null===(u=this.config)||void 0===u?void 0:u.debug)?q`
                    <div class="debug-info">
                        <div>Filtered Parts: ${this._filteredParts.length}</div>
                        <div>Raw Parts: ${v}</div>
                        <div>Parameter Service: ${p}</div>
                        <div>Rendering Service: ${this._renderingService?"available":"unavailable"}</div>
                    </div>
                `:""}
            </div>
        `}_renderNoPartsView(e){var t,i;return q`
            <div style="padding: 20px; background-color: #f8f8f8; border: 1px solid #ddd; border-radius: 8px; margin: 10px;">
                <h3 style="color: #666; margin-top: 0;">No Parts Available</h3>
                <p>There are no parts to display in this view.</p>
                
                <div style="margin-top: 16px; padding: 12px; background: #eee; border-radius: 4px;">
                    <h4 style="margin-top: 0; font-size: 14px;">Debugging Information</h4>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>Entity: ${this.entity||"Not set"}</li>
                        <li>Raw parts count: ${e}</li>
                        <li>Filtered parts: ${this._filteredParts.length}</li>
                        <li>Config parameters enabled: ${(null===(i=null===(t=this.config)||void 0===t?void 0:t.parameters)||void 0===i?void 0:i.enabled)?"Yes":"No"}</li>
                        <li>Parameter service: ${this._parameterService?"Available":"Missing"}</li>
                    </ul>
                </div>
            </div>
        `}_renderTestPattern(){var e,t;return q`
            <div style="padding: 20px; background-color: #f0f0f0; border: 2px solid red; margin: 10px;">
                <h3 style="color: red;">TEST PATTERN - Rendering Works!</h3>
                <p>This is a test pattern to verify that basic rendering is working.</p>
                <ul>
                    <li>Hass: ${this.hass?"Available":"Missing"}</li>
                    <li>Config: ${this.config?"Available":"Missing"}</li>
                    <li>Entity: ${this.entity||"Not set"}</li>
                    <li>RenderingService: ${this._renderingService?"Available":"Missing"}</li>
                    <li>ParameterService: ${this._parameterService?"Available":"Missing"}</li>
                    <li>Filtered Parts: ${(null===(e=this._filteredParts)||void 0===e?void 0:e.length)||0}</li>
                    <li>Parts from props: ${(null===(t=this.parts)||void 0===t?void 0:t.length)||0}</li>
                </ul>
            </div>
        `}_renderPartWithSize(e,t){var i,r,a,s,o,n,c,l,d,h,u,p,g,v,m,f,b,y,_;const w=this._getContainerStyle(e.pk);return q`
            <div class="list-item" style="${w}">
                <!-- Image section with specified size -->
                ${!1!==(null===(r=null===(i=this.config)||void 0===i?void 0:i.display)||void 0===r?void 0:r.show_image)?q`
                    <div class="list-item-image" style="width: ${t}px; height: ${t}px;">
                        <img 
                            src="${e.thumbnail||"/local/inventree-card/placeholder.png"}" 
                            alt="${e.name}"
                            @error=${this._handleImageError}
                        >
                    </div>
                `:""}
                
                <!-- Content section -->
                <div class="list-item-content">
                    ${!1!==(null===(s=null===(a=this.config)||void 0===a?void 0:a.display)||void 0===s?void 0:s.show_name)?q`
                        <div class="list-item-name" style="${this._getTextStyle(e.pk)}">${e.name}</div>
                    `:""}
                    
                    ${!1!==(null===(n=null===(o=this.config)||void 0===o?void 0:o.display)||void 0===n?void 0:n.show_stock)?q`
                        <div class="list-item-stock" style="${this._getTextStyle(e.pk)}">
                            Stock: ${e.in_stock||0}
                        </div>
                    `:""}
                    
                    ${!0===(null===(l=null===(c=this.config)||void 0===c?void 0:c.display)||void 0===l?void 0:l.show_description)&&e.description?q`
                        <div class="list-item-description" style="${this._getTextStyle(e.pk)}">
                            ${e.description}
                        </div>
                    `:""}
                    
                    ${!0===(null===(h=null===(d=this.config)||void 0===d?void 0:d.display)||void 0===h?void 0:h.show_category)&&e.category_name?q`
                        <div class="list-item-category" style="${this._getTextStyle(e.pk)}">
                            ${e.category_name}
                        </div>
                    `:""}

                    <!-- Parameters section -->
                    ${!0===(null===(p=null===(u=this.config)||void 0===u?void 0:u.display)||void 0===p?void 0:p.show_parameters)&&e.parameters&&e.parameters.length>0?q`
                        <div class="list-item-parameters">
                            ${e.parameters.map((t=>{var i,r;return q`
                                <div class="list-item-parameter">
                                    <span class="param-name" style="${this._getTextStyle(e.pk)}">${(null===(i=t.template_detail)||void 0===i?void 0:i.name)||"Parameter"}</span>
                                    <span class="param-value" style="${this._getTextStyle(e.pk)}">${t.data} ${(null===(r=t.template_detail)||void 0===r?void 0:r.units)||""}</span>
                                </div>
                            `}))}
                        </div>
                    `:""}
                </div>
                
                <!-- Action buttons section -->
                ${!1!==(null===(v=null===(g=this.config)||void 0===g?void 0:g.display)||void 0===v?void 0:v.show_buttons)?q`
                    <div class="list-item-actions">
                        <inventree-part-buttons
                            .hass=${this.hass}
                            .config=${this.config}
                            .partData=${e}
                        ></inventree-part-buttons>
                        
                        <!-- Parameter action buttons -->
                        ${(this._actionButtons.get(e.pk)||[]).length>0?q`
                            <div class="parameter-actions">
                                ${(this._actionButtons.get(e.pk)||[]).map((e=>q`
                                    <button 
                                        class="parameter-action-button"
                                        @click=${e.onClick}
                                        title="${e.label}"
                                    >
                                        ${e.icon?q`<ha-icon icon="${e.icon}"></ha-icon>`:e.label}
                                    </button>
                                `))}
                            </div>
                        `:""}
                    </div>
                `:""}
                
                <!-- Badge from parameter condition -->
                ${(null===(m=this._visualModifiers.get(e.pk))||void 0===m?void 0:m.badge)?q`
                    <div class="parameter-badge">${null===(f=this._visualModifiers.get(e.pk))||void 0===f?void 0:f.badge}</div>
                `:""}
                
                <!-- Icon from parameter condition -->
                ${(null===(b=this._visualModifiers.get(e.pk))||void 0===b?void 0:b.icon)?q`
                    <ha-icon icon="${null===(y=this._visualModifiers.get(e.pk))||void 0===y?void 0:y.icon}" class="parameter-icon"></ha-icon>
                `:""}

                ${(null===(_=this.config)||void 0===_?void 0:_.debug)?q`
                    <div class="part-debug">
                        <div>ID: ${e.pk}</div>
                        <div>Source: ${e.source||"unknown"}</div>
                    </div>
                `:""}
            </div>
        `}_getContainerStyle(e){const t=this._visualModifiers.get(e)||{},i=[];return t.highlight&&i.push(`background-color: ${t.highlight}`),t.border&&i.push(`border: 2px solid ${t.border}`),"high"===t.priority?(i.push("transform: scale(1.02)"),i.push("z-index: 10")):"low"===t.priority&&i.push("opacity: 0.8"),i.join(";")}_getTextStyle(e){const t=this._visualModifiers.get(e)||{};return t.textColor?`color: ${t.textColor}`:""}_handleImageError(e){e.target.src="/local/inventree-card/placeholder.png"}};var xi,Si;ki.styles=[$i],c([be()],ki.prototype,"_visualModifiers",void 0),c([be()],ki.prototype,"_actionButtons",void 0),ki=c([ge("inventree-list-layout")],ki),function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(xi||(xi={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(Si||(Si={}));var Ci=function(e,t,i,r){r=r||{},i=null==i?{}:i;var a=new Event(t,{bubbles:void 0===r.bubbles||r.bubbles,cancelable:Boolean(r.cancelable),composed:void 0===r.composed||r.composed});return a.detail=i,e.dispatchEvent(a),a},Pi=function(e){Ci(window,"haptic",e)};class Ei{constructor(e){this.hass=e,console.debug("🌈 WLED Service: Initialized")}async toggleLED(e){try{if(!e)throw Pi("failure"),new Error("No entity_id provided");const t=this.hass.states[e];if(!t)throw Pi("failure"),new Error(`Entity ${e} not found`);await this.hass.callService("light","on"===t.state?"turn_off":"turn_on",{entity_id:e}),Pi("success")}catch(e){throw Pi("failure"),console.error("Failed to toggle LED:",e),e}}async locatePart(e,t){var i,r,a;try{if(console.debug("🌈 WLED: Starting locate part process",{part:e,config:t}),!t.entity_id)throw Pi("failure"),new Error("No entity_id configured for WLED");const s=null===(r=null===(i=e.parameters)||void 0===i?void 0:i.find((e=>{var i;return(null===(i=e.template_detail)||void 0===i?void 0:i.name)===t.parameter_name})))||void 0===r?void 0:r.data;if(!s)throw new Error(`No ${t.parameter_name} parameter found for part`);const o=parseInt(s);console.debug("🌈 WLED: Using LED position:",o);const n=this.hass.states[t.entity_id];if(!n)throw new Error(`Entity ${t.entity_id} not found`);const c=(null===(a=t.ip_address)||void 0===a?void 0:a.replace("http://",""))||"192.168.0.61";console.debug("🌈 WLED IP:",c);const l="on"===n.state;await this.hass.callService("rest_command","wled_segment",{url:`http://${c}/json/state`,payload:JSON.stringify(l?{on:!1}:{on:!0,bri:t.intensity||128,seg:[{id:0,start:o-1,stop:o,col:[[255,0,0],[0,0,0],[0,0,0]],fx:0}]})}),Pi("success")}catch(e){throw Pi("failure"),console.error("Failed to locate part with WLED:",e),e}}}class Ii{constructor(e){this.hass=e,console.debug("🖨️ Print Service: Initialized")}async printLabel(e,t){try{const i="number"==typeof e?e:e.pk,r=void 0!==(null==t?void 0:t.template_id)?Number(t.template_id):2,a=(null==t?void 0:t.plugin)||"zebra";if(console.log(`🖨️ Printing label for part ${i} using template ${r} and plugin ${a}`),console.log("🖨️ Part object:",e),console.log("🖨️ Config object:",t),!i)throw new Error("Part ID is required");const s={item_id:Number(i),template_id:Number(r),plugin:a};console.log("🖨️ Print parameters:",s);const o=await this.hass.callService("inventree","print_label",s);console.log("🖨️ Print response:",o)}catch(e){throw console.error("Failed to print label:",e),e}}}class Ti{constructor(e){this.hass=e}async adjustStock(e,t){try{const i=this.getEntityId(e);i&&(this.hass.states[i]=Object.assign(Object.assign({},this.hass.states[i]),{attributes:Object.assign(Object.assign({},this.hass.states[i].attributes),{items:this.hass.states[i].attributes.items.map((i=>i.pk===e.pk?Object.assign(Object.assign({},i),{in_stock:i.in_stock+t}):i))})})),await this.hass.callService("inventree","adjust_stock",{name:e.name,quantity:t})}catch(e){throw console.error("Failed to adjust stock:",e),e}}getEntityId(e){var t,i;return null!==(i=null===(t=Object.entries(this.hass.states).find((([t,i])=>{var r,a;return null===(a=null===(r=i.attributes)||void 0===r?void 0:r.items)||void 0===a?void 0:a.some((t=>t.pk===e.pk))})))||void 0===t?void 0:t[0])&&void 0!==i?i:null}}let Di=class extends ue{constructor(){super(),this._timers=new _e("PartView",!0),this.logger=e.getInstance(),console.log("🧩 Part View created")}updated(e){var t,i,r;super.updated(e),e.has("hass")&&this.hass&&(this.wledService=new Ei(this.hass),this.printService=new Ii(this.hass),this.stockService=new Ti(this.hass),this.logger.log("PartView","Services initialized")),e.has("partData")&&console.log("🧩 Part View received part data:",{partId:null===(t=this.partData)||void 0===t?void 0:t.pk,partName:null===(i=this.partData)||void 0===i?void 0:i.name,partSource:null===(r=this.partData)||void 0===r?void 0:r.source,hasPartData:!!this.partData})}render(){var e,t,i,r,a,s,o,n,c,l,d,h,u,p,g;if(!this.hass||!this.config||!this.partData)return console.log("⚠️ Part View missing required properties:",{hass:!!this.hass,config:!!this.config,partData:!!this.partData}),this.logger.log("PartView",`Missing required properties - hass: ${!!this.hass}, config: ${!!this.config}, partData: ${!!this.partData}`),q`<div class="error">Missing required properties</div>`;console.log("🧩 Rendering part:",this.partData.name),this.logger.log("PartView",`Rendering part ${this.partData.name}`);const v=this.partData,m=v.in_stock||0,f=m<=0?"no-stock":m<=(v.minimum_stock||5)?"low-stock":"in-stock",b=!1!==(null===(e=this.config.display)||void 0===e?void 0:e.show_image),y=!1!==(null===(t=this.config.display)||void 0===t?void 0:t.show_name),_=!1!==(null===(i=this.config.display)||void 0===i?void 0:i.show_stock),w=!0===(null===(r=this.config.display)||void 0===r?void 0:r.show_description),$=!1!==(null===(a=this.config.display)||void 0===a?void 0:a.show_buttons),k=!1!==(null===(o=null===(s=this.config)||void 0===s?void 0:s.display)||void 0===o?void 0:o.show_stock_status_border),x=!1!==(null===(c=null===(n=this.config)||void 0===n?void 0:n.display)||void 0===c?void 0:c.show_stock_status_colors),S=!0===(null===(d=null===(l=this.config)||void 0===l?void 0:l.display)||void 0===d?void 0:d.show_category),C=this.getStockStatus(),P=this.getStockColor(C);return q`
      <div class="part-container ${f}" style="
        --stock-color: ${P};
        --show-stock-indicator: ${k?"block":"none"};
        --stock-indicator-color: ${k?P:"transparent"};
      ">
        <div class="part-content">
          ${y?q`<div class="part-name">${v.name}</div>`:""}
          
          ${_?q`
            <div class="stock-value" style="
              --stock-background-color: ${x?P:"transparent"};
              --stock-text-color: ${x?"white":"var(--primary-text-color)"};
            ">
              ${m} in stock
            </div>
          `:""}
        </div>
        
        <div class="part-details">
          ${b&&v.thumbnail?q`
            <img src="${v.thumbnail}" alt="${v.name}" style="width: 100%; max-height: 150px; object-fit: contain;">
          `:""}
          
          ${S&&v.category_name?q`
            <div class="part-category">Category: ${v.category_name}</div>
          `:""}
          
          ${w&&v.description?q`
            <div class="part-description">${v.description}</div>
          `:""}
        </div>
        
        ${$?q`
          <div class="part-buttons">
            <button class="part-button" @click=${()=>this._adjustStock(1)}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>
            <button class="part-button" @click=${()=>this._adjustStock(-1)}>
              <ha-icon icon="mdi:minus"></ha-icon>
            </button>
            
            ${(null===(u=null===(h=this.config.services)||void 0===h?void 0:h.wled)||void 0===u?void 0:u.enabled)?q`
              <button class="part-button" @click=${this._locateInWLED}>
                <ha-icon icon="mdi:map-marker"></ha-icon>
              </button>
            `:""}
            
            ${(null===(g=null===(p=this.config.services)||void 0===p?void 0:p.print)||void 0===g?void 0:g.enabled)?q`
              <button class="part-button" @click=${this._printLabel}>
                <ha-icon icon="mdi:printer"></ha-icon>
              </button>
            `:""}
          </div>
        `:""}
        
        ${this.config.debug?q`
          <div class="debug-info">
            <div>ID: ${v.pk}</div>
            <div>Source: ${v.source||"unknown"}</div>
            <div>Stock: ${m} / ${v.minimum_stock||"none"}</div>
          </div>
        `:""}
      </div>
    `}async _adjustStock(e){if(this.partData&&this.stockService)try{await this.stockService.adjustStock(this.partData,e),this.logger.log("PartView",`Stock adjusted by ${e} for part ${this.partData.name}`)}catch(e){this.logger.error("PartView",`Failed to adjust stock: ${e}`)}else this.logger.warn("PartView","Cannot adjust stock - missing part data or service")}async _locateInWLED(){var e,t;if(this.partData&&this.wledService&&(null===(t=null===(e=this.config)||void 0===e?void 0:e.services)||void 0===t?void 0:t.wled))try{await this.wledService.locatePart(this.partData,this.config.services.wled),this.logger.log("PartView",`WLED location triggered for part ${this.partData.name}`)}catch(e){this.logger.error("PartView",`Failed to trigger WLED: ${e}`)}else this.logger.warn("PartView","Cannot locate in WLED - missing part data, service, or configuration")}async _printLabel(){var e,t;if(this.partData&&this.printService&&(null===(t=null===(e=this.config)||void 0===e?void 0:e.services)||void 0===t?void 0:t.print))try{await this.printService.printLabel(this.partData,this.config.services.print),this.logger.log("PartView",`Label print requested for part ${this.partData.name}`)}catch(e){this.logger.error("PartView",`Failed to print label: ${e}`)}else this.logger.warn("PartView","Cannot print label - missing part data, service, or configuration")}getStockStatus(){if(!this.partData)return"none";const e=this.partData.in_stock||0,t=this.partData.minimum_stock||0;return e<=0?"none":e<=t?"low":"good"}getStockColor(e){switch(e){case"none":return"var(--error-color, red)";case"low":return"var(--warning-color, orange)";case"good":return"var(--success-color, green)"}}disconnectedCallback(){super.disconnectedCallback(),this._quantityTimer&&(this._timers.clearTimeout(this._quantityTimer),this._quantityTimer=void 0),this._timers.clearAll()}};Di.styles=g`
    :host {
      display: block;
      width: 100%;
    }
    
    .part-container {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem;
      border-radius: var(--ha-card-border-radius, 4px);
      background: var(--ha-card-background, var(--card-background-color, white));
    }
    
    /* Top border indicator */
    .part-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background-color: var(--stock-indicator-color);
      display: var(--show-stock-indicator, block);
    }
    
    .part-name {
      font-weight: bold;
      font-size: 1.1em;
    }
    
    /* Stock value badge */
    .stock-value {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.9em;
      background-color: var(--stock-background-color, transparent);
      color: var(--stock-text-color, var(--primary-text-color));
    }
    
    .part-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .part-details {
      padding: 12px;
    }
    
    .part-description, .part-category {
      margin-top: 8px;
      font-size: 14px;
    }
    
    .part-buttons {
      display: flex;
      justify-content: flex-end;
      padding: 8px;
      gap: 8px;
      border-top: 1px solid var(--divider-color, #e0e0e0);
    }
    
    .part-button {
      background-color: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      border: none;
      border-radius: 4px;
      padding: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .no-stock {
      --stock-color: var(--error-color, #f44336);
    }
    
    .low-stock {
      --stock-color: var(--warning-color, #ff9800);
    }
    
    .in-stock {
      --stock-color: var(--success-color, #4caf50);
    }
    
    .part-container.no-stock .part-header {
      background-color: var(--stock-color);
    }
    
    .part-container.low-stock .part-header {
      background-color: var(--stock-color);
    }
    
    .part-container.in-stock .part-header {
      background-color: var(--stock-color);
    }
    
    .stock-indicator {
      height: 3px;
      width: 100%;
      margin-top: 4px;
    }

    .debug-info {
      background: rgba(0,0,0,0.05);
      padding: 8px;
      margin-top: 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
    }

    .error {
      padding: 16px;
      color: var(--error-color, #f44336);
      background: rgba(244, 67, 54, 0.1);
      border-radius: 4px;
    }
  `,c([fe({attribute:!1})],Di.prototype,"partData",void 0),c([fe({attribute:!1})],Di.prototype,"config",void 0),c([fe({attribute:!1})],Di.prototype,"hass",void 0),Di=c([ge("inventree-part-view")],Di);let Ai=class extends ue{render(){var e;if(!this.partData)return q``;const t=(null===(e=this.config)||void 0===e?void 0:e.display)||{};return q`
      <div class="part-details">
        <!-- Name -->
        ${!1!==t.show_name?q`
          <div class="part-name">${this.partData.name}</div>
        `:""}
        
        <!-- Description -->
        ${t.show_description&&this.partData.description?q`
          <div class="part-description">${this.partData.description}</div>
        `:""}
        
        <!-- Stock -->
        ${!1!==t.show_stock?q`
          <div class="part-stock">
            Stock: ${this.partData.in_stock}${this.partData.minimum_stock&&this.partData.minimum_stock>0?` / Min: ${this.partData.minimum_stock}`:""}
          </div>
        `:""}
        
        <!-- Parameters -->
        ${!1!==t.show_parameters&&this.partData.parameters&&this.partData.parameters.length>0?q`
          <div class="part-parameters">
            ${this.partData.parameters.map((e=>{var t,i;return q`
              <div class="part-parameter">
                <span class="param-name">${(null===(t=e.template_detail)||void 0===t?void 0:t.name)||"Param"}:</span>
                <span class="param-value">${e.data}${(null===(i=e.template_detail)||void 0===i?void 0:i.units)?` ${e.template_detail.units}`:""}</span>
              </div>
            `}))}
          </div>
        `:""}
      </div>
    `}};Ai.styles=g`
    .part-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow: hidden;
    }

    .part-name {
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .part-description {
      font-size: 0.9em;
      opacity: 0.8;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .part-stock {
      font-size: 0.9em;
      font-weight: 500;
    }

    .part-parameters {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 4px;
      font-size: 0.8em;
    }

    .part-parameter {
      display: flex;
      justify-content: space-between;
    }

    .param-name {
      font-weight: 500;
      margin-right: 4px;
    }
  `,c([fe({attribute:!1})],Ai.prototype,"partData",void 0),c([fe({attribute:!1})],Ai.prototype,"config",void 0),Ai=c([ge("inventree-part-details")],Ai);let Ri=class extends ue{constructor(){super(...arguments),this.layout="grid"}render(){var e;return this.partData?(this.layout=(null===(e=this.config)||void 0===e?void 0:e.view_type)||"grid",q`
      <div class="thumbnail-wrapper">
        ${this.partData.thumbnail?q`
          <img class="thumbnail-image" src="${this.partData.thumbnail}" alt="${this.partData.name}" />
        `:q`
          <div class="thumbnail-placeholder">
            <span>${this.partData.name.substring(0,2).toUpperCase()}</span>
          </div>
        `}
      </div>
    `):q``}};Ri.styles=g`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .thumbnail-wrapper {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
      background: var(--secondary-background-color);
      border-radius: 8px;
    }

    .thumbnail-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: transform 0.2s ease-in-out;
    }

    .thumbnail-image:hover {
      transform: scale(1.05);
    }

    .thumbnail-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--secondary-text-color);
    }

    /* Grid specific */
    :host([layout="grid"]) .thumbnail-wrapper {
      aspect-ratio: 1;
      max-height: 150px;
    }

    /* List specific */
    :host([layout="list"]) .thumbnail-wrapper {
      width: 60px;
      height: 60px;
    }

    /* Detail specific */
    :host([layout="detail"]) .thumbnail-wrapper {
      max-height: 200px;
    }
  `,c([fe({attribute:!1})],Ri.prototype,"partData",void 0),c([fe({attribute:!1})],Ri.prototype,"config",void 0),c([fe({reflect:!0})],Ri.prototype,"layout",void 0),Ri=c([ge("inventree-part-thumbnail")],Ri);let Li=class extends ue{constructor(){super(),this.showImage=!0,this.showName=!0,this.showStock=!0,this.showDescription=!1,this.showCategory=!1,this.textStyle="",this.parts=[],this.view_type="detail",this.columns=4,this.grid_spacing=8,this.item_height=40,this.logger=e.getInstance(),console.log("✅ Part Container created with ID:",this.id||"unknown")}updated(e){var t,i,r;super.updated(e),e.has("config")&&(this.logger.log("PartContainer","Config changed",{category:"parts",subsystem:"container"}),this.config&&(this.view_type=this.config.view_type||"detail",this.columns=this.config.columns||4,this.grid_spacing=this.config.grid_spacing||8,"string"==typeof this.config.item_height?this.item_height=parseInt(this.config.item_height,10)||40:this.item_height=this.config.item_height||40),this.requestUpdate()),e.has("parts")&&(console.log("📦 Parts updated:",{count:(null===(t=this.parts)||void 0===t?void 0:t.length)||0,firstPart:(null===(i=this.parts)||void 0===i?void 0:i.length)>0?this.parts[0]:null}),this.logger.log("PartContainer",`Parts array updated with ${(null===(r=this.parts)||void 0===r?void 0:r.length)||0} parts`,{category:"parts",subsystem:"container"}))}render(){var e,t,i,r,a;return this.hass&&this.config?(console.log("🔄 Rendering part-container:",{viewType:this.view_type,partsCount:(null===(e=this.parts)||void 0===e?void 0:e.length)||0,showParts:this.parts&&this.parts.length>0}),this.logger.log("PartContainer",`Rendering with ${(null===(t=this.parts)||void 0===t?void 0:t.length)||0} parts, view_type: ${this.view_type}`,{category:"parts",subsystem:"container"}),this.parts&&0!==this.parts.length?"grid"===this.view_type?q`
        <inventree-grid-layout
          .hass=${this.hass}
          .config=${this.config}
          .parts=${this.parts}
        ></inventree-grid-layout>
      `:"list"===this.view_type?q`
        <inventree-list-layout
          .hass=${this.hass}
          .config=${this.config}
          .parts=${this.parts}
        ></inventree-list-layout>
      `:"parts"===this.view_type?q`
        <inventree-parts-layout
          .hass=${this.hass}
          .config=${this.config}
          .parts=${this.parts}
        ></inventree-parts-layout>
      `:q`
        <div class="container detail">
          ${this.parts.map((e=>q`
            <inventree-part-view
              .hass=${this.hass}
              .config=${this.config}
              .partData=${e}
            ></inventree-part-view>
          `))}
          ${this.config.debug?q`
            <div class="debug-info">
              <div>View Type: ${this.view_type}</div>
              <div>Parts Count: ${(null===(r=this.parts)||void 0===r?void 0:r.length)||0}</div>
              <div>First Part: ${(null===(a=this.parts)||void 0===a?void 0:a.length)>0?this.parts[0].name:"none"}</div>
            </div>
          `:""}
        </div>
      `:q`
        <div class="no-parts">No parts available</div>
        ${this.config.debug?q`
          <div class="debug-info">
            <div>View Type: ${this.view_type}</div>
            <div>Parts Count: ${(null===(i=this.parts)||void 0===i?void 0:i.length)||0}</div>
            <div>Config: ${JSON.stringify(this.config).substring(0,100)}...</div>
          </div>
        `:""}
      `):(console.log("⚠️ Missing hass or config"),this.logger.log("PartContainer","Missing hass or config",{category:"parts",subsystem:"container"}),q``)}_handleImageError(e){e.target.src="/local/inventree-card/placeholder.png"}};Li.styles=g`
    :host {
      display: block;
      width: 100%;
      --default-spacing: 16px;
      --default-height: 64px;
    }

    .container {
      display: flex;
      flex-direction: column;
      width: 100%;
      box-sizing: border-box;
    }

    .container.grid {
      display: grid;
      grid-template-columns: repeat(var(--columns, 2), minmax(0, 1fr));
      gap: var(--grid-spacing, var(--default-spacing));
      padding: var(--grid-spacing, var(--default-spacing));
      overflow-y: auto;
      min-height: 0;
    }

    .container.list {
      display: flex;
      flex-direction: column;
      gap: var(--grid-spacing, var(--default-spacing));
      padding: var(--grid-spacing, var(--default-spacing));
    }

    .container.detail {
      padding: var(--grid-spacing, var(--default-spacing));
    }

    ::slotted(*) {
      min-height: var(--item-height, var(--default-height));
      width: 100%;
      box-sizing: border-box;
    }

    .part-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 8px;
      box-sizing: border-box;
    }

    .part-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .part-name {
      font-weight: 500;
      font-size: 1.1em;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .part-content {
      display: flex;
      flex: 1;
      gap: 8px;
    }

    .part-image-container {
      width: 80px;
      height: 80px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .part-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .part-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow: hidden;
    }

    .part-stock {
      font-weight: 500;
    }

    .part-description {
      font-size: 0.9em;
      color: var(--secondary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .part-category {
      font-size: 0.8em;
      color: var(--secondary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .no-parts {
      padding: 16px;
      text-align: center;
      color: var(--secondary-text-color);
    }

    .debug-info {
      background: rgba(0,0,0,0.05);
      padding: 8px;
      margin-top: 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
    }
  `,c([fe({attribute:!1})],Li.prototype,"hass",void 0),c([fe({attribute:!1})],Li.prototype,"config",void 0),c([fe({type:Boolean})],Li.prototype,"showImage",void 0),c([fe({type:Boolean})],Li.prototype,"showName",void 0),c([fe({type:Boolean})],Li.prototype,"showStock",void 0),c([fe({type:Boolean})],Li.prototype,"showDescription",void 0),c([fe({type:Boolean})],Li.prototype,"showCategory",void 0),c([fe({type:String})],Li.prototype,"textStyle",void 0),c([fe({type:Array})],Li.prototype,"parts",void 0),c([fe({type:String})],Li.prototype,"view_type",void 0),c([fe({type:Number})],Li.prototype,"columns",void 0),c([fe({type:Number})],Li.prototype,"grid_spacing",void 0),c([fe({type:Number})],Li.prototype,"item_height",void 0),Li=c([ge("inventree-part-container")],Li);const Mi=g`
    .button-container {
        display: flex;
        gap: 8px;
        margin-top: 12px;
        justify-content: center;
    }

    .action-button {
        padding: 8px 12px;
        border-radius: 4px;
        border: none;
        background: var(--button-color, var(--primary-color));
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    }

    .action-button:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.14), 0 2px 3px rgba(0,0,0,0.28);
    }

    .action-button:active {
        filter: brightness(0.9);
        transform: translateY(1px);
        box-shadow: 0 1px 2px rgba(0,0,0,0.10), 0 1px 1px rgba(0,0,0,0.20);
    }

    .action-button.compact {
        padding: 4px 8px;
        font-size: 12px;
    }

    .action-button.icon {
        border-radius: 50%;
        width: 36px;
        height: 36px;
        padding: 0;
        min-width: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .action-button.icon ha-icon {
        --mdc-icon-size: 20px;
    }

    .action-button.active {
        box-shadow: 0 0 8px var(--button-color, var(--primary-color));
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0% {
            box-shadow: 0 0 8px var(--button-color, var(--primary-color));
        }
        50% {
            box-shadow: 0 0 16px var(--button-color, var(--primary-color));
        }
        100% {
            box-shadow: 0 0 8px var(--button-color, var(--primary-color));
        }
    }
`;let Fi=class extends ue{constructor(){super(...arguments),this.processedButtons=[],this.logger=e.getInstance(),this.stockAdjustmentTimeout=null,this.pendingAdjustment=0}get activePart(){return this.partData||this.partItem}updated(e){var t,i,r,a,s,o;super.updated(e),e.has("hass")&&this.hass&&(this.stockService=new Ti(this.hass),this.wledService=new Ei(this.hass),this.printService=new Ii(this.hass)),(e.has("partData")||e.has("partItem")||e.has("config"))&&(this.logger.log("PartButtons","Config or part changed, updating processed buttons"),this.logger.log("PartButtons","WLED enabled: "+((null===(r=null===(i=null===(t=this.config)||void 0===t?void 0:t.services)||void 0===i?void 0:i.wled)||void 0===r?void 0:r.enabled)?"yes":"no"),{}),this.logger.log("PartButtons","Print enabled: "+((null===(o=null===(s=null===(a=this.config)||void 0===a?void 0:a.services)||void 0===s?void 0:s.print)||void 0===o?void 0:o.enabled)?"yes":"no"),{}),this.processedButtons=this.getButtonConfig())}connectedCallback(){super.connectedCallback(),this.processedButtons=this.getButtonConfig()}async handleClick(e){var t,i,r,a;const s=this.activePart;if(s)switch(e.type){case"increment":case"decrement":if(!this.stockService)return;const o="decrement"===e.type?-1*(e.value||1):e.value||1,n=s.in_stock;this.pendingAdjustment+=o,this.dispatchEvent(new CustomEvent("adjust-stock",{detail:{item:s,amount:o,originalStock:n,pendingTotal:this.pendingAdjustment},bubbles:!0,composed:!0})),this.stockAdjustmentTimeout&&clearTimeout(this.stockAdjustmentTimeout),this.stockAdjustmentTimeout=setTimeout((async()=>{try{const e=this.pendingAdjustment;this.pendingAdjustment=0,this.stockService&&s&&(await this.stockService.adjustStock(s,e),s.in_stock+=e,this.dispatchEvent(new CustomEvent("adjust-stock-success",{detail:{item:s,amount:e},bubbles:!0,composed:!0})))}catch(e){this.dispatchEvent(new CustomEvent("adjust-stock-error",{detail:{item:s,error:e,originalStock:n},bubbles:!0,composed:!0})),this.pendingAdjustment=0}}),1500);break;case"locate":if(!this.wledService)return;try{const e=(null===(i=null===(t=this.config)||void 0===t?void 0:t.services)||void 0===i?void 0:i.wled)||{enabled:!0,entity_id:"light.wled_inventory",parameter_name:"led_xaxis"};await this.wledService.locatePart(s,e)}catch(e){console.error("Failed to locate part:",e)}break;case"print":if(!this.printService)return;try{const e=(null===(a=null===(r=this.config)||void 0===r?void 0:r.services)||void 0===a?void 0:a.print)||{template_id:2,plugin:"zebra"};await this.printService.printLabel(s,e)}catch(e){console.error("Failed to print label:",e)}break;case"custom":if(!this.hass||!e.service)return;try{await this.hass.callService(e.service.split(".")[0],e.service.split(".")[1],Object.assign(Object.assign({},e.service_data),{part_id:s.pk}))}catch(e){console.error("Failed to call custom service:",e)}}}isLEDActiveForPart(){var e,t,i,r,a,s;const o=this.activePart;if(!(this.hass&&this.config&&(null===(t=null===(e=this.config.services)||void 0===e?void 0:e.wled)||void 0===t?void 0:t.entity_id)&&o))return!1;const n=this.hass.states[this.config.services.wled.entity_id];if(!n||"on"!==n.state)return!1;const c=null===(r=null===(i=o.parameters)||void 0===i?void 0:i.find((e=>{var t,i,r,a;return(null===(t=e.template_detail)||void 0===t?void 0:t.name)===(null===(a=null===(r=null===(i=this.config)||void 0===i?void 0:i.services)||void 0===r?void 0:r.wled)||void 0===a?void 0:a.parameter_name)})))||void 0===r?void 0:r.data;if(!c)return!1;const l=null===(s=null===(a=n.attributes)||void 0===a?void 0:a.seg)||void 0===s?void 0:s[0];if(!l)return!1;const d=parseInt(c);return l.start+1===d}render(){return this.activePart&&this.processedButtons.length?q`
            <div class="button-container">
                ${this.processedButtons.map((e=>q`
                    <button 
                        class="action-button ${e.style||"normal"} ${"locate"===e.type&&this.isLEDActiveForPart()?"active":""}"
                        style="--button-color: ${e.color||this.getButtonColor(e.type||"default",this.isLEDActiveForPart())}"
                        @click=${()=>this.handleClick(e)}
                        title="${this.getButtonTitle(e)}"
                    >
                        ${e.icon?q`<ha-icon icon="${e.icon}"></ha-icon>`:e.label||this.getDefaultLabel(e)}
                    </button>
                `))}
            </div>
        `:q``}getButtonColor(e,t=!1){if("locate"===e&&t)return"var(--warning-color)";switch(e){case"increment":return"var(--success-color)";case"decrement":return"var(--error-color)";case"locate":return"var(--info-color)";default:return"var(--primary-color)"}}getButtonTitle(e){switch(e.type){case"increment":return`Add ${e.value||1}`;case"decrement":return`Remove ${e.value||1}`;case"locate":return"Locate part";case"print":return"Print label";case"custom":return e.label||"Custom action";default:return""}}getDefaultLabel(e){switch(e.type){case"increment":return`+${e.value||1}`;case"decrement":return`-${e.value||1}`;case"locate":return"Locate";case"print":return"Print";default:return""}}getButtonConfig(){var e,t,i,r,a,s,o,n,c,l,d,h;const u=[];let p=1;switch((null===(t=null===(e=this.config)||void 0===e?void 0:e.buttons)||void 0===t?void 0:t.preset)||"default"){case"precise":p=.1;break;case"bulk":p=10;break;case"custom":if(null===(r=null===(i=this.config)||void 0===i?void 0:i.buttons)||void 0===r?void 0:r.custom_buttons)return this.config.buttons.custom_buttons;break;default:p=1}u.push({type:"decrement",value:p,style:"icon",icon:"mdi:minus",color:"var(--error-color)"}),u.push({type:"increment",value:p,style:"icon",icon:"mdi:plus",color:"var(--success-color)"});return(!0===(null===(o=null===(s=null===(a=this.config)||void 0===a?void 0:a.services)||void 0===s?void 0:s.wled)||void 0===o?void 0:o.enabled)||!0===(null===(c=null===(n=this.config)||void 0===n?void 0:n.wled)||void 0===c?void 0:c.enabled))&&u.push({type:"locate",style:"icon",icon:"mdi:map-marker-radius",color:"var(--info-color)",value:0,label:"Locate"}),!0===(null===(h=null===(d=null===(l=this.config)||void 0===l?void 0:l.services)||void 0===d?void 0:d.print)||void 0===h?void 0:h.enabled)&&u.push({type:"print",style:"icon",icon:"mdi:printer",color:"var(--primary-color)",value:0,label:"Print"}),u}};Fi.styles=[Mi],c([fe({attribute:!1})],Fi.prototype,"partData",void 0),c([fe({attribute:!1})],Fi.prototype,"partItem",void 0),c([fe({attribute:!1})],Fi.prototype,"config",void 0),c([fe({attribute:!1})],Fi.prototype,"hass",void 0),c([be()],Fi.prototype,"processedButtons",void 0),Fi=c([ge("inventree-part-buttons")],Fi);const Ni=g`
    :host {
        display: block;
    }

    .variant-grid-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
    }

    .variant-grid-item {
        background-color: var(--card-background-color);
        border-radius: var(--ha-card-border-radius, 4px);
        overflow: hidden;
        box-shadow: var(--ha-card-box-shadow, 0px 2px 4px rgba(0, 0, 0, 0.1));
        transition: all 0.3s ease;
        position: relative;
    }

    .variant-grid-item:hover {
        box-shadow: var(--ha-card-box-shadow, 0px 4px 8px rgba(0, 0, 0, 0.2));
        transform: translateY(-2px);
    }

    .variant-header {
        padding: 12px;
        border-bottom: 1px solid var(--divider-color);
    }

    .variant-name {
        margin: 0;
        font-size: 1.1em;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .variant-content {
        display: flex;
        padding: 12px;
    }

    .variant-image-container {
        width: 80px;
        height: 80px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
    }

    .variant-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }

    .variant-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .variant-stock {
        font-weight: 500;
    }

    .variant-description {
        font-size: 0.9em;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .variant-actions {
        padding: 12px;
        border-top: 1px solid var(--divider-color);
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    /* Parameter badge and icon */
    .parameter-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        background-color: var(--primary-color);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8em;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        z-index: 10;
    }

    .parameter-icon {
        position: absolute;
        top: 8px;
        right: 8px;
        --mdc-icon-size: 24px;
        color: var(--primary-color);
        z-index: 10;
    }

    /* Parameter action buttons */
    .parameter-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    .parameter-action-button {
        padding: 4px 8px;
        border-radius: 4px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        transition: all 0.2s ease;
        font-size: 0.8em;
    }

    .parameter-action-button:hover {
        filter: brightness(1.1);
    }

    .parameter-action-button ha-icon {
        --mdc-icon-size: 16px;
    }

    /* Dropdown view styles */
    .variant-dropdown {
        margin-bottom: 16px;
    }

    /* Tabs view styles */
    .variant-tabs {
        display: flex;
        overflow-x: auto;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
    }

    .variant-tab {
        padding: 8px 16px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
    }

    .variant-tab.active {
        border-bottom-color: var(--primary-color);
        color: var(--primary-color);
    }

    /* List view styles */
    .variant-list-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .variant-list-item {
        display: flex;
        padding: 12px;
        background-color: var(--card-background-color);
        border-radius: var(--ha-card-border-radius, 4px);
        box-shadow: var(--ha-card-box-shadow, 0px 2px 4px rgba(0, 0, 0, 0.1));
    }

    /* Tree view styles */
    .variant-tree {
        margin-bottom: 16px;
    }

    .variant-tree-item {
        margin-bottom: 8px;
    }

    .variant-tree-parent {
        font-weight: 500;
        margin-bottom: 4px;
        cursor: pointer;
    }

    .variant-tree-children {
        margin-left: 16px;
        padding-left: 8px;
        border-left: 1px solid var(--divider-color);
    }

    @media (max-width: 600px) {
        .variant-grid-container {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
    }

    @media (max-width: 400px) {
        .variant-grid-container {
            grid-template-columns: 1fr;
        }
    }
`;let Ui=class extends _i{constructor(){super(...arguments),this.parts=[],this._selectedVariantGroup=null,this._selectedVariant=null,this._processedVariants=[],this._visualModifiers=new Map,this._actionButtons=new Map,this._expandedGroups=new Set,this._webSocketErrorCount=0,this.logger=e.getInstance(),this.processedItems=[],this._timers=new _e("VariantLayout",!0)}connectedCallback(){super.connectedCallback(),this._setupListeners()}_setupListeners(){var e,t;this._cleanupListeners();switch((null===(t=null===(e=this.config)||void 0===e?void 0:e.direct_api)||void 0===t?void 0:t.method)||"polling"){case"websocket":this._setupWebSocketConnection();break;case"hass":this._setupEntityListener();break;default:this._setupParameterListener()}}_setupParameterListener(){this._paramChangeListener=e=>{this._handleParameterChange(e)},window.addEventListener("inventree-parameter-changed",this._paramChangeListener),console.log("📝 Variant Layout: Set up parameter change listener for polling method")}_setupEntityListener(){const e=e=>{var t;e.detail&&e.detail.entityId===(null===(t=this.config)||void 0===t?void 0:t.entity)&&(console.log("📝 Variant Layout: Received entity update event",e.detail),this._processVariants(),this._updateVisualModifiers(),this.requestUpdate())};window.addEventListener("inventree-entity-updated",e),this._entityUpdateListener=e,console.log("📝 Variant Layout: Set up entity update listener for HASS method")}_setupWebSocketConnection(){var e,t;if(!(null===(t=null===(e=this.config)||void 0===e?void 0:e.direct_api)||void 0===t?void 0:t.enabled))return void console.error("📝 Variant Layout: Cannot set up WebSocket connection - Direct API not enabled");let i=this.config.direct_api.websocket_url||"";if(i)console.log(`📝 Variant Layout: Using provided WebSocket URL: ${i}`);else{if(!this.config.direct_api.url)return void console.error("📝 Variant Layout: Cannot set up WebSocket connection - missing URL");i=this.config.direct_api.url,i=i.replace(/^http:\/\//,"ws://").replace(/^https:\/\//,"wss://"),i.endsWith("/")&&(i=i.slice(0,-1)),i+="/api/ws",console.log(`📝 Variant Layout: No WebSocket URL provided, constructed ${i} from API URL`)}console.log(`📝 Variant Layout: Setting up WebSocket connection to ${i}`);try{this._webSocketConnection=new WebSocket(i),this._webSocketConnection.onopen=this._handleWebSocketOpen.bind(this),this._webSocketConnection.onmessage=this._handleWebSocketMessage.bind(this),this._webSocketConnection.onerror=this._handleWebSocketError.bind(this),this._webSocketConnection.onclose=this._handleWebSocketClose.bind(this),this._webSocketKeepAliveTimer=this._timers.setInterval((()=>{this._sendWebSocketKeepAlive()}),3e4),this._setupIdleRenderTimer()}catch(e){console.error("📝 Variant Layout: Error setting up WebSocket connection",e)}}_setupIdleRenderTimer(){var e,t;const i=(null===(t=null===(e=this.config)||void 0===e?void 0:e.direct_api)||void 0===t?void 0:t.idle_render_time)||60,r=Math.max(1e3*i,1e4);console.log(`📝 Variant Layout: Setting up idle render timer with interval ${i} seconds`),this._idleRenderTimer&&this._timers.clearInterval(this._idleRenderTimer),this._idleRenderTimer=this._timers.setInterval((()=>{console.log("📝 Variant Layout: Performing idle refresh"),this._processVariants(),this._updateVisualModifiers(),this.requestUpdate()}),r)}_handleWebSocketOpen(e){var t,i;console.log("📝 Variant Layout: WebSocket connection established"),this._webSocketErrorCount=0,(null===(i=null===(t=this.config)||void 0===t?void 0:t.direct_api)||void 0===i?void 0:i.api_key)&&this._sendWebSocketAuthentication(),this._sendWebSocketSubscription()}_sendWebSocketAuthentication(){var e,t;if(!this._webSocketConnection||this._webSocketConnection.readyState!==WebSocket.OPEN)return;const i={type:"authenticate",token:null===(t=null===(e=this.config)||void 0===e?void 0:e.direct_api)||void 0===t?void 0:t.api_key};this._webSocketConnection.send(JSON.stringify(i)),console.log("📝 Variant Layout: Sent WebSocket authentication")}_sendWebSocketSubscription(){if(!this._webSocketConnection||this._webSocketConnection.readyState!==WebSocket.OPEN)return;this._webSocketConnection.send(JSON.stringify({type:"subscribe",events:["part_partparameter.saved"]})),console.log("📝 Variant Layout: Subscribed to parameter events")}_sendWebSocketKeepAlive(){if(!this._webSocketConnection||this._webSocketConnection.readyState!==WebSocket.OPEN)return;const e={type:"ping",source:"client",time:Date.now()/1e3};this._webSocketConnection.send(JSON.stringify(e))}_handleWebSocketMessage(e){var t;try{const i=JSON.parse(e.data);"event"===i.type&&"part_partparameter.saved"===i.event?(console.log("📝 Variant Layout: Received parameter update via WebSocket",i.data),this._processVariants(),this._updateVisualModifiers(),this.requestUpdate(),this._notifyParameterChanged(i.data.parent_id,i.data.parameter_name,i.data.parameter_value)):"ping"===i.type&&"server"===i.source?(null===(t=this._webSocketConnection)||void 0===t?void 0:t.readyState)===WebSocket.OPEN&&this._webSocketConnection.send(JSON.stringify({type:"pong",source:"client",time:Date.now()/1e3})):"welcome"===i.type&&console.log("📝 Variant Layout: Connected to InvenTree WebSocket Server:",i)}catch(t){console.error("📝 Variant Layout: Error handling WebSocket message",t,e.data)}}_notifyParameterChanged(e,t,i){var r;const a=new CustomEvent("inventree-parameter-changed",{detail:{entityId:null===(r=this.config)||void 0===r?void 0:r.entity,partId:e,parameter:t,value:i,source:"websocket"},bubbles:!0,composed:!0});window.dispatchEvent(a)}_handleWebSocketError(e){console.error("📝 Variant Layout: WebSocket error",e),this._webSocketErrorCount++}_handleWebSocketClose(e){console.log(`📝 Variant Layout: WebSocket connection closed: ${e.code} ${e.reason}`),this._webSocketKeepAliveTimer&&(this._timers.clearInterval(this._webSocketKeepAliveTimer),this._webSocketKeepAliveTimer=void 0),this._idleRenderTimer&&(this._timers.clearInterval(this._idleRenderTimer),this._idleRenderTimer=void 0);const t=Math.min(5e3*Math.pow(1.5,this._webSocketErrorCount),6e4);console.log(`📝 Variant Layout: Will attempt to reconnect in ${t/1e3} seconds`),this._webSocketReconnectTimer=this._timers.setTimeout((()=>{console.log("📝 Variant Layout: Attempting to reconnect WebSocket"),this._setupWebSocketConnection()}),t)}_cleanupListeners(){this._paramChangeListener&&(window.removeEventListener("inventree-parameter-changed",this._paramChangeListener),this._paramChangeListener=void 0),this._entityUpdateListener&&(window.removeEventListener("inventree-entity-updated",this._entityUpdateListener),this._entityUpdateListener=void 0),this._webSocketConnection&&(this._webSocketConnection.close(),this._webSocketConnection=void 0),this._webSocketReconnectTimer&&(this._timers.clearTimeout(this._webSocketReconnectTimer),this._webSocketReconnectTimer=void 0),this._webSocketKeepAliveTimer&&(this._timers.clearInterval(this._webSocketKeepAliveTimer),this._webSocketKeepAliveTimer=void 0),this._idleRenderTimer&&(this._timers.clearInterval(this._idleRenderTimer),this._idleRenderTimer=void 0)}disconnectedCallback(){super.disconnectedCallback(),this._cleanupListeners(),this._timers.clearAll()}_handleParameterChange(e){var t;const i=e;i.detail&&(i.detail.entityId!==(null===(t=this.config)||void 0===t?void 0:t.entity)&&"direct-api"!==i.detail.source&&"websocket"!==i.detail.source||(console.log(`📝 Variant Layout: Parameter ${i.detail.parameter} changed, processing variants`),this._processVariants(),this._updateVisualModifiers(),this.requestUpdate()))}updated(e){super.updated(e),e.has("parts")&&this.parts&&(this._processVariants(),this._updateVisualModifiers()),e.has("hass")&&this.hass&&this._parameterService&&(this._parameterService.updateHass(this.hass),this._updateVisualModifiers()),e.has("config")&&this.config&&(this._processVariants(),this._updateVisualModifiers(),this._setupListeners())}_processVariants(){if(!this.parts||!this.config)return;const e=[],t=new Map;this.parts.forEach((e=>{var i;const r=String(e.category_name||"Ungrouped");t.has(r)||t.set(r,[]),null===(i=t.get(r))||void 0===i||i.push(e)})),t.forEach(((t,i)=>{if(t.length>0){const r=t[0],a=t.reduce(((e,t)=>e+(t.in_stock||0)),0);e.push({pk:r.pk,name:i,template:r,variants:t,thumbnail:r.thumbnail,in_stock:a,category_name:i,totalStock:a})}})),this._processedVariants=e,this.logger.log("Variants",`Processed ${e.length} variant groups`,{category:"layouts",subsystem:"variant"})}_updateVisualModifiers(){var e,t;if(!this.parts||!(null===(t=null===(e=this.config)||void 0===e?void 0:e.parameters)||void 0===t?void 0:t.enabled))return this._visualModifiers=new Map,void(this._actionButtons=new Map);this.processedItems=[...this.parts,...this._processedVariants],this.processedItems.forEach((e=>{var t,i,r,a;"pk"in e&&this._parameterService&&(this._visualModifiers.set(e.pk,this._parameterService.processConditions(e,(null===(i=null===(t=this.config)||void 0===t?void 0:t.parameters)||void 0===i?void 0:i.conditions)||[])),this._actionButtons.set(e.pk,this._parameterService.getActionButtons(`${e.pk}`,"",null===(a=null===(r=this.config)||void 0===r?void 0:r.parameters)||void 0===a?void 0:a.actions)))}))}_getContainerStyle(e){const t=this._visualModifiers.get(e);if(!t)return"";const i=[];return t.highlight&&i.push(`background-color: ${t.highlight}`),t.border&&i.push(`border: 2px solid ${t.border}`),i.join(";")}_getTextStyle(e){const t=this._visualModifiers.get(e);return t&&t.textColor?`color: ${t.textColor}`:""}_handleImageError(e){e.target.src="/local/inventree-card/placeholder.png"}render(){if(!this.parts||!this.config)return q`<div>No parts to display</div>`;const e=this.config.variant_view_type||"grid";return q`
            <!-- Variant layout rendering -->
            ${this._renderVariantGroups(e)}
        `}_renderVariantGroups(e){if(!this.parts||0===this.parts.length)return q`<div class="no-parts">No parts found</div>`;switch(e){case"tabs":return this._renderTabsView();case"list":return this._renderListView();case"tree":return this._renderTreeView();case"grid":return this._renderGridView();default:return this._renderDropdownView()}}_renderDropdownView(){return 0===this._processedVariants.length?q`<div class="no-variants">No variant groups found</div>`:q`
            <div class="variant-dropdown-container">
                <select 
                    class="variant-dropdown"
                    @change=${e=>this._selectVariantGroup(parseInt(e.target.value))}
                >
                    <option value="">Select a variant group</option>
                    ${this._processedVariants.map(((e,t)=>q`
                        <option value="${t}">${e.template.name}</option>
                    `))}
                </select>
                
                ${null!==this._selectedVariantGroup?q`
                    <div class="variant-details">
                        <h3>${this._processedVariants[this._selectedVariantGroup].template.name}</h3>
                        <div class="variant-list">
                            ${this._processedVariants[this._selectedVariantGroup].variants.map((e=>{if("hide"===(this._visualModifiers.get(e.pk)||{}).filter)return q``;const t=this._getContainerStyle(e.pk);return q`
                                    <div class="variant-item" style="${t}">
                                        <div class="variant-name" style="${this._getTextStyle(e.pk)}">${e.name}</div>
                                        <div class="variant-stock" style="${this._getTextStyle(e.pk)}">Stock: ${e.in_stock}</div>
                                        
                                        <!-- Parameter action buttons -->
                                        ${(this._actionButtons.get(e.pk)||[]).length>0?q`
                                            <div class="parameter-actions">
                                                ${(this._actionButtons.get(e.pk)||[]).map((e=>q`
                                                    <button 
                                                        class="parameter-action-button"
                                                        @click=${e.onClick}
                                                        title="${e.label}"
                                                    >
                                                        ${e.icon?q`<ha-icon icon="${e.icon}"></ha-icon>`:e.label}
                                                    </button>
                                                `))}
                                            </div>
                                        `:""}
                                    </div>
                                `}))}
                        </div>
                    </div>
                `:""}
            </div>
        `}_renderTabsView(){return 0===this._processedVariants.length?q`<div class="no-variants">No variant groups found</div>`:q`
            <div class="variant-tabs-container">
                <div class="variant-tabs">
                    ${this._processedVariants.map(((e,t)=>q`
                        <div 
                            class="variant-tab ${this._selectedVariantGroup===t?"active":""}"
                            @click=${()=>this._selectVariantGroup(t)}
                        >
                            ${e.template.name}
                        </div>
                    `))}
                </div>
                
                ${null!==this._selectedVariantGroup?q`
                    <div class="variant-details">
                        <div class="variant-list">
                            ${this._processedVariants[this._selectedVariantGroup].variants.map((e=>{if("hide"===(this._visualModifiers.get(e.pk)||{}).filter)return q``;const t=this._getContainerStyle(e.pk);return q`
                                    <div class="variant-item" style="${t}">
                                        <div class="variant-name" style="${this._getTextStyle(e.pk)}">${e.name}</div>
                                        <div class="variant-stock" style="${this._getTextStyle(e.pk)}">Stock: ${e.in_stock}</div>
                                        
                                        <!-- Parameter action buttons -->
                                        ${(this._actionButtons.get(e.pk)||[]).length>0?q`
                                            <div class="parameter-actions">
                                                ${(this._actionButtons.get(e.pk)||[]).map((e=>q`
                                                    <button 
                                                        class="parameter-action-button"
                                                        @click=${e.onClick}
                                                        title="${e.label}"
                                                    >
                                                        ${e.icon?q`<ha-icon icon="${e.icon}"></ha-icon>`:e.label}
                                                    </button>
                                                `))}
                                            </div>
                                        `:""}
                                    </div>
                                `}))}
                        </div>
                    </div>
                `:""}
            </div>
        `}_renderListView(){return 0===this._processedVariants.length?q`<div class="no-variants">No variant groups found</div>`:q`
            <div class="variant-list-container">
                ${this._processedVariants.map((e=>q`
                    <div class="variant-group">
                        <div class="variant-group-header">
                            <h3>${e.template.name}</h3>
                            <div class="variant-group-stock">Total Stock: ${e.totalStock}</div>
                        </div>
                        
                        <div class="variant-group-items">
                            ${e.variants.map((e=>{const t=this._visualModifiers.get(e.pk)||{};if("hide"===t.filter)return q``;const i=this._getContainerStyle(e.pk);return q`
                                    <div class="variant-list-item" style="${i}">
                                        <div class="variant-list-content">
                                            <div class="variant-name" style="${this._getTextStyle(e.pk)}">${e.name}</div>
                                            <div class="variant-stock" style="${this._getTextStyle(e.pk)}">Stock: ${e.in_stock}</div>
                                        </div>
                                        
                                        <div class="variant-list-actions">
                                            <inventree-part-buttons
                                                .hass=${this.hass}
                                .config=${this.config}
                                                .partData=${e}
                                            ></inventree-part-buttons>
                                            
                                            <!-- Parameter action buttons -->
                                            ${(this._actionButtons.get(e.pk)||[]).length>0?q`
                                                <div class="parameter-actions">
                                                    ${(this._actionButtons.get(e.pk)||[]).map((e=>q`
                                                        <button 
                                                            class="parameter-action-button"
                                                            @click=${e.onClick}
                                                            title="${e.label}"
                                                        >
                                                            ${e.icon?q`<ha-icon icon="${e.icon}"></ha-icon>`:e.label}
                                                        </button>
                                                    `))}
                                                </div>
                                            `:""}
                                        </div>
                                        
                                        <!-- Badge from parameter condition -->
                                        ${t.badge?q`
                                            <div class="parameter-badge">${t.badge}</div>
                                        `:""}
                                        
                                        <!-- Icon from parameter condition -->
                                        ${t.icon?q`
                                            <ha-icon icon="${t.icon}" class="parameter-icon"></ha-icon>
                                        `:""}
                                    </div>
                                `}))}
                        </div>
                    </div>
                `))}
            </div>
        `}_renderTreeView(){return 0===this._processedVariants.length?q`<div class="no-variants">No variant groups found</div>`:q`
            <div class="variant-tree-container">
                ${this._processedVariants.map(((e,t)=>q`
                    <div class="variant-tree-group">
                        <div 
                            class="variant-tree-parent" 
                            @click=${()=>this._toggleGroup(t)}
                        >
                            <span class="tree-toggle">${this._expandedGroups.has(t)?"▼":"►"}</span>
                            <span>${e.template.name} (${e.totalStock})</span>
                        </div>
                        
                        ${this._expandedGroups.has(t)?q`
                            <div class="variant-tree-children">
                                ${e.variants.map((e=>{const t=this._visualModifiers.get(e.pk)||{};if("hide"===t.filter)return q``;const i=this._getContainerStyle(e.pk);return q`
                                        <div class="variant-tree-item" style="${i}">
                                            <div class="variant-tree-content">
                                                <div class="variant-name" style="${this._getTextStyle(e.pk)}">${e.name}</div>
                                                <div class="variant-stock" style="${this._getTextStyle(e.pk)}">Stock: ${e.in_stock}</div>
                                            </div>
                                            
                                            <div class="variant-tree-actions">
                                                <inventree-part-buttons
                                                    .hass=${this.hass}
                                .config=${this.config}
                                                    .partData=${e}
                                                ></inventree-part-buttons>
                                                
                                                <!-- Parameter action buttons -->
                                                ${(this._actionButtons.get(e.pk)||[]).length>0?q`
                                                    <div class="parameter-actions">
                                                        ${(this._actionButtons.get(e.pk)||[]).map((e=>q`
                                                            <button 
                                                                class="parameter-action-button"
                                                                @click=${e.onClick}
                                                                title="${e.label}"
                                                            >
                                                                ${e.icon?q`<ha-icon icon="${e.icon}"></ha-icon>`:e.label}
                                                            </button>
                                                        `))}
                                                    </div>
                                                `:""}
                                            </div>
                                            
                                            <!-- Badge from parameter condition -->
                                            ${t.badge?q`
                                                <div class="parameter-badge">${t.badge}</div>
                                            `:""}
                                            
                                            <!-- Icon from parameter condition -->
                                            ${t.icon?q`
                                                <ha-icon icon="${t.icon}" class="parameter-icon"></ha-icon>
                                            `:""}
                                        </div>
                                    `}))}
                            </div>
                        `:""}
                    </div>
                `))}
            </div>
        `}_renderGridView(){return 0===this.parts.length?q`<div class="no-variants">No parts found</div>`:q`
            <div class="variant-grid-container">
                ${this.parts.map((e=>{const t=this._visualModifiers.get(e.pk)||{};if("hide"===t.filter)return q``;const i=this._getContainerStyle(e.pk);return q`
                        <div class="variant-grid-item" style="${i}">
                            <div class="variant-header">
                                <h3 class="variant-name" style="${this._getTextStyle(e.pk)}">${e.name}</h3>
                            </div>
                            
                            <div class="variant-content">
                                <div class="variant-image-container">
                                    <img 
                                        class="variant-image" 
                                        src="${e.thumbnail||"/local/inventree-card/placeholder.png"}" 
                                        alt="${e.name}"
                                        @error=${this._handleImageError}
                                    >
                                </div>
                                
                                <div class="variant-details">
                                    <div class="variant-stock" style="${this._getTextStyle(e.pk)}">
                                        Stock: ${e.in_stock||0}
                                    </div>
                                    
                                    ${e.description?q`
                                        <div class="variant-description" style="${this._getTextStyle(e.pk)}">
                                            ${e.description}
                                        </div>
                                    `:""}
                                </div>
                            </div>
                            
                            <div class="variant-actions">
                                <inventree-part-buttons
                                    .hass=${this.hass}
                                    .config=${this.config}
                                    .partData=${e}
                                ></inventree-part-buttons>
                                
                                <!-- Parameter action buttons -->
                                ${(this._actionButtons.get(e.pk)||[]).length>0?q`
                                    <div class="parameter-actions">
                                        ${(this._actionButtons.get(e.pk)||[]).map((e=>q`
                                            <button 
                                                class="parameter-action-button"
                                                @click=${e.onClick}
                                                title="${e.label}"
                                            >
                                                ${e.icon?q`<ha-icon icon="${e.icon}"></ha-icon>`:e.label}
                                            </button>
                                        `))}
                                    </div>
                                `:""}
                            </div>
                            
                            <!-- Badge from parameter condition -->
                            ${t.badge?q`
                                <div class="parameter-badge">${t.badge}</div>
                            `:""}
                            
                            <!-- Icon from parameter condition -->
                            ${t.icon?q`
                                <ha-icon icon="${t.icon}" class="parameter-icon"></ha-icon>
                            `:""}
                        </div>
                    `}))}
            </div>
        `}_selectVariantGroup(e){this._selectedVariantGroup=e}_toggleGroup(e){this._expandedGroups.has(e)?this._expandedGroups.delete(e):this._expandedGroups.add(e),this.requestUpdate()}};Ui.styles=[Ni],c([fe({attribute:!1})],Ui.prototype,"hass",void 0),c([fe({attribute:!1})],Ui.prototype,"config",void 0),c([fe({attribute:!1})],Ui.prototype,"parts",void 0),c([be()],Ui.prototype,"_selectedVariantGroup",void 0),c([be()],Ui.prototype,"_selectedVariant",void 0),c([be()],Ui.prototype,"_processedVariants",void 0),c([be()],Ui.prototype,"_visualModifiers",void 0),c([be()],Ui.prototype,"_actionButtons",void 0),c([be()],Ui.prototype,"_expandedGroups",void 0),Ui=c([ge("inventree-variant-layout")],Ui),customElements.get("inventree-variant-layout")||customElements.define("inventree-variant-layout",Ui);const Vi=g`
  /* Common styles */
  :host {
    display: block;
    width: 100%;
  }
  
  /* GRID VIEW */
  :host([variant-view="grid"]) .variant-grid {
    display: flex;
    flex-direction: column;
    gap: var(--grid-spacing, 8px);
  }
  
  :host([variant-view="grid"]) .variant-template {
    margin-bottom: var(--grid-spacing, 8px);
    padding: 12px;
    border-radius: 8px;
    background: var(--primary-background-color, #f0f0f0);
    box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
  }
  
  :host([variant-view="grid"]) .template-details {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  :host([variant-view="grid"]) .template-info {
    flex: 1;
  }
  
  :host([variant-view="grid"]) .template-stock {
    font-weight: bold;
    color: var(--primary-color, #03a9f4);
  }
  
  :host([variant-view="grid"]) .variants-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--grid-spacing, 8px);
  }
  
  :host([variant-view="grid"]) .variant-item {
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s;
  }
  
  :host([variant-view="grid"]) .variant-item:hover {
    transform: translateY(-2px);
  }
  
  /* LIST VIEW */
  :host([variant-view="list"]) .variant-list {
    display: flex;
    flex-direction: column;
    gap: var(--grid-spacing, 8px);
  }
  
  :host([variant-view="list"]) .variant-template {
    padding: 12px;
    border-radius: 8px;
    background: var(--primary-background-color, #f0f0f0);
    margin-bottom: var(--grid-spacing, 8px);
  }
  
  :host([variant-view="list"]) .template-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }
  
  :host([variant-view="list"]) .template-stock {
    font-weight: bold;
    color: var(--primary-color, #03a9f4);
  }
  
  :host([variant-view="list"]) .variants-list {
    border-radius: 8px;
    overflow: hidden;
    background: var(--card-background-color, #fff);
  }
  
  :host([variant-view="list"]) .variant-list-header {
    display: grid;
    grid-template-columns: 2fr 1fr 3fr;
    padding: 8px 12px;
    background: var(--secondary-background-color, #f0f0f0);
    font-weight: bold;
  }
  
  :host([variant-view="list"]) .variant-list-item {
    display: grid;
    grid-template-columns: 2fr 1fr 3fr;
    padding: 8px 12px;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
  }
  
  :host([variant-view="list"]) .variant-name {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  /* TREE VIEW */
  :host([variant-view="tree"]) .variant-tree {
    display: flex;
    flex-direction: column;
  }
  
  :host([variant-view="tree"]) .tree-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  :host([variant-view="tree"]) .tree-template {
    padding: 12px;
    border-radius: 8px;
    background: var(--primary-background-color, #f0f0f0);
    box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
    margin-left: 24px;
  }
  
  :host([variant-view="tree"]) .tree-variants {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-left: 48px;
  }
  
  :host([variant-view="tree"]) .tree-variant-item {
    display: flex;
    position: relative;
  }
  
  :host([variant-view="tree"]) .tree-line-container {
    position: absolute;
    left: -24px;
    top: 0;
    bottom: 0;
    width: 24px;
  }
  
  :host([variant-view="tree"]) .tree-line-vertical {
    position: absolute;
    left: 0;
    top: -16px;
    bottom: 50%;
    width: 2px;
    background-color: var(--primary-color, #03a9f4);
  }
  
  :host([variant-view="tree"]) .tree-line-horizontal {
    position: absolute;
    left: 0;
    top: 50%;
    width: 24px;
    height: 2px;
    background-color: var(--primary-color, #03a9f4);
  }
  
  :host([variant-view="tree"]) .variant-child-content {
    flex: 1;
    padding: 12px;
    border-radius: 8px;
    background: var(--secondary-background-color, #f0f0f0);
  }
`;class Oi{constructor(t){this.logger=e.getInstance(),this.hass=t}static getTemplateKey(e){const t=e.parameters||[];if(t.length>0){const i=t.find((e=>{var t,i,r;return"Food_State"===(null===(t=e.template_detail)||void 0===t?void 0:t.name)||"Color"===(null===(i=e.template_detail)||void 0===i?void 0:i.name)||"Size"===(null===(r=e.template_detail)||void 0===r?void 0:r.name)}));if(i)return e.name.split(" ")[0]}return e.name}static getVariants(e){const t={};return e.forEach((e=>{const i=this.getTemplateKey(e);t[i]||(t[i]=[]),t[i].push(e)})),t}static groupVariants(e,t){var i,r;const a={};if(!(null===(i=t.variants)||void 0===i?void 0:i.show_variants))return a;return((null===(r=t.variants)||void 0===r?void 0:r.variant_groups)||[]).forEach((t=>{const i=e.find((e=>e.pk===t.main_pk));i&&(a[i.pk]=[i,...e.filter((e=>(t.variantPks||[]).includes(e.pk)))])})),a}static processVariants(t,i){var r;if(!(null===(r=i.variants)||void 0===r?void 0:r.show_variants))return t;try{this.groupVariants(t,i);return t}catch(i){return e.getInstance().error("VariantService","Failed to process variants:",i),t}}static getTotalStock(e,t){return(e.in_stock||0)+t.reduce(((e,t)=>e+(t.in_stock||0)),0)}static isVariant(e){return!!e.variant_of}static isTemplate(e){return!!e.is_template&&!e.variant_of}async getVariants(e){var t;if(!(null===(t=e.variants)||void 0===t?void 0:t.show_variants))return[];try{return e.variants.variant_groups||[]}catch(e){return this.logger.error("VariantService","Failed to get variants:",e),[]}}detectVariantGroups(e){this.logger.log("VariantService",`Detecting variant groups from ${e.length} parts`),e.filter((e=>e.is_template));const t=e.filter((e=>null!==e.variant_of)),i={};t.forEach((e=>{e.variant_of&&(i[e.variant_of]||(i[e.variant_of]=[]),i[e.variant_of].push(e))}));const r=Object.keys(i).map((t=>{const r=Number(t),a=i[r],s=e.find((e=>e.pk===r));return{main_pk:r,templatePk:r,variantPks:a.map((e=>e.pk)),template_id:r,name:(null==s?void 0:s.name)||`Group ${r}`,parts:a.map((e=>e.pk))}}));return this.logger.log("VariantService",`Detected ${r.length} variant groups`),r}processVariantGroups(e,t){const i={};e.forEach((e=>{i[e.pk]=e}));const r=t.map((e=>{const t=i[e.template_id];if(!t)return this.logger.warn("VariantService",`Template part not found for group ${e.template_id}`),null;const r=(e.parts||[]).map((e=>i[e])).filter((e=>void 0!==e)),a=this.getTotalStock(t,r);return Object.assign(Object.assign({},t),{variants:r,is_variant_group:!0,totalStock:a})})).filter((e=>null!==e)),a=new Set;r.forEach((e=>{a.add(e.pk),e.variants&&e.variants.forEach((e=>{a.add(e.pk)}))}));const s=e.filter((e=>!a.has(e.pk)));return[...r,...s]}getTotalStock(e,t){let i=e.in_stock||0;return t.forEach((e=>{i+=e.in_stock||0})),i}async getVariantData(e){try{if(!this.hass||!e)return[];const t=this.hass.states[e];return t&&t.attributes&&t.attributes.items?t.attributes.items:[]}catch(e){return this.logger.error("VariantService","Failed to get variant data:",e),[]}}}class Wi{constructor(t){this.hass=t,this.variantService=new Oi(t),this.logger=e.getInstance()}static processItems(t,i){var r,a;console.log("🔍 VariantHandler: Processing items with config:",{auto_detect:i.auto_detect_variants,variant_view_type:i.variant_view_type,variants_config:i.variants});const s=e.getInstance();if(!t||0===t.length)return[];if(!(null===(r=i.variants)||void 0===r?void 0:r.show_variants))return t;try{const e=[...t],r=[],o=new Set;if(i.variants.auto_detect){console.log("🔍 VariantHandler: Auto-detecting variants from",t.length,"items");const i=e.filter((e=>null!==e.variant_of));console.log("🔍 VariantHandler: Found",i.length,"parts with variant_of set");const a={};i.forEach((e=>{e.variant_of&&(a[e.variant_of]||(a[e.variant_of]=[]),a[e.variant_of].push(e))})),Object.keys(a).forEach((t=>{const i=Number(t),s=a[i],n=e.find((e=>e.pk===i));n&&(r.push({template:n,variants:s,totalStock:Wi.calculateTotalStock(n,s)}),o.add(n.pk),s.forEach((e=>o.add(e.pk))))})),console.log("🔍 VariantHandler: Created",r.length,"variant groups")}else(null===(a=i.variants.variant_groups)||void 0===a?void 0:a.length)&&(s.log("VariantHandler",`Processing ${i.variants.variant_groups.length} configured variant groups`),i.variants.variant_groups.forEach((t=>{const i=t.templatePk,a=t.variantPks||[];if(i&&a.length){const t=e.find((e=>e.pk===i));if(t){const i=e.filter((e=>a.includes(e.pk)));i.length>0&&(r.push({template:t,variants:i,totalStock:Wi.calculateTotalStock(t,i)}),o.add(t.pk),i.forEach((e=>o.add(e.pk))))}}})));const n=e.filter((e=>!o.has(e.pk))),c=[...r,...n];return s.log("VariantHandler",`Processed ${r.length} variant groups and ${n.length} regular items`),c}catch(i){return e.getInstance().error("VariantHandler","Error processing variants:",i),t}}static isVariant(e){return void 0!==e.template&&void 0!==e.variants&&Array.isArray(e.variants)}static calculateTotalStock(e,t){let i=e.in_stock||0;return t.forEach((e=>{i+=e.in_stock||0})),i}processVariants(e,t){var i;if(!(null===(i=null==t?void 0:t.variants)||void 0===i?void 0:i.show_variants))return e;let r=[];return t.variants.auto_detect?r=this.variantService.detectVariantGroups(e):t.variants.variant_groups&&t.variants.variant_groups.length>0&&(r=t.variants.variant_groups),this.variantService.processVariantGroups(e,r)}getTotalStock(e,t){return Wi.calculateTotalStock(e,t)}}let zi=class extends ue{constructor(){super(...arguments),this.viewType="grid",this.logger=e.getInstance()}updated(e){var t,i,r;if(e.has("config")){const e=(null===(t=this.config)||void 0===t?void 0:t.variant_view_type)||(null===(r=null===(i=this.config)||void 0===i?void 0:i.variants)||void 0===r?void 0:r.view_type)||"grid";e!==this.viewType&&(this.logger.log("PartVariant",`View type changed to ${e}`),this.viewType=e)}e.has("variant")&&this.logVariantDetails()}logVariantDetails(){this.variant?Wi.isVariant(this.variant)?(this.logger.log("PartVariant","Received variant data:"),this.logger.log("PartVariant",`Template: ${this.variant.template.pk} (${this.variant.template.name})`),this.logger.log("PartVariant",`Variants: ${this.variant.variants.length} items`),this.variant.variants.forEach((e=>{this.logger.log("PartVariant",`  - ${e.pk} (${e.name}), variant_of: ${e.variant_of}`)})),this.logger.log("PartVariant",`Total stock: ${this.variant.totalStock}`),this.logger.log("PartVariant",`View type: ${this.viewType}`)):this.logger.error("PartVariant","Received invalid variant data structure"):this.logger.log("PartVariant","No variant data provided")}render(){if(!this.variant)return console.log("🧩 PartVariant: No variant data provided"),q`<div>No variant data</div>`;if(console.log("🧩 PartVariant: Rendering variant",{template:this.variant.template.name,variants:this.variant.variants.length,viewType:this.viewType}),!Wi.isVariant(this.variant))return this.logger.error("PartVariant","Invalid variant data structure"),q`<div>Invalid variant data</div>`;switch(this.logger.log("PartVariant",`Rendering variant for ${this.variant.template.name} with ${this.variant.variants.length} variants`),this.setAttribute("variant-view",this.viewType),this.viewType){case"list":return this.renderListView();case"tree":return this.renderTreeView();default:return this.renderGridView()}}renderGridView(){return this.variant?(console.log("🧩 PartVariant: Rendering GRID view"),q`
            <div class="variant-grid">
                <!-- Template part - larger/highlighted -->
                <div class="variant-template">
                    <h3>${this.variant.template.name}</h3>
                    <div class="template-details">
                        <inventree-part-thumbnail
                            .part=${this.variant.template}
                            .config=${this.config}
                        ></inventree-part-thumbnail>
                        <div class="template-info">
                            <div class="template-stock">
                                Total Stock: ${this.variant.totalStock}
                            </div>
                            <div class="template-description">
                                ${this.variant.template.description||""}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Variants in a grid -->
                <div class="variants-container">
                    ${this.variant.variants.map((e=>q`
                        <div class="variant-item">
                            <inventree-part-view
                                .partData=${e}
                                .config=${this.config}
                                .hass=${this.hass}
                            ></inventree-part-view>
                        </div>
                    `))}
                </div>
            </div>
        `):q``}renderListView(){return this.variant?(console.log("🧩 PartVariant: Rendering LIST view"),q`
            <div class="variant-list">
                <!-- Template part with full details -->
                <div class="variant-template">
                    <div class="template-header">
                        <inventree-part-thumbnail
                            .part=${this.variant.template}
                            .config=${this.config}
                        ></inventree-part-thumbnail>
                        <div>
                            <h3>${this.variant.template.name}</h3>
                            <div class="template-stock">
                                Total Stock: ${this.variant.totalStock}
                            </div>
                        </div>
                    </div>
                    <div class="template-description">
                        ${this.variant.template.description||""}
                    </div>
                </div>
                
                <!-- Variants in a list -->
                <div class="variants-list">
                    <div class="variant-list-header">
                        <div class="variant-name-header">Name</div>
                        <div class="variant-stock-header">Stock</div>
                        <div class="variant-description-header">Description</div>
                    </div>
                    ${this.variant.variants.map((e=>q`
                        <div class="variant-list-item">
                            <div class="variant-name">
                                <inventree-part-thumbnail
                                    .part=${e}
                                    .config=${this.config}
                                    size="small"
                                ></inventree-part-thumbnail>
                                ${e.name}
                            </div>
                            <div class="variant-stock">${e.in_stock}</div>
                            <div class="variant-description">${e.description||""}</div>
                        </div>
                    `))}
                </div>
            </div>
        `):q``}renderTreeView(){return this.variant?(console.log("🧩 PartVariant: Rendering TREE view"),q`
            <div class="variant-tree">
                <!-- Template part at the left/top -->
                <div class="tree-container">
                    <div class="tree-template">
                        <inventree-part-view
                            .partData=${this.variant.template}
                            .config=${this.config}
                            .hass=${this.hass}
                        ></inventree-part-view>
                    </div>
                    
                    <!-- Variants branching out with connecting lines -->
                    <div class="tree-variants">
                        ${this.variant.variants.map(((e,t)=>q`
                            <div class="tree-variant-item">
                                <div class="tree-line-container">
                                    <div class="tree-line-vertical"></div>
                                    <div class="tree-line-horizontal"></div>
                                </div>
                                <div class="variant-child-content">
                                    <inventree-part-view
                                        .partData=${e}
                                        .config=${this.config}
                                        .hass=${this.hass}
                                    ></inventree-part-view>
                                </div>
                            </div>
                        `))}
                    </div>
                </div>
            </div>
        `):q``}};zi.styles=[Vi],c([fe({attribute:!1})],zi.prototype,"variant",void 0),c([fe({attribute:!1})],zi.prototype,"config",void 0),c([fe({attribute:!1})],zi.prototype,"hass",void 0),c([fe({attribute:!1})],zi.prototype,"viewType",void 0),zi=c([ge("inventree-part-variant")],zi);const ji=g`
    :host {
        display: block;
    }
    
    .parts-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    
    .part-item {
        position: relative;
        background-color: var(--card-background-color);
        border-radius: var(--ha-card-border-radius, 4px);
        overflow: visible;
        box-shadow: var(--ha-card-box-shadow, 0px 2px 4px rgba(0, 0, 0, 0.1));
        transition: all 0.3s ease;
    }
    
    .part-item:hover {
        box-shadow: var(--ha-card-box-shadow, 0px 4px 8px rgba(0, 0, 0, 0.2));
    }
    
    .no-parts {
        padding: 32px;
        text-align: center;
        color: var(--primary-text-color);
        font-style: italic;
    }
    
    .no-config {
        padding: 16px;
        text-align: center;
        color: var(--error-color);
        font-weight: bold;
    }
    
    .filter-info {
        margin-bottom: 16px;
        padding: 8px 16px;
        background-color: var(--secondary-background-color);
        border-radius: var(--ha-card-border-radius, 4px);
        font-size: 0.9em;
    }
    
    .debug-info {
        margin-top: 16px;
        padding: 16px;
        background-color: var(--secondary-background-color);
        border-radius: var(--ha-card-border-radius, 4px);
        font-size: 0.9em;
    }
    
    .debug-info pre {
        overflow-x: auto;
        background-color: var(--primary-background-color);
        padding: 8px;
        border-radius: 4px;
    }

    /* Parameter badge and icon */
    .parameter-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        background-color: var(--primary-color);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8em;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        z-index: 20;
    }

    .parameter-icon {
        position: absolute;
        top: 8px;
        right: 8px;
        --mdc-icon-size: 24px;
        color: var(--primary-color);
        z-index: 20;
    }

    /* Parameter action buttons */
    .parameter-actions {
        position: absolute;
        bottom: 8px;
        right: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        z-index: 20;
        padding: 4px;
        background-color: rgba(var(--rgb-card-background-color, 255, 255, 255), 0.9);
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }

    .parameter-action-button {
        padding: 4px 8px;
        border-radius: 4px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        transition: all 0.2s ease;
        font-size: 0.8em;
    }

    .parameter-action-button:hover {
        filter: brightness(1.1);
    }

    .parameter-action-button ha-icon {
        --mdc-icon-size: 16px;
    }

    .empty-message {
        grid-column: 1 / -1;
        text-align: center;
        padding: 32px;
        color: var(--secondary-text-color);
    }

    .part-card {
        background: var(--card-background-color);
        border-radius: var(--ha-card-border-radius, 4px);
        box-shadow: var(--ha-card-box-shadow, none);
        padding: 16px;
    }

    .part-card.error {
        border: 1px solid var(--error-color);
    }

    .part-card.empty {
        border: 1px dashed var(--divider-color);
    }

    .part-header {
        margin-bottom: 16px;
    }

    .part-header h3 {
        margin: 0;
        font-size: 1.2em;
        color: var(--primary-text-color);
    }

    .part-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .part-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .part-name {
        font-weight: 500;
    }

    .part-stock {
        color: var(--secondary-text-color);
    }
`;let Bi=class extends _i{constructor(){super(...arguments),this.selectedEntities=[],this._visualModifiers=new Map,this._actionButtons=new Map,this.filteredParts=[]}updated(e){super.updated(e),(e.has("parts")||e.has("config"))&&(this._updateVisualModifiers(),this.applyFilters()),e.has("selectedEntities")&&this.loadPartsFromEntities()}async loadPartsFromEntities(){if(!this.selectedEntities||0===this.selectedEntities.length)return void(this.filteredParts=[]);const e=Ee.getInstance();let t=[];for(const i of this.selectedEntities){const r=e.getNewestData(i);t=[...t,...r],e.registerEntityOfInterest(i),this.logger.log("Parts",`Loaded ${r.length} parts from entity ${i}`,{category:"parts"})}this.parts=t,this.applyFilters(),this._updateVisualModifiers()}_updateVisualModifiers(){var e,t;if(!this._parameterService||!this.filteredParts||!(null===(t=null===(e=this.config)||void 0===e?void 0:e.parameters)||void 0===t?void 0:t.enabled))return this._visualModifiers=new Map,void(this._actionButtons=new Map);this.filteredParts.forEach((e=>{var t,i,r,a;this._visualModifiers.set(e.pk,this._parameterService.processConditions(e,(null===(i=null===(t=this.config)||void 0===t?void 0:t.parameters)||void 0===i?void 0:i.conditions)||[])),Ee.getInstance(),this._actionButtons.set(e.pk,this._parameterService.getActionButtons(`${e.pk}`,"",null===(a=null===(r=this.config)||void 0===r?void 0:r.parameters)||void 0===a?void 0:a.actions))}))}applyFilters(){this.parts&&0!==this.parts.length?this.config&&this.config.filters&&0!==this.config.filters.length?this.filteredParts=this.parts.filter((e=>{let t=!0;if(this.config&&this.config.filters)for(const i of this.config.filters)if(!this.matchesFilter(e,i)){t=!1;break}return t})):this.filteredParts=[...this.parts]:this.filteredParts=[]}matchesFilter(e,t){if(!t.attribute||!t.value)return!0;if(t.attribute.includes("parameter:"))return this.matchesParameterFilter(e,t);const i=e[t.attribute];return void 0!==i&&this._compareFilterValues(i,t.value,t.operator||"eq")}matchesParameterFilter(e,t){if(!t.attribute||!t.value)return!0;const i=t.attribute.split("parameter:")[1];if(!i)return!0;let r=null;return this._parameterService&&(r=this._parameterService.getParameterValueFromPart(e,i)),null!==r&&this._compareFilterValues(r,t.value,t.operator||"eq")}_compareFilterValues(e,t,i){const r=String(e).toLowerCase(),a=t.toLowerCase();switch(i){case"eq":return r===a;case"ne":return r!==a;case"gt":return parseFloat(r)>parseFloat(a);case"lt":return parseFloat(r)<parseFloat(a);case"contains":return r.includes(a);default:return!1}}_getContainerStyle(e){const t=this._visualModifiers.get(e);if(!t)return"";const i=[];return t.highlight&&i.push(`background-color: ${t.highlight}`),t.border&&i.push(`border: 2px solid ${t.border}`),i.join(";")}_getTextStyle(e){const t=this._visualModifiers.get(e);return t&&t.textColor?`color: ${t.textColor}`:""}_handleImageError(e){e.target.src="/local/inventree-card/placeholder.png"}render(){var e;if(!this.filteredParts||0===this.filteredParts.length)return q`<div class="no-parts">No parts found</div>`;return"list"===((null===(e=this.config)||void 0===e?void 0:e.view_type)||"grid")?this._renderListView():this._renderGridView()}_renderGridView(){return q`
            <div class="parts-grid">
                ${this.filteredParts.map((e=>q`
                    <div class="part-card" style="${this._getContainerStyle(e.pk)}">
                        <div class="part-header">
                            <h3 style="${this._getTextStyle(e.pk)}">${e.name}</h3>
                            ${e.category_name?q`
                                <div class="part-category">${e.category_name}</div>
                            `:""}
                        </div>
                        
                        ${e.thumbnail?q`
                            <div class="part-image">
                                <img 
                                    src="${e.thumbnail}" 
                                    alt="${e.name}"
                                    @error=${this._handleImageError}
                                />
                            </div>
                        `:""}
                        
                        <div class="part-stock">
                            <span class="label">In Stock:</span>
                            <span class="value ${e.in_stock<=(e.minimum_stock||0)?"low-stock":""}">${e.in_stock}</span>
                        </div>
                    </div>
                `))}
            </div>
        `}_renderListView(){return q`
            <div class="parts-list">
                ${this.filteredParts.map((e=>q`
                    <div class="part-row" style="${this._getContainerStyle(e.pk)}">
                        ${e.thumbnail?q`
                            <div class="part-thumbnail">
                                <img 
                                    src="${e.thumbnail}" 
                                    alt="${e.name}"
                                    @error=${this._handleImageError}
                                />
                            </div>
                        `:""}
                        
                        <div class="part-info">
                            <div class="part-name" style="${this._getTextStyle(e.pk)}">${e.name}</div>
                            ${e.category_name?q`
                                <div class="part-category">${e.category_name}</div>
                            `:""}
                        </div>
                        
                        <div class="part-stock">
                            <span class="label">Stock:</span>
                            <span class="value ${e.in_stock<=(e.minimum_stock||0)?"low-stock":""}">${e.in_stock}</span>
                        </div>
                    </div>
                `))}
            </div>
        `}};Bi.styles=[ji],c([fe({attribute:!1})],Bi.prototype,"selectedEntities",void 0),c([be()],Bi.prototype,"_visualModifiers",void 0),c([be()],Bi.prototype,"_actionButtons",void 0),Bi=c([ge("inventree-parts-layout")],Bi);let Hi=class extends ue{constructor(){super(),this._reduxParts=[],this._storeUnsubscribe=null,this.logger=e.getInstance(),this.logger.log("BaseLayoutAdapter","Created adapter using delegation",{category:"redux",subsystem:"adapters"})}connectedCallback(){super.connectedCallback(),this._ensureLayoutInstance(),a("useReduxForParts")&&(this._connectToReduxStore(),this.logger.log("BaseLayoutAdapter","Connected to Redux store for parts",{category:"redux",subsystem:"adapters"}))}disconnectedCallback(){super.disconnectedCallback(),this._storeUnsubscribe&&(this._storeUnsubscribe(),this._storeUnsubscribe=null)}_ensureLayoutInstance(){this._baseLayout||(this._baseLayout=document.createElement("inventree-base-layout"),this.shadowRoot&&!this.shadowRoot.contains(this._baseLayout)&&this.shadowRoot.appendChild(this._baseLayout)),this._updateBaseLayoutProps()}_updateBaseLayoutProps(){this._baseLayout&&(this.hass&&(this._baseLayout.hass=this.hass),this.config&&(this._baseLayout.config=this.config),this.entity&&(this._baseLayout.entity=this.entity),a("useReduxForParts")&&this._reduxParts.length>0?this._baseLayout.parts=this._reduxParts:this.parts&&(this._baseLayout.parts=this.parts))}_connectToReduxStore(){var e;if(this._storeUnsubscribe)return;this._storeUnsubscribe=vi.subscribe((()=>{var e;if(this.entity){const t=vi.getState();if(null===(e=t.parts)||void 0===e?void 0:e.items){const e=t.parts.items[this.entity]||[];JSON.stringify(e)!==JSON.stringify(this._reduxParts)&&(this._reduxParts=e,this._updateBaseLayoutProps())}}}));const t=vi.getState();this.entity&&(null===(e=t.parts)||void 0===e?void 0:e.items)&&(this._reduxParts=t.parts.items[this.entity]||[])}updateParameterValue(e,t,i,r="user"){var s,o;a("useReduxForParameters")&&(vi.dispatch({type:"parameters/updateValue",payload:{partId:e,paramName:t,value:i,source:r}}),this.logger.log("BaseLayoutAdapter",`Dispatched parameter update to Redux: ${e}:${t} = ${i}`,{category:"redux",subsystem:"adapters"})),this._baseLayout&&(null===(o=(s=this._baseLayout).updateParameterValue)||void 0===o||o.call(s,e,t,i,r))}async refreshData(){if(this._baseLayout)return this._baseLayout.refreshData()}updated(e){this._updateBaseLayoutProps()}render(){return this._ensureLayoutInstance(),q`
      <!-- The base layout is appended to the shadow DOM directly -->
    `}};Hi.styles=g`
    :host {
      display: block;
      width: 100%;
    }
  `,c([fe({attribute:!1})],Hi.prototype,"hass",void 0),c([fe({attribute:!1})],Hi.prototype,"config",void 0),c([fe({type:String})],Hi.prototype,"entity",void 0),c([fe({type:Array})],Hi.prototype,"parts",void 0),Hi=c([ge("base-layout-adapter")],Hi);const qi={redux:new Map,legacy:new Map};class Gi{static trackUsage(e,t){const i="redux"===e?qi.redux:qi.legacy,r=i.get(t)||0;i.set(t,r+1),r%10==0&&this.logger.log("StateAdapter",`Usage metrics - ${t}: ${e} used ${r+1} times`,{category:"migration",subsystem:"adapter"})}static getParts(e,t=!0){if(a("useReduxForParts")){this.trackUsage("redux","getParts");const t=vi.getState();return t.parts.items[e]||[]}{this.trackUsage("legacy","getParts");const i=Ee.getInstance();return t?i.getFilteredParts(e):i.getNewestData(e)}}static getPartById(e){if(a("useReduxForParts")){this.trackUsage("redux","getPartById");const t=vi.getState();for(const i in t.parts.items){const r=t.parts.items[i].find((t=>t.pk===e));if(r)return r}}else{this.trackUsage("legacy","getPartById");const t=Ee.getInstance();for(const i of t.getTrackedEntities()){const r=t.getNewestData(i).find((t=>t.pk===e));if(r)return r}}}static updateParameter(e,t,i,r="ui"){a("useReduxForParameters")?(this.trackUsage("redux","updateParameter"),vi.dispatch({type:"parameters/updateValue",payload:{partId:e,paramName:t,value:i,source:r}})):(this.trackUsage("legacy","updateParameter"),Ee.getInstance().updateParameter(e,t,i)),a("useReduxForParameters")&&Ee.getInstance().updateParameter(e,t,i)}static getDataSourcePriority(){if(a("useReduxForParts")){this.trackUsage("redux","getDataSourcePriority");return vi.getState().parts.sourcePriority||"hass"}return this.trackUsage("legacy","getDataSourcePriority"),Ee.getInstance()._prioritySource||"hass"}static setDataSourcePriority(e){a("useReduxForParts")&&(this.trackUsage("redux","setDataSourcePriority"),vi.dispatch({type:"parts/setSourcePriority",payload:e})),this.trackUsage("legacy","setDataSourcePriority"),Ee.getInstance().setPriorityDataSource(e)}static getUsageMetrics(){return{redux:Object.fromEntries(qi.redux),legacy:Object.fromEntries(qi.legacy)}}}Gi.logger=e.getInstance();let Ji=class extends ue{constructor(){super(),this._reduxParts=[],this._storeUnsubscribe=null,this.logger=e.getInstance(),this.logger.log("GridLayoutAdapter","Created adapter using delegation",{category:"redux",subsystem:"adapters"})}connectedCallback(){super.connectedCallback(),this._ensureLayoutInstance(),a("useReduxForParts")&&(this._connectToReduxStore(),this.logger.log("GridLayoutAdapter","Connected to Redux store for parts",{category:"redux",subsystem:"adapters"})),Gi.trackUsage("redux","gridLayoutConnected")}disconnectedCallback(){super.disconnectedCallback(),this._storeUnsubscribe&&(this._storeUnsubscribe(),this._storeUnsubscribe=null)}_ensureLayoutInstance(){this._gridLayout||(this._gridLayout=document.createElement("inventree-grid-layout"),this.shadowRoot&&!this.shadowRoot.contains(this._gridLayout)&&this.shadowRoot.appendChild(this._gridLayout)),this._updateLayoutProps()}_updateLayoutProps(){this._gridLayout&&(this.hass&&(this._gridLayout.hass=this.hass),this.config&&(this._gridLayout.config=this.config),a("useReduxForParts")&&this._reduxParts.length>0?(this._gridLayout.parts=this._reduxParts,this.logger.log("GridLayoutAdapter",`Using ${this._reduxParts.length} parts from Redux store`,{category:"redux",subsystem:"adapters"})):this.parts&&(this._gridLayout.parts=this.parts,this.logger.log("GridLayoutAdapter",`Using ${this.parts.length} parts from legacy state`,{category:"redux",subsystem:"adapters"})))}_connectToReduxStore(){var e,t;if(this._storeUnsubscribe)return;this._storeUnsubscribe=vi.subscribe((()=>{var e,t;if(null===(e=this.config)||void 0===e?void 0:e.entity){const e=vi.getState();if(null===(t=e.parts)||void 0===t?void 0:t.items){const t=this.config.entity,i=e.parts.items[t]||[];JSON.stringify(i)!==JSON.stringify(this._reduxParts)&&(this._reduxParts=i,this._updateLayoutProps(),this.logger.log("GridLayoutAdapter",`Updated parts from Redux store: ${i.length} items`,{category:"redux",subsystem:"adapters"}))}}}));const i=vi.getState();(null===(e=this.config)||void 0===e?void 0:e.entity)&&(null===(t=i.parts)||void 0===t?void 0:t.items)&&(this._reduxParts=i.parts.items[this.config.entity]||[])}forceImmediateFilter(){this._gridLayout&&"function"==typeof this._gridLayout.forceImmediateFilter&&this._gridLayout.forceImmediateFilter()}updated(e){this._updateLayoutProps()}render(){return this._ensureLayoutInstance(),q`
      <!-- The grid layout is appended to the shadow DOM directly -->
    `}};var Ki;Ji.styles=g`
    :host {
      display: block;
      width: 100%;
    }
  `,c([fe({attribute:!1})],Ji.prototype,"hass",void 0),c([fe({attribute:!1})],Ji.prototype,"config",void 0),c([fe({type:Array})],Ji.prototype,"parts",void 0),Ji=c([ge("grid-layout-adapter")],Ji),window.customCards||(window.customCards=[]),window.customCards.push({type:"inventree-card",name:"InvenTree Card",description:"A card for displaying InvenTree inventory data",preview:!0});try{let t=Ki=class extends mi{constructor(){super(),this._reduxParts={},this._useRedux=!1,this._instanceId=`InventreeCard-${Date.now()}-${Math.floor(1e3*Math.random())}`,this.logger=e.getInstance(),this._renderingService=Pe.getInstance(),this._controller=Me.getInstance(),this._state=Ee.getInstance(),this.timers=new _e(`InventreeCard-${Date.now()}-${Math.floor(1e3*Math.random())}`,!0),this.cache=ke.getInstance(),this._renderDebounceTimer=null,this.RENDER_DEBOUNCE_TIME=100,this._lastRenderedHash="",this._apiDiagnosticsTimer=null,this._cleanupFunctions=[],this._entitySubscriptions=new Map,this._isRefreshing=!1,this._lastRefreshTime=0,this._lastPartsCount=0,this._lastPartsHash="",this._lastValidParts=[],this._websocketSubscriptions=[],this._forceRenderListener=null,this._isDestroyed=!1,console.log(`InventreeCard: Constructor called, timers initialized with ID ${this._instanceId}`),this.timers||(console.warn("TimerManager not initialized in property declaration, creating now"),this.timers=new _e(this._instanceId,!0)),console.log("DEBUG-CHECK: InventreeCard constructor",{logger:!!this.logger,controller:!!this._controller,renderingService:!!this._renderingService,state:!!this._state,timers:!!this.timers});try{this.logger.log("InventreeCard","Card instance created with ID "+this._instanceId,{category:"card",subsystem:"initialization"}),this._setupEventListeners(),Ki._instance||(Ki._instance=this),this._useRedux=a("useReduxForCard"),this.initReduxSelectors()}catch(e){console.error("Error during InventreeCard constructor:",e)}}initReduxSelectors(){this._useRedux&&(this.logger.log("InventreeCard","Initializing Redux selectors",{category:"card",subsystem:"redux"}),this.connectToRedux("reduxParts",(e=>{var t;return(null===(t=e.parts)||void 0===t?void 0:t.items)||{}})),this.connectToRedux("reduxConfig",(e=>{var t;return null===(t=e.config)||void 0===t?void 0:t.cardConfig})))}static async getConfigElement(){return customElements.get(n)||await import("./editor-af52de45.js"),document.createElement(n)}static getStubConfig(e){const t=Object.keys(e.states).find((t=>{var i;return t.startsWith("sensor.")&&void 0!==(null===(i=e.states[t].attributes)||void 0===i?void 0:i.items)}));return{type:`custom:${o}`,entity:t||"",view_type:"detail",selected_entities:[],display:{show_header:!0,show_image:!0,show_name:!0,show_stock:!0,show_description:!1,show_category:!1,show_stock_status_border:!0,show_stock_status_colors:!0,show_buttons:!0},direct_api:{enabled:!1,url:"",api_key:"",method:"websocket"}}}setConfig(e){if(!e)throw new Error("No configuration provided");console.log("InventreeCard: setConfig called with config:",JSON.stringify(e,null,2)),this.logger.info("Card","Setting configuration",{category:"card",subsystem:"config",data:{entityId:e.entity,viewType:e.view_type}}),this._config=e,this.config=e,this._initializeServices(),this._controller.setConfig(e),this._setupDebugMode(e),e.entity&&"string"==typeof e.entity&&(this.logger.info("Card",`Registering primary entity: ${e.entity}`,{category:"card",subsystem:"entities"}),this._state.registerEntityOfInterest(e.entity)),e.selected_entities&&Array.isArray(e.selected_entities)&&(this.logger.info("Card",`Registering ${e.selected_entities.length} additional entities`,{category:"card",subsystem:"entities"}),e.selected_entities.forEach((e=>{e&&"string"==typeof e&&this._state.registerEntityOfInterest(e)}))),this.requestUpdate()}_setupEntitySubscriptions(){var e;if(this._clearEntitySubscriptions(),!this._hass)return void this.logger.warn("Card","Cannot set up entity subscription - HASS object is null.");const t=this._hass.connection;if(!t)return void this.logger.warn("Card","Cannot set up entity subscription - HASS connection not available.");const i=null===(e=this.config)||void 0===e?void 0:e.entity;if(!i)return void this.logger.log("Card","No entity to subscribe to.");(async e=>{try{const i=await t.subscribeEvents((t=>{t.data.entity_id===e&&(this.logger.log("Card",`Entity ${e} changed, requesting update.`),this.requestUpdate())}),"state_changed");this._entitySubscriptions.set(e,i),this.logger.log("Card",`Subscribed to entity: ${e}`)}catch(t){this.logger.error("Card",`Error subscribing to entity ${e}:`,t)}})(i)}_clearEntitySubscriptions(){if(this.logger.log("Card","Clearing entity subscriptions",{category:"card",subsystem:"lifecycle"}),this._hass&&this.config){for(const e of this._entitySubscriptions.values())"function"==typeof e&&e();if(this._entitySubscriptions.clear(),this.config.entity){const e=Ie.getInstance().subscribeToEntity(this.config.entity,(()=>{try{this.logger.log("Card",`Entity update received for ${this.config.entity}`,{category:"card",subsystem:"websocket"}),this.requestUpdate()}catch(e){this.logger.error("Card",`Error handling entity update: ${e}`,{category:"card",subsystem:"errors"})}}));this._entitySubscriptions.set(this.config.entity,e)}if(this.config.selected_entities&&Array.isArray(this.config.selected_entities))for(const e of this.config.selected_entities){if(this._entitySubscriptions.has(e))continue;const t=Ie.getInstance().subscribeToEntity(e,(()=>{try{this.logger.log("Card",`Entity update received for ${e}`,{category:"card",subsystem:"websocket"}),this.requestUpdate()}catch(e){this.logger.error("Card",`Error handling entity update: ${e}`,{category:"card",subsystem:"errors"})}}));this._entitySubscriptions.set(e,t)}if(this.config.debug&&this.config.entity){const e=Ee.getInstance(),t=e.getNewestData(this.config.entity);t&&0!==t.length?this.logger.log("Card",`Using real data: ${t.length} parts found for ${this.config.entity}`,{category:"card",subsystem:"debug"}):(this.logger.log("Card","Setting debug pizza data since no real data found",{category:"card",subsystem:"debug"}),e.setHassData(this.config.entity,[{pk:1,name:"Pizza Margherita",in_stock:5,description:"Classic Italian pizza with tomato, mozzarella, and basil",source:"hass",thumbnail:"https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"},{pk:2,name:"Pizza Pepperoni",in_stock:3,description:"American-style pizza topped with pepperoni slices",source:"hass",thumbnail:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"}]))}}}_debouncedRender(){null!==this._renderDebounceTimer&&window.clearTimeout(this._renderDebounceTimer),this._renderDebounceTimer=window.setTimeout((()=>{try{this._useRedux,this.requestUpdate()}catch(e){this.logger.error("Card","Error in debouncedRender:",e)}}),this.RENDER_DEBOUNCE_TIME)}updated(e){var t;super.updated(e),e.has("config")&&(this._controller.setConfig(this.config),this._setupEntitySubscriptions(),(null===(t=this.config.direct_api)||void 0===t?void 0:t.enabled)&&this._renderingService.setupRendering(this.config.direct_api))}render(){var e,t,i,r,a;try{if(this._useRedux)return this._renderWithRedux();if(console.log("InvenTree Card render called:",{hass:!!this._hass,config:!!this.config,entity:null===(e=this.config)||void 0===e?void 0:e.entity}),!this._hass||!this.config)return q`
                        <ha-card>
                            <div class="card-header">
                                <div class="name">InvenTree Card</div>
                            </div>
                            <div class="card-content">
                                No configuration available
                            </div>
                        </ha-card>
                    `;const s=this.config.entity,o=s?this._hass.states[s]:void 0;if(!o&&s)return q`
                        <ha-card>
                            <div class="card-header">
                                <div class="name">${this.config.name||"InvenTree Card"}</div>
                            </div>
                            <div class="card-content">
                                Entity ${s} not found
                            </div>
                        </ha-card>
                    `;if(null!==this._renderDebounceTimer)return q`
                        <ha-card>
                            <div class="card-content">
                                <!-- Reuse last rendered content -->
                            </div>
                        </ha-card>
                    `;const n=this._controller.getParts();console.log("InvenTree Card parts from controller:",{partsCount:n.length,firstPart:n.length>0?{pk:n[0].pk,name:n[0].name,in_stock:n[0].in_stock,source:n[0].source,thumbnail:n[0].thumbnail?"present":"missing"}:null});const c=Ee.getInstance().getNewestData(this.config.entity||"");if(console.log("InvenTree Card direct parts from state:",{entityId:this.config.entity,partsCount:c.length,firstPart:c.length>0?{pk:c[0].pk,name:c[0].name,in_stock:c[0].in_stock,source:c[0].source}:null}),this.config.show_debug)return this._renderDebugInfo(n);const l=this.getSelectedPart(n),d=this.config.view_type||this.config.layout||"detail",h=this.getParts()||[];return this.logger.log("Card",`Rendering with ${h.length} parts`),window.setTimeout((()=>{this._renderingService.notifyRenderComplete()}),10),q`
                    <ha-card style="background: ${(null===(t=this.config.style)||void 0===t?void 0:t.background)||"var(--card-background-color)"}">
                        ${!1!==(null===(i=this.config.display)||void 0===i?void 0:i.show_header)?q`
                            <div class="card-header">
                                <div class="name">${this.config.name||(null===(r=null==o?void 0:o.attributes)||void 0===r?void 0:r.friendly_name)||s||"InvenTree Card"}</div>
                            </div>
                        `:""}
                        
                        <div class="card-content">
                            ${"detail"===d&&l?q`
                            <inventree-detail-layout
                                    .hass=${this._hass}
                                .config=${this.config}
                                    .item=${l}
                                    .parts=${n}
                            ></inventree-detail-layout>
                            `:"detail"!==d||l?"grid"===d?q`
                            <inventree-grid-layout
                                    .hass=${this._hass}
                                .config=${this.config}
                                    .parts=${h}
                            ></inventree-grid-layout>
                            `:"list"===d?q`
                                <inventree-list-layout
                                    .hass=${this._hass}
                                    .config=${this.config}
                                .entity=${this.config.entity}
                                .parts=${this.getParts()}
                                ></inventree-list-layout>
                            `:"parts"===d?q`
                                <inventree-parts-layout
                                    .hass=${this._hass}
                                    .config=${this.config}
                                    .selectedEntities=${this.config.selected_entities||[]}
                                ></inventree-parts-layout>
                            `:"variants"===d?q`
                                <inventree-variants-layout
                                    .hass=${this._hass}
                                    .config=${this.config}
                                    .parts=${n}
                                ></inventree-variants-layout>
                            `:"base"===d?q`
                                <inventree-base-layout-view
                                    .hass=${this._hass}
                                    .config=${this.config}
                                    .entity=${this.config.entity}
                                    .parts=${this.getParts()}
                                ></inventree-base-layout-view>
                            `:"debug"===d?q`
                                <inventree-data-flow-debug
                                    .hass=${this._hass}
                                    .config=${this.config}
                                    .entity=${this.config.entity}
                                    .parts=${this.getParts()}
                                ></inventree-data-flow-debug>
                            `:"custom"===d&&(null===(a=this.config.custom_view)||void 0===a?void 0:a.tag)?q`
                                <${this.config.custom_view.tag}
                                    .hass=${this._hass}
                                    .config=${this.config}
                                    .entity=${this.config.entity}
                                    .parts=${this.getParts()}
                                    ...${this.config.custom_view.properties||{}}
                                ></${this.config.custom_view.tag}>
                            `:q`
                                <!-- Empty template for unknown view type -->
                                <div>Unknown layout type: ${d}</div>
                            `:q`
                                <!-- Empty template instead of "No part selected" -->
                            `}
                        </div>
                    </ha-card>
                `}catch(e){const t=e instanceof Error?e.message:String(e);return console.error("Critical error in render:",e),q`<div class="error">Error rendering card: ${t}</div>`}}_renderWithRedux(){var e;try{const t=this._getReduxParts();this.getSelectedPart(t);this.logger.log("Card",`Rendering with Redux: ${t.length} parts`,{category:"card",subsystem:"rendering"}),this._lastPartsCount=t.length;const i=(null===(e=this._reduxConfig)||void 0===e?void 0:e.layout_type)||"grid";return"grid"===i?q`
                        <inventree-grid-layout-adapter
                            .config=${this._reduxConfig}
                            .parts=${t}
                            .hass=${this._hass}
                        ></inventree-grid-layout-adapter>
                    `:"list"===i?q`
                        <inventree-list-layout
                            .config=${this._reduxConfig}
                            .parts=${t}
                            .hass=${this._hass}
                        ></inventree-list-layout>
                    `:"parts"===i?q`
                        <inventree-parts-layout
                            .config=${this._reduxConfig}
                            .parts=${t}
                            .hass=${this._hass}
                        ></inventree-parts-layout>
                    `:q`
                        <inventree-grid-layout-adapter
                            .config=${this._reduxConfig}
                            .parts=${t}
                            .hass=${this._hass}
                        ></inventree-grid-layout-adapter>
                    `}catch(e){const t=e instanceof Error?e.message:String(e);return this.logger.error("Card","Error in renderWithRedux:",e),q`<div class="error">Error rendering card: ${t}</div>`}}_computeHash(e){let t=0;for(let i=0;i<e.length;i++){t=(t<<5)-t+e.charCodeAt(i),t|=0}return Math.abs(t)}getSelectedPart(e){if(e.length)return this.config.part_id&&e.find((e=>e.pk===this.config.part_id))||e[0]}get parts(){return this._useRedux?this._getReduxParts():this.getParts()}getParts(){var e;try{const t=this.cache.get("currentParts",!0);if(t)return t;const i=(null===(e=this.config)||void 0===e?void 0:e.entity)||"",r=this._state.getNewestData(i);return this.cache.set("currentParts",r,3e4,$e.GENERAL),this._useRedux&&this._updateReduxParts(r),r}catch(e){return this.logger.error("Card","Error getting parts:",e),[]}}_getReduxParts(){try{if(!this._reduxConfig||!this._reduxConfig.entity)return[];const e=this._reduxConfig.entity;return this._reduxParts&&this._reduxParts[e]?this._reduxParts[e]:[]}catch(e){return this.logger.error("Card","Error getting Redux parts:",e),[]}}_updateReduxParts(e){try{if(!this.config||!this.config.entity)return;const t=this.config.entity;vi.dispatch({type:"parts/setParts",payload:{entityId:t,parts:e}})}catch(e){this.logger.error("Card","Error updating Redux parts:",e)}}getCardSize(){var e,t;if(!this.config)return 1;const i=null===(t=null===(e=this._hass)||void 0===e?void 0:e.states[this.config.entity])||void 0===t?void 0:t.state;if(!i)return 1;try{const e=JSON.parse(i);return Math.ceil(e.length/(this.config.columns||2))}catch(e){return 1}}async handleLocateClick(e){var t,i,r;try{if(!this.wledService)throw new Error("WLED service not initialized");const a=(null===(i=null===(t=this.config.services)||void 0===t?void 0:t.wled)||void 0===i?void 0:i.enabled)?this.config.services.wled:(null===(r=this.config.wled)||void 0===r?void 0:r.enabled)?this.config.wled:void 0;if(!a||!a.enabled)throw new Error("WLED not enabled in config");const s=this.convertToInvenTreePart(e);await this.wledService.locatePart(s,Object.assign(Object.assign({},a),{parameter_name:a.parameter_name||"led_xaxis"}))}catch(e){throw e}}convertToInvenTreePart(e){return{pk:e.pk,name:e.name,in_stock:e.in_stock,minimum_stock:e.minimum_stock||0,image:e.thumbnail||null,thumbnail:e.thumbnail||void 0,active:e.active||!0,assembly:!1,category:e.category||0,category_name:e.category_name||"",category_pathstring:"",dashboard_url:"",inventree_url:"",barcode_hash:"",barcode_data:"",component:!1,description:e.description||"",full_name:e.full_name||e.name,IPN:e.IPN||"",keywords:"",purchaseable:!1,revision:"",salable:!1,units:e.units||"",total_in_stock:e.total_in_stock||e.in_stock,unallocated_stock:0,allocated_to_build_orders:0,allocated_to_sales_orders:0,building:0,ordering:0,variant_of:e.variant_of||null,is_template:e.is_template||!1,parameters:e.parameters?e.parameters.filter((e=>null!=e)).map((e=>({pk:e.pk,part:e.part,template:e.template,template_detail:e.template_detail,data:e.data,data_numeric:"number"==typeof e.data_numeric?e.data_numeric:null}))):[]}}_handleStockAdjustment(e){const{item:t,amount:i}=e.detail;if(!t||!this._hass)return;const r=this._controller.getParameterService();r?r.updateParameter(t,"stock",String(i)).then((()=>{this.logger.log("Card","Stock adjustment successful via ParameterService"),this.requestUpdate()})).catch((e=>{this.logger.error("Card","Stock adjustment failed via ParameterService:",e)})):this.logger.error("Card","ParameterService not available for stock adjustment.")}_renderActionButtons(e){var t,i,r,a;if(!e)return q``;const s=[];return(null===(i=null===(t=this.config.services)||void 0===t?void 0:t.wled)||void 0===i?void 0:i.enabled)&&s.push(q`
                    <button @click=${()=>this.handleLocateClick(e)}>
                        Locate
                    </button>
                `),(null===(a=null===(r=this.config.services)||void 0===r?void 0:r.print)||void 0===a?void 0:a.enabled)&&s.push(q`
                    <button @click=${()=>this._handlePrintLabel(e)}>
                        Print Label
                    </button>
                `),s}async _handlePrintLabel(e){var t,i;if(e&&this.printService&&(null===(i=null===(t=this.config.services)||void 0===t?void 0:t.print)||void 0===i?void 0:i.enabled))try{const t={template_id:this.config.services.print.template_id||2,plugin:this.config.services.print.plugin||"zebra"};await this.printService.printLabel(e,t)}catch(e){e instanceof Error?e.message:String(e)}}static getConfigForm(){return{schema:[{name:"entity",required:!0,selector:{entity:{domain:["sensor"],filter:{attributes:{items:{}}},mode:"dropdown"}}},{name:"view_type",selector:{select:{options:[{value:"detail",label:"Detail"},{value:"grid",label:"Grid"},{value:"list",label:"List"},{value:"parts",label:"Parts"},{value:"variants",label:"Variants"},{value:"base",label:"Base Layout"},{value:"debug",label:"Data Flow Debug"}],mode:"dropdown"}}},{name:"selected_entities",selector:{entity:{domain:["sensor"],multiple:!0,filter:{attributes:{items:{}}}}}}],assertConfig:e=>{if(!e.entity||"string"!=typeof e.entity)throw new Error('Configuration error: "entity" must be a non-empty string.')}}}_compareValues(e,t,i){if(null==e)return!1;switch(i){case"eq":return String(e)===t;case"contains":return String(e).toLowerCase().includes(t.toLowerCase());case"gt":return Number(e)>Number(t);case"lt":return Number(e)<Number(t);default:return!1}}_renderDebugInfo(e){return q`
                <ha-card>
                    <div class="card-header">
                        <div class="name">InvenTree Card Debug</div>
                    </div>
                    <div class="card-content">
                        <details>
                            <summary>Configuration</summary>
                            <pre>${JSON.stringify(this.config,null,2)}</pre>
                        </details>
                        <details>
                            <summary>Parts (${e.length})</summary>
                            <pre>${JSON.stringify(e,null,2)}</pre>
                        </details>
                    </div>
                </ha-card>
            `}async refreshParameterData(e,t){if(this.logger.log("Card",`🔄 Requesting parameter refresh for part ${e}${t?` parameter ${t}`:""}`,{category:"parameters"}),this.parameterService)try{await this.parameterService.fetchParameterData(e,t),this.logger.log("Card",`✅ Successfully refreshed parameters for part ${e}`,{category:"parameters"})}catch(e){this.logger.error("Card","Error refreshing parameter data:",e)}}async updateCrossEntityParameter(e,t){if(this._hass)try{const i=this._controller.getParameterService();if(!i)return void this.logger.warn("Card","Parameter service not available for cross-entity update",{category:"parameters",subsystem:"errors"});if(i.isDirectPartReference(e)){const[r,a]=e.split(":");if(!r||!a)throw new Error(`Invalid parameter reference: ${e}`);await i.updateParameter({pk:parseInt(r)},a,t),this.logger.log("Card",`Parameter ${a}=${t} updated for part ${r}`,{category:"parameters",subsystem:"update"})}}catch(e){this.logger.error("Card",`Error updating cross-entity parameter: ${e}`,{category:"parameters",subsystem:"errors"})}else this.logger.error("Card","Cannot update parameter: HASS not available",{category:"parameters",subsystem:"errors"})}async updateParametersForMatchingParts(e,t,i,r){if(this._hass)try{const a=this.getParts(),s=this._controller.getParameterService();if(!s)return void this.logger.error("Card","ParameterService not available",{category:"parameters",subsystem:"errors"});this.logger.log("Card",`Checking ${a.length} parts for condition ${e}=${t}`,{category:"parameters",subsystem:"update"});for(const o of a){const a={parameter:e,operator:"equals",value:t,action:"highlight",action_value:"true"};await s.matchesCondition(o,a)&&(this.logger.log("Card",`Part ${o.pk} matches condition, updating ${i}=${r}`,{category:"parameters",subsystem:"update"}),await s.updateParameter(o,i,r))}this.requestUpdate()}catch(e){this.logger.error("Card",`Error updating parameters for matching parts: ${e}`,{category:"parameters",subsystem:"errors"})}else this.logger.error("Card","Cannot update parameters: HASS not available",{category:"parameters",subsystem:"errors"})}handleParameterUpdateEvent(e){if(!e.detail)return;const{parameterRef:t,value:i}=e.detail;t&&void 0!==i&&this.updateCrossEntityParameter(t,String(i)).catch((e=>{this.logger.error("Card",`Error handling parameter update event: ${e}`,{category:"parameters",subsystem:"errors"})}))}connectedCallback(){var e,t;super.connectedCallback();try{if(this.logger.log("InventreeCard","Card connected to DOM",{category:"card",subsystem:"initialization"}),this._useRedux=a("useReduxForCard"),this._useRedux&&(this.logger.log("InventreeCard","Connecting to Redux store",{category:"card",subsystem:"redux"}),this.config&&(vi.dispatch({type:"config/setCardConfig",payload:this.config}),this.logger.log("Card","Dispatched config to Redux store",{category:"redux",subsystem:"dispatch"}))),this._hass&&(null===(t=null===(e=this.config)||void 0===e?void 0:e.direct_api)||void 0===t?void 0:t.enabled)){this.api||(this.api=new Te(this.config.direct_api.url,this.config.direct_api.api_key));this._controller.getWebSocketPlugin();this.logger.log("Card","WebSocket plugin initialized"),this.parameterService&&this.logger.log("Card","Parameter service initialized")}this._setupWebSocketSubscriptions(),this._setupParameterEventListeners()}catch(e){this.logger.error("InventreeCard","Error in connectedCallback:",e),console.error("InventreeCard: Error in connectedCallback",e)}}_setupWebSocketSubscriptions(){}_setupParameterEventListeners(){}get hass(){return this._hass?this._hass:void 0}set hass(e){var t;if(e&&(this._hass=e,this._controller.setHass(e),!this.api&&this.config&&this._initializeServices(),a("useReduxForParts"))){const e=this._controller.getParts();e.length>0&&(null===(t=this.config)||void 0===t?void 0:t.entity)&&this._updateReduxParts(e)}}_initializeServices(){try{this.timers||(_e.hasInstance()?(this.timers=_e.getInstance("InventreeCard",!0),this.logger.log("InventreeCard","Using existing global TimerManager instance",{category:"card",subsystem:"initialization"})):(this.timers=new _e("InventreeCard",!0),this.logger.log("InventreeCard","Created new local TimerManager instance",{category:"card",subsystem:"initialization"}))),this._renderingService=Pe.getInstance(),this._controller=Me.getInstance(),this._state=Ee.getInstance(),this.cache=ke.getInstance(),this.logger.log("InventreeCard","Services initialized successfully",{category:"card",subsystem:"initialization"})}catch(e){const t=e instanceof Error?e.message:String(e);this.logger.error("InventreeCard",`Failed to initialize services: ${t}`,{category:"card",subsystem:"initialization"})}}requestUpdate(e,t){try{super.requestUpdate(e,t),"config"===e&&t!==this.config&&(this.logger&&this.logger.log("Card","Config changed, updating controller and rendering",{category:"card",subsystem:"update"}),this._controller&&this.config&&this._controller.setConfig(this.config),this._debouncedRender())}catch(e){console.error("Critical error in requestUpdate:",e),this.logger&&this.logger.error("Card",`Critical error in requestUpdate: ${e}`)}}disconnectedCallback(){super.disconnectedCallback();try{this._isDestroyed=!0,this.timers&&this.timers.clearAll(),this._forceRenderListener&&(window.removeEventListener("inventree-force-render",this._forceRenderListener),this._forceRenderListener=null),this._clearEntitySubscriptions(),this._websocketSubscriptions.forEach((e=>e())),this._websocketSubscriptions=[],this._cleanupFunctions.forEach((e=>e())),this._cleanupFunctions=[],null!==this._apiDiagnosticsTimer&&(window.clearTimeout(this._apiDiagnosticsTimer),this._apiDiagnosticsTimer=null),null!==this._renderDebounceTimer&&(window.clearTimeout(this._renderDebounceTimer),this._renderDebounceTimer=null),this._useRedux&&this.config&&(vi.dispatch({type:"config/setCardConfig",payload:this.config}),this.logger.log("Card","Dispatched config to Redux store",{category:"redux",subsystem:"dispatch"}))}catch(e){console.error("InventreeCard: Error in disconnectedCallback",e)}}_renderDebugTestPattern(){var e,t,i;const r=this.getParts(),a=r?r.length:0,s=this._hass&&(null===(e=this.config)||void 0===e?void 0:e.entity)?this._hass.states[this.config.entity]:void 0;return q`
                <ha-card style="padding: 16px;">
                    <div style="border: 3px solid blue; padding: 16px; margin-bottom: 16px; background: #f0f7ff;">
                        <h2 style="color: blue; margin-top: 0;">InvenTree Card Debug Mode</h2>
                        <p>This is a special debug rendering to diagnose layout issues.</p>
                        
                        <h3>Component Status:</h3>
                        <ul>
                            <li>Card Version: ${"1.0.0"}</li>
                            <li>HASS Available: ${this._hass?"Yes":"No"}</li>
                            <li>Config Available: ${this.config?"Yes":"No"}</li>
                            <li>Entity: ${(null===(t=this.config)||void 0===t?void 0:t.entity)||"Not set"}</li>
                            <li>View Type: ${(null===(i=this.config)||void 0===i?void 0:i.view_type)||"Not set"}</li>
                            <li>Parts Count: ${a}</li>
                        </ul>
                        
                        <h3>Service Status:</h3>
                        <ul>
                            <li>RenderingService: ${this._renderingService?"Available":"Missing"}</li>
                            <li>API: ${this.api?"Available":"Missing"}</li>
                            <li>WebSocketService: ${Ie.getInstance()?"Available":"Missing"}</li>
                            <li>ParameterService: ${this.parameterService?"Available":"Missing"}</li>
                            <li>CacheService: ${ke.getInstance()?"Available":"Missing"}</li>
                        </ul>
                        
                        <h3>First 3 Parts:</h3>
                        <pre style="background: #eee; padding: 8px; max-height: 200px; overflow: auto; font-size: 12px;">
${r&&r.length>0?JSON.stringify(r.slice(0,3),null,2):"No parts available"}
                        </pre>
                        
                        <h3>Raw Entity State:</h3>
                        <pre style="background: #eee; padding: 8px; max-height: 200px; overflow: auto; font-size: 12px;">
${s?JSON.stringify(s,null,2):"No entity state available"}
                        </pre>
                    </div>
                </ha-card>
            `}_setupDebugMode(e){var t;if(this.logger.setDebugConfig(e),this.logger.log("Card","Debug mode configuration",{category:"card",subsystem:"debug",data:{debug:!!e.debug,debug_card:!!e.debug_card,show_debug:!!e.show_debug}}),null===(t=e.direct_api)||void 0===t?void 0:t.enabled){const t=Le.getInstance();"websocket"===e.direct_api.method&&e.direct_api.websocket_url&&(t.configure({url:e.direct_api.websocket_url,enabled:!0,apiKey:e.direct_api.api_key,debug:e.debug||e.debug_websocket||!1}),t.connect())}}_handleServiceInitialization(){var e;if(this._hass&&!this._isDestroyed&&(!this.parameterService||!this.api))try{this.logger.log("InventreeCard","🔄 Initializing services",{category:"card",subsystem:"lifecycle"}),(null===(e=this.config.direct_api)||void 0===e?void 0:e.enabled)&&this.config.direct_api.url&&this.config.direct_api.api_key&&(this.api||(this.api=new Te(this.config.direct_api.url,this.config.direct_api.api_key),this.logger.log("InventreeCard","API initialized",{category:"initialization",subsystem:"services"}))),this.parameterService||(this.parameterService=Ae.getInstance(),this.logger.log("InventreeCard","Parameter service initialized",{category:"initialization",subsystem:"services"}),this.api&&this.parameterService&&this.api.setParameterService(this.parameterService)),this.logger.log("InventreeCard","✅ Service initialization sequence complete",{category:"card",subsystem:"lifecycle"}),this._apiDiagnosticsTimer||(this._apiDiagnosticsTimer=this.timers.setTimeout((()=>{this._runApiDiagnostics()}),5e3,"initial-api-diagnostics"))}catch(e){this.logger.error("InventreeCard",`Error during service initialization: ${e}`,{category:"initialization",subsystem:"services"})}}_runApiDiagnostics(){if(!this._isDestroyed)try{const e=this._controller,t=e.getWebSocketDiagnostics();(this.config.debug||this.config.debug_api||this.config.debug_diagnostics)&&this.logger.log("InventreeCard",`API Stats: ${JSON.stringify(t)}`,{category:"api",subsystem:"diagnostics"}),e.resetApiFailures(),this._apiDiagnosticsTimer||(this._apiDiagnosticsTimer=this.timers.setTimeout((()=>{this._apiDiagnosticsTimer=null,this._runApiDiagnostics()}),6e4,"api-diagnostics"))}catch(e){this.logger.error("InventreeCard",`Error in API diagnostics: ${e}`,{category:"api",subsystem:"diagnostics"}),this._apiDiagnosticsTimer||(this._apiDiagnosticsTimer=this.timers.setTimeout((()=>{this._apiDiagnosticsTimer=null,this._runApiDiagnostics()}),12e4,"api-diagnostics-error-backoff"))}}_setupEventListeners(){this.logger.log("Card","Setting up event listeners"),this._forceRenderListener||(this._forceRenderListener=()=>{this.requestUpdate()},window.addEventListener("inventree-force-render",this._forceRenderListener))}dispatch(e){super.dispatch(e),this.logger.log("Card",`Dispatched action: ${e.type}`,{category:"redux",subsystem:"dispatch"})}};t._instance=null,t._isSingleton=!1,t.styles=[g`
                .diagnostic-tools {
                    margin-top: 16px;
                    padding: 12px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                
                .diagnostic-tools h3 {
                    margin-top: 0;
                    margin-bottom: 8px;
                }
                
                .api-status {
                    margin-bottom: 12px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                
                .status-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 8px;
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 4px;
                }
                
                .status-label {
                    font-weight: bold;
                }
                
                .status-value {
                    padding: 0 4px;
                }
                
                .status-value.success {
                    color: green;
                }
                
                .status-value.warning {
                    color: orange;
                }
                
                .status-value.error {
                    color: red;
                }
                
                .diagnostic-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                
                .diagnostic-buttons button {
                    padding: 8px 12px;
                    border-radius: 4px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    cursor: pointer;
                }
                
                .diagnostic-buttons button:hover {
                    background: var(--primary-color-light);
                }
            `],c([fe({attribute:!1})],t.prototype,"config",void 0),c([be()],t.prototype,"_config",void 0),c([be()],t.prototype,"_reduxConfig",void 0),c([be()],t.prototype,"_reduxParts",void 0),c([be()],t.prototype,"_useRedux",void 0),t=Ki=c([ge("inventree-card")],t)}catch(me){if(console.error("Error defining InventreeCard:",me),!customElements.get(o)){console.log("Attempting fallback definition for InventreeCard");try{class e extends ue{setConfig(e){this.config=e}get hass(){return this._hass}set hass(e){this._hass=e}getCardSize(){return 3}static get styles(){return g`
                        ha-card {
                            padding: 16px;
                            text-align: center;
                        }
                    `}render(){var e;return q`
                        <ha-card>
                            <h2>InvenTree Card (Fallback)</h2>
                            <p>Normal card failed to load - see console for errors</p>
                            ${(null===(e=this.config)||void 0===e?void 0:e.entity)?q`<p>Entity: ${this.config.entity}</p>`:q`<p>No entity configured</p>`}
                        </ha-card>
                    `}}c([fe({attribute:!1})],e.prototype,"config",void 0),c([fe({attribute:!1})],e.prototype,"_hass",void 0),customElements.define(o,e)}catch(e){console.error("Even fallback InventreeCard failed to register:",e)}}}window.customCards=window.customCards||[],window.customCards.push({type:"inventree-card",name:"InvenTree Card",description:"A card for displaying InvenTree inventory data",preview:!0});let Yi=class extends _i{constructor(){super(...arguments),this.parts=[]}render(){var e,t,i,r,a,s,o,n,c,l,d;const h=Ee.getInstance(),u=Me.getInstance(),p=this.entity?h.getNewestData(this.entity):[],g=u.getParts();if(!this.parts||0===this.parts.length)return q`
        <div class="no-parts">
          <h3>No parts available in entity ${this.entity}</h3>
          
          <div class="debug-section">
            <div><strong>Entity:</strong> ${this.entity}</div>
            <div><strong>View Type:</strong> ${null===(e=this.config)||void 0===e?void 0:e.view_type}</div>
            <div><strong>Parameter Service Available:</strong> ${!!this._parameterService}</div>
            <div><strong>Parts from props:</strong> ${(null===(t=this.parts)||void 0===t?void 0:t.length)||0}</div>
            <div><strong>Parts from state:</strong> ${(null==p?void 0:p.length)||0}</div>
            <div><strong>Parts from controller:</strong> ${(null==g?void 0:g.length)||0}</div>
            <div><strong>WebSocket Config:</strong> ${(null===(r=null===(i=this.config)||void 0===i?void 0:i.direct_api)||void 0===r?void 0:r.websocket_url)||"Not configured"}</div>
            
            <div class="debug-buttons">
              <button @click=${()=>this._debugLoadData()}>Force Data Load</button>
              <button @click=${()=>this._debugForceFilter()}>Force Filter</button>
              <button @click=${()=>this._debugResetState()}>Reset State</button>
              <button @click=${()=>this._debugFixData()}>Fix Data</button>
            </div>
            
            ${(null===(o=null===(s=null===(a=this.config)||void 0===a?void 0:a.parameters)||void 0===s?void 0:s.conditions)||void 0===o?void 0:o.length)?q`
              <div><strong>Active Conditions:</strong></div>
              <ul>
                ${this.config.parameters.conditions.map((e=>q`
                  <li>
                    ${e.parameter} ${e.operator} "${e.value}" 
                    (${e.action}: ${e.action_value})
                  </li>
                `))}
              </ul>
            `:""}
            
            ${(null==p?void 0:p.length)?q`
              <div><strong>First part in state:</strong> ${p[0].name} (ID: ${p[0].pk})</div>
            `:""}
            
            ${(null==g?void 0:g.length)?q`
              <div><strong>First part in controller:</strong> ${g[0].name} (ID: ${g[0].pk})</div>
            `:""}
          </div>
        </div>
      `;const v=this.parts||[],m=this._filteredParts||[];return q`
      <div class="base-layout">
        <div class="header">Base Layout View (Debug Mode)</div>
        
        <div class="filter-info">
          <div><strong>Parts before filtering:</strong> ${v.length}</div>
          <div><strong>Parts after filtering:</strong> ${m.length}</div>
        </div>
        
        <div class="header">Unfiltered Parts:</div>
        ${v.map((e=>this._renderPartItem(e,!1)))}
        
        ${m.length!==v.length?q`
          <div class="header">Filtered Parts:</div>
          ${m.map((e=>this._renderPartItem(e,!0)))}
        `:""}
        
        <div class="debug-section">
          <div><strong>Entity:</strong> ${this.entity}</div>
          <div><strong>View Type:</strong> ${null===(n=this.config)||void 0===n?void 0:n.view_type}</div>
          <div><strong>Parameter Service Available:</strong> ${!!this._parameterService}</div>
          
          ${(null===(d=null===(l=null===(c=this.config)||void 0===c?void 0:c.parameters)||void 0===l?void 0:l.conditions)||void 0===d?void 0:d.length)?q`
            <div><strong>Active Conditions:</strong></div>
            <ul>
              ${this.config.parameters.conditions.map((e=>q`
                <li>
                  ${e.parameter} ${e.operator} "${e.value}" 
                  (${e.action}: ${e.action_value})
                </li>
              `))}
            </ul>
          `:""}
        </div>
      </div>
    `}_renderPartItem(e,t){return q`
      <div class="part-item" style=${t?"border-color: green;":""}>
        <div class="part-name">${e.name} (ID: ${e.pk})</div>
        
        <div class="part-detail">
          <span class="detail-label">Stock:</span>
          <span>${e.in_stock} / ${e.minimum_stock} minimum</span>
        </div>
        
        ${e.description?q`
          <div class="part-detail">
            <span class="detail-label">Description:</span>
            <span>${e.description}</span>
          </div>
        `:""}
        
        ${e.category?q`
          <div class="part-detail">
            <span class="detail-label">Category:</span>
            <span>${e.category}</span>
          </div>
        `:""}
        
        ${e.parameters&&e.parameters.length>0?q`
          <div class="parameters">
            <div class="part-detail"><strong>Parameters:</strong></div>
            ${e.parameters.map((e=>{var t;return q`
              <div class="parameter-item">
                <span class="parameter-name">${(null===(t=e.template_detail)||void 0===t?void 0:t.name)||"Unknown"}:</span>
                <span>${e.data}</span>
              </div>
            `}))}
          </div>
        `:""}
      </div>
    `}_applyParameterFilteringSync(e){const t=super._applyParameterFilteringSync(e);return this._filteredParts=[...t],e}async _applyParameterFiltering(e){const t=await super._applyParameterFiltering(e);return this._filteredParts=[...t],e}_debugLoadData(){this.logger.log("BaseLayoutView","Force loading data",{category:"layouts",subsystem:"debugging"}),this._loadData().then((()=>{this.requestUpdate()}))}_debugForceFilter(){this.logger.log("BaseLayoutView","Force filtering data",{category:"layouts",subsystem:"debugging"}),this.parts&&this.parts.length>0?this._applyParameterFiltering(this.parts).then((e=>{this._filteredParts=e,this.requestUpdate()})):this.logger.warn("BaseLayoutView","No parts to filter",{category:"layouts",subsystem:"debugging"})}_debugResetState(){this.logger.log("BaseLayoutView","Resetting state and cache",{category:"layouts",subsystem:"debugging"}),this.cache.clear(),Me.getInstance();Ee.getInstance().clearCache(),this._parameterService&&(this._parameterService.clearCache(),this._parameterService.clearConditionCache()),this._loadData().then((()=>{this.requestUpdate()}))}_debugFixData(){this.logger.log("BaseLayoutView","Fixing data",{category:"layouts",subsystem:"debugging"});const e=Ee.getInstance(),t=this.entity?e.getNewestData(this.entity):[];t&&t.length>0?(this.parts=[...t],this.requestUpdate(),this.logger.log("BaseLayoutView",`Fixed data with ${t.length} parts`,{category:"layouts",subsystem:"debugging"})):this.logger.warn("BaseLayoutView","No data to fix",{category:"layouts",subsystem:"debugging"})}};Yi.styles=g`
    :host {
      display: block;
      padding: 0;
    }
    
    .base-layout {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .header {
      font-weight: bold;
      margin-bottom: 8px;
      padding: 4px;
      background: rgba(0,0,0,0.05);
    }
    
    .part-item {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .part-name {
      font-weight: bold;
    }
    
    .part-detail {
      font-size: 0.9em;
      display: flex;
      flex-direction: row;
      gap: 4px;
    }
    
    .detail-label {
      font-weight: bold;
      min-width: 100px;
    }
    
    .parameters {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #eee;
    }
    
    .parameter-item {
      padding: 4px;
      margin: 2px 0;
      font-size: 0.9em;
      display: flex;
      flex-direction: row;
      gap: 4px;
    }
    
    .parameter-name {
      font-weight: bold;
      min-width: 150px;
    }
    
    .debug-section {
      margin-top: 16px;
      padding: 8px;
      border: 1px dashed #aaa;
      border-radius: 4px;
      background: rgba(0,0,0,0.03);
    }
    
    .filter-info {
      margin-top: 8px;
      padding: 4px;
      border-left: 4px solid #f0ad4e;
      background: rgba(240, 173, 78, 0.1);
    }
    
    .debug-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 10px 0;
    }
    
    .debug-buttons button {
      padding: 6px 12px;
      background: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .debug-buttons button:hover {
      background: #388e3c;
    }
    
    .no-parts {
      padding: 16px;
      background: #f5f5f5;
      border-radius: 4px;
    }
  `,c([fe({attribute:!1})],Yi.prototype,"hass",void 0),c([fe({attribute:!1})],Yi.prototype,"config",void 0),c([fe({attribute:!1})],Yi.prototype,"parts",void 0),c([fe({type:String})],Yi.prototype,"entity",void 0),Yi=c([ge("inventree-base-layout-view")],Yi);let Qi=class extends _i{constructor(){super(...arguments),this.parts=[],this._filterTrace=[],this._dataSourceStats={},this._conditionResults=new Map,this._parameterCache=new Map,this._showDataFlow=!0,this._showWebSocket=!0,this._showFilterTrace=!0,this._showCacheStats=!1}async _applyParameterFiltering(e){this._filterTrace=[],this._addTraceEntry("START",`Starting filter process with ${e.length} parts`),this._updateDataSourceStats(),this._captureParameterCache(),this._addTraceEntry("CALL","Calling BaseLayout._applyParameterFiltering");const t=await super._applyParameterFiltering(e);return this._addTraceEntry("RESULT",`Filter result: ${t.length} parts passed filtering`),this._analyzeConditionResults(e),t}_addTraceEntry(e,t,i){this._filterTrace.push({step:e,message:t,data:i}),this.logger.log("DataFlowDebug",`${e}: ${t}`,{category:"debug",subsystem:"data-flow"})}_updateDataSourceStats(){const e=Ee.getInstance();this.entity&&(this._dataSourceStats={websocket:{count:e.getWebSocketData(this.entity).length,lastUpdate:e.getLastUpdate("websocket",this.entity)},api:{count:e.getApiData(this.entity).length,lastUpdate:e.getLastUpdate("api",this.entity)},hass:{count:e.getHassData(this.entity).length,lastUpdate:e.getLastUpdate("hass",this.entity)},newest:{count:e.getNewestData(this.entity).length,lastUpdate:Math.max(e.getLastUpdate("websocket",this.entity),e.getLastUpdate("api",this.entity),e.getLastUpdate("hass",this.entity))}})}_captureParameterCache(){if(!this._parameterService)return;const e=new Map;this.parts&&this.parts.forEach((t=>{t.parameters&&t.parameters.forEach((i=>{var r,a;const s=null===(r=i.template_detail)||void 0===r?void 0:r.name;if(s){const i=`part:${t.pk}:${s}`,r=null===(a=this._parameterService)||void 0===a?void 0:a.getParameterValueFromPart(t,s);null!=r&&e.set(i,String(r))}}))})),this._parameterCache=e}_analyzeConditionResults(e){var t,i;if(!this._parameterService||!(null===(i=null===(t=this.config)||void 0===t?void 0:t.parameters)||void 0===i?void 0:i.conditions))return;const r=new Map;for(const t of e)for(const e of this.config.parameters.conditions)if("filter"===e.action){const i=`${t.pk}:${e.parameter}:${e.operator}:${e.value}`,a=this._parameterService.matchesConditionSyncVersion(t,e);r.set(i,a),this._addTraceEntry("CONDITION",`Part ${t.pk} ${a?"MATCHES":"does NOT match"} condition: ${e.parameter} ${e.operator} ${e.value}`,{partId:t.pk,condition:e,result:a})}this._conditionResults=r}_debugReloadData(){this._addTraceEntry("MANUAL","User requested data reload"),this._loadData().then((()=>{this._addTraceEntry("COMPLETE","Data reload completed"),this.requestUpdate()}))}_debugClearCache(){this._addTraceEntry("CACHE","Clearing all caches"),this._parameterService&&(this._parameterService.clearCache(),this._parameterService.clearConditionCache()),Ee.getInstance().clearCache(),this.cache.clear(),this._debugReloadData()}_renderDataFlowDiagram(){var e,t,i,r,a,s,o;const n=(null===(e=this._dataSourceStats.websocket)||void 0===e?void 0:e.count)>0,c=(null===(t=this._dataSourceStats.api)||void 0===t?void 0:t.count)>0,l=(null===(i=this._dataSourceStats.hass)||void 0===i?void 0:i.count)>0,d=n?"websocket":c?"api":l?"hass":null;return q`
      <div class="section">
        <div class="section-title">Data Flow Diagram</div>
        <div class="flow-diagram">
          <!-- Data Sources -->
          <div class="flow-step">
            <div class="flow-node ${n?"active":"inactive"}">
              WebSocket
              <div class="data-count">${(null===(r=this._dataSourceStats.websocket)||void 0===r?void 0:r.count)||0}</div>
            </div>
            <div class="flow-arrow"></div>
            <div class="flow-node ${"websocket"===d?"active":"inactive"}">WebSocket Store</div>
          </div>
          
          <div class="flow-step">
            <div class="flow-node ${c?"active":"inactive"}">
              API
              <div class="data-count">${(null===(a=this._dataSourceStats.api)||void 0===a?void 0:a.count)||0}</div>
            </div>
            <div class="flow-arrow"></div>
            <div class="flow-node ${"api"===d?"active":"inactive"}">API Store</div>
          </div>
          
          <div class="flow-step">
            <div class="flow-node ${l?"active":"inactive"}">
              HASS
              <div class="data-count">${(null===(s=this._dataSourceStats.hass)||void 0===s?void 0:s.count)||0}</div>
            </div>
            <div class="flow-arrow"></div>
            <div class="flow-node ${"hass"===d?"active":"inactive"}">HASS Store</div>
          </div>
          
          <!-- Data Consolidation -->
          <div class="flow-step">
            <div class="flow-node active">
              Consolidated Store
              <div class="data-count">${(null===(o=this._dataSourceStats.newest)||void 0===o?void 0:o.count)||0}</div>
            </div>
            <div class="flow-arrow"></div>
            <div class="flow-node active">BaseLayout Data</div>
          </div>
          
          <!-- Filtering Pipeline -->
          <div class="flow-step">
            <div class="flow-node active">
              Parameter Service
            </div>
            <div class="flow-arrow"></div>
            <div class="flow-node active">
              Filter Logic
              <div class="data-count">${this._filteredParts.length}</div>
            </div>
          </div>
          
          <!-- Result -->
          <div class="flow-step">
            <div class="flow-node active">
              Filtered Result
              <div class="data-count">${this._filteredParts.length}</div>
            </div>
            <div class="flow-arrow"></div>
            <div class="flow-node active">
              Render Pipeline
            </div>
          </div>
        </div>
      </div>
    `}_renderWebSocketDiagnostics(){var e,t,i,r;const a=Me.getInstance();let s={isConnected:!1};try{s={isConnected:!!a.getWebSocketPlugin().isConnected()}}catch(e){console.error("Error getting WebSocket status:",e)}return q`
      <div class="section">
        <div class="section-title">WebSocket Diagnostics</div>
        
        <div class="websocket">
          <div class="websocket-status">
            <div class="status-indicator ${s.isConnected?"status-connected":"status-disconnected"}"></div>
            <div>Status: ${s.isConnected?"Connected":"Disconnected"}</div>
          </div>
          
          <div>WebSocket URL: ${(null===(t=null===(e=this.config)||void 0===e?void 0:e.direct_api)||void 0===t?void 0:t.websocket_url)||"Not configured"}</div>
          <div>WebSocket Data Count: ${(null===(i=this._dataSourceStats.websocket)||void 0===i?void 0:i.count)||0} parts</div>
          <div>
            Last WebSocket Update: 
            ${(null===(r=this._dataSourceStats.websocket)||void 0===r?void 0:r.lastUpdate)?new Date(this._dataSourceStats.websocket.lastUpdate).toLocaleString():"Never"}
          </div>
        </div>
      </div>
    `}_renderFilterTrace(){return this._filterTrace.length?q`
      <div class="section">
        <div class="section-title">Filter Trace</div>
        <div class="filter-trace">
          ${this._filterTrace.map((e=>q`
            <div class="filter-entry">
              <span class="step-name">[${e.step}]</span>
              ${e.message}
            </div>
          `))}
        </div>
      </div>
    `:q`
        <div class="section">
          <div class="section-title">Filter Trace</div>
          <div>No filtering has occurred yet</div>
        </div>
      `}_renderCacheStats(){const e=ke.getInstance().getStats();return q`
      <div class="section">
        <div class="section-title">Cache Statistics</div>
        <div>Total Cache Entries: ${e.size} (${e.expired} expired)</div>
        <div>Fallback Entries: ${e.fallbackCount}</div>
        
        <div class="section-title" style="margin-top: 16px;">Categories</div>
        <div class="cache-stats">
          ${Object.entries(e.byCategory).map((([e,t])=>q`
            <div class="cache-category">
              <div class="category-name">${e}</div>
              <div class="stats-value">${t} entries</div>
            </div>
          `))}
        </div>
      </div>
    `}_renderFilterConditions(){var e,t;if(!(null===(t=null===(e=this.config)||void 0===e?void 0:e.parameters)||void 0===t?void 0:t.conditions)||0===this.config.parameters.conditions.length)return q`
        <div class="section">
          <div class="section-title">Filter Conditions</div>
          <div>No conditions are configured</div>
        </div>
      `;const i=this.config.parameters.conditions.filter((e=>"filter"===e.action));return q`
      <div class="section">
        <div class="section-title">Filter Conditions</div>
        
        ${0===i.length?q`
          <div>No filter conditions are configured</div>
        `:q`
          ${i.map((e=>q`
            <div class="condition">
              <div>
                ${"show"===e.action_value?"SHOW":"HIDE"}:
              </div>
              <div class="condition-text">
                ${e.parameter} ${e.operator} "${e.value}"
              </div>
            </div>
          `))}
        `}
      </div>
    `}render(){var e;return q`
      <div class="data-flow-debug">
        <div class="header">
          <div>Data Flow Debug: ${this.entity||"No Entity"}</div>
          <div>
            <span class="part-count">Filtered: ${this._filteredParts.length} / ${(null===(e=this.parts)||void 0===e?void 0:e.length)||0}</span>
          </div>
        </div>
        
        <div class="controls">
          <button class="toggle-btn ${this._showDataFlow?"active":""}" 
            @click=${()=>{this._showDataFlow=!this._showDataFlow,this.requestUpdate()}}>
            Data Flow
          </button>
          <button class="toggle-btn ${this._showWebSocket?"active":""}" 
            @click=${()=>{this._showWebSocket=!this._showWebSocket,this.requestUpdate()}}>
            WebSocket
          </button>
          <button class="toggle-btn ${this._showFilterTrace?"active":""}" 
            @click=${()=>{this._showFilterTrace=!this._showFilterTrace,this.requestUpdate()}}>
            Filter Trace
          </button>
          <button class="toggle-btn ${this._showCacheStats?"active":""}" 
            @click=${()=>{this._showCacheStats=!this._showCacheStats,this.requestUpdate()}}>
            Cache Stats
          </button>
          
          <div style="flex-grow: 1;"></div>
          
          <button class="action-btn" @click=${()=>this._debugReloadData()}>
            Reload Data
          </button>
          <button class="action-btn danger" @click=${()=>this._debugClearCache()}>
            Clear Cache
          </button>
        </div>
        
        ${this._renderFilterConditions()}
        
        ${this._showDataFlow?this._renderDataFlowDiagram():""}
        ${this._showWebSocket?this._renderWebSocketDiagnostics():""}
        ${this._showFilterTrace?this._renderFilterTrace():""}
        ${this._showCacheStats?this._renderCacheStats():""}
      </div>
    `}};Qi.styles=g`
    :host {
      display: block;
      padding: 16px;
    }
    
    .data-flow-debug {
      display: flex;
      flex-direction: column;
      gap: 16px;
      font-family: var(--paper-font-body1_-_font-family, 'Roboto', 'Noto', sans-serif);
    }
    
    .header {
      font-weight: bold;
      padding: 8px;
      background: var(--primary-color, #03a9f4);
      color: white;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 8px 0;
    }
    
    .toggle-btn {
      padding: 4px 12px;
      background: var(--primary-color, #03a9f4);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }
    
    .toggle-btn:not(.active) {
      background: rgba(0,0,0,0.1);
      color: rgba(0,0,0,0.7);
    }
    
    .action-btn {
      padding: 6px 12px;
      background: var(--primary-color, #03a9f4);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }
    
    .danger {
      background: #F44336;
    }
    
    .section {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    
    .section-title {
      font-weight: bold;
      font-size: 1.1em;
      margin-bottom: 12px;
      color: var(--primary-color, #03a9f4);
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
    }
    
    .flow-diagram {
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow-x: auto;
    }
    
    .flow-step {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .flow-node {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      min-width: 120px;
      text-align: center;
      position: relative;
    }
    
    .flow-node.active {
      border-color: #4CAF50;
      background: rgba(76, 175, 80, 0.1);
    }
    
    .flow-node.inactive {
      border-color: #F44336;
      background: rgba(244, 67, 54, 0.1);
    }
    
    .flow-arrow {
      flex-grow: 1;
      height: 2px;
      background: #ddd;
      position: relative;
      min-width: 40px;
    }
    
    .flow-arrow::after {
      content: '';
      position: absolute;
      right: 0;
      top: -4px;
      border-style: solid;
      border-width: 5px 0 5px 8px;
      border-color: transparent transparent transparent #ddd;
    }
    
    .data-source {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
    }
    
    .data-source.active {
      border-color: #4CAF50;
    }
    
    .data-source-name {
      font-weight: bold;
    }
    
    .data-count {
      background: rgba(0,0,0,0.05);
      padding: 2px 6px;
      border-radius: 12px;
      font-size: 0.9em;
    }
    
    .timestamp {
      font-size: 0.8em;
      color: #666;
    }
    
    .filter-trace {
      font-family: monospace;
      font-size: 0.9em;
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .filter-entry {
      padding: 4px 0;
      border-bottom: 1px solid #eee;
    }
    
    .step-name {
      font-weight: bold;
      margin-right: 8px;
      color: #0288d1;
    }
    
    .condition {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    
    .condition-result {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    
    .condition-result.true {
      background: #4CAF50;
    }
    
    .condition-result.false {
      background: #F44336;
    }
    
    .condition-text {
      flex-grow: 1;
    }
    
    .websocket {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .websocket-status {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    
    .status-connected {
      background: #4CAF50;
    }
    
    .status-disconnected {
      background: #F44336;
    }
    
    .cache-stats {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }
    
    .cache-category {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .category-name {
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .stats-value {
      background: rgba(0,0,0,0.05);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
    }
    
    .part-count {
      background: rgba(2, 136, 209, 0.1);
      color: #0288d1;
      padding: 4px 8px;
      border-radius: 16px;
      font-weight: bold;
    }
  `,c([fe({attribute:!1})],Qi.prototype,"hass",void 0),c([fe({attribute:!1})],Qi.prototype,"config",void 0),c([fe({attribute:!1})],Qi.prototype,"parts",void 0),c([fe({type:String})],Qi.prototype,"entity",void 0),c([be()],Qi.prototype,"_filterTrace",void 0),c([be()],Qi.prototype,"_dataSourceStats",void 0),c([be()],Qi.prototype,"_conditionResults",void 0),c([be()],Qi.prototype,"_parameterCache",void 0),c([be()],Qi.prototype,"_showDataFlow",void 0),c([be()],Qi.prototype,"_showWebSocket",void 0),c([be()],Qi.prototype,"_showFilterTrace",void 0),c([be()],Qi.prototype,"_showCacheStats",void 0),Qi=c([ge("inventree-data-flow-debug")],Qi);let Xi=class extends _i{constructor(){super(...arguments),this.parts=[],this._filteredParts=[],this._debugEntities=[],this._conditionResults=new Map,this._parameterValues=new Map,this._crossReferences=new Map,this._expandedParts=new Set,this._showUnfiltered=!0,this._showFiltered=!0,this._showConditionDetails=!0,this._showCrossReferences=!0,this._showParameterValues=!0,this._websocketMessages=[],this._parameterUpdates=[],this._dataFlowView="parts",this._selectedPart=null,this._dataSources=[],this._cacheStats={},this._eventListenerAdded=!1,this._statsInterval=null,this._showRawState=!1,this._showOrphanedParts=!1,this._showParameterCache=!1,this._selectedEntityForState=null,this._activeTab="data-flow",this._showUnfilteredParts=!1,this._showFilteredParts=!1,this._selectedPartForInspection=null,this._renderTimings=[],this._showTimings=!0}async _applyParameterFiltering(e){this._collectParameterValues(e),this._analyzeConditions(e),this._collectCrossReferences(),this._collectEntities();return await super._applyParameterFiltering(e)}_collectEntities(){const e=new Set;this.entity&&e.add(this.entity),this._crossReferences.forEach(((t,i)=>{t.forEach((t=>{const i=t.split(":");if(i.length>=2){const t=i[0];t&&"part"!==t&&e.add(t)}}))})),this._debugEntities=Array.from(e)}_analyzeConditions(e){var t,i;const r=new Map,a=(null===(i=null===(t=this.config)||void 0===t?void 0:t.parameters)||void 0===i?void 0:i.conditions)||[];e.forEach((e=>{a.forEach((t=>{if(this._parameterService){const i=`${e.pk}:${t.parameter}:${t.operator}:${t.value}`,a=this._parameterService.matchesConditionSyncVersion(e,t);r.set(i,a)}}))})),this._conditionResults=r}_collectParameterValues(e){const t=new Map;e.forEach((e=>{e.parameters&&e.parameters.forEach((i=>{var r;const a=`part:${e.pk}:${(null===(r=i.template_detail)||void 0===r?void 0:r.name)||"unknown"}`;t.set(a,i.data)}))})),this.hass&&Object.entries(this.hass.states).forEach((([e,i])=>{i.attributes&&(Object.entries(i.attributes).forEach((([i,r])=>{const a=`${e}:${i}`;t.set(a,r)})),t.set(`${e}:state`,i.state))})),this._parameterValues=t}_collectCrossReferences(){var e,t;const i=new Map;((null===(t=null===(e=this.config)||void 0===e?void 0:e.parameters)||void 0===t?void 0:t.conditions)||[]).forEach((e=>{var t;const r=e.parameter;if(r.includes(":")){if("part"!==r.split(":")[0]){const e=r;i.has(e)||i.set(e,[]),null===(t=i.get(e))||void 0===t||t.push(r)}}})),this._crossReferences=i}_togglePartExpansion(e){this._expandedParts.has(e)?this._expandedParts.delete(e):this._expandedParts.add(e),this.requestUpdate()}_debugForceRedraw(){this.logger.log("DebugView","Force redrawing",{category:"debug",subsystem:"filtering"}),this.requestUpdate()}_debugRefreshData(){this.logger.log("DebugView","Refreshing data",{category:"debug",subsystem:"filtering"}),this._loadData().then((()=>{this.requestUpdate()}))}_debugClearCache(){this.logger.log("DebugView","Clearing cache",{category:"debug",subsystem:"filtering"});const e=ke.getInstance(),t=Ee.getInstance();e.clear(),t.clearCache(),window.dispatchEvent(new CustomEvent("inventree-force-render")),this._updateCacheStats(),this._updateDataSourceStats(),this.requestUpdate()}_getParameterDisplay(e){return null==e?"<null>":"object"==typeof e?JSON.stringify(e):"boolean"==typeof e?e?"true":"false":String(e)}_renderParameterValue(e,t){const i=this._getParameterDisplay(t),r=this._crossReferences.has(e);return q`
      <div class="parameter-item">
        <span class="parameter-name">${e}:</span>
        <span class="parameter-value ${r?"cross-reference":""}">${i}</span>
        ${r?q`
          <span class="parameter-references">Used in conditions</span>
        `:""}
      </div>
    `}_renderConditionResult(e,t){const i=`${e.pk}:${t.parameter}:${t.operator}:${t.value}`,r=this._conditionResults.get(i),a=t.parameter.split(":"),s=a.length>1&&"part"!==a[0];return q`
      <div class="condition-item">
        <div class="condition-result">
          <div class="result-icon ${r?"result-true":"result-false"}"></div>
          <span class="condition-text ${s?"cross-reference":""}">
            ${t.parameter} ${t.operator} "${t.value}"
            (${t.action}: ${t.action_value})
          </span>
        </div>
        ${s&&this._showConditionDetails?q`
          <div class="evaluate-trace">
            Value lookup from <code>${t.parameter}</code>: 
            ${this._parameterValues.has(t.parameter)?this._getParameterDisplay(this._parameterValues.get(t.parameter)):"Not found"}
          </div>
        `:""}
      </div>
    `}_renderPartItem(e,t){var i,r;const a=this._expandedParts.has(e.pk);return q`
      <div class="part-item ${t?"filtered":"not-filtered"}">
        <div class="part-header">
          <div class="part-name">
            ${e.name} 
            <span class="part-badge ${t?"badge-show":"badge-hide"}">
              ${t?"VISIBLE":"HIDDEN"}
            </span>
          </div>
          <button class="expand-toggle" @click=${()=>this._togglePartExpansion(e.pk)}>
            ${a?"Collapse":"Expand"}
          </button>
        </div>
        
        ${a?q`
          <div class="part-detail">
            <span class="detail-label">ID:</span>
            <span>${e.pk}</span>
          </div>
          
          <div class="part-detail">
            <span class="detail-label">Stock:</span>
            <span>${e.in_stock} / ${e.minimum_stock} minimum</span>
          </div>
          
          ${e.description?q`
            <div class="part-detail">
              <span class="detail-label">Description:</span>
              <span>${e.description}</span>
            </div>
          `:""}
          
          ${e.category?q`
            <div class="part-detail">
              <span class="detail-label">Category:</span>
              <span>${e.category}</span>
            </div>
          `:""}
          
          ${this._showParameterValues&&e.parameters&&e.parameters.length>0?q`
            <div class="parameters">
              <div class="section-title">Parameters:</div>
              ${e.parameters.map((t=>{var i;const r=`part:${e.pk}:${(null===(i=t.template_detail)||void 0===i?void 0:i.name)||"unknown"}`;return this._renderParameterValue(r,t.data)}))}
            </div>
          `:""}
          
          ${this._showConditionDetails&&(null===(r=null===(i=this.config)||void 0===i?void 0:i.parameters)||void 0===r?void 0:r.conditions)?q`
            <div class="parameters">
              <div class="section-title">Condition Results:</div>
              ${this.config.parameters.conditions.map((t=>this._renderConditionResult(e,t)))}
            </div>
          `:""}
        `:""}
      </div>
    `}_renderCrossReferenceMap(){return this._showCrossReferences&&0!==this._crossReferences.size?q`
      <div class="cross-reference-map">
        <div class="section-title">Cross-References Map:</div>
        ${Array.from(this._crossReferences.entries()).map((([e,t])=>q`
          <div class="cross-ref-item">
            <div class="reference-source">${e}</div>
            <div class="reference-targets">
              ${t.map((e=>q`
                <div class="reference-target">${e}</div>
              `))}
            </div>
          </div>
        `))}
      </div>
    `:q``}_renderParameterValuesList(){if(!this._showParameterValues||0===this._parameterValues.size)return q``;const e=Array.from(this._parameterValues.entries()).filter((([e])=>this._crossReferences.has(e)||Array.from(this._crossReferences.values()).some((t=>t.includes(e))))),t=Array.from(this._parameterValues.entries()).filter((([t])=>!e.some((([e])=>e===t))));return q`
      <div class="debug-section">
        <div class="section-title">Parameter Values:</div>
        
        ${e.length>0?q`
          <div class="subsection-title">Cross-Reference Parameters:</div>
          ${e.map((([e,t])=>this._renderParameterValue(e,t)))}
        `:""}
        
        ${t.length>0?q`
          <div class="subsection-title">Other Parameters:</div>
          ${t.map((([e,t])=>this._renderParameterValue(e,t)))}
        `:""}
      </div>
    `}_renderPartsDebug(){const e=this.parts||[],t=this._filteredParts||[],i=this.entity||"",r=Ee.getInstance();this._getParameterService();const a=r.getTrackedEntities();return!this._selectedEntityForState&&a.length>0&&(this._selectedEntityForState=a[0]),q`
      <div class="debug-view">
        <h3>Data Flow Debug: ${i}</h3>
        
        <div class="debug-counts">
          <span>Filtered: ${t.length} / ${e.length}</span>
        </div>
        
        <div class="debug-tabs">
          <button class="tab ${"data-flow"===this._activeTab?"active":""}" 
                  @click=${()=>this._activeTab="data-flow"}>Data Flow</button>
          <button class="tab ${"websocket"===this._activeTab?"active":""}" 
                  @click=${()=>this._activeTab="websocket"}>WebSocket</button>
          <button class="tab ${"filter-trace"===this._activeTab?"active":""}" 
                  @click=${()=>this._activeTab="filter-trace"}>Filter Trace</button>
          <button class="tab ${"cache"===this._activeTab?"active":""}" 
                  @click=${()=>this._activeTab="cache"}>Cache Stats</button>
          <button class="tab ${"raw-state"===this._activeTab?"active":""}" 
                  @click=${()=>this._activeTab="raw-state"}>Raw State</button>
        </div>
        
        <div class="tab-content">
          ${"data-flow"===this._activeTab?this._renderDataFlow():""}
          ${"websocket"===this._activeTab?this._renderWebSocketDebug():""}
          ${"filter-trace"===this._activeTab?this._renderFilterTrace():""}
          ${"cache"===this._activeTab?this._renderCacheStats():""}
          ${"raw-state"===this._activeTab?this._renderRawStateDebug():""}
        </div>
        
        <div class="debug-tools">
          <div class="debug-buttons">
            <button @click=${this._handleReloadData}>Reload Data</button>
            <button @click=${this._handleClearCache}>Clear Cache</button>
            <button @click=${this._handleForceRender}>Force Redraw</button>
          </div>
          
          <div class="filter-conditions">
            <h4>Filter Conditions</h4>
            ${this._renderFilterConditions()}
          </div>
          
          ${this._showUnfilteredParts?this._renderUnfilteredParts():""}
          ${this._showFilteredParts?this._renderFilteredParts():""}
        </div>
      </div>
    `}render(){return this._recordRenderTiming("debug-view"),this.hass&&this.config?q`
      <div class="debug-container">
        <div class="debug-nav">
          <button 
            class="${"data-flow"===this._activeTab?"active":""}" 
            @click=${()=>this._activeTab="data-flow"}
          >Data Flow</button>
          <button 
            class="${"websocket"===this._activeTab?"active":""}" 
            @click=${()=>this._activeTab="websocket"}
          >WebSocket</button>
          <button 
            class="${"filter-trace"===this._activeTab?"active":""}" 
            @click=${()=>this._activeTab="filter-trace"}
          >Filter Trace</button>
          <button 
            class="${"raw-state"===this._activeTab?"active":""}" 
            @click=${()=>this._activeTab="raw-state"}
          >Raw State</button>
          <button 
            class="${"cache"===this._activeTab?"active":""}" 
            @click=${()=>this._activeTab="cache"}
          >Cache</button>
          <button 
            class="${"part-inspector"===this._activeTab?"active":""}" 
            @click=${()=>this._activeTab="part-inspector"}
          >Part Inspector</button>
          <button 
            class="${"timing"===this._activeTab?"active":""}" 
            @click=${()=>this._activeTab="timing"}
          >Timing</button>
          <button 
            class="${"redux"===this._activeTab?"active":""}" 
            @click=${()=>this._activeTab="redux"}
          >Redux</button>
        </div>

        <div class="debug-content">
          ${"data-flow"===this._activeTab?this._renderDataFlow():""}
          ${"websocket"===this._activeTab?this._renderWebSocketDebug():""}
          ${"filter-trace"===this._activeTab?this._renderFilterTrace():""}
          ${"raw-state"===this._activeTab?this._renderRawStateDebug():""}
          ${"cache"===this._activeTab?this._renderCacheStats():""}
          ${"part-inspector"===this._activeTab?this._renderPartInspector():""}
          ${"timing"===this._activeTab?this._renderTimingInfo():""}
          ${"redux"===this._activeTab?this._renderReduxDebug():""}
        </div>
        
        <!-- Always show quick timing stats at the bottom -->
        <div class="timing-overview">
          <div class="timing-bar">
            <span class="timing-label">Last render: ${this._renderTimings.length>0?new Date(this._renderTimings[this._renderTimings.length-1].time).toLocaleTimeString():"None"}</span>
            <button @click=${this._debugForceRedraw}>Force Redraw</button>
            <button @click=${this._debugRefreshData}>Refresh Data</button>
            <button @click=${this._debugClearCache}>Clear Cache</button>
          </div>
        </div>
      </div>
    `:q`<div>Loading...</div>`}connectedCallback(){super.connectedCallback(),this._eventListenerAdded||(window.addEventListener("inventree-parameter-updated",this._handleParameterUpdateEvent.bind(this)),window.addEventListener("inventree-websocket-connected",this._handleWebSocketEvent.bind(this)),this._eventListenerAdded=!0),this._updateDataSourceStats(),null===this._statsInterval&&(this._statsInterval=this.timers.setInterval((()=>{this._updateDataSourceStats(),this._updateCacheStats()}),5e3,"debug-stats-update-interval"))}disconnectedCallback(){this._eventListenerAdded&&(window.removeEventListener("inventree-parameter-updated",this._handleParameterUpdateEvent.bind(this)),window.removeEventListener("inventree-websocket-connected",this._handleWebSocketEvent.bind(this)),this._eventListenerAdded=!1),null!==this._statsInterval&&(this.timers.clearInterval(this._statsInterval),this._statsInterval=null),super.disconnectedCallback()}_handleParameterUpdateEvent(e){const t=e.detail;t&&t.part_id&&t.parameter_name&&(this._parameterUpdates=[{partId:t.part_id,name:t.parameter_name,value:t.value||"",timestamp:Date.now(),source:t.source||"unknown"},...this._parameterUpdates.slice(0,49)],this.requestUpdate())}_handleWebSocketEvent(e){Me.getInstance().getWebSocketPlugin()&&(this._websocketMessages=[{type:"connection",message:"Connected to WebSocket server",timestamp:Date.now()},...this._websocketMessages.slice(0,49)],this.requestUpdate())}_updateDataSourceStats(){const e=Ee.getInstance(),t=e.getTrackedEntities();this._dataSources=[{name:"WebSocket",count:t.reduce(((t,i)=>t+e.getWebSocketData(i).length),0),lastUpdate:this._getLastWebSocketUpdate()},{name:"API",count:t.reduce(((t,i)=>t+e.getApiData(i).length),0),lastUpdate:this._getLastApiUpdate()},{name:"HASS",count:t.reduce(((t,i)=>t+e.getHassData(i).length),0),lastUpdate:this._getLastHassUpdate()}]}_getLastWebSocketUpdate(){return this._getLastSourceUpdate("websocket")}_getLastApiUpdate(){return this._getLastSourceUpdate("api")}_getLastHassUpdate(){return this._getLastSourceUpdate("hass")}_getLastSourceUpdate(e){const t=Ee.getInstance(),i=t.getTrackedEntities();let r=0;for(const a of i){const i=t.getLastUpdate(e,a);i>r&&(r=i)}return r}_updateCacheStats(){const e=ke.getInstance();this._cacheStats=e.getStats()}_formatTimestamp(e){if(!e)return"Never";const t=Date.now()-e;return t<1e3?"Just now":t<6e4?`${Math.floor(t/1e3)}s ago`:t<36e5?`${Math.floor(t/6e4)}m ago`:`${Math.floor(t/36e5)}h ago`}_renderDataFlowSelector(){return q`
      <div class="debug-controls">
        <button 
          class=${"parts"===this._dataFlowView?"selected":""} 
          @click=${()=>this._dataFlowView="parts"}>
          Parts Data
        </button>
        <button 
          class=${"parameters"===this._dataFlowView?"selected":""} 
          @click=${()=>this._dataFlowView="parameters"}>
          Parameter Updates
        </button>
        <button 
          class=${"pipeline"===this._dataFlowView?"selected":""} 
          @click=${()=>this._dataFlowView="pipeline"}>
          Data Pipeline
        </button>
      </div>
    `}_renderParameterUpdateHistory(){return 0===this._parameterUpdates.length?q`<div class="message">No parameter updates recorded yet</div>`:q`
      <div class="parameter-history">
        <h3>Parameter Update History</h3>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Part ID</th>
              <th>Parameter</th>
              <th>Value</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            ${this._parameterUpdates.map((e=>q`
              <tr>
                <td>${this._formatTimestamp(e.timestamp)}</td>
                <td>${e.partId}</td>
                <td>${e.name}</td>
                <td>${e.value}</td>
                <td>${e.source}</td>
              </tr>
            `))}
          </tbody>
        </table>
      </div>
    `}_renderDataPipeline(){var e;return q`
      <div class="data-pipeline">
        <h3>Data Pipeline Visualization</h3>
        
        <div class="pipeline-container">
          <!-- Data Sources section -->
          <div class="pipeline-section sources">
            <h4>Data Sources</h4>
            ${this._dataSources.map((e=>q`
              <div class="data-source ${e.count>0?"active":"inactive"}">
                <div class="source-name">${e.name}</div>
                <div class="source-stats">
                  <span class="count">${e.count} parts</span>
                  <span class="last-update">Updated: ${this._formatTimestamp(e.lastUpdate)}</span>
                </div>
              </div>
            `))}
          </div>
          
          <!-- Data Flow arrows -->
          <div class="pipeline-flow">
            <div class="flow-arrow"></div>
            <div class="flow-arrow"></div>
          </div>
          
          <!-- Data Processing section -->
          <div class="pipeline-section processing">
            <h4>Data Processing</h4>
            <div class="process-step ${this._cacheStats.size>0?"active":"inactive"}">
              <div class="step-name">Cache Layer</div>
              <div class="step-stats">
                <span class="count">${this._cacheStats.size||0} entries</span>
                <span class="expired">${this._cacheStats.expired||0} expired</span>
              </div>
            </div>
            
            <div class="process-step active">
              <div class="step-name">Parameter Service</div>
              <div class="step-stats">
                <span class="updates">${this._parameterUpdates.length} updates</span>
              </div>
            </div>
            
            <div class="process-step active">
              <div class="step-name">Condition Evaluation</div>
            </div>
          </div>
          
          <!-- Data Flow arrows -->
          <div class="pipeline-flow">
            <div class="flow-arrow"></div>
            <div class="flow-arrow"></div>
          </div>
          
          <!-- Output section -->
          <div class="pipeline-section output">
            <h4>Rendering</h4>
            <div class="output-result active">
              <div class="result-name">Visual Modifiers</div>
            </div>
            
            <div class="output-result active">
              <div class="result-name">Filtered Parts</div>
              <div class="result-stats">
                <span class="count">${(null===(e=this._filteredParts)||void 0===e?void 0:e.length)||0} parts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `}_renderWebSocketStatus(){const e=Me.getInstance().getWebSocketPlugin(),t=e?e.getStats():null;return q`
      <div class="websocket-status">
        <h3>WebSocket Status</h3>
        
        <div class="status-container">
          <div class="connection-status ${(null==t?void 0:t.isConnected)?"connected":"disconnected"}">
            <span class="status-indicator"></span>
            <span class="status-text">${(null==t?void 0:t.isConnected)?"Connected":"Disconnected"}</span>
          </div>
          
          ${t?q`
            <div class="status-details">
              <div class="detail-item">
                <span class="label">Messages received:</span>
                <span class="value">${t.messageCount}</span>
              </div>
              <div class="detail-item">
                <span class="label">Errors:</span>
                <span class="value">${t.errorCount}</span>
              </div>
              <div class="detail-item">
                <span class="label">Last activity:</span>
                <span class="value">${this._formatTimestamp(t.lastMessageTime)}</span>
              </div>
            </div>
          `:q`<div class="status-unavailable">WebSocket stats unavailable</div>`}
          
          <button @click=${this._sendPing} ?disabled=${!(null==t?void 0:t.isConnected)}>
            Send Ping
          </button>
        </div>
      </div>
    `}_sendPing(){const e=Me.getInstance().getWebSocketPlugin();e&&e.isConnected()&&"function"==typeof e.sendPing&&e.sendPing()}_renderRawStateDebug(){const e=Ee.getInstance(),t=e.getTrackedEntities(),i=e.getOrphanedPartIds();return q`
      <div class="raw-state-debug">
        <h4>InvenTreeState Contents</h4>
        
        <div class="state-controls">
          <div class="select-container">
            <label for="entity-select">Select Entity:</label>
            <select id="entity-select" 
                    @change=${e=>this._selectedEntityForState=e.target.value}>
              ${t.map((e=>q`
                <option value=${e} ?selected=${e===this._selectedEntityForState}>
                  ${e}
                </option>
              `))}
            </select>
          </div>
          
          <div class="state-toggles">
            <button @click=${()=>this._showRawState=!this._showRawState}>
              ${this._showRawState?"Hide":"Show"} Raw Data (${this._selectedEntityForState})
            </button>
            <button @click=${()=>this._showOrphanedParts=!this._showOrphanedParts}>
              ${this._showOrphanedParts?"Hide":"Show"} Orphaned Parts (${i.length})
            </button>
            <button @click=${()=>this._showParameterCache=!this._showParameterCache}>
              ${this._showParameterCache?"Hide":"Show"} Parameter Cache
            </button>
          </div>
        </div>
        
        <div class="state-summary">
          <div class="state-counts">
            <div class="state-count">
              <div class="count-label">Tracked Entities:</div>
              <div class="count-value">${t.length}</div>
            </div>
            <div class="state-count">
              <div class="count-label">Orphaned Parts:</div>
              <div class="count-value">${i.length}</div>
            </div>
            <div class="state-count">
              <div class="count-label">Data Priority:</div>
              <div class="count-value">${e._prioritySource||"Unknown"}</div>
            </div>
          </div>
          
          <div class="state-data-summary">
            <h5>Data Sources for ${this._selectedEntityForState||"No entity selected"}</h5>
            ${this._selectedEntityForState?q`
              <div class="data-source">
                <div class="source-label">WebSocket:</div>
                <div class="source-count">${e.getWebSocketData(this._selectedEntityForState).length} parts</div>
                <div class="source-time">Last update: ${this._formatLastUpdate(e.getLastUpdate("websocket",this._selectedEntityForState))}</div>
              </div>
              <div class="data-source">
                <div class="source-label">API:</div>
                <div class="source-count">${e.getApiData(this._selectedEntityForState).length} parts</div>
                <div class="source-time">Last update: ${this._formatLastUpdate(e.getLastUpdate("api",this._selectedEntityForState))}</div>
              </div>
              <div class="data-source">
                <div class="source-label">HASS:</div>
                <div class="source-count">${e.getHassData(this._selectedEntityForState).length} parts</div>
                <div class="source-time">Last update: ${this._formatLastUpdate(e.getLastUpdate("hass",this._selectedEntityForState))}</div>
              </div>
              <div class="data-source highlighted">
                <div class="source-label">Newest Data:</div>
                <div class="source-count">${e.getNewestData(this._selectedEntityForState).length} parts</div>
              </div>
            `:q`<div class="no-data">No entity selected</div>`}
          </div>
        </div>
        
        ${this._showRawState&&this._selectedEntityForState?this._renderRawEntityData(this._selectedEntityForState):""}
        ${this._showOrphanedParts?this._renderOrphanedPartsData():""}
        ${this._showParameterCache?this._renderParameterCacheData():""}
      </div>
    `}_formatLastUpdate(e){if(!e)return"Never";const t=Date.now()-e;return t<1e3?"Just now":t<6e4?`${Math.floor(t/1e3)}s ago`:t<36e5?`${Math.floor(t/6e4)}m ago`:new Date(e).toLocaleTimeString()}_renderRawEntityData(e){const t=Ee.getInstance(),i=t.getWebSocketData(e),r=t.getApiData(e),a=t.getHassData(e);return q`
      <div class="raw-entity-data">
        <h5>Raw Entity Data: ${e}</h5>
        
        <div class="data-accordion">
          <div class="accordion-item">
            <div class="accordion-header" @click=${this._toggleAccordion}>
              WebSocket Data (${i.length} parts)
            </div>
            <div class="accordion-content">
              ${i.length>0?this._renderPartsList(i):q`<div class="no-data">No WebSocket data</div>`}
            </div>
          </div>
          
          <div class="accordion-item">
            <div class="accordion-header" @click=${this._toggleAccordion}>
              API Data (${r.length} parts)
            </div>
            <div class="accordion-content">
              ${r.length>0?this._renderPartsList(r):q`<div class="no-data">No API data</div>`}
            </div>
          </div>
          
          <div class="accordion-item">
            <div class="accordion-header" @click=${this._toggleAccordion}>
              HASS Data (${a.length} parts)
            </div>
            <div class="accordion-content">
              ${a.length>0?this._renderPartsList(a):q`<div class="no-data">No HASS data</div>`}
            </div>
          </div>
        </div>
      </div>
    `}_toggleAccordion(e){const t=e.currentTarget.nextElementSibling;t&&(t.style.display="block"===t.style.display?"none":"block")}_renderPartsList(e){return q`
      <div class="parts-list">
        ${e.map((e=>q`
          <div class="part-item">
            <div class="part-header" @click=${this._togglePartDetails}>
              ${e.name||"Unnamed Part"} (ID: ${e.pk})
            </div>
            <div class="part-details">
              <table>
                <tr>
                  <th>Property</th>
                  <th>Value</th>
                </tr>
                ${Object.entries(e).filter((([e,t])=>"parameters"!==e)).map((([e,t])=>q`
                  <tr>
                    <td>${e}</td>
                    <td>${"object"==typeof t?JSON.stringify(t):t}</td>
                  </tr>
                `))}
              </table>
              
              <h6>Parameters:</h6>
              ${e.parameters&&e.parameters.length>0?q`
                <table>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                  </tr>
                  ${e.parameters.map((e=>{var t;return q`
                    <tr>
                      <td>${(null===(t=e.template_detail)||void 0===t?void 0:t.name)||e.name||"Unknown"}</td>
                      <td>${e.data}</td>
                    </tr>
                  `}))}
                </table>
              `:q`<div class="no-data">No parameters</div>`}
            </div>
          </div>
        `))}
      </div>
    `}_togglePartDetails(e){const t=e.currentTarget.nextElementSibling;t&&(t.style.display="block"===t.style.display?"none":"block")}_renderOrphanedPartsData(){const e=Ee.getInstance(),t=e.getOrphanedPartIds();return q`
      <div class="orphaned-parts-data">
        <h5>Orphaned Parts (${t.length})</h5>
        
        ${t.length>0?q`
          <div class="orphaned-parts-list">
            ${t.map((t=>{const i=e.getOrphanedPartParameters(t);return q`
                <div class="orphaned-part">
                  <div class="part-id">Part ID: ${t}</div>
                  <div class="part-params">
                    <h6>Parameters:</h6>
                    ${i?q`
                      <table>
                        <tr>
                          <th>Parameter</th>
                          <th>Value</th>
                        </tr>
                        ${Object.entries(i).map((([e,t])=>q`
                          <tr>
                            <td>${e}</td>
                            <td>${t}</td>
                          </tr>
                        `))}
                      </table>
                    `:q`<div class="no-data">No parameters</div>`}
                  </div>
                </div>
              `}))}
          </div>
        `:q`<div class="no-data">No orphaned parts</div>`}
      </div>
    `}_renderParameterCacheData(){return q`
      <div class="parameter-cache-data">
        <h5>Parameter Cache</h5>
        <div class="cache-info">
          <p>Parameter cache details not directly accessible via public API.</p>
          <p>Use the Clear Cache button to reset all cached parameters.</p>
        </div>
      </div>
    `}_getParameterService(){if(!this._parameterService&&this.hass)try{this._parameterService=Ae.getInstance()}catch(e){console.error("Failed to get parameter service",e)}return this._parameterService}_renderFilterConditions(){var e,t,i;return(null===(i=null===(t=null===(e=this.config)||void 0===e?void 0:e.parameters)||void 0===t?void 0:t.conditions)||void 0===i?void 0:i.length)?q`
      <div>
        ${this.config.parameters.conditions.map((e=>{const t="filter"===e.action&&"show"===e.action_value,i="filter"===e.action&&"hide"===e.action_value;return q`
            <div class="condition ${t?"show-condition":""} ${i?"hide-condition":""}">
              ${t?"SHOW:":i?"HIDE:":""}
              ${e.parameter} ${e.operator} "${e.value}"
            </div>
          `}))}
      </div>
    `:q`<div>No conditions configured</div>`}_renderUnfilteredParts(){const e=this.parts||[],t=this._filteredParts||[];return q`
      <div class="parts-container">
        <h4>Unfiltered Parts (${e.length})</h4>
        ${e.filter((e=>!t.some((t=>t.pk===e.pk)))).map((e=>q`
            <div class="part-card">
              <div><strong>${e.name||"Unnamed Part"}</strong> (ID: ${e.pk})</div>
              <div><small>${e.description||"No description"}</small></div>
            </div>
          `))}
      </div>
    `}_renderFilteredParts(){const e=this._filteredParts||[];return q`
      <div class="parts-container">
        <h4>Filtered Parts (${e.length})</h4>
        ${e.map((e=>q`
          <div class="part-card">
            <div><strong>${e.name||"Unnamed Part"}</strong> (ID: ${e.pk})</div>
            <div><small>${e.description||"No description"}</small></div>
          </div>
        `))}
      </div>
    `}_handleReloadData(){window.dispatchEvent(new CustomEvent("inventree-reload-data"))}_handleClearCache(){const e=ke.getInstance(),t=Ee.getInstance();e.clear(),t.clearCache(),window.dispatchEvent(new CustomEvent("inventree-force-render")),this._updateCacheStats(),this._updateDataSourceStats(),this.requestUpdate()}_handleForceRender(){window.dispatchEvent(new CustomEvent("inventree-force-render"))}_renderDataFlow(){return this.parts&&0!==this.parts.length?q`
      <div class="debug-section">
        <h2>Data Flow Debugging</h2>
        
        ${this._renderDataFlowSelector()}
        
        ${"parts"===this._dataFlowView?this._renderPartsDebug():""}
        ${"parameters"===this._dataFlowView?this._renderParameterUpdateHistory():""}
        ${"pipeline"===this._dataFlowView?this._renderDataPipeline():""}
        
        ${this._renderWebSocketStatus()}
      </div>
    `:q`<div class="no-parts">No parts available for debugging</div>`}_renderWebSocketDebug(){return q`
      <div class="debug-section">
        <h2>WebSocket Debug</h2>
        
        <div class="debug-actions">
          <button @click=${this._sendPing}>Send Ping</button>
        </div>
        
        <h3>Recent Messages</h3>
        <div class="websocket-messages">
          ${0===this._websocketMessages.length?q`<div class="no-messages">No WebSocket messages received yet</div>`:this._websocketMessages.slice().reverse().map((e=>q`
              <div class="websocket-message">
                <div class="message-time">${this._formatTimestamp(e.timestamp)}</div>
                <div class="message-content">${JSON.stringify(e.data,null,2)}</div>
              </div>
            `))}
        </div>
        
        ${this._renderWebSocketStatus()}
      </div>
    `}_renderFilterTrace(){const e=this.parts||[],t=this._filteredParts||[];return this._parameterService,e.length?q`
      <div class="debug-section">
        <h2>Filter Trace</h2>
        
        <div class="filter-stats">
          <div class="stat-box">
            <div class="stat-label">Total Parts</div>
            <div class="stat-value">${e.length}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Filtered Parts</div>
            <div class="stat-value">${t.length}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Filtered Out</div>
            <div class="stat-value">${e.length-t.length}</div>
          </div>
        </div>
        
        <div class="filter-controls">
          <h3>Filter Conditions</h3>
          ${this._renderFilterConditions()}
        </div>
        
        <div class="filter-results">
          <div class="section-toggle" @click=${()=>this._showUnfilteredParts=!this._showUnfilteredParts}>
            <div class="toggle-icon">${this._showUnfilteredParts?"▼":"►"}</div>
            <h3>Unfiltered Parts (${e.length})</h3>
          </div>
          ${this._showUnfilteredParts?this._renderUnfilteredParts():""}
          
          <div class="section-toggle" @click=${()=>this._showFilteredParts=!this._showFilteredParts}>
            <div class="toggle-icon">${this._showFilteredParts?"▼":"►"}</div>
            <h3>Filtered Parts (${t.length})</h3>
          </div>
          ${this._showFilteredParts?this._renderFilteredParts():""}
        </div>
      </div>
    `:q`<div class="no-data">No parts available for filter tracing</div>`}_renderCacheStats(){const e=ke.getInstance(),t=e.getStats(),i=e.getKeys();return q`
      <div class="debug-section">
        <h2>Cache Statistics</h2>
        
        <div class="cache-stats">
          <div class="stat-box">
            <div class="stat-label">Total Entries</div>
            <div class="stat-value">${t.size}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Expired Entries</div>
            <div class="stat-value">${t.expired}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Fallback Count</div>
            <div class="stat-value">${t.fallbackCount}</div>
          </div>
        </div>
        
        <h3>Cache by Category</h3>
        <div class="category-stats">
          ${Object.entries(t.byCategory).map((([e,t])=>q`
            <div class="category-item">
              <div class="category-name">${e}</div>
              <div class="category-count">${t}</div>
            </div>
          `))}
        </div>
        
        <div class="cache-actions">
          <button @click=${this._debugClearCache}>Clear Cache</button>
          <button @click=${()=>e.prune()}>Prune Expired</button>
        </div>
        
        <h3>Cache Keys (${i.length})</h3>
        <div class="cache-keys">
          ${i.slice(0,100).map((e=>q`
            <div class="cache-key">${e}</div>
          `))}
          ${i.length>100?q`<div class="more-indicator">...and ${i.length-100} more</div>`:""}
        </div>
      </div>
    `}_renderPartInspector(){const e=this.parts||[],t=e.find((e=>e.pk===this._selectedPartForInspection));return q`
      <div class="debug-section">
        <h3>Part Inspector</h3>
        <div class="part-selector">
          <select @change=${e=>this._selectedPartForInspection=Number(e.target.value)}>
            <option value="">Select a part to inspect</option>
            ${e.map((e=>q`
              <option value="${e.pk}" ?selected=${e.pk===this._selectedPartForInspection}>
                ${e.pk}: ${e.name} (${e.source||"unknown"})
              </option>
            `))}
          </select>
        </div>
        
        ${t?q`
          <div class="part-inspector">
            <div class="inspector-header">
              <h4>${t.name} (ID: ${t.pk})</h4>
              <div class="metadata">Source: ${t.source||"unknown"}</div>
            </div>
            
            <div class="object-tree">
              ${this._renderObjectTree(t)}
            </div>
          </div>
        `:q`
          <div class="no-selection">Select a part from the dropdown to inspect its data structure</div>
        `}
      </div>
    `}_renderObjectTree(e,t=0,i=""){if(null===e)return q`<div class="tree-item" style="margin-left: ${20*t}px;">null</div>`;if(void 0===e)return q`<div class="tree-item" style="margin-left: ${20*t}px;">undefined</div>`;if("object"!=typeof e||e instanceof Date){let r=String(e),a="";return"string"==typeof e?(r=`"${e}"`,a="string-value"):"number"==typeof e?a="number-value":"boolean"==typeof e?a="boolean-value":e instanceof Date&&(r=e.toISOString(),a="date-value"),q`<div class="tree-item ${a}" style="margin-left: ${20*t}px;">${i?`${i}: `:""}${r}</div>`}if(Array.isArray(e))return q`
        <div class="tree-item array-item" style="margin-left: ${20*t}px;">${i?`${i}: `:""}Array(${e.length})</div>
        ${e.map(((e,i)=>this._renderObjectTree(e,t+1,`[${i}]`)))}
      `;const r=Object.keys(e);return q`
      <div class="tree-item object-item" style="margin-left: ${20*t}px;">${i?`${i}: `:""}Object</div>
      ${r.map((i=>this._renderObjectTree(e[i],t+1,i)))}
    `}_recordRenderTiming(e){const t=Date.now();this._renderTimings.push({component:e,time:t,duration:this._renderTimings.length>0?t-this._renderTimings[this._renderTimings.length-1].time:0}),this._renderTimings.length>20&&(this._renderTimings=this._renderTimings.slice(-20))}_clearTimings(){this._renderTimings=[]}_renderTimingInfo(){return q`
      <div class="debug-section">
        <div class="section-header">
          <h3>Render Timing</h3>
          <button @click=${this._clearTimings}>Clear</button>
          <button @click=${()=>this._showTimings=!this._showTimings}>
            ${this._showTimings?"Hide":"Show"}
          </button>
        </div>
        
        ${this._showTimings?q`
          <div class="timing-info">
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Time</th>
                  <th>Duration (ms)</th>
                </tr>
              </thead>
              <tbody>
                ${this._renderTimings.map((e=>q`
                  <tr>
                    <td>${e.component}</td>
                    <td>${new Date(e.time).toLocaleTimeString()}</td>
                    <td>${e.duration}</td>
                  </tr>
                `))}
              </tbody>
            </table>
          </div>
        `:""}
      </div>
    `}_renderReduxDebug(){return q`
      <div class="redux-debug-container">
        <h3>Redux Migration Debug</h3>
        <redux-debug-view 
          .hass=${this.hass}
        ></redux-debug-view>
      </div>
    `}};Xi.styles=g`
    .debug-view {
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;
    }
    
    h3 {
      margin-top: 0;
      margin-bottom: 8px;
    }
    
    .debug-counts {
      margin-bottom: 12px;
      font-weight: bold;
    }
    
    .debug-tabs {
      display: flex;
      overflow-x: auto;
      border-bottom: 1px solid #ccc;
      margin-bottom: 16px;
    }
    
    .tab {
      background: none;
      border: none;
      padding: 8px 16px;
      cursor: pointer;
      opacity: 0.7;
    }
    
    .tab.active {
      border-bottom: 2px solid var(--primary-color, #03a9f4);
      opacity: 1;
      font-weight: bold;
    }
    
    .debug-buttons {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    button {
      background-color: var(--primary-color, #03a9f4);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 12px;
      cursor: pointer;
    }
    
    .filter-conditions {
      margin-bottom: 16px;
    }
    
    .condition {
      background-color: rgba(0, 0, 0, 0.05);
      padding: 8px;
      margin-bottom: 8px;
      border-radius: 4px;
    }
    
    .show-condition {
      border-left: 4px solid green;
    }
    
    .hide-condition {
      border-left: 4px solid red;
    }
    
    .parts-container {
      margin-top: 16px;
    }
    
    .part-card {
      background-color: white;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }
    
    .toggle-button {
      background: none;
      border: 1px solid #ccc;
      color: #333;
      margin-right: 8px;
    }
    
    .tab-content {
      margin-bottom: 16px;
    }
    
    /* Data flow diagram styles */
    .data-flow-diagram {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .data-source-box {
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px;
      text-align: center;
    }
    
    .data-source-name {
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .data-source-count {
      font-size: 18px;
    }
    
    .flow-arrow {
      text-align: center;
      margin-top: 8px;
    }
    
    .storage-box {
      grid-column: span 3;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px;
      text-align: center;
      margin-top: 8px;
    }
    
    .processing-box {
      grid-column: span 3;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px;
      text-align: center;
      margin-top: 8px;
    }
    
    .result-box {
      grid-column: span 3;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px;
      text-align: center;
      margin-top: 8px;
      font-weight: bold;
    }
    
    /* WebSocket debug styles */
    .websocket-debug {
      margin-bottom: 16px;
    }
    
    .websocket-status {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .status-item {
      background-color: rgba(0, 0, 0, 0.05);
      padding: 8px 12px;
      border-radius: 4px;
    }
    
    .status-label {
      font-weight: bold;
      margin-right: 4px;
    }
    
    /* Filter trace styles */
    .filter-trace {
      font-family: monospace;
      background-color: #1e1e1e;
      color: #d4d4d4;
      padding: 12px;
      border-radius: 4px;
      height: 200px;
      overflow-y: auto;
    }
    
    .trace-line {
      margin-bottom: 4px;
    }
    
    /* Cache stats styles */
    .cache-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .cache-item {
      background-color: rgba(0, 0, 0, 0.05);
      padding: 12px;
      border-radius: 4px;
      flex: 1;
      min-width: 150px;
    }
    
    .cache-label {
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .cache-categories {
      margin-top: 8px;
    }
    
    .cache-category {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    
    /* Raw state debug styles */
    .raw-state-debug {
      margin-bottom: 16px;
    }
    
    .state-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 16px;
      align-items: center;
    }
    
    .select-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .state-toggles {
      display: flex;
      gap: 8px;
    }
    
    .state-summary {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .state-counts {
      flex: 1;
      min-width: 200px;
      background-color: rgba(0, 0, 0, 0.03);
      padding: 12px;
      border-radius: 4px;
    }
    
    .state-count {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .count-label {
      font-weight: bold;
    }
    
    .state-data-summary {
      flex: 2;
      min-width: 300px;
      background-color: rgba(0, 0, 0, 0.03);
      padding: 12px;
      border-radius: 4px;
    }
    
    .data-source {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding: 8px;
      background-color: rgba(255, 255, 255, 0.5);
      border-radius: 4px;
    }
    
    .data-source.highlighted {
      background-color: rgba(3, 169, 244, 0.1);
      font-weight: bold;
    }
    
    .source-label {
      font-weight: bold;
    }
    
    .raw-entity-data {
      margin-top: 16px;
    }
    
    .data-accordion {
      border: 1px solid #ccc;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .accordion-item {
      margin-bottom: 1px;
    }
    
    .accordion-header {
      background-color: rgba(0, 0, 0, 0.05);
      padding: 10px;
      cursor: pointer;
      font-weight: bold;
    }
    
    .accordion-content {
      padding: 10px;
      display: none;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .parts-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .part-item {
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .part-header {
      background-color: rgba(0, 0, 0, 0.05);
      padding: 8px;
      cursor: pointer;
      font-weight: bold;
    }
    
    .part-details {
      padding: 8px;
      display: none;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      text-align: left;
      padding: 6px;
      border-bottom: 1px solid #ddd;
    }
    
    th {
      background-color: rgba(0, 0, 0, 0.03);
    }
    
    .no-data {
      padding: 8px;
      color: #666;
      font-style: italic;
    }
    
    .orphaned-parts-data, .parameter-cache-data {
      margin-top: 16px;
      background-color: rgba(0, 0, 0, 0.03);
      padding: 12px;
      border-radius: 4px;
    }
    
    .orphaned-parts-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 12px;
    }
    
    .orphaned-part {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 12px;
      background-color: white;
    }
    
    .part-id {
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .cache-info {
      padding: 8px;
      color: #666;
    }
    
    .part-inspector {
      background: var(--card-background-color, #fff);
      border-radius: 8px;
      padding: 16px;
      margin: 8px 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: auto;
      max-height: 500px;
    }
    
    .inspector-header {
      margin-bottom: 16px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
      padding-bottom: 8px;
    }
    
    .inspector-header h4 {
      margin: 0 0 4px 0;
      font-weight: 500;
    }
    
    .metadata {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    
    .object-tree {
      font-family: monospace;
      font-size: 12px;
      white-space: pre-wrap;
      word-break: break-all;
    }
    
    .tree-item {
      padding: 2px 0;
      display: flex;
      align-items: flex-start;
    }
    
    .string-value {
      color: #067d17;
    }
    
    .number-value {
      color: #0000ff;
    }
    
    .boolean-value {
      color: #0000ff;
      font-weight: bold;
    }
    
    .date-value {
      color: #9400d3;
    }
    
    .object-item {
      color: #000000;
      font-weight: bold;
    }
    
    .array-item {
      color: #000000;
      font-weight: bold;
    }
    
    .no-selection {
      font-style: italic;
      color: var(--secondary-text-color);
      padding: 16px 0;
    }
    
    .part-selector {
      margin-bottom: 16px;
    }
    
    .part-selector select {
      width: 100%;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--divider-color, #e0e0e0);
    }
    
    .timing-info {
      margin-top: 8px;
      overflow: auto;
      max-height: 400px;
    }
    
    .timing-info table {
      width: 100%;
      border-collapse: collapse;
      font-family: monospace;
      font-size: 12px;
    }
    
    .timing-info th, .timing-info td {
      border: 1px solid #ddd;
      padding: 4px 8px;
      text-align: left;
    }
    
    .timing-info th {
      background-color: #f2f2f2;
    }
    
    .timing-info tr:nth-child(even) {
      background-color: #f8f8f8;
    }
    
    .timing-overview {
      margin-top: 16px;
      border-top: 1px solid #ddd;
      padding-top: 8px;
    }
    
    .timing-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .timing-label {
      font-family: monospace;
      font-size: 12px;
      color: #666;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .section-header h3 {
      margin: 0;
    }
    
    .section-header button {
      margin-left: 8px;
      padding: 4px 8px;
      background-color: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .section-header button:hover {
      background-color: #e0e0e0;
    }
  `,c([fe({attribute:!1})],Xi.prototype,"hass",void 0),c([fe({attribute:!1})],Xi.prototype,"config",void 0),c([fe({attribute:!1})],Xi.prototype,"parts",void 0),c([fe({type:String})],Xi.prototype,"entity",void 0),c([fe({attribute:!1})],Xi.prototype,"view_type",void 0),c([fe({attribute:!1})],Xi.prototype,"layout",void 0),c([fe({attribute:!1})],Xi.prototype,"parameters",void 0),c([fe({attribute:!1})],Xi.prototype,"filters",void 0),c([fe({attribute:!1})],Xi.prototype,"_filteredParts",void 0),c([fe({attribute:!1})],Xi.prototype,"entityId",void 0),c([be()],Xi.prototype,"_debugEntities",void 0),c([be()],Xi.prototype,"_conditionResults",void 0),c([be()],Xi.prototype,"_parameterValues",void 0),c([be()],Xi.prototype,"_crossReferences",void 0),c([be()],Xi.prototype,"_expandedParts",void 0),c([be()],Xi.prototype,"_showUnfiltered",void 0),c([be()],Xi.prototype,"_showFiltered",void 0),c([be()],Xi.prototype,"_showConditionDetails",void 0),c([be()],Xi.prototype,"_showCrossReferences",void 0),c([be()],Xi.prototype,"_showParameterValues",void 0),c([be()],Xi.prototype,"_websocketMessages",void 0),c([be()],Xi.prototype,"_parameterUpdates",void 0),c([be()],Xi.prototype,"_dataFlowView",void 0),c([be()],Xi.prototype,"_selectedPart",void 0),c([be()],Xi.prototype,"_dataSources",void 0),c([be()],Xi.prototype,"_cacheStats",void 0),c([be()],Xi.prototype,"_eventListenerAdded",void 0),c([be()],Xi.prototype,"_statsInterval",void 0),c([be()],Xi.prototype,"_showRawState",void 0),c([be()],Xi.prototype,"_showOrphanedParts",void 0),c([be()],Xi.prototype,"_showParameterCache",void 0),c([be()],Xi.prototype,"_selectedEntityForState",void 0),c([be()],Xi.prototype,"_activeTab",void 0),c([be()],Xi.prototype,"_showUnfilteredParts",void 0),c([be()],Xi.prototype,"_showFilteredParts",void 0),c([be()],Xi.prototype,"_selectedPartForInspection",void 0),c([be()],Xi.prototype,"_renderTimings",void 0),c([be()],Xi.prototype,"_showTimings",void 0),Xi=c([ge("inventree-debug-view")],Xi);const Zi=t=>class extends t{constructor(){super(...arguments),this._reduxUnsubscribe=null,this._wasConnected=!1,this._watchSelectors=[],this.logger=e.getInstance()}connectedCallback(){super.connectedCallback(),this._wasConnected=!0,this._subscribeToStore(),this.logger.log("ReduxLitMixin","Component connected and subscribed to Redux store",{category:"redux",subsystem:"components"}),Gi.trackUsage("redux","componentConnected")}disconnectedCallback(){super.disconnectedCallback(),this._unsubscribeFromStore(),this.logger.log("ReduxLitMixin","Component disconnected from Redux store",{category:"redux",subsystem:"components"})}watchReduxState(e,t){const i=e(vi.getState());this._watchSelectors.push({selector:e,lastValue:i,propertyName:t}),this[t]=i,this._wasConnected&&this._subscribeToStore(),this.logger.log("ReduxLitMixin",`Watching Redux state for property ${t}`,{category:"redux",subsystem:"components"})}dispatchRedux(e){vi.dispatch(e),this.logger.log("ReduxLitMixin",`Dispatched action: ${e.type}`,{category:"redux",subsystem:"components"}),Gi.trackUsage("redux","dispatchAction")}_subscribeToStore(){this._unsubscribeFromStore(),0!==this._watchSelectors.length&&(this._reduxUnsubscribe=vi.subscribe((()=>{const e=vi.getState();let t=!1;for(const i of this._watchSelectors){const r=i.selector(e);r!==i.lastValue&&(this[i.propertyName]=r,i.lastValue=r,t=!0)}t&&this.requestUpdate()})))}_unsubscribeFromStore(){this._reduxUnsubscribe&&(this._reduxUnsubscribe(),this._reduxUnsubscribe=null)}};const er=Zi(ue);let tr=class extends er{constructor(){super(...arguments),this._featureFlags=s(),this._selectedTab="feature-flags",this._usageMetrics=Gi.getUsageMetrics(),this._expandedStoreSection=null,this._reduxState=null,this.logger=e.getInstance()}connectedCallback(){super.connectedCallback(),this.watchReduxState((e=>e),"_reduxState"),this._updateTimer=window.setInterval((()=>{this._featureFlags=s(),this._usageMetrics=Gi.getUsageMetrics()}),1e3)}disconnectedCallback(){super.disconnectedCallback(),this._updateTimer&&clearInterval(this._updateTimer)}render(){return q`
      <div class="tabs">
        <div class="tab ${"feature-flags"===this._selectedTab?"active":""}" 
             @click=${()=>this._selectedTab="feature-flags"}>
          Feature Flags
        </div>
        <div class="tab ${"redux-state"===this._selectedTab?"active":""}" 
             @click=${()=>this._selectedTab="redux-state"}>
          Redux State
        </div>
        <div class="tab ${"metrics"===this._selectedTab?"active":""}" 
             @click=${()=>this._selectedTab="metrics"}>
          Usage Metrics
        </div>
      </div>
      
      ${this._renderSelectedTab()}
    `}_renderSelectedTab(){switch(this._selectedTab){case"feature-flags":return this._renderFeatureFlags();case"redux-state":return this._renderReduxState();case"metrics":return this._renderMetrics();default:return q`<div>Unknown tab</div>`}}_renderFeatureFlags(){const e=this._featureFlags,t=function(){const e=s(),t=Object.keys(e).length,i=Object.values(e).filter((e=>e)).length;return`Migration Progress: ${Math.round(i/t*100)}% (${i}/${t} features enabled)`}(),i=Object.values(e).filter((e=>e)).length/Object.keys(e).length*100;return q`
      <div class="card">
        <h3 class="card-title">Migration Progress</h3>
        <div>${t}</div>
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: ${i}%"></div>
        </div>
      </div>
      
      <div class="card">
        <h3 class="card-title">Enable Migration Phases</h3>
        <div class="phase-buttons">
          <button @click=${()=>this._enablePhase("foundation")}>Foundation</button>
          <button @click=${()=>this._enablePhase("state")}>State Management</button>
          <button @click=${()=>this._enablePhase("rendering")}>Rendering</button>
          <button @click=${()=>this._enablePhase("components")}>Components</button>
          <button @click=${()=>this._enablePhase("all")}>All Features</button>
        </div>
      </div>
      
      <div class="card">
        <h3 class="card-title">Feature Flags</h3>
        <div class="feature-flags">
          ${Object.entries(e).map((([e,t])=>q`
            <div class="feature-flag">
              <label class="feature-flag-name">${e}</label>
              <ha-switch
                .checked=${t}
                @change=${t=>this._toggleFeature(e,t.target.checked)}
              ></ha-switch>
            </div>
          `))}
        </div>
      </div>
    `}_renderReduxState(){const e=vi.getState();return q`
      <div class="card">
        <h3 class="card-title">Redux Store State</h3>
        ${Object.keys(e).map((t=>this._renderStoreSection(t,e[t])))}
      </div>
    `}_renderStoreSection(e,t){const i=this._expandedStoreSection===e;return q`
      <div class="store-section">
        <div class="store-section-header" @click=${()=>this._toggleStoreSection(e)}>
          <span class="expander">${i?"▼":"▶"}</span>
          <span>${e}</span>
        </div>
        ${i?q`
          <div class="store-section-content">
            <pre>${JSON.stringify(t,null,2)}</pre>
          </div>
        `:""}
      </div>
    `}_renderMetrics(){const{redux:e,legacy:t}=this._usageMetrics,i=[],r=[];return Object.keys(e).forEach((t=>{const r=e[t];"number"==typeof r&&i.push({key:t,value:r})})),Object.keys(t).forEach((e=>{const i=t[e];"number"==typeof i&&r.push({key:e,value:i})})),i.sort(((e,t)=>t.value-e.value)),r.sort(((e,t)=>t.value-e.value)),q`
      <div class="card">
        <h3 class="card-title">Usage Metrics</h3>
        <div class="metrics">
          <div class="metric-card">
            <h4 class="metric-title">Redux Usage</h4>
            <div class="metric-list">
              ${i.map((e=>q`
                <span class="metric-name">${e.key}</span>
                <span class="metric-count">${e.value}</span>
              `))}
            </div>
          </div>
          
          <div class="metric-card">
            <h4 class="metric-title">Legacy Usage</h4>
            <div class="metric-list">
              ${r.map((e=>q`
                <span class="metric-name">${e.key}</span>
                <span class="metric-count">${e.value}</span>
              `))}
            </div>
          </div>
        </div>
      </div>
    `}_toggleFeature(e,t){t?r(e,!0):function(e){r(e,!1)}(e),this._featureFlags=s(),this.logger.log("ReduxDebug",`Feature flag ${e} set to ${t}`,{category:"debug",subsystem:"redux"})}_enablePhase(e){!function(e){i.log("FeatureFlags",`Enabling migration phase: ${e}`,{category:"migration",subsystem:"feature-flags"}),"foundation"!==e&&"all"!==e||r("useConnectedComponents",!0),"state"!==e&&"all"!==e||(r("useReduxForParts",!0),r("useReduxForParameters",!0),r("useReduxForCard",!0)),"rendering"!==e&&"all"!==e||(r("useReduxForRendering",!0),r("useReduxRenderingService",!0)),"components"!==e&&"all"!==e||(r("useBaseLayoutAdapter",!0),r("useReduxParameterService",!0),r("useReduxForWebSocket",!0))}(e),this._featureFlags=s(),this.logger.log("ReduxDebug",`Enabled migration phase: ${e}`,{category:"debug",subsystem:"redux"})}_toggleStoreSection(e){this._expandedStoreSection===e?this._expandedStoreSection=null:this._expandedStoreSection=e}};tr.styles=g`
    :host {
      display: block;
      padding: 16px;
      color: var(--primary-text-color);
    }
    
    .tabs {
      display: flex;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--divider-color);
    }
    
    .tab {
      padding: 8px 16px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-right: 8px;
    }
    
    .tab.active {
      border-bottom-color: var(--primary-color);
      color: var(--primary-color);
    }
    
    .card {
      background: var(--card-background-color);
      border-radius: 8px;
      box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2));
      padding: 16px;
      margin-bottom: 16px;
    }
    
    .card-title {
      margin-top: 0;
      font-size: 18px;
      font-weight: 500;
      color: var(--primary-text-color);
      margin-bottom: 8px;
    }
    
    .feature-flags {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 8px;
    }
    
    .feature-flag {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      padding: 8px;
      background: var(--secondary-background-color);
      border-radius: 4px;
    }
    
    .switch {
      margin-left: auto;
    }
    
    .feature-flag-name {
      margin: 0 8px;
      font-size: 14px;
    }
    
    .phase-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    button {
      background-color: var(--primary-color);
      color: var(--text-primary-color);
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
    }
    
    button:hover {
      background-color: var(--primary-color-light);
    }
    
    pre {
      background: var(--code-background-color, #f5f5f5);
      border-radius: 4px;
      padding: 8px;
      overflow: auto;
      font-family: monospace;
      font-size: 12px;
    }
    
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
    
    .metric-card {
      background: var(--secondary-background-color);
      border-radius: 4px;
      padding: 16px;
    }
    
    .metric-title {
      margin-top: 0;
      margin-bottom: 8px;
      font-size: 16px;
      font-weight: 500;
    }
    
    .metric-list {
      display: grid;
      grid-template-columns: 1fr auto;
      row-gap: 4px;
      column-gap: 16px;
      font-size: 14px;
    }
    
    .metric-count {
      text-align: right;
      font-weight: 500;
    }
    
    .progress-bar {
      height: 8px;
      border-radius: 4px;
      background: var(--divider-color);
      margin-top: 8px;
      overflow: hidden;
    }
    
    .progress-bar-fill {
      height: 100%;
      background: var(--primary-color);
    }
    
    .store-section {
      margin-bottom: 8px;
      cursor: pointer;
    }
    
    .store-section-header {
      display: flex;
      align-items: center;
      padding: 8px;
      background: var(--secondary-background-color);
      border-radius: 4px;
    }
    
    .store-section-content {
      padding: 8px;
      margin-top: 4px;
      margin-left: 16px;
      background: var(--code-background-color, #f5f5f5);
      border-radius: 4px;
    }
    
    .expander {
      margin-right: 8px;
    }
  `,c([fe({attribute:!1})],tr.prototype,"hass",void 0),c([be()],tr.prototype,"_featureFlags",void 0),c([be()],tr.prototype,"_selectedTab",void 0),c([be()],tr.prototype,"_usageMetrics",void 0),c([be()],tr.prototype,"_expandedStoreSection",void 0),c([be()],tr.prototype,"_reduxState",void 0),tr=c([ge("redux-debug-view")],tr),"undefined"==typeof window||window.process||(window.process={env:{NODE_ENV:"production"}});const ir=e.getInstance();ir.setDebug(!0),ir.setVerboseMode(!0),ir.info("Index","1/7 - Starting module initialization",{category:"initialization",subsystem:"index"}),ir.info("Index",`2/7 - Checking main card component ${o}`,{category:"initialization",subsystem:"card"}),ir.info("Index",`Main card registered: ${!!customElements.get(o)}`,{category:"initialization",subsystem:"card"}),window.customCards=window.customCards||[],window.customCards.push({type:"inventree-card",name:"InvenTree Card",description:"Display and manage InvenTree inventory",preview:!0}),ir.info("Index","3/7 - Card registration complete",{category:"initialization",subsystem:"card"});try{customElements.get("inventree-grid-layout")||customElements.define("inventree-grid-layout",bi),customElements.get("inventree-list-layout")||customElements.define("inventree-list-layout",ki),customElements.get("inventree-parts-layout")||customElements.define("inventree-parts-layout",Bi),customElements.get("inventree-part-buttons")||customElements.define("inventree-part-buttons",Fi),customElements.get("inventree-base-layout")||customElements.define("inventree-base-layout",Yi),customElements.get("data-flow-debug")||customElements.define("data-flow-debug",Qi),customElements.get("debug-view")||customElements.define("debug-view",Xi),a("useConnectedComponents")&&(ir.log("Main","Registering Redux-connected components",{category:"initialization",subsystem:"redux"}),customElements.get("redux-debug-view")||customElements.define("redux-debug-view",tr),customElements.get("base-layout-adapter")||customElements.define("base-layout-adapter",Hi),customElements.get("grid-layout-adapter")||customElements.define("grid-layout-adapter",Ji))}catch(e){ir.error("Index",`Error registering components: ${e}`,{category:"initialization",subsystem:"components"}),console.error("Error registering components:",e)}ir.info("Index","7/7 - Module initialization complete",{category:"initialization",subsystem:"index"});export{J as A,e as L,_e as T,c as _,fe as a,ge as e,g as i,Ci as n,ue as s,be as t,q as x};
//# sourceMappingURL=inventree-card.js.map
