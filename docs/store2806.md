{
  components: {
    registeredComponents: {
      'card-inst--787561822': {
        isActive: true,
        registeredAt: 1751118000197,
        lastActive: 1751118000197
      },
      'card-inst-921830068': {
        isActive: true,
        registeredAt: 1751118000219,
        lastActive: 1751118000219
      },
      'card-inst--627091381': {
        isActive: true,
        registeredAt: 1751118000232,
        lastActive: 1751118000232
      },
      'card-inst-1047225096': {
        isActive: true,
        registeredAt: 1751118000244,
        lastActive: 1751118000244
      },
      'card-inst--938871979': {
        isActive: true,
        registeredAt: 1751118000262,
        lastActive: 1751118000262
      }
    }
  },
  conditionalLogic: {
    definedLogicsByInstance: {
      'card-inst--787561822': [
        {
          id: '0a8d3f91-8c93-4347-a00b-f688c54f6a2e',
          name: 'New Logic Block 1',
          logicPairs: [
            {
              id: 'f8a520e6-2f33-4fab-85e1-c5a8eaf49944',
              name: '',
              conditionRules: {
                id: '34318531-82a2-4a4d-b273-aaec148a2bb3',
                combinator: 'and',
                rules: [
                  {
                    id: '4d2b9c4c-3d3c-487a-99d8-b7b95a2ad90c',
                    field: 'ha_entity_state_sun.sun',
                    operator: '=',
                    valueSource: 'value',
                    value: 'above_horizon'
                  }
                ],
                not: false
              },
              effects: [
                {
                  id: '159da70d-dbd5-4996-85a6-0a5e4373e2d5',
                  type: 'set_style',
                  styleTarget: 'Row',
                  styleProperty: 'textColor',
                  styleValue: 'red',
                  targetPartPks: 'all_loaded'
                }
              ]
            }
          ]
        }
      ],
      'card-inst-921830068': [
        {
          id: '4e23c094-dd0d-40fa-a5b6-5e33d9450f27',
          name: 'New Logic Block 1',
          logicPairs: [
            {
              id: 'c047044d-77c0-4da7-a5ee-e7ceb8ab0d48',
              name: '',
              conditionRules: {
                id: '81616899-38fc-48bd-925b-d2f7dc671504',
                combinator: 'and',
                rules: [
                  {
                    id: 'a58a0a43-e0a9-410c-8048-5b92a1cead52',
                    field: 'ha_entity_state_sun.sun',
                    operator: '=',
                    valueSource: 'value',
                    value: 'below_horizon'
                  }
                ],
                not: false
              },
              effects: [
                {
                  id: '22d7a731-a080-43dc-b0a2-bf42e2af2ac9',
                  type: 'set_style',
                  styleTarget: 'Row',
                  styleProperty: 'textColor',
                  styleValue: 'red',
                  targetPartPks: 'all_loaded'
                }
              ]
            }
          ]
        }
      ],
      'card-inst--627091381': [
        {
          id: '27d0e83a-5fd3-4428-b564-13368e9e775e',
          name: 'New Logic Block 1',
          logicPairs: [
            {
              id: '8fd28dd2-c4be-4639-ad49-e2e17cf27e04',
              name: '',
              conditionRules: {
                id: '48a2a191-eb42-4b2d-842a-97b2c2fa864f',
                combinator: 'and',
                rules: [
                  {
                    id: '3c6f5517-4c11-4db4-bbd5-bea743a91117',
                    field: 'part_name',
                    operator: '=',
                    valueSource: 'value',
                    value: 'Coca-Cola Regular'
                  }
                ],
                not: false
              },
              effects: [
                {
                  id: '1120caa2-715f-46fa-acf2-def7b3ad57f5',
                  type: 'set_style',
                  styleTarget: 'Row',
                  styleProperty: 'highlight',
                  styleValue: 'red'
                }
              ]
            }
          ]
        }
      ],
      'card-inst-1047225096': [
        {
          id: 'ac054823-6daa-4acf-b6be-adca277eb3e1',
          name: 'New Logic Block 1',
          logicPairs: [
            {
              id: '81c39b60-31bf-47e0-88cd-269ad6c506f9',
              name: '',
              conditionRules: {
                id: '467e8bb3-945c-4132-9cc9-ea2737a1ba55',
                combinator: 'and',
                rules: [
                  {
                    id: '2a14a10f-e38b-477b-84ed-b348a694bab7',
                    field: 'part_in_stock',
                    operator: '=',
                    valueSource: 'value',
                    value: '0'
                  }
                ],
                not: false
              },
              effects: [
                {
                  id: '8772308e-f8c7-4111-a746-5a20f5694a10',
                  type: 'animate_style',
                  preset: 'Shake',
                  targetPartPks: 'all_loaded'
                }
              ]
            }
          ]
        }
      ],
      'card-inst--938871979': [
        {
          id: '0a8d3f91-8c93-4347-a00b-f688c54f6a2e',
          name: 'New Logic Block 1',
          logicPairs: [
            {
              id: 'f8a520e6-2f33-4fab-85e1-c5a8eaf49944',
              name: '',
              conditionRules: {
                id: '34318531-82a2-4a4d-b273-aaec148a2bb3',
                combinator: 'and',
                rules: [
                  {
                    id: '4d2b9c4c-3d3c-487a-99d8-b7b95a2ad90c',
                    field: 'ha_entity_state_sun.sun',
                    operator: '=',
                    valueSource: 'value',
                    value: 'above_horizon'
                  }
                ],
                not: false
              },
              effects: [
                {
                  id: '159da70d-dbd5-4996-85a6-0a5e4373e2d5',
                  type: 'set_style',
                  styleTarget: 'Row',
                  styleProperty: 'textColor',
                  styleValue: 'red',
                  targetPartPks: 'all_loaded'
                }
              ]
            }
          ]
        }
      ]
    }
  },
  config: {
    configsByInstance: {
      'card-inst--787561822': {
        config: {
          type: 'custom:inventree-card',
          name: 'InvenTree Card',
          layout: {
            viewType: 'custom',
            columns: [
              {
                id: 'part',
                content: 'name',
                header: '',
                width: '2fr'
              },
              {
                id: 'thumbnail',
                content: 'thumbnail',
                header: 'Thumbnail',
                width: '1fr'
              }
            ],
            rowHeight: 84,
            isDraggable: true,
            isResizable: true,
            compactType: 'vertical',
            allowOverlap: true
          },
          data_sources: {
            inventree_hass_sensors: [
              'sensor.inventree_coffee_tea_stock'
            ],
            ha_entities: [
              'sun.sun'
            ],
            inventree_pks: [],
            inventree_parameters: [],
            inventree_parameters_to_fetch: [],
            inventree_pk_thumbnail_overrides: []
          },
          layout_options: {
            columns: 3,
            grid_spacing: 8,
            item_height: 170
          },
          display: {
            show_header: true,
            show_image: true,
            show_name: true,
            show_stock: true,
            show_description: false,
            show_category: false,
            show_ipn: false,
            show_location: false,
            show_supplier: false,
            show_manufacturer: false,
            show_notes: false,
            show_buttons: true,
            show_stock_status_border: true,
            show_stock_status_colors: true,
            show_related_parts: false,
            show_parameters: true,
            show_part_details_component: true,
            show_stock_status_border_for_templates: false,
            show_buttons_for_variants: true,
            show_part_details_component_for_variants: true,
            show_image_for_variants: true,
            show_stock_for_variants: true,
            show_name_for_variants: true
          },
          direct_api: {
            enabled: true,
            url: 'http://192.168.0.21:8079/api',
            api_key: 'inv-076bf5c0744d53adeeb9f3bd75a38d16789817ed-20241031',
            method: 'websocket',
            websocket_url: '',
            idle_render_time: 60,
            performance: {
              api: {
                throttle: 0.2,
                cacheLifetime: 60,
                batchSize: 20,
                failedRequestRetryDelaySeconds: 30
              },
              websocket: {
                reconnectInterval: 5000,
                messageDebounce: 50
              }
            }
          },
          parameters: {
            enabled: true,
            show_section: true,
            collapsed_by_default: false,
            group_parameters: false,
            filter_fallback_mode: 'all'
          },
          conditional_logic: {
            definedLogics: [
              {
                id: '0a8d3f91-8c93-4347-a00b-f688c54f6a2e',
                name: 'New Logic Block 1',
                logicPairs: [
                  {
                    id: 'f8a520e6-2f33-4fab-85e1-c5a8eaf49944',
                    name: '',
                    conditionRules: {
                      id: '34318531-82a2-4a4d-b273-aaec148a2bb3',
                      combinator: 'and',
                      rules: [
                        {
                          id: '4d2b9c4c-3d3c-487a-99d8-b7b95a2ad90c',
                          field: 'ha_entity_state_sun.sun',
                          operator: '=',
                          valueSource: 'value',
                          value: 'above_horizon'
                        }
                      ],
                      not: false
                    },
                    effects: [
                      {
                        id: '159da70d-dbd5-4996-85a6-0a5e4373e2d5',
                        type: 'set_style',
                        styleTarget: 'Row',
                        styleProperty: 'textColor',
                        styleValue: 'red',
                        targetPartPks: 'all_loaded'
                      }
                    ]
                  }
                ]
              }
            ]
          },
          style: {
            background: 'var(--ha-card-background, var(--card-background-color, white))',
            spacing: 8,
            image_size: 50
          },
          interactions: {
            buttons: []
          },
          performance: {
            rendering: {
              debounceTime: 50,
              idleRenderInterval: 5000,
              maxRenderFrequency: 10
            },
            api: {
              throttle: 0.2,
              cacheLifetime: 60,
              batchSize: 20,
              failedRequestRetryDelaySeconds: 30
            },
            websocket: {
              reconnectInterval: 5000,
              messageDebounce: 50
            },
            parameters: {
              updateFrequency: 1000,
              conditionEvalFrequency: 1000
            }
          },
          debug: true,
          debug_verbose: true,
          show_debug: false,
          view_type: 'custom',
          actions: [
            {
              name: 'my-light-on-action',
              trigger: {
                type: 'ui_button',
                ui: {
                  labelTemplate: '',
                  placement: 'part_footer',
                  icon: 'mdi:lightbulb'
                }
              },
              operation: {
                type: 'call_ha_service',
                callHAService: {
                  service: 'light.turn_on',
                  dataTemplate: {}
                }
              },
              isEnabledExpressionId: '',
              id: '1749924859146'
            }
          ],
          grid_options: {
            columns: 'full',
            rows: 4
          },
          columns: [
            {
              id: 'part',
              content: 'name',
              header: '',
              width: '2fr'
            },
            {
              id: 'thumbnail',
              content: 'thumbnail',
              header: 'Thumbnail',
              width: '1fr'
            }
          ],
          logging: {}
        },
        configInitialized: true
      },
      'card-inst-921830068': {
        config: {
          type: 'custom:inventree-card',
          name: 'InvenTree Card',
          layout: {
            viewType: 'custom',
            columns: [
              {
                id: 'col_1749924785020',
                content: 'name',
                header: 'Milk',
                width: '1fr'
              },
              {
                id: 'col_1749924791855',
                content: 'thumbnail',
                header: '',
                width: '20fr'
              },
              {
                id: 'col_1750070955538',
                content: 'in_stock',
                header: '',
                width: '1fr'
              }
            ],
            rowHeight: 84,
            isDraggable: true,
            isResizable: true,
            compactType: 'vertical'
          },
          data_sources: {
            inventree_hass_sensors: [
              'sensor.inventree_milk_stock'
            ],
            ha_entities: [
              'sun.sun'
            ],
            inventree_pks: [],
            inventree_parameters: [],
            inventree_parameters_to_fetch: [],
            inventree_pk_thumbnail_overrides: []
          },
          layout_options: {
            columns: 3,
            grid_spacing: 8,
            item_height: 170
          },
          display: {
            show_header: true,
            show_image: true,
            show_name: true,
            show_stock: true,
            show_description: false,
            show_category: false,
            show_ipn: false,
            show_location: false,
            show_supplier: false,
            show_manufacturer: false,
            show_notes: false,
            show_buttons: true,
            show_stock_status_border: true,
            show_stock_status_colors: true,
            show_related_parts: false,
            show_parameters: true,
            show_part_details_component: true,
            show_stock_status_border_for_templates: false,
            show_buttons_for_variants: true,
            show_part_details_component_for_variants: true,
            show_image_for_variants: true,
            show_stock_for_variants: true,
            show_name_for_variants: true
          },
          direct_api: {
            enabled: true,
            url: 'http://192.168.0.21:8079/api',
            api_key: 'inv-076bf5c0744d53adeeb9f3bd75a38d16789817ed-20241031',
            method: 'websocket',
            websocket_url: '',
            idle_render_time: 60,
            performance: {
              api: {
                throttle: 0.2,
                cacheLifetime: 60,
                batchSize: 20,
                failedRequestRetryDelaySeconds: 30
              },
              websocket: {
                reconnectInterval: 5000,
                messageDebounce: 50
              }
            }
          },
          parameters: {
            enabled: true,
            show_section: true,
            collapsed_by_default: false,
            group_parameters: false,
            filter_fallback_mode: 'all'
          },
          conditional_logic: {
            definedLogics: [
              {
                id: '4e23c094-dd0d-40fa-a5b6-5e33d9450f27',
                name: 'New Logic Block 1',
                logicPairs: [
                  {
                    id: 'c047044d-77c0-4da7-a5ee-e7ceb8ab0d48',
                    name: '',
                    conditionRules: {
                      id: '81616899-38fc-48bd-925b-d2f7dc671504',
                      combinator: 'and',
                      rules: [
                        {
                          id: 'a58a0a43-e0a9-410c-8048-5b92a1cead52',
                          field: 'ha_entity_state_sun.sun',
                          operator: '=',
                          valueSource: 'value',
                          value: 'below_horizon'
                        }
                      ],
                      not: false
                    },
                    effects: [
                      {
                        id: '22d7a731-a080-43dc-b0a2-bf42e2af2ac9',
                        type: 'set_style',
                        styleTarget: 'Row',
                        styleProperty: 'textColor',
                        styleValue: 'red',
                        targetPartPks: 'all_loaded'
                      }
                    ]
                  }
                ]
              }
            ]
          },
          style: {
            background: 'var(--ha-card-background, var(--card-background-color, white))',
            spacing: 8,
            image_size: 50
          },
          interactions: {
            buttons: []
          },
          performance: {
            rendering: {
              debounceTime: 50,
              idleRenderInterval: 5000,
              maxRenderFrequency: 10
            },
            api: {
              throttle: 0.2,
              cacheLifetime: 60,
              batchSize: 20,
              failedRequestRetryDelaySeconds: 30
            },
            websocket: {
              reconnectInterval: 5000,
              messageDebounce: 50
            },
            parameters: {
              updateFrequency: 1000,
              conditionEvalFrequency: 1000
            }
          },
          debug: false,
          debug_verbose: false,
          show_debug: false,
          view_type: 'custom',
          actions: [
            {
              name: 'my-light-on-action',
              trigger: {
                type: 'ui_button',
                ui: {
                  labelTemplate: '',
                  placement: 'part_footer',
                  icon: 'mdi:lightbulb'
                }
              },
              operation: {
                type: 'call_ha_service',
                callHAService: {
                  service: 'light.turn_on',
                  dataTemplate: {}
                }
              },
              isEnabledExpressionId: '',
              id: '1749924859146'
            }
          ],
          grid_options: {
            rows: 4,
            columns: 12
          },
          columns: [
            {
              id: 'col_1749924785020',
              content: 'name',
              header: 'Milk',
              width: '1fr'
            },
            {
              id: 'col_1749924791855',
              content: 'thumbnail',
              header: '',
              width: '20fr'
            },
            {
              id: 'col_1750070955538',
              content: 'in_stock',
              header: '',
              width: '1fr'
            }
          ]
        },
        configInitialized: true
      },
      'card-inst--627091381': {
        config: {
          type: 'custom:inventree-card',
          name: 'InvenTree Card',
          layout: {
            viewType: 'custom',
            columns: [
              {
                id: 'col_1749924785020',
                content: 'name',
                header: 'Sodas',
                width: '1fr'
              },
              {
                id: 'col_1749924791855',
                content: 'thumbnail',
                header: '',
                width: '20fr'
              },
              {
                id: 'col_1750070955538',
                content: 'in_stock',
                header: '',
                width: '1fr'
              }
            ],
            rowHeight: 84
          },
          data_sources: {
            inventree_hass_sensors: [
              'sensor.inventree_sodas_stock'
            ],
            ha_entities: [
              'sun.sun'
            ],
            inventree_pks: [],
            inventree_parameters: [],
            inventree_parameters_to_fetch: [],
            inventree_pk_thumbnail_overrides: []
          },
          layout_options: {
            columns: 3,
            grid_spacing: 8,
            item_height: 170
          },
          display: {
            show_header: true,
            show_image: true,
            show_name: true,
            show_stock: true,
            show_description: false,
            show_category: false,
            show_ipn: false,
            show_location: false,
            show_supplier: false,
            show_manufacturer: false,
            show_notes: false,
            show_buttons: true,
            show_stock_status_border: true,
            show_stock_status_colors: true,
            show_related_parts: false,
            show_parameters: true,
            show_part_details_component: true,
            show_stock_status_border_for_templates: false,
            show_buttons_for_variants: true,
            show_part_details_component_for_variants: true,
            show_image_for_variants: true,
            show_stock_for_variants: true,
            show_name_for_variants: true
          },
          direct_api: {
            enabled: true,
            url: 'http://192.168.0.21:8079/api',
            api_key: 'inv-076bf5c0744d53adeeb9f3bd75a38d16789817ed-20241031',
            method: 'websocket',
            websocket_url: '',
            idle_render_time: 60,
            performance: {
              api: {
                throttle: 0.2,
                cacheLifetime: 60,
                batchSize: 20,
                failedRequestRetryDelaySeconds: 30
              },
              websocket: {
                reconnectInterval: 5000,
                messageDebounce: 50
              }
            }
          },
          parameters: {
            enabled: true,
            show_section: true,
            collapsed_by_default: false,
            group_parameters: false,
            filter_fallback_mode: 'all'
          },
          conditional_logic: {
            definedLogics: [
              {
                id: '27d0e83a-5fd3-4428-b564-13368e9e775e',
                name: 'New Logic Block 1',
                logicPairs: [
                  {
                    id: '8fd28dd2-c4be-4639-ad49-e2e17cf27e04',
                    name: '',
                    conditionRules: {
                      id: '48a2a191-eb42-4b2d-842a-97b2c2fa864f',
                      combinator: 'and',
                      rules: [
                        {
                          id: '3c6f5517-4c11-4db4-bbd5-bea743a91117',
                          field: 'part_name',
                          operator: '=',
                          valueSource: 'value',
                          value: 'Coca-Cola Regular'
                        }
                      ],
                      not: false
                    },
                    effects: [
                      {
                        id: '1120caa2-715f-46fa-acf2-def7b3ad57f5',
                        type: 'set_style',
                        styleTarget: 'Row',
                        styleProperty: 'highlight',
                        styleValue: 'red'
                      }
                    ]
                  }
                ]
              }
            ]
          },
          style: {
            background: 'var(--ha-card-background, var(--card-background-color, white))',
            spacing: 8,
            image_size: 50
          },
          interactions: {
            buttons: []
          },
          performance: {
            rendering: {
              debounceTime: 50,
              idleRenderInterval: 5000,
              maxRenderFrequency: 10
            },
            api: {
              throttle: 0.2,
              cacheLifetime: 60,
              batchSize: 20,
              failedRequestRetryDelaySeconds: 30
            },
            websocket: {
              reconnectInterval: 5000,
              messageDebounce: 50
            },
            parameters: {
              updateFrequency: 1000,
              conditionEvalFrequency: 1000
            }
          },
          debug: false,
          debug_verbose: false,
          show_debug: false,
          view_type: 'custom',
          actions: [
            {
              name: 'my-light-on-action',
              trigger: {
                type: 'ui_button',
                ui: {
                  labelTemplate: '',
                  placement: 'part_footer',
                  icon: 'mdi:lightbulb'
                }
              },
              operation: {
                type: 'call_ha_service',
                callHAService: {
                  service: 'light.turn_on',
                  dataTemplate: {}
                }
              },
              isEnabledExpressionId: '',
              id: '1749924859146'
            }
          ],
          grid_options: {
            columns: 'full',
            rows: 6
          },
          columns: [
            {
              id: 'col_1749924785020',
              content: 'name',
              header: 'Sodas',
              width: '1fr'
            },
            {
              id: 'col_1749924791855',
              content: 'thumbnail',
              header: '',
              width: '20fr'
            },
            {
              id: 'col_1750070955538',
              content: 'in_stock',
              header: '',
              width: '1fr'
            }
          ]
        },
        configInitialized: true
      },
      'card-inst-1047225096': {
        config: {
          type: 'custom:inventree-card',
          name: 'InvenTree Card',
          layout: {
            viewType: 'custom',
            columns: [
              {
                id: 'col_1749924785020',
                content: 'name',
                header: 'Water',
                width: '20fr'
              },
              {
                id: 'col_1749924791855',
                content: 'thumbnail',
                header: '',
                width: '20fr'
              },
              {
                id: 'col_1750070955538',
                content: 'in_stock',
                header: '',
                width: '1fr'
              },
              {
                id: 'col_1750117121774',
                content: 'buttons',
                header: '',
                width: '1fr',
                buttons: [
                  {
                    id: 'btn_1750117127172',
                    actionId: '1750117162273',
                    targetPartPks: [
                      180
                    ]
                  }
                ]
              }
            ],
            rowHeight: 84,
            enableFiltering: true
          },
          data_sources: {
            inventree_hass_sensors: [
              'sensor.inventree_water_stock'
            ],
            ha_entities: [],
            inventree_pks: [],
            inventree_parameters: [],
            inventree_parameters_to_fetch: [],
            inventree_pk_thumbnail_overrides: []
          },
          layout_options: {
            columns: 3,
            grid_spacing: 8,
            item_height: 170
          },
          display: {
            show_header: true,
            show_image: true,
            show_name: true,
            show_stock: true,
            show_description: false,
            show_category: false,
            show_ipn: false,
            show_location: false,
            show_supplier: false,
            show_manufacturer: false,
            show_notes: false,
            show_buttons: true,
            show_stock_status_border: true,
            show_stock_status_colors: true,
            show_related_parts: false,
            show_parameters: true,
            show_part_details_component: true,
            show_stock_status_border_for_templates: false,
            show_buttons_for_variants: true,
            show_part_details_component_for_variants: true,
            show_image_for_variants: true,
            show_stock_for_variants: true,
            show_name_for_variants: true
          },
          direct_api: {
            enabled: true,
            url: 'http://192.168.0.21:8079/api',
            api_key: 'inv-076bf5c0744d53adeeb9f3bd75a38d16789817ed-20241031',
            method: 'websocket',
            websocket_url: '',
            idle_render_time: 60,
            performance: {
              api: {
                throttle: 0.2,
                cacheLifetime: 60,
                batchSize: 20,
                failedRequestRetryDelaySeconds: 30
              },
              websocket: {
                reconnectInterval: 5000,
                messageDebounce: 50
              }
            }
          },
          parameters: {
            enabled: true,
            show_section: true,
            collapsed_by_default: false,
            group_parameters: false,
            filter_fallback_mode: 'all'
          },
          conditional_logic: {
            definedLogics: [
              {
                id: 'ac054823-6daa-4acf-b6be-adca277eb3e1',
                name: 'New Logic Block 1',
                logicPairs: [
                  {
                    id: '81c39b60-31bf-47e0-88cd-269ad6c506f9',
                    name: '',
                    conditionRules: {
                      id: '467e8bb3-945c-4132-9cc9-ea2737a1ba55',
                      combinator: 'and',
                      rules: [
                        {
                          id: '2a14a10f-e38b-477b-84ed-b348a694bab7',
                          field: 'part_in_stock',
                          operator: '=',
                          valueSource: 'value',
                          value: '0'
                        }
                      ],
                      not: false
                    },
                    effects: [
                      {
                        id: '8772308e-f8c7-4111-a746-5a20f5694a10',
                        type: 'animate_style',
                        preset: 'Shake',
                        targetPartPks: 'all_loaded'
                      }
                    ]
                  }
                ]
              }
            ]
          },
          style: {
            background: 'var(--ha-card-background, var(--card-background-color, white))',
            spacing: 8,
            image_size: 50
          },
          interactions: {
            buttons: []
          },
          performance: {
            rendering: {
              debounceTime: 50,
              idleRenderInterval: 5000,
              maxRenderFrequency: 10
            },
            api: {
              throttle: 0.2,
              cacheLifetime: 60,
              batchSize: 20,
              failedRequestRetryDelaySeconds: 30
            },
            websocket: {
              reconnectInterval: 5000,
              messageDebounce: 50
            },
            parameters: {
              updateFrequency: 1000,
              conditionEvalFrequency: 1000
            }
          },
          debug: false,
          debug_verbose: false,
          show_debug: false,
          view_type: 'custom',
          actions: [
            {
              name: 'turnonlight',
              trigger: {
                type: 'ui_button',
                ui: {
                  labelTemplate: '',
                  placement: 'part_footer',
                  icon: 'mdi:lightbulb'
                }
              },
              operation: {
                type: 'call_ha_service',
                callHAService: {
                  service: 'light.turn_on',
                  dataTemplate: {}
                }
              },
              isEnabledExpressionId: '',
              id: '1750117162273'
            }
          ],
          grid_options: {
            columns: 15,
            rows: 3
          },
          columns: [
            {
              id: 'col_1749924785020',
              content: 'name',
              header: 'Water',
              width: '20fr'
            },
            {
              id: 'col_1749924791855',
              content: 'thumbnail',
              header: '',
              width: '20fr'
            },
            {
              id: 'col_1750070955538',
              content: 'in_stock',
              header: '',
              width: '1fr'
            },
            {
              id: 'col_1750117121774',
              content: 'buttons',
              header: '',
              width: '1fr',
              buttons: [
                {
                  id: 'btn_1750117127172',
                  actionId: '1750117162273',
                  targetPartPks: [
                    180
                  ]
                }
              ]
            }
          ]
        },
        configInitialized: true
      },
      'card-inst--938871979': {
        config: {
          type: 'custom:inventree-card',
          name: 'InvenTree Card',
          layout: {
            viewType: 'custom',
            columns: [
              {
                id: 'part',
                content: 'name',
                header: '',
                width: '2fr'
              },
              {
                id: 'thumbnail',
                content: 'thumbnail',
                header: 'Thumbnail',
                width: '1fr'
              }
            ],
            rowHeight: 84,
            isDraggable: true,
            isResizable: true,
            compactType: 'vertical',
            allowOverlap: true
          },
          data_sources: {
            inventree_hass_sensors: [
              'sensor.inventree_coffee_tea_stock'
            ],
            ha_entities: [
              'sun.sun'
            ],
            inventree_pks: [],
            inventree_parameters: [],
            inventree_parameters_to_fetch: [],
            inventree_pk_thumbnail_overrides: []
          },
          layout_options: {
            columns: 3,
            grid_spacing: 8,
            item_height: 170
          },
          display: {
            show_header: true,
            show_image: true,
            show_name: true,
            show_stock: true,
            show_description: false,
            show_category: false,
            show_ipn: false,
            show_location: false,
            show_supplier: false,
            show_manufacturer: false,
            show_notes: false,
            show_buttons: true,
            show_stock_status_border: true,
            show_stock_status_colors: true,
            show_related_parts: false,
            show_parameters: true,
            show_part_details_component: true,
            show_stock_status_border_for_templates: false,
            show_buttons_for_variants: true,
            show_part_details_component_for_variants: true,
            show_image_for_variants: true,
            show_stock_for_variants: true,
            show_name_for_variants: true
          },
          direct_api: {
            enabled: true,
            url: 'http://192.168.0.21:8079/api',
            api_key: 'inv-076bf5c0744d53adeeb9f3bd75a38d16789817ed-20241031',
            method: 'websocket',
            websocket_url: '',
            idle_render_time: 60,
            performance: {
              api: {
                throttle: 0.2,
                cacheLifetime: 60,
                batchSize: 20,
                failedRequestRetryDelaySeconds: 30
              },
              websocket: {
                reconnectInterval: 5000,
                messageDebounce: 50
              }
            }
          },
          parameters: {
            enabled: true,
            show_section: true,
            collapsed_by_default: false,
            group_parameters: false,
            filter_fallback_mode: 'all'
          },
          conditional_logic: {
            definedLogics: [
              {
                id: '0a8d3f91-8c93-4347-a00b-f688c54f6a2e',
                name: 'New Logic Block 1',
                logicPairs: [
                  {
                    id: 'f8a520e6-2f33-4fab-85e1-c5a8eaf49944',
                    name: '',
                    conditionRules: {
                      id: '34318531-82a2-4a4d-b273-aaec148a2bb3',
                      combinator: 'and',
                      rules: [
                        {
                          id: '4d2b9c4c-3d3c-487a-99d8-b7b95a2ad90c',
                          field: 'ha_entity_state_sun.sun',
                          operator: '=',
                          valueSource: 'value',
                          value: 'above_horizon'
                        }
                      ],
                      not: false
                    },
                    effects: [
                      {
                        id: '159da70d-dbd5-4996-85a6-0a5e4373e2d5',
                        type: 'set_style',
                        styleTarget: 'Row',
                        styleProperty: 'textColor',
                        styleValue: 'red',
                        targetPartPks: 'all_loaded'
                      }
                    ]
                  }
                ]
              }
            ]
          },
          style: {
            background: 'var(--ha-card-background, var(--card-background-color, white))',
            spacing: 8,
            image_size: 50
          },
          interactions: {
            buttons: []
          },
          performance: {
            rendering: {
              debounceTime: 50,
              idleRenderInterval: 5000,
              maxRenderFrequency: 10
            },
            api: {
              throttle: 0.2,
              cacheLifetime: 60,
              batchSize: 20,
              failedRequestRetryDelaySeconds: 30
            },
            websocket: {
              reconnectInterval: 5000,
              messageDebounce: 50
            },
            parameters: {
              updateFrequency: 1000,
              conditionEvalFrequency: 1000
            }
          },
          debug: true,
          debug_verbose: true,
          show_debug: false,
          view_type: 'custom',
          actions: [
            {
              name: 'my-light-on-action',
              trigger: {
                type: 'ui_button',
                ui: {
                  labelTemplate: '',
                  placement: 'part_footer',
                  icon: 'mdi:lightbulb'
                }
              },
              operation: {
                type: 'call_ha_service',
                callHAService: {
                  service: 'light.turn_on',
                  dataTemplate: {}
                }
              },
              isEnabledExpressionId: '',
              id: '1749924859146'
            }
          ],
          grid_options: {
            columns: 'full',
            rows: 4
          },
          columns: [
            {
              id: 'part',
              content: 'name',
              header: '',
              width: '2fr'
            },
            {
              id: 'thumbnail',
              content: 'thumbnail',
              header: 'Thumbnail',
              width: '1fr'
            }
          ]
        },
        configInitialized: true
      }
    }
  },
  genericHaStates: {
    entities: {
      'sun.sun': {
        entity_id: 'sun.sun',
        state: 'above_horizon',
        attributes: {
          next_dawn: '2025-06-29T02:45:16.215697+00:00',
          next_dusk: '2025-06-28T20:46:44.197710+00:00',
          next_midnight: '2025-06-28T23:46:03+00:00',
          next_noon: '2025-06-29T11:45:56+00:00',
          next_rising: '2025-06-29T03:32:12.985930+00:00',
          next_setting: '2025-06-28T19:59:47.786598+00:00',
          elevation: 55.05,
          azimuth: 228.2,
          rising: false,
          friendly_name: 'Sun'
        },
        last_changed: '2025-06-28T13:36:41.234Z',
        last_updated: '2025-06-28T13:36:41.234Z'
      }
    }
  },
  metrics: {
    usage: {
      redux: {},
      legacy: {}
    },
    events: [],
    performance: {
      timerOperations: {
        redux: {
          setTimeout: 0,
          clearTimeout: 0,
          setInterval: 0,
          clearInterval: 0
        },
        legacy: {
          setTimeout: 0,
          clearTimeout: 0,
          setInterval: 0,
          clearInterval: 0
        }
      },
      renderTiming: {
        lastRender: 0,
        history: [],
        maxHistory: 20
      }
    }
  },
  parameters: {
    parameterValues: {},
    parameterLoadingStatus: {},
    parameterError: {},
    config: null,
    strictWebSocketMode: false,
    recentlyChanged: [],
    cache: {
      conditionResults: {},
      lastCleared: 1751118000263
    },
    parametersByPartId: {}
  },
  parts: {
    partsByInstance: {
      'card-inst--787561822': {
        partsById: {
          '194': {
            pk: 194,
            name: 'Caffé Gondoliere Tradition ground coffee',
            in_stock: 0,
            minimum_stock: 0,
            image: '/media/part_images/AHI_4354523130313930383630.jpg',
            thumbnail: '/local/inventree_thumbs/part_194.jpg',
            active: true,
            assembly: false,
            category: 162,
            category_name: 'Coffee & Tea',
            category_pathstring: 'Food/Beverages/Coffee & Tea',
            dashboard_url: '/dashboard-food/beverages/coffee & tea',
            inventree_url: '/part/194/',
            barcode_hash: '',
            barcode_data: '',
            component: true,
            description: 'Grocery item from receipt on 2025-01-10',
            full_name: 'Caffé Gondoliere Tradition ground coffee',
            IPN: '',
            keywords: '',
            purchaseable: true,
            revision: '',
            salable: false,
            units: '',
            total_in_stock: 0,
            unallocated_stock: 0,
            allocated_to_build_orders: 0,
            allocated_to_sales_orders: 0,
            building: 0,
            ordering: 0,
            variant_of: null,
            is_template: false,
            source: 'hass'
          },
          '305': {
            pk: 305,
            name: 'Munt',
            in_stock: 0,
            minimum_stock: 0,
            image: '/media/part_images/AHI_4354523130303737343738.jpg',
            thumbnail: '/local/inventree_thumbs/part_305.jpg',
            active: true,
            assembly: false,
            category: 162,
            category_name: 'Coffee & Tea',
            category_pathstring: 'Food/Beverages/Coffee & Tea',
            dashboard_url: '/dashboard-food/beverages/coffee & tea',
            inventree_url: '/part/305/',
            barcode_hash: '',
            barcode_data: '',
            component: true,
            description: 'Grocery item from receipt on 2023-09-04',
            full_name: 'Munt',
            IPN: '',
            keywords: '',
            purchaseable: true,
            revision: '',
            salable: false,
            units: '',
            total_in_stock: 0,
            unallocated_stock: 0,
            allocated_to_build_orders: 0,
            allocated_to_sales_orders: 0,
            building: 0,
            ordering: 0,
            variant_of: null,
            is_template: false,
            source: 'hass'
          }
        },
        locatingPartId: null,
        adjustingStockPartId: null,
        adjustmentError: null
      },
      'card-inst-921830068': {
        partsById: {
          '170': {
            pk: 170,
            name: 'Campina Houdbare halfvolle melk',
            in_stock: 0,
            minimum_stock: 0,
            image: '/media/part_images/AHI_4354523130313238313830.jpg',
            thumbnail: '/local/inventree_thumbs/part_170.jpg',
            active: true,
            assembly: false,
            category: 172,
            category_name: 'Milk',
            category_pathstring: 'Food/Beverages/Milk',
            dashboard_url: '/dashboard-food/beverages/milk',
            inventree_url: '/part/170/',
            barcode_hash: '',
            barcode_data: '',
            component: true,
            description: 'Grocery item from receipt on 2025-02-12',
            full_name: 'Campina Houdbare halfvolle melk',
            IPN: '',
            keywords: '',
            purchaseable: true,
            revision: '',
            salable: false,
            units: '',
            total_in_stock: 0,
            unallocated_stock: 0,
            allocated_to_build_orders: 0,
            allocated_to_sales_orders: 0,
            building: 0,
            ordering: 0,
            variant_of: null,
            is_template: false,
            source: 'hass'
          },
          '286': {
            pk: 286,
            name: 'Haverdrink ongezoet',
            in_stock: 0,
            minimum_stock: 0,
            image: '/media/part_images/AHI_43545239393536393239.jpg',
            thumbnail: '/local/inventree_thumbs/part_286.jpg',
            active: true,
            assembly: false,
            category: 172,
            category_name: 'Milk',
            category_pathstring: 'Food/Beverages/Milk',
            dashboard_url: '/dashboard-food/beverages/milk',
            inventree_url: '/part/286/',
            barcode_hash: '',
            barcode_data: '',
            component: true,
            description: 'Grocery item from receipt on 2023-11-06',
            full_name: 'Haverdrink ongezoet',
            IPN: '',
            keywords: '',
            purchaseable: true,
            revision: '',
            salable: false,
            units: '',
            total_in_stock: 0,
            unallocated_stock: 0,
            allocated_to_build_orders: 0,
            allocated_to_sales_orders: 0,
            building: 0,
            ordering: 0,
            variant_of: null,
            is_template: false,
            source: 'hass'
          }
        },
        locatingPartId: null,
        adjustingStockPartId: null,
        adjustmentError: null
      },
      'card-inst--627091381': {
        partsById: {
          '176': {
            pk: 176,
            name: 'Maaza Tropical fruit drink',
            in_stock: 0,
            minimum_stock: 0,
            image: '/media/part_images/AHI_4354523130313033343037.jpg',
            thumbnail: '/local/inventree_thumbs/part_176.jpg',
            active: true,
            assembly: false,
            category: 163,
            category_name: 'Sodas',
            category_pathstring: 'Food/Beverages/Sodas',
            dashboard_url: '/dashboard-food/beverages/sodas',
            inventree_url: '/part/176/',
            barcode_hash: '',
            barcode_data: '',
            component: true,
            description: 'Grocery item from receipt on 2025-02-12',
            full_name: 'Maaza Tropical fruit drink',
            IPN: '',
            keywords: '',
            purchaseable: true,
            revision: '',
            salable: false,
            units: '',
            total_in_stock: 0,
            unallocated_stock: 0,
            allocated_to_build_orders: 0,
            allocated_to_sales_orders: 0,
            building: 0,
            ordering: 0,
            variant_of: null,
            is_template: false,
            source: 'hass'
          },
          '229': {
            pk: 229,
            name: 'Coca-Cola Regular',
            in_stock: 0,
            minimum_stock: 0,
            image: '/media/part_images/AHI_4354523130313038313431.jpg',
            thumbnail: '/local/inventree_thumbs/part_229.jpg',
            active: true,
            assembly: false,
            category: 163,
            category_name: 'Sodas',
            category_pathstring: 'Food/Beverages/Sodas',
            dashboard_url: '/dashboard-food/beverages/sodas',
            inventree_url: '/part/229/',
            barcode_hash: '',
            barcode_data: '',
            component: true,
            description: 'Grocery item from receipt on 2024-07-31',
            full_name: 'Coca-Cola Regular',
            IPN: '',
            keywords: '',
            purchaseable: true,
            revision: '',
            salable: false,
            units: '',
            total_in_stock: 0,
            unallocated_stock: 0,
            allocated_to_build_orders: 0,
            allocated_to_sales_orders: 0,
            building: 0,
            ordering: 0,
            variant_of: null,
            is_template: false,
            source: 'hass'
          },
          '231': {
            pk: 231,
            name: 'Groenteshot Wortel',
            in_stock: 0,
            minimum_stock: 0,
            image: '/media/part_images/AHI_4354523130303337323933.jpg',
            thumbnail: '/local/inventree_thumbs/part_231.jpg',
            active: true,
            assembly: false,
            category: 163,
            category_name: 'Sodas',
            category_pathstring: 'Food/Beverages/Sodas',
            dashboard_url: '/dashboard-food/beverages/sodas',
            inventree_url: '/part/231/',
            barcode_hash: '',
            barcode_data: '',
            component: true,
            description: 'Grocery item from receipt on 2024-07-03',
            full_name: 'Groenteshot Wortel',
            IPN: '',
            keywords: '',
            purchaseable: true,
            revision: '',
            salable: false,
            units: '',
            total_in_stock: 0,
            unallocated_stock: 0,
            allocated_to_build_orders: 0,
            allocated_to_sales_orders: 0,
            building: 0,
            ordering: 0,
            variant_of: null,
            is_template: false,
            source: 'hass'
          },
          '240': {
            pk: 240,
            name: 'Ice tea peach',
            in_stock: 0,
            minimum_stock: 0,
            image: '/media/part_images/AHI_4354523130313935303631.jpg',
            thumbnail: '/local/inventree_thumbs/part_240.jpg',
            active: true,
            assembly: false,
            category: 163,
            category_name: 'Sodas',
            category_pathstring: 'Food/Beverages/Sodas',
            dashboard_url: '/dashboard-food/beverages/sodas',
            inventree_url: '/part/240/',
            barcode_hash: '',
            barcode_data: '',
            component: true,
            description: 'Grocery item from receipt on 2024-06-22',
            full_name: 'Ice tea peach',
            IPN: '',
            keywords: '',
            purchaseable: true,
            revision: '',
            salable: false,
            units: '',
            total_in_stock: 0,
            unallocated_stock: 0,
            allocated_to_build_orders: 0,
            allocated_to_sales_orders: 0,
            building: 0,
            ordering: 0,
            variant_of: null,
            is_template: false,
            source: 'hass'
          }
        },
        locatingPartId: null,
        adjustingStockPartId: null,
        adjustmentError: null
      },
      'card-inst-1047225096': {
        partsById: {
          '180': {
            pk: 180,
            name: 'Spa Reine mineraalwater 6-pack bel',
            in_stock: 0,
            minimum_stock: 0,
            image: '/media/part_images/AHI_4354523130303138353536.jpg',
            thumbnail: '/local/inventree_thumbs/part_180.jpg',
            active: true,
            assembly: false,
            category: 173,
            category_name: 'Water',
            category_pathstring: 'Food/Beverages/Water',
            dashboard_url: '/dashboard-food/beverages/water',
            inventree_url: '/part/180/',
            barcode_hash: '',
            barcode_data: '',
            component: true,
            description: 'Grocery item from receipt on 2025-02-12',
            full_name: 'Spa Reine mineraalwater 6-pack bel',
            IPN: '',
            keywords: '',
            purchaseable: true,
            revision: '',
            salable: false,
            units: '',
            total_in_stock: 0,
            unallocated_stock: 0,
            allocated_to_build_orders: 0,
            allocated_to_sales_orders: 0,
            building: 0,
            ordering: 0,
            variant_of: null,
            is_template: false,
            source: 'hass'
          },
          '204': {
            pk: 204,
            name: 'Mineraalwater koolzuurvrij 6-pack',
            in_stock: 0,
            minimum_stock: 0,
            image: '/media/part_images/AHI_4354523130303739333230.jpg',
            thumbnail: '/local/inventree_thumbs/part_204.jpg',
            active: true,
            assembly: false,
            category: 173,
            category_name: 'Water',
            category_pathstring: 'Food/Beverages/Water',
            dashboard_url: '/dashboard-food/beverages/water',
            inventree_url: '/part/204/',
            barcode_hash: '',
            barcode_data: '',
            component: true,
            description: 'Grocery item from receipt on 2024-11-27',
            full_name: 'Mineraalwater koolzuurvrij 6-pack',
            IPN: '',
            keywords: '',
            purchaseable: true,
            revision: '',
            salable: false,
            units: '',
            total_in_stock: 0,
            unallocated_stock: 0,
            allocated_to_build_orders: 0,
            allocated_to_sales_orders: 0,
            building: 0,
            ordering: 0,
            variant_of: null,
            is_template: false,
            source: 'hass'
          },
          '304': {
            pk: 304,
            name: 'Mineraalwater licht sprankelend',
            in_stock: 0,
            minimum_stock: 0,
            image: '/media/part_images/AHI_4354523130303739333231.jpg',
            thumbnail: '/local/inventree_thumbs/part_304.jpg',
            active: true,
            assembly: false,
            category: 173,
            category_name: 'Water',
            category_pathstring: 'Food/Beverages/Water',
            dashboard_url: '/dashboard-food/beverages/water',
            inventree_url: '/part/304/',
            barcode_hash: '',
            barcode_data: '',
            component: true,
            description: 'Grocery item from receipt on 2023-09-04',
            full_name: 'Mineraalwater licht sprankelend',
            IPN: '',
            keywords: '',
            purchaseable: true,
            revision: '',
            salable: false,
            units: '',
            total_in_stock: 0,
            unallocated_stock: 0,
            allocated_to_build_orders: 0,
            allocated_to_sales_orders: 0,
            building: 0,
            ordering: 0,
            variant_of: null,
            is_template: false,
            source: 'hass'
          }
        },
        locatingPartId: null,
        adjustingStockPartId: null,
        adjustmentError: null
      },
      'card-inst--938871979': {
        partsById: {
          '194': {
            pk: 194,
            name: 'Caffé Gondoliere Tradition ground coffee',
            in_stock: 0,
            minimum_stock: 0,
            image: '/media/part_images/AHI_4354523130313930383630.jpg',
            thumbnail: '/local/inventree_thumbs/part_194.jpg',
            active: true,
            assembly: false,
            category: 162,
            category_name: 'Coffee & Tea',
            category_pathstring: 'Food/Beverages/Coffee & Tea',
            dashboard_url: '/dashboard-food/beverages/coffee & tea',
            inventree_url: '/part/194/',
            barcode_hash: '',
            barcode_data: '',
            component: true,
            description: 'Grocery item from receipt on 2025-01-10',
            full_name: 'Caffé Gondoliere Tradition ground coffee',
            IPN: '',
            keywords: '',
            purchaseable: true,
            revision: '',
            salable: false,
            units: '',
            total_in_stock: 0,
            unallocated_stock: 0,
            allocated_to_build_orders: 0,
            allocated_to_sales_orders: 0,
            building: 0,
            ordering: 0,
            variant_of: null,
            is_template: false,
            source: 'hass'
          },
          '305': {
            pk: 305,
            name: 'Munt',
            in_stock: 0,
            minimum_stock: 0,
            image: '/media/part_images/AHI_4354523130303737343738.jpg',
            thumbnail: '/local/inventree_thumbs/part_305.jpg',
            active: true,
            assembly: false,
            category: 162,
            category_name: 'Coffee & Tea',
            category_pathstring: 'Food/Beverages/Coffee & Tea',
            dashboard_url: '/dashboard-food/beverages/coffee & tea',
            inventree_url: '/part/305/',
            barcode_hash: '',
            barcode_data: '',
            component: true,
            description: 'Grocery item from receipt on 2023-09-04',
            full_name: 'Munt',
            IPN: '',
            keywords: '',
            purchaseable: true,
            revision: '',
            salable: false,
            units: '',
            total_in_stock: 0,
            unallocated_stock: 0,
            allocated_to_build_orders: 0,
            allocated_to_sales_orders: 0,
            building: 0,
            ordering: 0,
            variant_of: null,
            is_template: false,
            source: 'hass'
          }
        },
        locatingPartId: null,
        adjustingStockPartId: null,
        adjustmentError: null
      }
    },
    loadingStatus: {},
    loading: false,
    error: null
  },
  ui: {
    activeView: 'detail',
    selectedPartId: null,
    debug: {
      showDebugPanel: false,
      activeTab: 'data'
    },
    loading: false
  },
  visualEffects: {
    effectsByCardInstance: {
      'card-inst--787561822': {
        '194': {
          textColor: 'red'
        },
        '305': {
          textColor: 'red'
        }
      },
      'card-inst-921830068': {},
      'card-inst--627091381': {
        '229': {
          highlight: 'red'
        }
      },
      'card-inst-1047225096': {
        '180': {
          animation: {
            animate: {
              x: [
                0,
                -5,
                5,
                -5,
                5,
                0
              ]
            },
            transition: {
              duration: 0.5,
              ease: 'easeInOut',
              repeat: null,
              repeatDelay: 1
            }
          }
        },
        '204': {
          animation: {
            animate: {
              x: [
                0,
                -5,
                5,
                -5,
                5,
                0
              ]
            },
            transition: {
              duration: 0.5,
              ease: 'easeInOut',
              repeat: null,
              repeatDelay: 1
            }
          }
        },
        '304': {
          animation: {
            animate: {
              x: [
                0,
                -5,
                5,
                -5,
                5,
                0
              ]
            },
            transition: {
              duration: 0.5,
              ease: 'easeInOut',
              repeat: null,
              repeatDelay: 1
            }
          }
        }
      },
      'card-inst--938871979': {
        '194': {
          textColor: 'red'
        },
        '305': {
          textColor: 'red'
        }
      }
    },
    elementVisibilityByCard: {},
    layoutOverridesByCardInstance: {},
    layoutEffectsByCell: {}
  },
  websocket: {
    status: 'idle',
    lastMessage: null,
    lastError: null,
    messageCount: 0
  },
  actions: {
    byInstance: {
      'card-inst--787561822': {
        actionDefinitions: {
          '1749924859146': {
            name: 'my-light-on-action',
            trigger: {
              type: 'ui_button',
              ui: {
                labelTemplate: '',
                placement: 'part_footer',
                icon: 'mdi:lightbulb'
              }
            },
            operation: {
              type: 'call_ha_service',
              callHAService: {
                service: 'light.turn_on',
                dataTemplate: {}
              }
            },
            isEnabledExpressionId: '',
            id: '1749924859146'
          }
        },
        actionRuntimeStates: {
          '1749924859146': {
            status: 'idle'
          }
        }
      },
      'card-inst-921830068': {
        actionDefinitions: {
          '1749924859146': {
            name: 'my-light-on-action',
            trigger: {
              type: 'ui_button',
              ui: {
                labelTemplate: '',
                placement: 'part_footer',
                icon: 'mdi:lightbulb'
              }
            },
            operation: {
              type: 'call_ha_service',
              callHAService: {
                service: 'light.turn_on',
                dataTemplate: {}
              }
            },
            isEnabledExpressionId: '',
            id: '1749924859146'
          }
        },
        actionRuntimeStates: {
          '1749924859146': {
            status: 'idle'
          }
        }
      },
      'card-inst--627091381': {
        actionDefinitions: {
          '1749924859146': {
            name: 'my-light-on-action',
            trigger: {
              type: 'ui_button',
              ui: {
                labelTemplate: '',
                placement: 'part_footer',
                icon: 'mdi:lightbulb'
              }
            },
            operation: {
              type: 'call_ha_service',
              callHAService: {
                service: 'light.turn_on',
                dataTemplate: {}
              }
            },
            isEnabledExpressionId: '',
            id: '1749924859146'
          }
        },
        actionRuntimeStates: {
          '1749924859146': {
            status: 'idle'
          }
        }
      },
      'card-inst-1047225096': {
        actionDefinitions: {
          '1750117162273': {
            name: 'turnonlight',
            trigger: {
              type: 'ui_button',
              ui: {
                labelTemplate: '',
                placement: 'part_footer',
                icon: 'mdi:lightbulb'
              }
            },
            operation: {
              type: 'call_ha_service',
              callHAService: {
                service: 'light.turn_on',
                dataTemplate: {}
              }
            },
            isEnabledExpressionId: '',
            id: '1750117162273'
          }
        },
        actionRuntimeStates: {
          '1750117162273': {
            status: 'idle'
          }
        }
      },
      'card-inst--938871979': {
        actionDefinitions: {
          '1749924859146': {
            name: 'my-light-on-action',
            trigger: {
              type: 'ui_button',
              ui: {
                labelTemplate: '',
                placement: 'part_footer',
                icon: 'mdi:lightbulb'
              }
            },
            operation: {
              type: 'call_ha_service',
              callHAService: {
                service: 'light.turn_on',
                dataTemplate: {}
              }
            },
            isEnabledExpressionId: '',
            id: '1749924859146'
          }
        },
        actionRuntimeStates: {
          '1749924859146': {
            status: 'idle'
          }
        }
      }
    }
  },
  logging: {
    logsByInstance: {}
  },
  layout: {
    layoutsByInstance: {
      'card-inst--787561822': {
        lg: [
          {
            i: '194-part',
            x: 0,
            y: 0,
            w: 2,
            h: 1
          },
          {
            i: '194-thumbnail',
            x: 2,
            y: 0,
            w: 1,
            h: 1
          },
          {
            i: '305-part',
            x: 0,
            y: 1,
            w: 2,
            h: 1
          },
          {
            i: '305-thumbnail',
            x: 2,
            y: 1,
            w: 1,
            h: 1
          }
        ],
        xs: [
          {
            w: 2,
            h: 1,
            x: 0,
            y: 1,
            i: '194-part',
            moved: false,
            'static': false
          },
          {
            w: 1,
            h: 1,
            x: 2,
            y: 0,
            i: '194-thumbnail',
            moved: false,
            'static': false
          },
          {
            w: 2,
            h: 1,
            x: 0,
            y: 0,
            i: '305-part',
            moved: false,
            'static': false
          },
          {
            w: 1,
            h: 1,
            x: 2,
            y: 1,
            i: '305-thumbnail',
            moved: false,
            'static': false
          }
        ]
      }
    },
    columnsByInstance: {
      'card-inst--787561822': [
        {
          id: 'part',
          content: 'name',
          header: '',
          width: '2fr'
        },
        {
          id: 'thumbnail',
          content: 'thumbnail',
          header: 'Thumbnail',
          width: '1fr'
        }
      ],
      'card-inst-921830068': [
        {
          id: 'col_1749924785020',
          content: 'name',
          header: 'Milk',
          width: '1fr'
        },
        {
          id: 'col_1749924791855',
          content: 'thumbnail',
          header: '',
          width: '20fr'
        },
        {
          id: 'col_1750070955538',
          content: 'in_stock',
          header: '',
          width: '1fr'
        }
      ],
      'card-inst--627091381': [
        {
          id: 'col_1749924785020',
          content: 'name',
          header: 'Sodas',
          width: '1fr'
        },
        {
          id: 'col_1749924791855',
          content: 'thumbnail',
          header: '',
          width: '20fr'
        },
        {
          id: 'col_1750070955538',
          content: 'in_stock',
          header: '',
          width: '1fr'
        }
      ],
      'card-inst-1047225096': [
        {
          id: 'col_1749924785020',
          content: 'name',
          header: 'Water',
          width: '20fr'
        },
        {
          id: 'col_1749924791855',
          content: 'thumbnail',
          header: '',
          width: '20fr'
        },
        {
          id: 'col_1750070955538',
          content: 'in_stock',
          header: '',
          width: '1fr'
        },
        {
          id: 'col_1750117121774',
          content: 'buttons',
          header: '',
          width: '1fr',
          buttons: [
            {
              id: 'btn_1750117127172',
              actionId: '1750117162273',
              targetPartPks: [
                180
              ]
            }
          ]
        }
      ],
      'card-inst--938871979': [
        {
          id: 'part',
          content: 'name',
          header: '',
          width: '2fr'
        },
        {
          id: 'thumbnail',
          content: 'thumbnail',
          header: 'Thumbnail',
          width: '1fr'
        }
      ]
    }
  },
  inventreeApi: {
    queries: {},
    mutations: {},
    provided: {
      tags: {},
      keys: {}
    },
    subscriptions: {},
    config: {
      online: true,
      focused: true,
      middlewareRegistered: true,
      refetchOnFocus: false,
      refetchOnReconnect: false,
      refetchOnMountOrArgChange: false,
      keepUnusedDataFor: 60,
      reducerPath: 'inventreeApi',
      invalidationBehavior: 'delayed'
    }
  },
  loggingApi: {
    queries: {},
    mutations: {},
    provided: {
      tags: {},
      keys: {}
    },
    subscriptions: {},
    config: {
      online: true,
      focused: true,
      middlewareRegistered: true,
      refetchOnFocus: false,
      refetchOnReconnect: false,
      refetchOnMountOrArgChange: false,
      keepUnusedDataFor: 60,
      reducerPath: 'loggingApi',
      invalidationBehavior: 'delayed'
    }
  },
  _persist: {
    version: -1,
    rehydrated: true
  }
}