# Conditional Logic Engine (CLE) - Capabilities & Pipelines

This document serves as a blueprint for the capabilities of the Conditional Logic Engine. It details the "mini-pipelines" for each available effect, from configuration in the editor to the final visual result.

---

## Core Concepts

- **The Engine is a Two-Pass System:** The engine first evaluates all *generic* conditions (e.g., based on a HASS sensor) and then evaluates *part-specific* conditions (e.g., based on a part's stock level). This ensures effects are applied logically and don't overwrite each other.
- **Effects are Combined:** All true conditions have their effects combined. If one condition makes a row's background yellow and another makes its text bold, the final result will be a yellow, bold row.
- **Specificity Wins:** The engine applies effects to the parts specified in the `Target Part PKs` field. If this field is empty, the effect applies to the part that met the condition.

---

## 1. Effect: Set Style

This is the most powerful and versatile effect. It can modify the styling of an entire row or a single, specific cell within that row.

### Pipeline & Parameters

| Editor Field    | Parameter          | Example                               | Description                                                                                             |
| :-------------- | :----------------- | :------------------------------------ | :------------------------------------------------------------------------------------------------------ |
| **Effect Type** | `type`             | `set_style`                           | The base type for all styling effects.                                                                  |
| **Style Target**  | `styleTarget`      | `Row` OR `name` (a Column ID)         | Determines if the style applies to the whole row or just one cell.                                      |
| **Style Property**| `styleProperty`    | `backgroundColor` OR `highlight`      | The CSS property to change (for cells) or the abstract effect name (for rows).                          |
| **Style Value**   | `styleValue`       | `#ff0000`                             | The value for the style property.                                                                       |
| **Target Part PKs**| `targetPartPks`    | `145` OR `all_loaded`                 | Optional. Specifies which part(s) get this effect, overriding the part that met the condition. |

<br>

### Use Case 1: Highlight a Specific Part's Row

*Goal: Make the entire row for Part 145 have a red background.*

1.  **Condition:** `(Any valid condition, e.g., A HASS sensor is 'on')`
2.  **Configuration:**
    - Effect Type: `Set Style`
    - Style Target: `Row`
    - Style Property: `highlight` (or `backgroundColor`)
    - Style Value: `red`
    - Target Part PKs: `145`
3.  **Result:** The entire `<tr>` element for Part 145 will get a red background. This works as expected.

### Use Case 2: Change Text Color in a Specific Column

*Goal: Make the text of the "Part Name" column red for any part with low stock.*

1.  **Condition:** `Part Stock < 10`
2.  **Configuration:**
    - Effect Type: `Set Style`
    - Style Target: `name` (This must be the ID of your "Part Name" column from the Layout Builder)
    - Style Property: `color`
    - Style Value: `red`
    - Target Part PKs: `(empty)`
3.  **Result:** The engine will apply `{ color: 'red' }` to the `cellStyles` for the `name` column, for any part that meets the stock condition. The `TableLayout` renderer then applies this inline style to the specific `<td>` for that cell. **This is fully supported.**

### Use Case 3: Mismatched Properties (Your excellent question)

*Goal: Apply `color: red` to the `thumbnail` column.*

1.  **Configuration:**
    - Effect Type: `Set Style`
    - Style Target: `thumbnail` (the column ID)
    - Style Property: `color`
    - Style Value: `red`
2.  **Result:** The engine will dutifully apply `{ color: 'red' }` to the `<td>` of the thumbnail column. Since that cell contains an `<img>` tag and no text, the style will have **no visible effect**. This is not a bug, but the logical outcome of applying CSS. The engine does not validate if a style makes sense for a given column type; it simply applies it.

---

## 2. Effect: Animate Style

This effect applies a `framer-motion` animation to an entire part row.

### Pipeline & Parameters

| Editor Field    | Parameter          | Example                               | Description                                                                                             |
| :-------------- | :----------------- | :------------------------------------ | :------------------------------------------------------------------------------------------------------ |
| **Effect Type** | `type`             | `animate_style`                       | The base type for all animation effects.                                                              |
| **Preset**      | `preset`           | `shake` OR `pulse` OR `none`          | Selects a pre-configured animation. `none` will actively remove any existing animation.                 |
| **Target Part PKs**| `targetPartPks`    | `145` OR `all_loaded`                 | Optional. Specifies which part(s) get this effect.                                                      |

<br>

### Use Case: Shake a Part with Low Stock

1.  **Condition:** `Part Stock < 5`
2.  **Configuration:**
    - Effect Type: `Animate Style`
    - Preset: `shake`
    - Target Part PKs: `(empty)`
3.  **Result:** Any part whose stock drops below 5 will have the "shake" animation applied to its row. When the condition is no longer met, the animation property is removed, and the element returns to normal.

---

## 3. Effect: Set Visibility

This effect can completely show or hide a part from the layout.

### Pipeline & Parameters

| Editor Field    | Parameter          | Example                               | Description                                                                                             |
| :-------------- | :----------------- | :------------------------------------ | :------------------------------------------------------------------------------------------------------ |
| **Effect Type** | `type`             | `set_visibility`                      | The base type for visibility effects.                                                                   |
| **Visible**     | `isVisible`        | `false`                               | Determines if the part should be visible.                                                               |
| **Target Part PKs**| `targetPartPks`    | `23, 37`                              | Optional. Specifies which part(s) to hide.                                                              |

<br>

### Use Case: Hide all Virtual Parts

1.  **Condition:** `Part Is Virtual is true`
2.  **Configuration:**
    - Effect Type: `Set Visibility`
    - Visible: `false`
    - Target Part PKs: `(empty)`
3.  **Result:** Any part that is a "virtual" part will be removed from the final rendered list of parts.

---

## 4. Effect: Set Thumbnail Style

This provides special styling options unique to the part thumbnail.

### Pipeline & Parameters

| Editor Field    | Parameter          | Example                               | Description                                                                                             |
| :-------------- | :----------------- | :------------------------------------ | :------------------------------------------------------------------------------------------------------ |
| **Effect Type** | `type`             | `set_thumbnail_style`                 | The base type for thumbnail effects.                                                                    |
| **Filter**      | `thumbnailFilter`  | `grayscale(100%)`                     | A standard CSS `filter` string to apply to the image.                                                   |
| **Opacity**     | `thumbnailOpacity` | `0.5`                                 | A number from 0 to 1 to set the image opacity.                                                          |
| **Target Part PKs**| `targetPartPks`    | `(empty)`                             | Optional. Specifies which part(s) get this effect.                                                      |

<br>

### Use Case: Grayscale a Deprecated Part

1.  **Condition:** `Part Name contains "DEPRECATED"`
2.  **Configuration:**
    - Effect Type: `Set Thumbnail Style`
    - Filter: `grayscale(100%)`
    - Opacity: `0.6`
3.  **Result:** The thumbnail for any part with "DEPRECATED" in its name will be turned black and white and become semi-transparent.

---

## Advanced Example: Part-Specific Conditions

The engine's "two-pass" system is smart enough to handle rules that are specific to one part.

### Use Case: Change Text Color on a Specific Part by Name

*Goal: If the part with PK 145 has the name "AEG MCC4061E-M", make its text red.*

This is a **part-specific rule**. The engine will only evaluate this condition when it is processing Part 145.

1.  **Condition:** `part_145_name = "AEG MCC4061E-M"`
2.  **Configuration:**
    - Effect Type: `Set Style`
    - Style Target: `Row`
    - Style Property: `textColor`
    - Style Value: `red`
    - Target Part PKs: `(empty)`
3.  **Result:** The text color for the row of Part 145 will be set to red.

```yaml
# Corresponding YAML Configuration
definedLogics:
  - id: c9e14ecc-07e1-4770-ae0c-78d1544d31ea
    name: New Logic Block 1
    logicPairs:
      - id: 8fc11093-291f-4a6c-a582-e9f9c62f51e3
        name: ""
        conditionRules:
          id: ae1f659b-ced0-4653-b687-de5f45c06128
          combinator: and
          rules:
            - id: c9e4f73f-9566-4ff8-9d4a-33a76eb36905
              field: part_145_name
              operator: "="
              valueSource: value
              value: AEG MCC4061E-M
          not: false
        effects:
          - id: da56c41b-b015-4977-b71f-82e6e1970fc2
            type: set_style
            styleTarget: Row
            styleProperty: textColor
            styleValue: red
```
