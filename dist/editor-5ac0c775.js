import{css as e,LitElement as t,html as i,nothing as o}from"lit";import{property as a,state as r,customElement as n}from"lit/decorators.js";import{fireEvent as s}from"custom-card-helpers";function l(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var a=0;for(o=Object.getOwnPropertySymbols(e);a<o.length;a++)t.indexOf(o[a])<0&&Object.prototype.propertyIsEnumerable.call(e,o[a])&&(i[o[a]]=e[o[a]])}return i}function d(e,t,i,o){var a,r=arguments.length,n=r<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,o);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,i,n):a(t,i))||n);return r>3&&n&&Object.defineProperty(t,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const c=e`
  ha-form {
    display: block;
    padding: 16px;
  }

  .parts-settings {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .part-entry {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 8px;
    align-items: center;
  }

  .add-part,
  .remove-part {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px;
    border: none;
    border-radius: 4px;
    background: var(--primary-color);
    color: var(--text-primary-color);
    cursor: pointer;
  }

  .remove-part {
    background: var(--error-color);
  }

  .add-part:hover,
  .remove-part:hover {
    opacity: 0.9;
  }
`;class u{constructor(){this.debugMode=!1,this.verboseMode=!1,this.logLevel="error",this.debugCategories={api:{enabled:!1,subsystems:{calls:!1,responses:!1,errors:!1,fallbacks:!1,throttling:!1}},parameters:{enabled:!1,subsystems:{updates:!1,conditions:!1,filtering:!1,actions:!1}},websocket:{enabled:!1,subsystems:{connection:!1,messages:!1,events:!1,plugin:!1,subscriptions:!1,authentication:!1}},redux:{enabled:!1,subsystems:{actions:!1,state:!1,components:!1,middleware:!1,dispatch:!1,sync:!1,parameters:!1,migration:!1}},layouts:{enabled:!1,subsystems:{rendering:!1,filtering:!1,updates:!1}},rendering:{enabled:!1,subsystems:{updates:!1,performance:!1,cycle:!1,debounce:!1}},cache:{enabled:!1,subsystems:{hits:!1,misses:!1,pruning:!1,performance:!1}},card:{enabled:!1,subsystems:{initialization:!1,lifecycle:!1,rendering:!1,updates:!1}},diagnostics:{enabled:!1,subsystems:{performance:!1,memory:!1,errors:!1}}},this._logSequence=0,this._recentLogs=new Map,this._dedupeTimeWindow=2e3,this._maxDuplicatesPerWindow=1,setTimeout((()=>{try{import("./cache-17abc121.js").then((e=>{this._cache=e.CacheService.getInstance(),console.info("Logger: Successfully initialized CacheService after delay")}))}catch(e){console.warn("Logger: Could not initialize CacheService, using built-in deduplication")}}),100)}static getInstance(){return u.instance||(u.instance=new u),u.instance}isEnabled(e,t){var i;return!(!this.verboseMode&&!this.anyCategoryEnabled())&&(!!this.debugCategories[e]&&(!!this.verboseMode||!!this.debugCategories[e].enabled&&(!t||!0===(null===(i=this.debugCategories[e].subsystems)||void 0===i?void 0:i[t]))))}anyCategoryEnabled(){return Object.keys(this.debugCategories).some((e=>this.debugCategories[e].enabled))}getNextSequence(){return++this._logSequence}setDebug(e){this.debugMode=e,e?this.logLevel="debug":(this.logLevel="error",this.verboseMode=!1),console.info("Logger debug mode "+(e?"ENABLED":"DISABLED"))}setVerboseMode(e){e&&!this.debugMode&&this.setDebug(!0),this.verboseMode=e,console.info("Logger verbose mode "+(e?"ENABLED - ALL categories will log":"DISABLED - only selected categories will log"))}setDebugConfig(e){var t,i,o,a,r,n,s,l;e&&(this.setDebug(e.debug||!1),this.setVerboseMode(e.debug_verbose||!1),e.debug_hierarchical?this.processHierarchicalConfig(e.debug_hierarchical):(this.setCategoryDebug("api",null!==(t=e.debug_api)&&void 0!==t&&t),this.setCategoryDebug("parameters",null!==(i=e.debug_parameters)&&void 0!==i&&i),this.setCategoryDebug("websocket",null!==(o=e.debug_websocket)&&void 0!==o&&o),this.setCategoryDebug("layouts",null!==(a=e.debug_layouts)&&void 0!==a&&a),this.setCategoryDebug("rendering",null!==(r=e.debug_rendering)&&void 0!==r&&r),this.setCategoryDebug("cache",null!==(n=e.debug_cache)&&void 0!==n&&n),this.setCategoryDebug("card",null!==(s=e.debug_card)&&void 0!==s&&s),this.setCategoryDebug("diagnostics",null!==(l=e.debug_diagnostics)&&void 0!==l&&l)),this.logConfigStatus())}processHierarchicalConfig(e){var t,i;for(const o in this.debugCategories){const a=e[o];if(a){if(this.setCategoryDebug(o,null!==(t=a.enabled)&&void 0!==t&&t),a.subsystems)for(const e in a.subsystems)this.setSubsystemDebug(o,e,null!==(i=a.subsystems[e])&&void 0!==i&&i)}else this.setCategoryDebug(o,!1)}}formatSystemStatus(e){if(!this.debugCategories[e])return"Not configured";if(!this.debugCategories[e].enabled)return"Disabled";const t=this.debugCategories[e].subsystems,i=Object.keys(t).filter((e=>t[e])).join(", ");return i?`Enabled with subsystems: ${i}`:"Enabled (no subsystems)"}setLogLevel(e){this.logLevel=e}setCategoryDebug(e,t){this.debugCategories[e]?this.debugCategories[e].enabled=t:console.warn(`Logger: Unknown debug category '${e}'`)}setSubsystemDebug(e,t,i){this.debugCategories[e]&&this.debugCategories[e].subsystems.hasOwnProperty(t)?this.debugCategories[e].subsystems[t]=i:console.warn(`Logger: Unknown debug subsystem '${t}' for system '${e}'`)}isDuplicate(e){const t=Date.now(),i=this._recentLogs.get(e);return!!(i&&t-i<this._dedupeTimeWindow)||(this._recentLogs.set(e,t),this._logSequence%10==0&&this.pruneRecentLogs(),!1)}pruneRecentLogs(){const e=Date.now();for(const[t,i]of this._recentLogs.entries())e-i>this._dedupeTimeWindow&&this._recentLogs.delete(t)}log(e,t,i,...o){i&&(i instanceof Error||"object"!=typeof i||Array.isArray(i))&&(o=[i,...o],i={});const a=i&&"object"==typeof i?i.category:void 0,r=i&&"object"==typeof i?i.subsystem:void 0,n=i&&"object"==typeof i&&i.level||"debug",s=i&&"object"==typeof i?i.performance:void 0;if(a&&!this.isEnabled(a,r))return;if(!a&&!this.debugMode)return;if("none"===this.logLevel)return;if("error"===this.logLevel&&"error"!==n)return;if("warn"===this.logLevel&&"error"!==n&&"warn"!==n)return;const l=`${e}:${a||"main"}:${r||""}:${t}`;if(this.isDuplicate(l))return;const d=this.getNextSequence(),c=Date.now().toString(),u=a?r?`${e}:${a}:${r}`:`${e}:${a}`:e;if("trace"===n){if(console.groupCollapsed(`[${c}][${d}][${u}] ${t}`),o.length>0&&console.log(...o),s){const{startTime:e,duration:t}=s;t?console.log(`⏱️ Duration: ${t.toFixed(2)}ms`):e&&console.log(`⏱️ Elapsed: ${(Date.now()-e).toFixed(2)}ms`)}console.groupEnd()}else if(console.log(`🔍 [${c}][${d}][${u}] ${t}`,...o),s){const{startTime:e,duration:t}=s;t?console.log(`⏱️ [${c}][${d}][${u}] Duration: ${t.toFixed(2)}ms`):e&&console.log(`⏱️ [${c}][${d}][${u}] Elapsed: ${(Date.now()-e).toFixed(2)}ms`)}}info(e,t,...i){const o=i.length>0&&"object"==typeof i[0]&&!Array.isArray(i[0])?i.shift():{};if("none"===this.logLevel||"error"===this.logLevel||"warn"===this.logLevel)return;const a=null==o?void 0:o.category,r=null==o?void 0:o.subsystem;if(a&&!this.isEnabled(a,r))return;const n=(null===performance||void 0===performance?void 0:performance.now().toFixed(2))||Date.now(),s=this.getNextSequence(),l=a?r?`${e}:${a}:${r}`:`${e}:${a}`:e;if(console.info(`ℹ️ [${n}][${s}][${l}] ${t}`,...i),null==o?void 0:o.performance){const{startTime:e,duration:t}=o.performance;t?console.info(`⏱️ [${n}][${s}][${l}] Duration: ${t.toFixed(2)}ms`):e&&console.info(`⏱️ [${n}][${s}][${l}] Elapsed: ${(Date.now()-e).toFixed(2)}ms`)}}warn(e,t,...i){const o=i.length>0&&"object"==typeof i[0]&&!Array.isArray(i[0])?i.shift():{};if("none"===this.logLevel||"error"===this.logLevel)return;const a=null==o?void 0:o.category,r=null==o?void 0:o.subsystem,n=(null===performance||void 0===performance?void 0:performance.now().toFixed(2))||Date.now(),s=this.getNextSequence(),l=a?r?`${e}:${a}:${r}`:`${e}:${a}`:e;console.warn(`⚠️ [${n}][${s}][${l}] ${t}`,...i)}error(e,t,...i){const o=i.length>0?i[0]:void 0,a=o instanceof Error||o&&"object"==typeof o&&"stack"in o||"string"==typeof o||!o||"object"!=typeof o||Array.isArray(o)?{}:i.shift();if("none"===this.logLevel)return;const r=null==a?void 0:a.category,n=null==a?void 0:a.subsystem,s=(null===performance||void 0===performance?void 0:performance.now().toFixed(2))||Date.now(),l=this.getNextSequence(),d=r?n?`${e}:${r}:${n}`:`${e}:${r}`:e;console.error(`❌ [${s}][${l}][${d}] ${t}`,...i)}startPerformance(e){return Date.now()}endPerformance(e,t,i,o){const a=Date.now()-i;this.log(e,t,Object.assign(Object.assign({},o),{performance:{duration:a}}))}resetDebugConfig(){console.log("Resetting logger config to defaults"),this.debugMode=!1,this.verboseMode=!1,this.logLevel="error";for(const e in this.debugCategories){this.debugCategories[e].enabled=!1;for(const t in this.debugCategories[e].subsystems)this.debugCategories[e].subsystems[t]=!1}this._recentLogs.clear(),console.info("Logger debug settings reset - all logging disabled")}setEnabled(e,t){this.setCategoryDebug(e,t)}getSystemsStatus(){const e={};for(const t in this.debugCategories){const i=this.debugCategories[t];e[t]={enabled:i.enabled,subsystems:Object.assign({},i.subsystems)}}return e}getSubsystems(e){return this.debugCategories[e]?Object.keys(this.debugCategories[e].subsystems):[]}isCategoryEnabled(e){return this.isEnabled(e)}logConfigStatus(){console.log("Logger configuration:"),console.log(`      Debug mode: ${this.debugMode} (controls debug UI view)`),console.log(`      Verbose mode: ${this.verboseMode} (logs everything when true)`);for(const e in this.debugCategories){const t=this.debugCategories[e].enabled;if(console.log(`      ${e.charAt(0).toUpperCase()+e.slice(1)}: ${t?"Enabled":"Disabled"}`),t&&!this.verboseMode)for(const t in this.debugCategories[e].subsystems){const i=this.debugCategories[e].subsystems[t];console.log(`        - ${t}: ${i?"Enabled":"Disabled"}`)}}}}let p=class extends t{constructor(){super(),this.logger=u.getInstance(),this._showConditionDialog=!1,this._editingConditionIndex=null,this._conditionParameter="",this._conditionOperator="equals",this._conditionValue="",this._conditionAction="highlight",this._conditionActionValue="",this._conditionTargetPartIds="",this._showActionDialog=!1,this._editingActionIndex=null,this._actionLabel="",this._actionIcon="",this._actionParameter="",this._actionValue="",this._actionConfirmation=!1,this._actionConfirmationText="",this._conditionParameterType="entity",this._conditionPartId="",this._conditionParamName="",this._filterAttribute=null,this._filterOperator="eq",this._filterValue="",this._parameterName="",this._parameterValue="",this.logger=u.getInstance(),this.logger.log("Editor","Editor constructor called")}disconnectedCallback(){super.disconnectedCallback()}setConfig(e){this._config=Object.assign(Object.assign({},e),{view_type:e.view_type||"detail"})}_updateConfig(e){const t=JSON.parse(JSON.stringify(this._config||{}));for(const[i,o]of Object.entries(e))Array.isArray(o)?t[i]=[...o]:t[i]="object"==typeof o&&null!==o?Object.assign(Object.assign({},t[i]||{}),o):o;this.logger.log("Editor","Updated config",{category:"editor"},t),s(this,"config-changed",{config:t})}render(){var e,t,a,r,n,s,l,d,c,u,p,g,h,v,b,m,_,f,y,x,$,w,C,k,S,P,A,D,I,O,L,V,E,T,j,q,N,F,R,z,M,U,B,W,H,J,G,Y,K,Q,X,Z,ee,te,ie,oe,ae,re,ne,se,le,de;if(!this.hass||!this._config)return i``;const ce="variants"===this._config.view_type;return i`
            <div class="editor">
                <!-- Basic Settings -->
                <div class="section">
                    <div class="section-header">Basic Settings</div>
                    <div class="basic-settings">
                        <ha-entity-picker
                            .hass=${this.hass}
                            .value=${this._config.entity}
                            .label=${"Entity"}
                            .includeDomains=${["sensor"]}
                            @value-changed=${this._valueChanged("entity")}
                        ></ha-entity-picker>
                        <div class="checkbox-container">
                            <input
                                type="checkbox"
                                id="show_header"
                                .checked=${null===(t=null===(e=this._config.display)||void 0===e?void 0:e.show_header)||void 0===t||t}
                                @change=${this._valueChanged("display.show_header")}
                            />
                            <label for="show_header">Show Header</label>
                        </div>
                    </div>
                    <input
                        type="text"
                        label="Title"
                        .value=${this._config.name||""}
                        @input=${this._valueChanged("name")}
                    />
                </div>

                <!-- Layout -->
                <div class="section">
                    <div class="section-header">Layout</div>
                    <div class="grid-2">
                        <div class="input-group">
                            <label for="view-type">View Type</label>
                            <select
                                id="view-type"
                                .value=${this._config.view_type||"detail"}
                                @change=${this._valueChanged("view_type")}
                            >
                                <option value="detail" ?selected=${"detail"===(null===(a=this._config)||void 0===a?void 0:a.view_type)}>Detail</option>
                                <option value="grid" ?selected=${"grid"===(null===(r=this._config)||void 0===r?void 0:r.view_type)}>Grid</option>
                                <option value="list" ?selected=${"list"===(null===(n=this._config)||void 0===n?void 0:n.view_type)}>List</option>
                                <option value="parts" ?selected=${"parts"===(null===(s=this._config)||void 0===s?void 0:s.view_type)}>Parts</option>
                                <option value="variants" ?selected=${"variants"===(null===(l=this._config)||void 0===l?void 0:l.view_type)}>Variants</option>
                                <option value="base" ?selected=${"base"===(null===(d=this._config)||void 0===d?void 0:d.view_type)}>Base Layout</option>
                                <option value="debug" ?selected=${"debug"===(null===(c=this._config)||void 0===c?void 0:c.view_type)}>Debug View</option>
                                <option value="custom" ?selected=${"custom"===(null===(u=this._config)||void 0===u?void 0:u.view_type)}>Custom</option>
                            </select>
                        </div>

                        ${"grid"===(null===(p=this._config)||void 0===p?void 0:p.view_type)?i`
                            <div class="grid-settings">
                            <ha-textfield
                                type="number"
                                label="Columns"
                                min="1"
                                max="6"
                                    .value=${null!==(h=null===(g=this._config)||void 0===g?void 0:g.columns)&&void 0!==h?h:3}
                                    @change=${e=>{this.logger.log("Editor","Columns changing",{category:"editor"}),this._valueChanged("columns")(e)}}
                            ></ha-textfield>
                                
                                <ha-textfield
                                    type="number"
                                    label="Grid Spacing"
                                    min="0"
                                    max="24"
                                    .value=${null!==(b=null===(v=this._config)||void 0===v?void 0:v.grid_spacing)&&void 0!==b?b:8}
                                    @change=${e=>{this.logger.log("Editor","Grid spacing changing",{category:"editor"}),this._valueChanged("grid_spacing")(e)}}
                                ></ha-textfield>
                                
                                <ha-textfield
                                    type="number"
                                    label="Item Height"
                                    min="40"
                                    max="500"
                                    .value=${null!==(_=null===(m=this._config)||void 0===m?void 0:m.item_height)&&void 0!==_?_:170}
                                    @change=${e=>{this.logger.log("Editor","Item height changing",{category:"editor"}),this._valueChanged("item_height")(e)}}
                                ></ha-textfield>
                                
                                <ha-textfield
                                    type="number"
                                    label="Thumbnail Width"
                                    min="50"
                                    max="300"
                                    .value=${null!==(x=null===(y=null===(f=this._config)||void 0===f?void 0:f.style)||void 0===y?void 0:y.image_size)&&void 0!==x?x:50}
                                    @change=${e=>{this.logger.log("Editor","Thumbnail width changing",{category:"editor"}),this._valueChanged("style.image_size")(e)}}
                            ></ha-textfield>
                            </div>
                        `:o}
                    </div>
                </div>

                <!-- Display Settings -->
                <div class="section">
                    <div class="section-header">Display</div>
                    <div class="grid-2">
                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    ?checked=${!1!==(null===($=this._config.display)||void 0===$?void 0:$.show_image)}
                                @change=${this._valueChanged("display.show_image")}
                                />
                                Show Images
                            </label>
                        </div>
                        
                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    ?checked=${!1!==(null===(w=this._config.display)||void 0===w?void 0:w.show_name)}
                                @change=${this._valueChanged("display.show_name")}
                                />
                                Show Names
                            </label>
                        </div>
                        
                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    ?checked=${!1!==(null===(C=this._config.display)||void 0===C?void 0:C.show_stock)}
                                @change=${this._valueChanged("display.show_stock")}
                                />
                                Show Stock
                            </label>
                        </div>
                        
                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    ?checked=${!0===(null===(k=this._config.display)||void 0===k?void 0:k.show_description)}
                                @change=${this._valueChanged("display.show_description")}
                                />
                                Show Description
                            </label>
                    </div>

                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    ?checked=${!0===(null===(S=this._config.display)||void 0===S?void 0:S.show_category)}
                                    @change=${this._valueChanged("display.show_category")}
                                />
                                Show Category
                            </label>
                </div>

                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    ?checked=${!1!==(null===(P=this._config.display)||void 0===P?void 0:P.show_stock_status_border)}
                                    @change=${this._valueChanged("display.show_stock_status_border")}
                                />
                                Show Stock Status Border
                            </label>
                        </div>

                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    ?checked=${!1!==(null===(A=this._config.display)||void 0===A?void 0:A.show_stock_status_colors)}
                                    @change=${this._valueChanged("display.show_stock_status_colors")}
                                />
                                Show Stock Status Colors
                            </label>
                        </div>

                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    ?checked=${!1!==(null===(D=this._config.display)||void 0===D?void 0:D.show_buttons)}
                                    @change=${this._valueChanged("display.show_buttons")}
                                />
                                Show Buttons
                            </label>
                        </div>

                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    ?checked=${!0===(null===(I=this._config.display)||void 0===I?void 0:I.show_parameters)}
                                    @change=${this._valueChanged("display.show_parameters")}
                                />
                                Show Parameters
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Parameters Tab -->
                <div class="section">
                    <div class="section-header">Parameters</div>
                    
                    <div class="checkbox-container">
                        <input
                            type="checkbox"
                            id="enable_parameters"
                            .checked=${null!==(L=null===(O=this._config.parameters)||void 0===O?void 0:O.enabled)&&void 0!==L&&L}
                            @change=${this._valueChanged("parameters.enabled")}
                        />
                        <label for="enable_parameters">Enable Parameter Features</label>
                    </div>
                    
                    ${(null===(V=this._config.parameters)||void 0===V?void 0:V.enabled)?i`
                        <div class="subsection">
                            <div class="subsection-header">Parameter Display</div>
                            <div class="grid-2">
                                <div>
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            ?checked=${!1!==(null===(E=this._config.parameters)||void 0===E?void 0:E.show_section)}
                                            @change=${this._valueChanged("parameters.show_section")}
                                        />
                                        Show Parameters Section
                                    </label>
                                </div>
                                
                                <div>
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            ?checked=${!0===(null===(T=this._config.parameters)||void 0===T?void 0:T.collapsed_by_default)}
                                            @change=${this._valueChanged("parameters.collapsed_by_default")}
                                        />
                                        Collapsed by Default
                                    </label>
                                </div>
                                
                                <div>
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            ?checked=${!0===(null===(j=this._config.parameters)||void 0===j?void 0:j.group_parameters)}
                                            @change=${this._valueChanged("parameters.group_parameters")}
                                        />
                                        Group Parameters
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="subsection">
                            <div class="subsection-header">Parameter Conditions</div>
                            <p>Create rules that change how parts are displayed based on parameter values.</p>
                            
                            <button @click=${this._addCondition} class="add-button">
                                + Add Condition
                            </button>
                            
                            <div class="conditions-list">
                                ${(null===(N=null===(q=this._config.parameters)||void 0===q?void 0:q.conditions)||void 0===N?void 0:N.map(((e,t)=>i`
                                    <div class="condition-row">
                                        <div class="condition-summary">
                                            If <strong>${e.parameter}</strong> 
                                            ${this._getOperatorLabel(e.operator)} 
                                            <strong>${e.value}</strong> then
                                            ${this._getActionLabel(e.action,e.action_value)}
                                        </div>
                                        <div class="condition-actions">
                                            <button @click=${()=>this._editCondition(t)} class="edit-button">Edit</button>
                                            <button @click=${()=>this._removeCondition(t)} class="delete-button">Delete</button>
                                        </div>
                                    </div>
                                `)))||""}
                            </div>
                        </div>
                        
                        <div class="subsection">
                            <div class="subsection-header">Parameter Actions</div>
                            <p>Create custom buttons that update parameter values.</p>
                            
                            <button @click=${this._addAction} class="add-button">
                                + Add Action Button
                            </button>
                            
                            <div class="actions-list">
                                ${(null===(R=null===(F=this._config.parameters)||void 0===F?void 0:F.actions)||void 0===R?void 0:R.map(((e,t)=>i`
                                    <div class="action-row">
                                        <div class="action-summary">
                                            <strong>${e.label}</strong>: Set <strong>${e.parameter}</strong> to <strong>${e.value}</strong>
                                        </div>
                                        <div class="action-buttons">
                                            <button @click=${()=>this._editAction(t)} class="edit-button">Edit</button>
                                            <button @click=${()=>this._removeAction(t)} class="delete-button">Delete</button>
                                        </div>
                                    </div>
                                `)))||""}
                            </div>
                        </div>
                    `:""}
                </div>

                <!-- Buttons Configuration -->
                <div class="section">
                    <div class="section-header">Buttons</div>
                    <div class="grid-2">
                        <div class="select-container">
                            <label>Button Preset</label>
                            <select
                                .value=${null!==(M=null===(z=this._config.buttons)||void 0===z?void 0:z.preset)&&void 0!==M?M:"default"}
                                @change=${this._valueChanged("buttons.preset")}
                            >
                                <option value="default">Default (+1/-1)</option>
                                <option value="precise">Precise (+0.1/-0.1)</option>
                                <option value="bulk">Bulk (+10/-10)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Services -->
                <div class="section">
                    <div class="section-header">Services</div>
                    <div class="services-settings">
                        <div class="checkbox-container">
                            <input
                                type="checkbox"
                                id="enable_wled"
                                .checked=${null!==(W=null===(B=null===(U=this._config.services)||void 0===U?void 0:U.wled)||void 0===B?void 0:B.enabled)&&void 0!==W&&W}
                                @change=${this._valueChanged("services.wled.enabled")}
                            />
                            <label for="enable_wled">Enable WLED Location</label>
                        </div>
                        
                        ${(null===(J=null===(H=this._config.services)||void 0===H?void 0:H.wled)||void 0===J?void 0:J.enabled)?i`
                            <div class="grid-2">
                                <div class="input-container">
                                    <label>WLED Entity</label>
                                    <input
                                        type="text"
                                        .value=${(null===(Y=null===(G=this._config.services)||void 0===G?void 0:G.wled)||void 0===Y?void 0:Y.entity_id)||""}
                                        @input=${this._valueChanged("services.wled.entity_id")}
                                    />
                                </div>
                                
                                <div class="input-container">
                                    <label>Parameter Name</label>
                                    <input
                                        type="text"
                                        .value=${(null===(Q=null===(K=this._config.services)||void 0===K?void 0:K.wled)||void 0===Q?void 0:Q.parameter_name)||"led_xaxis"}
                                        @input=${this._valueChanged("services.wled.parameter_name")}
                                    />
                                </div>
                            </div>
                        `:""}
                        
                        <div class="checkbox-container">
                            <input
                                type="checkbox"
                                id="enable_print"
                                .checked=${null!==(ee=null===(Z=null===(X=this._config.services)||void 0===X?void 0:X.print)||void 0===Z?void 0:Z.enabled)&&void 0!==ee&&ee}
                                @change=${this._valueChanged("services.print.enabled")}
                            />
                            <label for="enable_print">Enable Print Labels</label>
                        </div>
                        
                        ${(null===(ie=null===(te=this._config.services)||void 0===te?void 0:te.print)||void 0===ie?void 0:ie.enabled)?i`
                            <div class="grid-2">
                                <div class="input-container">
                                    <label>Template ID</label>
                                    <input
                                        type="number"
                                        .value=${(null===(ae=null===(oe=this._config.services)||void 0===oe?void 0:oe.print)||void 0===ae?void 0:ae.template_id)||2}
                                        @input=${this._valueChanged("services.print.template_id")}
                                    />
                                </div>
                                
                                <div class="input-container">
                                    <label>Print Plugin</label>
                                    <input
                                        type="text"
                                        .value=${(null===(ne=null===(re=this._config.services)||void 0===re?void 0:re.print)||void 0===ne?void 0:ne.plugin)||"zebra"}
                                        @input=${this._valueChanged("services.print.plugin")}
                                    />
                                </div>
                            </div>
                        `:""}
                    </div>
                </div>

                <!-- Direct API Configuration -->
                ${this._renderDirectApiConfig()}

                <!-- Debugging Section -->
                ${this._renderDebuggingSection()}

                <!-- Variant Settings - ONLY SHOW ONCE when view_type is variants -->
                ${ce?i`
                    <div class="section">
                        <div class="section-header">Variant Settings</div>
                        <div class="input-group">
                            <label for="variant-view-type">Variant View Type</label>
                            <select
                                id="variant-view-type"
                                .value=${this._config.variant_view_type||"grid"}
                                @change=${this._valueChanged("variant_view_type")}
                            >
                                <option value="grid">Grid</option>
                                <option value="list">List</option>
                                <option value="tree">Tree</option>
                            </select>
                        </div>
                        <div class="checkbox-container">
                            <input
                                type="checkbox"
                                id="auto-detect-variants"
                                .checked=${!1!==this._config.auto_detect_variants}
                                @change=${this._valueChanged("auto_detect_variants")}
                            />
                            <label for="auto-detect-variants">Auto-detect Variants</label>
                        </div>
                    </div>
                `:""}

                ${this._renderPartsConfig()}

                <!-- Condition Dialog -->
                ${this._renderConditionDialog()}
                
                <!-- Action Dialog -->
                ${this._renderActionDialog()}

                <!-- Performance Settings Section -->
                ${this._renderPerformanceSettings()}

                ${"custom"===(null===(se=this._config)||void 0===se?void 0:se.view_type)?i`
                    <div class="subsection">
                        <div class="grid-2">
                            <ha-textfield
                                label="Custom Tag"
                                .value=${(null===(de=null===(le=this._config)||void 0===le?void 0:le.custom_view)||void 0===de?void 0:de.tag)||""}
                                @change=${this._valueChanged("custom_view.tag")}
                            ></ha-textfield>
                        </div>
                        <div class="note">
                            Enter a custom HTML tag name for your view component
                        </div>
                    </div>
                `:o}
            </div>
        `}_renderPartsConfig(){var e,t,o;if(!(null===(e=this._config)||void 0===e?void 0:e.view_type))return i``;if("parts"!==this._config.view_type)return i``;const a=this.hass?Object.keys(this.hass.states).filter((e=>{var t,i,o,a,r;return e.startsWith("sensor.")&&void 0!==(null===(o=null===(i=null===(t=this.hass)||void 0===t?void 0:t.states[e])||void 0===i?void 0:i.attributes)||void 0===o?void 0:o.items)&&!(null===(r=null===(a=this._config)||void 0===a?void 0:a.selected_entities)||void 0===r?void 0:r.includes(e))})):[];return i`
            <div class="section">
                <div class="section-header">Parts Configuration</div>
                
                <div class="values">
                    <div class="row">
                        <div class="input-container">
                            <label for="entity-select">Add InvenTree Entity:</label>
                            <select 
                                id="entity-select"
                                @change=${this._entitySelected}
                                .value=${""}
                            >
                                <option value="" disabled selected>Select an entity</option>
                                ${a.map((e=>{var t,o,a;return i`
                                    <option value=${e}>
                                        ${(null===(a=null===(o=null===(t=this.hass)||void 0===t?void 0:t.states[e])||void 0===o?void 0:o.attributes)||void 0===a?void 0:a.friendly_name)||e}
                                    </option>
                                `}))}
                            </select>
                        </div>
                    </div>
    
                    <div class="selected-entities">
                        ${null===(t=this._config.selected_entities)||void 0===t?void 0:t.map(((e,t)=>{var o,a,r,n;return i`
                            <div class="entity-row">
                                <span class="entity-name">
                                    ${null!==(n=null===(r=null===(a=null===(o=this.hass)||void 0===o?void 0:o.states[e])||void 0===a?void 0:a.attributes)||void 0===r?void 0:r.friendly_name)&&void 0!==n?n:e}
                                </span>
                                <button
                                    @click=${()=>this._removeEntity(t)}
                                    class="delete-button"
                                >
                                    Delete
                                </button>
                            </div>
                        `}))}
                    </div>
                    
                    <div class="section-subheader">Filters</div>
                    <div class="row">
                        <div class="filter-controls">
                            <select id="filter-attribute" .value=${this._filterAttribute||""} @change=${e=>this._filterAttribute=e.target.value}>
                                <option value="" disabled selected>Select attribute</option>
                                <option value="pk">Part ID (pk)</option>
                                <option value="name">Name</option>
                                <option value="in_stock">In Stock</option>
                                <option value="category_name">Category</option>
                                <option value="parameter">Parameter</option>
                            </select>
                            
                            ${"parameter"!==this._filterAttribute?i`
                                <select id="filter-operator" .value=${this._filterOperator||"eq"} @change=${e=>this._filterOperator=e.target.value}>
                                    <option value="eq">Equals</option>
                                    <option value="contains">Contains</option>
                                    <option value="gt">Greater than</option>
                                    <option value="lt">Less than</option>
                                </select>
                                
                                <input 
                                    type="text" 
                                    id="filter-value" 
                                    placeholder="Filter value"
                                    .value=${this._filterValue||""}
                                    @input=${e=>this._filterValue=e.target.value}
                                >
                                
                                <button @click=${this._addFilter} class="add-button">Add Filter</button>
                            `:i`
                                <button @click=${this._showParameterFilterDialog} class="add-button">Configure Parameter Filter</button>
                            `}
                        </div>
                    </div>
                    
                    ${"parameter"===this._filterAttribute?i`
                        <div class="subsection parameter-filter-config">
                            <div class="subsection-header">Parameter Filter</div>
                            <div class="parameter-filter-form">
                                <div class="input-container">
                                    <label for="parameter-name">Parameter Name:</label>
                                    <input 
                                        type="text" 
                                        id="parameter-name" 
                                        placeholder="e.g. color, size, material"
                                        .value=${this._parameterName||""}
                                        @input=${e=>this._parameterName=e.target.value}
                                    >
                                </div>
                                
                                <div class="input-container">
                                    <label for="parameter-value">Parameter Value:</label>
                                    <input 
                                        type="text" 
                                        id="parameter-value" 
                                        placeholder="e.g. red, large, cotton"
                                        .value=${this._parameterValue||""}
                                        @input=${e=>this._parameterValue=e.target.value}
                                    >
                                </div>
                                
                                <div class="input-container">
                                    <label for="parameter-operator">Operator:</label>
                                    <select 
                                        id="parameter-operator" 
                                        .value=${this._filterOperator||"eq"} 
                                        @change=${e=>this._filterOperator=e.target.value}
                                    >
                                        <option value="eq">Equals</option>
                                        <option value="contains">Contains</option>
                                    </select>
                                </div>
                                
                                <button @click=${this._addParameterFilter} class="add-button">Add Parameter Filter</button>
                            </div>
                        </div>
                `:""}
                    
                    <div class="active-filters">
                        ${null===(o=this._config.filters)||void 0===o?void 0:o.map(((e,t)=>i`
                            <div class="filter-row">
                                <span>
                                    ${"parameter"===e.attribute?`Parameter: ${e.parameter_id||"any"} ${this._getOperatorLabel(e.operator)} ${e.value}`:`${e.attribute} ${this._getOperatorLabel(e.operator)} ${e.value}`}
                                </span>
                                <button @click=${()=>this._removeFilter(t)} class="delete-button">Delete</button>
                            </div>
                        `))}
                    </div>
                </div>
            </div>
        `}_entitySelected(e){const t=e.target,i=t.value;if(!this._config||!i)return;const o=this._config.selected_entities||[];o.includes(i)||this._updateConfig({selected_entities:[...o,i]}),t.value=""}_removeEntity(e){if(!this._config||!this._config.selected_entities)return;const t=[...this._config.selected_entities];t.splice(e,1),this._updateConfig({selected_entities:t})}_valueChanged(e){return t=>{var i;if(!this._config)return;const o=t.target;let a;if("detail"in t&&void 0!==(null===(i=t.detail)||void 0===i?void 0:i.value))a=t.detail.value;else{if(!o)return;a="checkbox"===o.type?o.checked:o.value}const r=JSON.parse(JSON.stringify(this._config));if("services.wled.enabled"===e)!0===a?(r.services||(r.services={}),r.services.wled?r.services.wled.enabled=!0:r.wled?r.services.wled=Object.assign(Object.assign({},r.wled),{enabled:!0}):r.services.wled={enabled:!0,entity_id:"light.wled_inventory",parameter_name:"led_xaxis"},r.wled=Object.assign({},r.services.wled)):(r.services||(r.services={}),r.services.wled||(r.services.wled={}),r.services.wled.enabled=!1,r.wled&&(r.wled.enabled=!1));else if(e.startsWith("services.wled.")){const t=e.split(".")[2];r.services||(r.services={}),r.services.wled||(r.services.wled={enabled:!0}),r.services.wled[t]=a,r.wled||(r.wled={}),r.wled[t]=a}else if(e.includes(".")){const t=e.split(".");let i=r;for(let e=0;e<t.length-1;e++)i[t[e]]&&"object"==typeof i[t[e]]||(i[t[e]]={}),i=i[t[e]];i[t[t.length-1]]=a}else r[e]=a;this.logger.log("Editor","Updated config",{category:"editor"},r),s(this,"config-changed",{config:r})}}static async getConfigForm(){return{schema:[{name:"entities",selector:{entity:{domain:["sensor"],multiple:!0,filter:{attributes:{items:{}}}}}}]}}static getStubConfig(e){return{type:"custom:inventree-card",entity:Object.keys(e.states).find((t=>{var i;return t.startsWith("sensor.")&&void 0!==(null===(i=e.states[t].attributes)||void 0===i?void 0:i.items)}))||"",view_type:"detail",selected_entities:[],display:{show_header:!0,show_image:!0,show_name:!0,show_stock:!0,show_description:!1,show_category:!1,show_stock_status_border:!0,show_stock_status_colors:!0,show_buttons:!0,show_parameters:!0}}}_getOperatorLabel(e){switch(e){case"eq":case"equals":return"equals";case"not_equals":return"does not equal";case"contains":return"contains";case"gt":case"greater_than":return"is greater than";case"lt":case"less_than":return"is less than";case"exists":return"exists";case"is_empty":return"is empty";default:return e}}_addFilter(){if(!this._config||!this._filterAttribute||!this._filterValue)return;const e=this._config.filters||[],t={attribute:this._filterAttribute,operator:this._filterOperator,value:this._filterValue};this.logger.log("Editor","Adding regular filter:",{category:"editor"},t);const i=[...e,t];this._updateConfig({filters:i}),this._filterAttribute=null,this._filterValue=""}_removeFilter(e){if(!this._config||!this._config.filters)return;const t=[...this._config.filters];t.splice(e,1),this._updateConfig({filters:t})}_showParameterFilterDialog(){}_addParameterFilter(){if(!this._config||!this._parameterName||!this._parameterValue)return void this.logger.log("Editor","Cannot add parameter filter: missing config, name, or value",{category:"editor"});const e=this._config.filters||[],t={attribute:"parameter",operator:this._filterOperator,value:this._parameterValue,parameter_id:this._parameterName};this.logger.log("Editor","Adding parameter filter:",{category:"editor"},t),this.logger.log("Editor","Existing filters:",{category:"editor"},e);const i=[...e,t];this.logger.log("Editor","Updated filters array:",{category:"editor"},i),this._updateConfig({filters:i}),this._parameterName="",this._parameterValue=""}_getActionLabel(e,t){switch(e){case"highlight":return`highlight with color ${t}`;case"text_color":return`change text color to ${t}`;case"border":return`add ${t} border`;case"icon":return`show ${t} icon`;case"badge":return`add "${t}" badge`;case"sort":return`sort to ${t}`;case"filter":return"show"===t?"show item":"hide item";case"show_section":return("show"===t?"show":"hide")+" section";case"priority":return`set priority to ${t}`;default:return`${e}: ${t}`}}_addCondition(){this._conditionParameter="",this._conditionOperator="equals",this._conditionValue="",this._conditionAction="highlight",this._conditionActionValue="#ff0000",this._editingConditionIndex=null,this._showConditionDialog=!0}_editCondition(e){var t;if(!this._config||!(null===(t=this._config.parameters)||void 0===t?void 0:t.conditions))return;const i=this._config.parameters.conditions[e];this._editingConditionIndex=e,this._conditionParameter=i.parameter,this._conditionOperator=i.operator,this._conditionValue=i.value||"",this._conditionAction=i.action,this._conditionActionValue=i.action_value,"string"==typeof i.targetPartIds?this._conditionTargetPartIds=i.targetPartIds:Array.isArray(i.targetPartIds)?this._conditionTargetPartIds=i.targetPartIds.join(", "):this._conditionTargetPartIds="",this._showConditionDialog=!0,this.requestUpdate()}_closeConditionDialog(){this._showConditionDialog=!1,this._editingConditionIndex=null,this._conditionParameter="",this._conditionOperator="equals",this._conditionValue="",this._conditionAction="highlight",this._conditionActionValue="",this._conditionTargetPartIds="",this.requestUpdate()}_saveCondition(){if(!this._conditionParameter)return void alert("Parameter is required");if("exists"!==this._conditionOperator&&"is_empty"!==this._conditionOperator&&!this._conditionValue)return void alert("Value is required for this operator");const e={parameter:this._conditionParameter,operator:this._conditionOperator,action:this._conditionAction,action_value:this._conditionActionValue};"exists"!==this._conditionOperator&&"is_empty"!==this._conditionOperator&&(e.value=this._conditionValue);const t=this._conditionTargetPartIds.trim();if("*"===t?e.targetPartIds="*":t?(e.targetPartIds=t.split(",").map((e=>parseInt(e.trim(),10))).filter((e=>!isNaN(e))),0===e.targetPartIds.length&&delete e.targetPartIds):delete e.targetPartIds,!this._config)return;const i=JSON.parse(JSON.stringify(this._config));i.parameters||(i.parameters={enabled:!0,conditions:[],actions:[]}),i.parameters.conditions||(i.parameters.conditions=[]),null!==this._editingConditionIndex?i.parameters.conditions[this._editingConditionIndex]=e:i.parameters.conditions.push(e),this._updateConfig(i),this._closeConditionDialog()}_removeCondition(e){var t;if(!this._config||!(null===(t=this._config.parameters)||void 0===t?void 0:t.conditions))return;const i=[...this._config.parameters.conditions];i.splice(e,1);const o=this._config.parameters||{};this._updateConfig({parameters:Object.assign(Object.assign({},o),{conditions:i})})}_addAction(){this._actionLabel="",this._actionIcon="",this._actionParameter="",this._actionValue="",this._actionConfirmation=!1,this._actionConfirmationText="",this._editingActionIndex=null,this._showActionDialog=!0}_editAction(e){var t;if(!this._config||!(null===(t=this._config.parameters)||void 0===t?void 0:t.actions))return;const i=this._config.parameters.actions[e];this._editingActionIndex=e,this._actionLabel=i.label,this._actionIcon=i.icon||"",this._actionParameter=i.parameter,this._actionValue=i.value,this._actionConfirmation=i.confirmation||!1,this._actionConfirmationText=i.confirmation_text||"",this._showActionDialog=!0,this.requestUpdate()}_closeActionDialog(){this._showActionDialog=!1,this._editingActionIndex=null,this.requestUpdate()}_saveAction(){var e;if(!this._config)return;const t=[...(null===(e=this._config.parameters)||void 0===e?void 0:e.actions)||[]];null!==this._editingActionIndex?t[this._editingActionIndex]={label:this._actionLabel,icon:this._actionIcon,parameter:this._actionParameter,value:this._actionValue,confirmation:this._actionConfirmation,confirmation_text:this._actionConfirmationText}:t.push({label:this._actionLabel,icon:this._actionIcon,parameter:this._actionParameter,value:this._actionValue,confirmation:this._actionConfirmation,confirmation_text:this._actionConfirmationText}),this._config.parameters||(this._config.parameters={enabled:!0,actions:[]}),this._updateConfig({parameters:Object.assign(Object.assign({},this._config.parameters),{actions:t})}),this._closeActionDialog()}_removeAction(e){var t;if(!this._config||!(null===(t=this._config.parameters)||void 0===t?void 0:t.actions))return;const i=[...this._config.parameters.actions];i.splice(e,1);const o=this._config.parameters||{};this._updateConfig({parameters:Object.assign(Object.assign({},o),{actions:i})})}_renderConditionDialog(){return this._showConditionDialog?i`
            <div class="dialog-overlay">
                <div class="dialog">
                    <div class="dialog-header">
                        <h3>${null!==this._editingConditionIndex?"Edit Condition":"Add Condition"}</h3>
                        <button class="close-button" @click=${this._closeConditionDialog}>×</button>
                    </div>
                    <div class="dialog-content">
                        <div class="input-group">
                            <label for="condition-parameter">Parameter</label>
                            <input
                                type="text"
                                id="condition-parameter"
                                .value=${this._conditionParameter}
                                @input=${e=>this._conditionParameter=e.target.value}
                                placeholder="e.g. order_status or part:145:microwavables"
                            />
                            <div class="helper-text">
                                Enter parameter name or direct reference (part:id:parameter)
                            </div>
                        </div>
                        
                        <div class="input-group">
                            <label for="condition-operator">Operator</label>
                            <select
                                id="condition-operator"
                                .value=${this._conditionOperator}
                                @change=${e=>this._conditionOperator=e.target.value}
                            >
                                <option value="equals">Equals</option>
                                <option value="not_equals">Not Equals</option>
                                <option value="contains">Contains</option>
                                <option value="greater_than">Greater Than</option>
                                <option value="less_than">Less Than</option>
                                <option value="exists">Exists</option>
                                <option value="is_empty">Is Empty</option>
                            </select>
                        </div>
                        
                        <div class="input-group">
                            <label for="condition-value">Value</label>
                            <input
                                type="text"
                                id="condition-value"
                                .value=${this._conditionValue}
                                @input=${e=>this._conditionValue=e.target.value}
                                placeholder="e.g. True, 42, red"
                                ?disabled=${"exists"===this._conditionOperator||"is_empty"===this._conditionOperator}
                            />
                        </div>
                        
                        <div class="input-group">
                            <label for="condition-action">Action</label>
                            <select
                                id="condition-action"
                                .value=${this._conditionAction}
                                @change=${e=>this._conditionAction=e.target.value}
                            >
                                <option value="highlight">Highlight</option>
                                <option value="text_color">Text Color</option>
                                <option value="border">Border</option>
                                <option value="icon">Icon</option>
                                <option value="badge">Badge</option>
                                <option value="sort">Sort</option>
                                <option value="filter">Filter</option>
                                <option value="show_section">Show/Hide Section</option>
                                <option value="priority">Set Priority</option>
                            </select>
                        </div>
                        
                        <div class="input-group">
                            ${this._renderActionValueInput()}
                        </div>
                        <div class="input-group">
                            <label for="condition-target-part-ids">Target Part IDs (optional)</label>
                            <input
                                type="text"
                                id="condition-target-part-ids"
                                .value=${this._conditionTargetPartIds}
                                @input=${e=>this._conditionTargetPartIds=e.target.value}
                                placeholder="e.g., 101, 102, 103 or * for all"
                            />
                            <div class="helper-text">
                                Comma-separated part IDs this action applies to, or '*' for all loaded parts.
                            </div>
                        </div>
                    </div>
                    <div class="dialog-actions">
                        <button @click=${this._closeConditionDialog}>Cancel</button>
                        <button @click=${this._saveCondition} class="primary">Save</button>
                    </div>
                </div>
            </div>
        `:i``}_renderActionValueInput(){switch(this._conditionActionValue||(["highlight","text_color"].includes(this._conditionAction)?this._conditionActionValue="#ff0000":"border"===this._conditionAction?this._conditionActionValue="2px solid #ff0000":"sort"===this._conditionAction?this._conditionActionValue="top":"filter"===this._conditionAction||"show_section"===this._conditionAction?this._conditionActionValue="show":"priority"===this._conditionAction&&(this._conditionActionValue="medium")),this._conditionAction){case"highlight":case"text_color":return i`
                    <label for="action-value">Color</label>
                    <input
                        type="color"
                        id="action-value"
                        .value=${this._conditionActionValue||"#ff0000"}
                        @input=${e=>this._conditionActionValue=e.target.value}
                    />
                `;case"border":return i`
                    <label for="action-value">Border CSS</label>
                    <input
                        type="text"
                        id="action-value"
                        .value=${this._conditionActionValue||"2px solid #ff0000"}
                        @input=${e=>this._conditionActionValue=e.target.value}
                        placeholder="e.g., 2px dashed blue"
                    />
                    <div class="helper-text">Enter a full CSS border string (e.g., "1px solid red").</div>
                `;case"sort":return i`
                    <label for="action-value">Sort Position</label>
                    <select
                        id="action-value"
                        .value=${this._conditionActionValue||"top"}
                        @change=${e=>this._conditionActionValue=e.target.value}
                    >
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                    </select>
                `;case"filter":return i`
                    <label for="action-value">Filter Action</label>
                    <select
                        id="action-value"
                        .value=${this._conditionActionValue||"show"}
                        @change=${e=>this._conditionActionValue=e.target.value}
                    >
                        <option value="show">Show Item</option>
                        <option value="hide">Hide Item</option>
                    </select>
                `;case"show_section":return i`
                    <label for="action-value">Section Visibility</label>
                    <select
                        id="action-value"
                        .value=${this._conditionActionValue||"show"}
                        @change=${e=>this._conditionActionValue=e.target.value}
                    >
                        <option value="show">Show Section</option>
                        <option value="hide">Hide Section</option>
                    </select>
                `;case"priority":return i`
                    <label for="action-value">Priority Level</label>
                    <select
                        id="action-value"
                        .value=${this._conditionActionValue||"medium"}
                        @change=${e=>this._conditionActionValue=e.target.value}
                    >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                `;default:return i`
                    <label for="action-value">Value</label>
                    <input
                        type="text"
                        id="action-value"
                        .value=${this._conditionActionValue||""}
                        @input=${e=>this._conditionActionValue=e.target.value}
                        placeholder="Enter action value"
                    />
                `}}_renderActionDialog(){return this._showActionDialog?i`
            <div class="dialog-overlay" @click=${e=>e.stopPropagation()}>
                <div class="dialog-container">
                    <div class="dialog-header">
                        <h2>${null!==this._editingActionIndex?"Edit Action":"Add Action"}</h2>
                        <button class="close-button" @click=${this._closeActionDialog}>×</button>
                    </div>
                    
                    <div class="dialog-content">
                        <div class="form-field">
                            <label for="action-label">Label</label>
                            <input 
                                type="text" 
                                id="action-label" 
                                .value=${this._actionLabel}
                                @input=${e=>this._actionLabel=e.target.value}
                                placeholder="e.g. Turn On, Set Color"
                            />
                        </div>
                        
                        <div class="form-field">
                            <label for="action-icon">Icon (optional)</label>
                            <input 
                                type="text" 
                                id="action-icon" 
                                .value=${this._actionIcon}
                                @input=${e=>this._actionIcon=e.target.value}
                                placeholder="e.g. mdi:power, mdi:lightbulb"
                            />
                            <div class="helper-text">MDI icon name, e.g. 'mdi:check'</div>
                        </div>
                        
                        <div class="form-field">
                            <label for="action-parameter">Parameter</label>
                            <input 
                                type="text" 
                                id="action-parameter" 
                                .value=${this._actionParameter}
                                @input=${e=>this._actionParameter=e.target.value}
                                placeholder="e.g. color or sensor.inventree_microwaves_stock:mw_power_state"
                            />
                            <div class="helper-text">Parameter name or cross-entity reference (entity_id:parameter_name)</div>
                        </div>
                        
                        <div class="form-field">
                            <label for="action-value">Value</label>
                            <input 
                                type="text" 
                                id="action-value" 
                                .value=${this._actionValue}
                                @input=${e=>this._actionValue=e.target.value}
                                placeholder="e.g. True, 42, red"
                            />
                        </div>
                        
                        <div class="form-field checkbox-field">
                            <label for="action-confirmation">Require confirmation</label>
                            <input 
                                type="checkbox" 
                                id="action-confirmation" 
                                .checked=${this._actionConfirmation}
                                @change=${e=>{this._actionConfirmation=e.target.checked,this.requestUpdate()}}
                            />
                        </div>
                        
                        ${this._actionConfirmation?i`
                            <div class="form-field">
                                <label for="action-confirmation-text">Confirmation Text</label>
                                <input 
                                    type="text" 
                                    id="action-confirmation-text" 
                                    .value=${this._actionConfirmationText}
                                    @input=${e=>this._actionConfirmationText=e.target.value}
                                    placeholder="e.g. Are you sure you want to turn on the microwave?"
                                />
                                <div class="helper-text">Text to show in confirmation dialog</div>
                            </div>
                        `:""}
                    </div>
                    
                    <div class="dialog-buttons">
                        <button 
                            class="cancel-button" 
                            @click=${this._closeActionDialog}
                        >
                            Cancel
                        </button>
                        <button 
                            class="save-button" 
                            @click=${this._saveAction}
                            .disabled=${!this._actionLabel||!this._actionParameter||!this._actionValue}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        `:i``}_renderDirectApiConfig(){var e,t,o,a,r,n,s;return this._config?i`
            <div class="section">
                <div class="section-header">InvenTree API Settings</div>
                
                <div class="checkbox-container">
                    <input
                        type="checkbox"
                        id="enable_direct_api"
                        .checked=${(null===(e=this._config.direct_api)||void 0===e?void 0:e.enabled)||!1}
                        @change=${this._valueChanged("direct_api.enabled")}
                    />
                    <label for="enable_direct_api">Enable Direct API</label>
                </div>
                
                ${(null===(t=this._config.direct_api)||void 0===t?void 0:t.enabled)?i`
                    <div class="input-group">
                        <label for="api-url">InvenTree API URL</label>
                        <input
                            type="text"
                            id="api-url"
                            .value=${(null===(o=this._config.direct_api)||void 0===o?void 0:o.url)||""}
                            @input=${this._valueChanged("direct_api.url")}
                            placeholder="http://your-inventree-server.com"
                        />
                    </div>
                    
                    <div class="input-group">
                        <label for="api-key">API Key</label>
                        <input
                            type="text"
                            id="api-key"
                            .value=${(null===(a=this._config.direct_api)||void 0===a?void 0:a.api_key)||""}
                            @input=${this._valueChanged("direct_api.api_key")}
                            placeholder="Your InvenTree API key"
                        />
                    </div>
                    
                    <!-- Remove Data Sources subsection -->
                    
                    <!-- Show WebSocket settings ONLY if direct API is enabled -->
                    <div class="input-group">
                        <label for="websocket-url">WebSocket URL (Optional)</label>
                        <input
                            type="text"
                            id="websocket-url"
                            .value=${(null===(r=this._config.direct_api)||void 0===r?void 0:r.websocket_url)||""}
                            @input=${this._valueChanged("direct_api.websocket_url")}
                            placeholder="ws://your-inventree-server.com/api/ws/"
                        />
                        <div class="helper-text">
                            Leave blank to auto-derive from API URL (e.g., ws://.../api/ws/). Needed if using a reverse proxy or different port.
                        </div>
                    </div>
                    
                    <div class="input-group">
                        <label for="idle-render-time">Idle Render Time (seconds)</label>
                        <input
                            type="number"
                            id="idle-render-time"
                            .value=${(null===(s=null===(n=this._config.direct_api)||void 0===n?void 0:n.idle_render_time)||void 0===s?void 0:s.toString())||"60"}
                            @input=${this._valueChanged("direct_api.idle_render_time")}
                            min="10"
                            max="600"
                            placeholder="60"
                        />
                        <div class="helper-text">
                            How often to refresh when no changes are detected (10-600 seconds)
                        </div>
                    </div>
                `:""}
            </div>
        `:i``}_renderDebuggingSection(){var e,t;const o=this.logger.getSystemsStatus();return i`
          <div class="row">
            <div class="col">
              <div class="card-header">
                <h3>Debugging</h3>
              </div>
              <div class="card-content">
                <div class="row">
                  <div class="col">
                    <input 
                      type="checkbox"
                      id="debug-checkbox"
                      ?checked=${(null===(e=this._config)||void 0===e?void 0:e.debug)||!1}
                      @change=${this._valueChangedDebug("debug")}
                    />
                    <label for="debug-checkbox">Enable Debug</label>
                  </div>
                </div>
                <div class="row">
                  <div class="col">
                    <input 
                      type="checkbox"
                      id="debug-verbose-checkbox"
                      ?checked=${(null===(t=this._config)||void 0===t?void 0:t.debug_verbose)||!1}
                      @change=${this._valueChangedDebug("debug_verbose")}
                    />
                    <label for="debug-verbose-checkbox">Verbose Logging</label>
                  </div>
                </div>
                <div class="row">
                  <h4>Debug Categories</h4>
                </div>
                ${Object.entries(o).map((([e,t],o)=>i`
                    <div class="row">
                      <div class="col">
                        <input 
                          type="checkbox"
                          id="debug-system-${o}"
                          ?checked=${!0===this._config[`debug_${e}`]}
                          @change=${this._valueChangedDebug(`debug_${e}`)}
                        />
                        <label for="debug-system-${o}">${e}</label>
                      </div>
                    </div>
                    ${Object.keys(t.subsystems||{}).map(((t,a)=>{var r,n,s,l;return i`
                        <div class="row">
                          <div class="col" style="padding-left: 2em">
                            <input 
                              type="checkbox"
                              id="debug-subsystem-${o}-${a}"
                              ?checked=${!0===(null===(l=null===(s=null===(n=null===(r=this._config)||void 0===r?void 0:r.debug_hierarchical)||void 0===n?void 0:n[e])||void 0===s?void 0:s.subsystems)||void 0===l?void 0:l[t])}
                              @change=${this._valueChangedDebug("debug_hierarchical",e,t)}
                            />
                            <label for="debug-subsystem-${o}-${a}">${t}</label>
                          </div>
                        </div>
                      `}))}
                  `))}
              </div>
            </div>
          </div>
        `}_getSubsystem(e,t){var i;const o=null===(i=this._config)||void 0===i?void 0:i.debug_hierarchical;return o&&o[e]&&o[e].subsystems&&o[e].subsystems[t]||!1}_updateSubsystem(e,t){return i=>{if(!this._config)return;const o=i.target.checked,a=JSON.parse(JSON.stringify(this._config));a.debug_hierarchical||(a.debug_hierarchical={}),a.debug_hierarchical[e]||(a.debug_hierarchical[e]={enabled:!0,subsystems:{}});const r=a.debug_hierarchical[e];r.subsystems||(r.subsystems={}),r.subsystems[t]=o;let n=!0;for(const e in r.subsystems)if(r.subsystems[e]){n=!1;break}r.enabled=!n;const s=u.getInstance();s.setSubsystemDebug(e,t,o),n?s.setCategoryDebug(e,!1):s.setCategoryDebug(e,!0),this._updateConfig(a)}}_formatSubsystemName(e){return e.split("_").map((e=>e.charAt(0).toUpperCase()+e.slice(1))).join(" ")}_getMethodDescription(e){switch(e){case"websocket":return"Uses WebSocket plugin for real-time updates from InvenTree. Fastest and most efficient method.";case"polling":return"Periodically polls the InvenTree API for updates. Reliable but less efficient.";case"hass":return"Uses Home Assistant sensors for updates. Slowest method, requires InvenTree integration.";default:return""}}_renderScheduledJobs(){return i`
            <div class="no-jobs-message">
                No scheduled jobs configured yet. Click "Add Scheduled Job" to create one.
            </div>
        `}_showAddJobDialog(){alert("Scheduled jobs configuration interface is coming soon! This feature allows you to configure regular data refresh, cache clearing, and other maintenance tasks on a schedule.")}_getPerformanceSetting(e,t,i){if(!this._config)return i;let o=this._config;const a=e.split(".");let r=[...a];"direct_api"===a[0]&&a.length>1&&"performance"!==a[1]?r.splice(1,0,"performance"):"direct_api"!==a[0]&&"performance"!==a[0]&&r.unshift("performance");for(const e of r){if(!o||"object"!=typeof o||!(e in o))return i;o=o[e]}if(o&&"object"==typeof o&&t in o){const e=o[t];return"number"==typeof e?e:i}return i}_updatePerformanceSetting(e,t,i=!1){return i=>{if(!this._config)return;const o=i.target;let a=parseFloat(o.value);if(isNaN(a))return this.logger.warn("Editor",`Invalid numeric input for performance setting ${e}.${t}: ${o.value}`),void this.requestUpdate();const r=JSON.parse(JSON.stringify(this._config));let n=r;const s=e.split(".");let l=[],d=[];"direct_api"===s[0]?(l=["direct_api","performance"],d=s.slice(1)):(l=["performance"],d=s);let c=n;for(const e of l)c[e]&&"object"==typeof c[e]||(c[e]={}),c=c[e];for(const e of d)c[e]&&"object"==typeof c[e]||(c[e]={}),c=c[e];c[t]=a,this._updateConfig(r),this.requestUpdate()}}_parameterTypeChanged(e){if(e.stopPropagation(),this._conditionParameterType=e.target.value,"direct"===this._conditionParameterType&&this._conditionParameter){const e=this._conditionParameter.split(":");2===e.length&&(this._conditionParamName=e[1])}else"entity"===this._conditionParameterType&&this._conditionPartId&&this._conditionParamName&&(this._conditionParameter=`part:${this._conditionPartId}:${this._conditionParamName}`);this.requestUpdate()}_valueChangedDebug(e,t,i){return o=>{if(!this._config)return;const a=!0===o.target.checked,r=JSON.parse(JSON.stringify(this._config));if("debug"===e)r.debug=a,this.logger.setDebug(a);else if("debug_verbose"===e)r.debug_verbose=a,this.logger.setVerboseMode(a);else if(e.startsWith("debug_")){const t=e.substring(6);r[e]=a,this.logger.setCategoryDebug(t,a)}else if("debug_hierarchical"===e&&t&&i){r.debug_hierarchical||(r.debug_hierarchical={}),r.debug_hierarchical[t]||(r.debug_hierarchical[t]={enabled:!0,subsystems:{}}),r.debug_hierarchical[t].subsystems||(r.debug_hierarchical[t].subsystems={}),r.debug_hierarchical[t].subsystems[i]=a,this.logger.setSubsystemDebug(t,i,a);let e=!0;for(const i in r.debug_hierarchical[t].subsystems)if(r.debug_hierarchical[t].subsystems[i]){e=!1;break}r.debug_hierarchical[t].enabled=!e,r[`debug_${t}`]=!e,this.logger.setCategoryDebug(t,!e)}this._updateConfig(r)}}_renderPerformanceSettings(){var e;if(!this._config)return i``;const t=(null===(e=this._config.direct_api)||void 0===e?void 0:e.enabled)||!1;return i`
            <div class="section">
                <div class="section-header">Performance Settings</div>
                <div class="helper-text">Fine-tune throttling and update frequencies. Lower values mean more responsive but potentially higher load. (Times in milliseconds unless specified).</div>

                <div class="subsection">
                    <div class="subsection-header">Direct API Performance</div>
                    <div class="performance-group" ?disabled=${!t}>
                         <div class="helper-text" ?hidden=${t}>Enable Direct API to configure these settings.</div>
                        <div class="slider-group">
                            <span>API Call Throttle (s)</span>
                            <input 
                                type="number" 
                                min="0" 
                                step="0.1"
                                .value=${this._getPerformanceSetting("direct_api.api","throttle",.2).toString()}
                                @input=${this._updatePerformanceSetting("direct_api.api","throttle",!0)}
                                ?disabled=${!t}
                            />
                            <span>${this._getPerformanceSetting("direct_api.api","throttle",.2)} s</span>
                        </div>
                        <div class="slider-group">
                            <span>API Cache Lifetime (s)</span>
                            <input 
                                type="number" 
                                min="0" 
                                step="1"
                                .value=${this._getPerformanceSetting("direct_api.api","cacheLifetime",60).toString()}
                                @input=${this._updatePerformanceSetting("direct_api.api","cacheLifetime",!0)}
                                ?disabled=${!t}
                            />
                            <span>${this._getPerformanceSetting("direct_api.api","cacheLifetime",60)} s</span>
                        </div>
                        <div class="slider-group">
                            <span>API Failed Retry Delay (s)</span>
                            <input 
                                type="number" 
                                min="0" 
                                step="1"
                                .value=${this._getPerformanceSetting("direct_api.api","failedRequestRetryDelaySeconds",30).toString()}
                                @input=${this._updatePerformanceSetting("direct_api.api","failedRequestRetryDelaySeconds",!0)}
                                ?disabled=${!t}
                            />
                            <span>${this._getPerformanceSetting("direct_api.api","failedRequestRetryDelaySeconds",30)} s</span>
                        </div>
                        <div class="slider-group">
                            <span>WS Reconnect (ms)</span>
                            <input 
                                type="number" 
                                min="1000" 
                                step="1000"
                                .value=${this._getPerformanceSetting("direct_api.websocket","reconnectInterval",5e3).toString()}
                                @input=${this._updatePerformanceSetting("direct_api.websocket","reconnectInterval")}
                                ?disabled=${!t}
                            />
                            <span>${this._getPerformanceSetting("direct_api.websocket","reconnectInterval",5e3)} ms</span>
                        </div>
                        <div class="slider-group">
                            <span>WS Msg Debounce (ms)</span>
                            <input 
                                type="number" 
                                min="0" 
                                step="10"
                                .value=${this._getPerformanceSetting("direct_api.websocket","messageDebounce",50).toString()}
                                @input=${this._updatePerformanceSetting("direct_api.websocket","messageDebounce")}
                                ?disabled=${!t}
                            />
                            <span>${this._getPerformanceSetting("direct_api.websocket","messageDebounce",50)} ms</span>
                        </div>
                    </div>
                </div>

                <div class="subsection">
                    <div class="subsection-header">General Card Performance</div>
                    <div class="performance-group">
                        <div class="slider-group">
                            <span>Render Debounce (ms)</span>
                            <input 
                                type="number" 
                                min="0" 
                                step="10"
                                .value=${this._getPerformanceSetting("rendering","debounceTime",50).toString()}
                                @input=${this._updatePerformanceSetting("rendering","debounceTime")}
                            />
                            <span>${this._getPerformanceSetting("rendering","debounceTime",50)} ms</span>
                        </div>
                        <div class="slider-group">
                            <span>Idle Render Interval (ms)</span>
                            <input 
                                type="number" 
                                min="500" 
                                step="500"
                                .value=${this._getPerformanceSetting("rendering","idleRenderInterval",5e3).toString()}
                                @input=${this._updatePerformanceSetting("rendering","idleRenderInterval")}
                            />
                            <span>${this._getPerformanceSetting("rendering","idleRenderInterval",5e3)} ms</span>
                        </div>
                        <div class="slider-group">
                            <span>Max Render Freq (Hz)</span>
                            <input 
                                type="number" 
                                min="1" 
                                max="60" 
                                step="1"
                                .value=${this._getPerformanceSetting("rendering","maxRenderFrequency",10).toString()}
                                @input=${this._updatePerformanceSetting("rendering","maxRenderFrequency")}
                            />
                            <span>${this._getPerformanceSetting("rendering","maxRenderFrequency",10)} Hz</span>
                        </div>
                        <div class="slider-group">
                            <span>Param Update Freq (ms)</span>
                            <input 
                                type="number" 
                                min="100" 
                                step="100"
                                .value=${this._getPerformanceSetting("parameters","updateFrequency",1e3).toString()}
                                @input=${this._updatePerformanceSetting("parameters","updateFrequency")}
                            />
                            <span>${this._getPerformanceSetting("parameters","updateFrequency",1e3)} ms</span>
                        </div>
                        <div class="slider-group">
                            <span>Cond. Eval Freq (ms)</span>
                            <input 
                                type="number" 
                                min="100" 
                                step="100"
                                .value=${this._getPerformanceSetting("parameters","conditionEvalFrequency",1e3).toString()}
                                @input=${this._updatePerformanceSetting("parameters","conditionEvalFrequency")}
                            />
                            <span>${this._getPerformanceSetting("parameters","conditionEvalFrequency",1e3)} ms</span>
                        </div>
                    </div>
                </div>
            </div>
        `}};p.styles=[c,e`
            :host {
                --primary-color: var(--primary-text-color);
                --secondary-color: var(--secondary-text-color);
                --primary-background-color: var(--card-background-color);
                --secondary-background-color: var(--secondary-background-color);
                --border-color: var(--divider-color, rgba(0, 0, 0, 0.12));
                --mdc-dialog-heading-ink-color: var(--primary-text-color);
                --mdc-dialog-content-ink-color: var(--primary-text-color);
                --dialog-background-color: var(--card-background-color);
                --dialog-text-color: var(--primary-text-color);
                --dialog-border-color: var(--divider-color);
                --button-primary-color: var(--primary-color);
                --button-primary-text-color: var(--text-primary-color);
                --button-secondary-color: var(--secondary-background-color);
                --button-secondary-text-color: var(--primary-text-color);
            }
            
            /* Feature flag styles */
            .feature-flag-row {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .feature-flag-row input[type="checkbox"] {
                margin-right: 8px;
                width: auto;
                margin-bottom: 0;
            }
            
            .feature-flag-row label {
                margin-bottom: 0;
                cursor: pointer;
            }
            
            /* Redux migration section styles */
            .card-config-panel {
                margin-top: 16px;
                padding: 16px;
                border-radius: 8px;
                background-color: var(--secondary-background-color, rgba(0,0,0,0.05));
            }
            
            .category {
                font-size: 18px;
                font-weight: 500;
                margin-bottom: 16px;
                color: var(--primary-text-color);
                border-bottom: 1px solid var(--divider-color);
                padding-bottom: 8px;
            }
            
            .sub-category {
                margin-bottom: 16px;
            }
            
            .sub-category-title {
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 8px;
                color: var(--secondary-text-color);
            }
            
            .sub-category-content {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                padding: 8px;
                background-color: var(--card-background-color);
                border-radius: 4px;
            }
            
            .sub-category-content button {
                padding: 6px 12px;
                border-radius: 4px;
                background-color: var(--secondary-background-color);
                color: var(--primary-text-color);
                border: 1px solid var(--divider-color);
                cursor: pointer;
                font-size: 12px;
                margin-right: 8px;
                margin-bottom: 8px;
                transition: all 0.2s ease-in-out;
            }
            
            .sub-category-content button:hover {
                background-color: var(--primary-color);
                color: var(--text-primary-color);
            }
            
            .phase-buttons {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }
            
            .phase-buttons button {
                width: 100%;
                text-align: left;
                position: relative;
                padding-left: 16px;
            }
            
            .phase-buttons button.active {
                background-color: var(--primary-color);
                color: var(--text-primary-color);
                font-weight: bold;
            }
            
            .phase-buttons button.active::before {
                content: '✓';
                position: absolute;
                left: 5px;
                top: 50%;
                transform: translateY(-50%);
            }
            /* End Redux migration section styles */
            
            .grid-2 {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
            }
            
            .section {
                padding: 16px;
                border-bottom: 1px solid var(--divider-color);
            }
            
            .section-header {
                font-size: 16px;
                font-weight: 500;
                margin-bottom: 16px;
                color: var(--primary-text-color);
            }

            .basic-settings {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 8px;
                align-items: center;
            }

            .select-container {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            select {
                padding: 8px;
                border-radius: 4px;
                border: 1px solid var(--divider-color);
                background: var(--card-background-color);
                color: var(--primary-text-color);
                margin-bottom: 8px;
            }
            
            label {
                color: var(--primary-text-color);
                font-size: 0.9rem;
            }

            .grid-settings {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-top: 8px;
            }

            .subsection {
                margin-top: 16px;
                padding: 12px;
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                background: var(--card-background-color);
            }
            
            .subsection-header {
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 8px;
                color: var(--secondary-text-color);
            }

            .input-container {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            input {
                padding: 8px;
                border-radius: 4px;
                border: 1px solid var(--divider-color);
                background: var(--card-background-color);
                color: var(--primary-text-color);
            }

            paper-dropdown-menu {
                width: 100%;
            }
            
            paper-listbox {
                padding: 0;
                background: var(--paper-card-background-color);
            }
            
            paper-item {
                cursor: pointer;
                min-height: 35px;
            }
            
            paper-item:hover::before,
            .iron-selected:before {
                position: var(--layout-fit_-_position);
                top: var(--layout-fit_-_top);
                right: var(--layout-fit_-_right);
                bottom: var(--layout-fit_-_bottom);
                left: var(--layout-fit_-_left);
                background: currentColor;
                content: '';
                opacity: var(--dark-divider-opacity);
                pointer-events: none;
            }

            .entity-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px;
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                margin: 4px 0;
            }
            
            .entity-name {
                flex-grow: 1;
                margin-right: 8px;
            }

            .delete-button {
                padding: 4px 8px;
                border-radius: 4px;
                background-color: var(--error-color);
                color: white;
                border: none;
                cursor: pointer;
            }

            .add-button {
                padding: 6px 12px;
                border-radius: 4px;
                background-color: var(--primary-color);
                color: white;
                border: none;
                cursor: pointer;
                margin-bottom: 12px;
            }

            .edit-button {
                padding: 4px 8px;
                border-radius: 4px;
                background-color: var(--info-color);
                color: white;
                border: none;
                cursor: pointer;
                margin-right: 4px;
            }

            select, input {
                width: 100%;
                padding: 8px;
                border-radius: 4px;
                border: 1px solid var(--divider-color);
                background: var(--card-background-color);
                color: var(--primary-text-color);
                margin-bottom: 8px;
            }
            
            .filter-controls {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr auto;
                gap: 8px;
                width: 100%;
            }
            
            .section-subheader {
                font-size: 16px;
                font-weight: 500;
                margin-top: 16px;
                margin-bottom: 8px;
            }

            .parameter-filter-config {
                background: var(--secondary-background-color, rgba(0,0,0,0.05));
                padding: 16px;
                border-radius: 4px;
                margin-top: 8px;
                margin-bottom: 16px;
            }
            
            .parameter-filter-form {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-top: 8px;
            }
            
            .parameter-filter-form .input-container:last-of-type {
                grid-column: 1 / -1;
                display: flex;
                justify-content: flex-end;
            }
            
            .filter-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px;
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                margin: 4px 0;
                background: var(--card-background-color);
            }
            
            .active-filters {
                margin-top: 16px;
            }

            .condition-row, .action-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px;
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                margin: 8px 0;
                background: var(--card-background-color);
            }

            .condition-summary, .action-summary {
                flex-grow: 1;
                margin-right: 8px;
            }

            .conditions-list, .actions-list {
                margin-top: 12px;
            }

            .dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .dialog-container {
                background-color: var(--dialog-background-color);
                color: var(--dialog-text-color);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }

            .dialog-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                border-bottom: 1px solid var(--dialog-border-color);
            }

            .dialog-header h2 {
                margin: 0;
                font-size: 18px;
                font-weight: 500;
            }

            .close-button {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: var(--dialog-text-color);
                padding: 0;
                margin: 0;
                line-height: 1;
            }

            .dialog-content {
                padding: 16px;
                overflow-y: auto;
                flex: 1;
            }

            .dialog-buttons {
                display: flex;
                justify-content: flex-end;
                padding: 16px;
                border-top: 1px solid var(--dialog-border-color);
                gap: 8px;
            }

            .form-field {
                margin-bottom: 16px;
            }

            .form-field label {
                display: block;
                margin-bottom: 4px;
                font-weight: 500;
            }

            .form-field input[type="text"],
            .form-field select {
                width: 100%;
                padding: 8px;
                border: 1px solid var(--dialog-border-color);
                border-radius: 4px;
                background-color: var(--primary-background-color);
                color: var(--dialog-text-color);
            }

            .form-field input[type="color"] {
                width: 100%;
                height: 40px;
                border: 1px solid var(--dialog-border-color);
                border-radius: 4px;
                padding: 0;
                cursor: pointer;
            }

            .checkbox-field {
                display: flex;
                align-items: center;
            }
            
            .checkbox-field label {
                margin-right: 8px;
                margin-bottom: 0;
            }
            
            .helper-text {
                font-size: 12px;
                color: var(--secondary-color);
                margin-top: 4px;
            }
            
            .save-button,
            .cancel-button {
                padding: 8px 16px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
                font-weight: 500;
            }
            
            .save-button {
                background-color: var(--button-primary-color);
                color: var(--button-primary-text-color);
            }
            
            .save-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .cancel-button {
                background-color: var(--button-secondary-color);
                color: var(--button-secondary-text-color);
            }
            
            .conditions-list,
            .actions-list {
                margin-top: 16px;
            }
            
            .condition-item,
            .action-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px;
                margin-bottom: 8px;
                background-color: var(--secondary-background-color);
                border-radius: 4px;
            }
            
            .condition-details,
            .action-details {
                flex: 1;
            }
            
            .condition-actions,
            .action-actions {
                display: flex;
                gap: 8px;
            }
            
            .edit-button,
            .delete-button {
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
            }
            
            .edit-button {
                color: var(--primary-color);
            }
            
            .delete-button {
                color: var(--error-color);
            }
            
            /* Fix for dropdown issues */
            ha-select::part(listbox) {
                z-index: 10000;
            }
            
            ha-select::part(combobox) {
                z-index: 10000;
            }
            
            ha-list-item {
                z-index: 10000;
            }

            .section {
                border: 1px solid var(--divider-color, #e0e0e0);
                border-radius: 8px;
                margin-bottom: 16px;
                overflow: hidden;
            }

            .section-header {
                background-color: var(--secondary-background-color, #f7f7f7);
                padding: 8px 16px;
                font-weight: 500;
                border-bottom: 1px solid var(--divider-color, #e0e0e0);
            }

            .subsection {
                border-top: 1px solid var(--divider-color, #e0e0e0);
                margin-top: 8px;
                padding-top: 8px;
            }

            .subsection-header {
                font-weight: 500;
                margin: 8px 16px;
            }

            .helper-text {
                font-size: 0.9em;
                margin: 4px 16px 8px;
                color: var(--secondary-text-color, #9e9e9e);
            }

            .grid-2 {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                gap: 8px;
                padding: 8px 16px;
            }

            label {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            /* Hierarchical debugging styles */
            .debug-category {
                margin-bottom: 8px;
                padding: 8px;
                border-radius: 4px;
                background-color: var(--secondary-background-color, #f7f7f7);
            }

            .main-category {
                font-weight: 500;
            }

            .subsystem-checkboxes {
                margin-left: 24px;
                margin-top: 4px;
                padding-top: 4px;
                padding-left: 8px;
                border-left: 1px dashed var(--divider-color, #e0e0e0);
            }

            .subsystem {
                font-size: 0.9em;
                margin-bottom: 4px;
            }

            /* Performance settings styles */
            .performance-group {
                padding: 0 16px 16px;
            }

            .performance-category {
                margin-bottom: 16px;
                padding: 8px;
                border-radius: 4px;
                background-color: var(--secondary-background-color, #f7f7f7);
            }

            .category-header {
                font-weight: 500;
                margin-bottom: 8px;
            }

            .slider-group {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
            }

            .slider-group input[type="range"] {
                flex: 1;
            }

            .slider-group span:first-child {
                width: 150px;
            }

            .slider-group span:last-child {
                width: 60px;
                text-align: right;
            }
        `],d([a({attribute:!1})],p.prototype,"hass",void 0),d([r()],p.prototype,"_config",void 0),d([r()],p.prototype,"_showConditionDialog",void 0),d([r()],p.prototype,"_editingConditionIndex",void 0),d([r()],p.prototype,"_conditionParameter",void 0),d([r()],p.prototype,"_conditionOperator",void 0),d([r()],p.prototype,"_conditionValue",void 0),d([r()],p.prototype,"_conditionAction",void 0),d([r()],p.prototype,"_conditionActionValue",void 0),d([r()],p.prototype,"_conditionTargetPartIds",void 0),d([r()],p.prototype,"_showActionDialog",void 0),d([r()],p.prototype,"_editingActionIndex",void 0),d([r()],p.prototype,"_actionLabel",void 0),d([r()],p.prototype,"_actionIcon",void 0),d([r()],p.prototype,"_actionParameter",void 0),d([r()],p.prototype,"_actionValue",void 0),d([r()],p.prototype,"_actionConfirmation",void 0),d([r()],p.prototype,"_actionConfirmationText",void 0),d([r()],p.prototype,"_conditionParameterType",void 0),d([r()],p.prototype,"_conditionPartId",void 0),d([r()],p.prototype,"_conditionParamName",void 0),p=d([n("inventree-card-editor")],p);export{p as I,u as L,l as _};
//# sourceMappingURL=editor-5ac0c775.js.map
