import { Expression, ItemComponent, ItemGroupComponent } from "survey-engine/data_types";
import { ComponentEditor } from "../survey-editor/component-editor";
import { ResponsiveBipolarLikertArrayProps, ResponsiveMatrixProps, ResponsiveSingleChoiceArrayProps, isExpressionDisplayProp } from "../types";
import { generateRandomKey } from "../utils/randomKeyGenerator";
import { generateExpressionDisplayComp, generateLocStrings } from "../utils/simple-generators";

export interface LikertGroupRow {
  key: string;
  content: Map<string, string>;
  descriptions?: ItemComponent[];
  hideTopBorder?: boolean;
  hideLabels?: boolean;
  optionDisabled?: Array<{
    optionKey: string;
    exp: Expression;
  }>;
  displayCondition?: Expression;
}

export const initLikertScaleGroup = (
  key: string,
  rows: Array<LikertGroupRow>,
  scaleOptions: Array<{
    key: string;
    className?: string;
    content: Map<string, string>;
  }>,
  stackOnSmallScreen?: boolean,
  displayCondition?: Expression,
): ItemGroupComponent => {
  const groupEdit = new ComponentEditor(undefined, {
    key: key,
    isGroup: true,
    role: 'likertGroup',
  });

  if (displayCondition) {
    groupEdit.setDisplayCondition(displayCondition);
  }

  rows.forEach((row, index) => {
    groupEdit.addItemComponent({
      key: generateRandomKey(4),
      role: 'text',
      style: [{
        key: 'className', value:
          'fw-bold' + (index !== 0 ? ' pt-1 mt-2' : '') + ((!row.hideTopBorder && index > 0) ? ' border-top border-1 border-grey-2' : '') + (row.descriptions ? ' mb-0' : ' mb-1')
      }, { key: 'variant', value: 'h6' }],
      content: generateLocStrings(row.content),
    });

    if (row.descriptions) {
      row.descriptions.forEach(desc => {
        groupEdit.addItemComponent(desc);
      });
    }

    const item = initLikertScaleItem(
      row.key,
      scaleOptions.map(option => {
        return {
          key: option.key,
          className: option.className,
          content: row.hideLabels ? undefined : option.content,
          disabled: row.optionDisabled?.find(cond => cond.optionKey === option.key)?.exp,
        }
      }),
      stackOnSmallScreen,
      row.displayCondition
    )
    groupEdit.addItemComponent(item);
  });



  return groupEdit.getComponent() as ItemGroupComponent;
}

export const initResponsiveSingleChoiceArray = (
  rgKey: string,
  props: ResponsiveSingleChoiceArrayProps,
  displayCondition?: Expression,
): ItemGroupComponent => {
  const groupEdit = new ComponentEditor(undefined, {
    key: rgKey,
    isGroup: true,
    role: 'responsiveSingleChoiceArray',
  });

  if (displayCondition) {
    groupEdit.setDisplayCondition(displayCondition);
  }

  const style: Array<{ key: string, value: string }> = [
    { key: 'defaultMode', value: props.defaultMode },
  ];
  if (props.responsiveModes) {
    if (props.responsiveModes.sm) {
      style.push({ key: 'smMode', value: props.responsiveModes.sm });
    }
    if (props.responsiveModes.md) {
      style.push({ key: 'mdMode', value: props.responsiveModes.md });
    }
    if (props.responsiveModes.lg) {
      style.push({ key: 'lgMode', value: props.responsiveModes.lg });
    }
    if (props.responsiveModes.xl) {
      style.push({ key: 'xlMode', value: props.responsiveModes.xl });
    }
    if (props.responsiveModes.xxl) {
      style.push({ key: 'xxlMode', value: props.responsiveModes.xxl });
    }
  }
  if (props.rgClassName) {
    style.push({ key: 'className', value: props.rgClassName });
  }
  if (props.verticalModeProps) {
    if (props.verticalModeProps.useReverseOptionOrder) {
      style.push({ key: 'verticalModeReverseOrder', value: 'true' });
    }
  }
  if (props.tableModeProps) {
    style.push({ key: 'tableModeClassName', value: 'table-borderless mb-0 ' + props.tableModeProps.className });
    if (props.tableModeProps.layout) {
      style.push({ key: 'tableModeLayout', value: props.tableModeProps.layout });
    }
    if (props.tableModeProps.firstColWidth) {
      style.push({ key: 'tableModeFirstColWidth', value: props.tableModeProps.firstColWidth });
    }
  }
  groupEdit.setStyles(style);

  const defaultBorderClass = 'border-bottom border-grey-2';


  let tableModeOptionHeaderClassName: string | undefined = undefined;
  if (!props.tableModeProps?.hideRowBorder) {
    tableModeOptionHeaderClassName = defaultBorderClass;
  }
  if (props.tableModeProps?.optionHeaderClassName) {
    tableModeOptionHeaderClassName += ' ' + props.tableModeProps.optionHeaderClassName;
  }

  const optionStyles: Array<{ key: string, value: string }> = [];
  if (tableModeOptionHeaderClassName) {
    optionStyles.push({ key: 'tableModeClassName', value: tableModeOptionHeaderClassName })
  }

  groupEdit.addItemComponent({
    key: 'header',
    role: 'options',
    style: optionStyles.length > 0 ? optionStyles : undefined,
    items: props.scaleOptions.map(option => {
      return {
        key: option.key,
        role: 'option',
        style: option.className ? [{ key: 'className', value: option.className }] : undefined,
        content: !Array.isArray(option.content) ? generateLocStrings(option.content) : undefined,
        items: Array.isArray(option.content) ? option.content.map((cont, index) => {
          if (isExpressionDisplayProp(cont)) {
            return generateExpressionDisplayComp(index.toFixed(), cont);
          }
          return {
            key: index.toFixed(),
            role: 'text',
            content: generateLocStrings(cont.content),
            style: cont.className ? [{ key: 'className', value: cont.className }] : undefined,
          }
        }) : [],
      }
    })
  })

  props.rows.forEach((row, index) => {
    let tableModeRowClassName: string | undefined = undefined;
    let horizontalModeRowClassName: string | undefined = undefined;
    let verticalModeRowClassName: string | undefined = undefined;

    const isLast = index === props.rows.length - 1;

    if (!props.tableModeProps?.hideRowBorder && !isLast) {
      tableModeRowClassName = defaultBorderClass;
    }
    if (row.tableModeProps?.className) {
      tableModeRowClassName += ' ' + row.tableModeProps?.className;
    }

    if (!props.horizontalModeProps?.hideRowBorder && !isLast) {
      horizontalModeRowClassName = defaultBorderClass;
    }
    if (row.horizontalModeProps?.className) {
      horizontalModeRowClassName += ' ' + row.horizontalModeProps?.className;
    }

    if (!props.verticalModeProps?.hideRowBorder && !isLast) {
      verticalModeRowClassName = defaultBorderClass;
    }
    if (row.verticalModeProps?.className) {
      verticalModeRowClassName += ' ' + row.verticalModeProps?.className;
    }

    const rowStyles: Array<{ key: string, value: string }> = [];
    if (tableModeRowClassName) {
      rowStyles.push({ key: 'tableModeClassName', value: tableModeRowClassName })
    }
    if (horizontalModeRowClassName) {
      rowStyles.push({ key: 'horizontalModeClassName', value: horizontalModeRowClassName })
    }
    if (verticalModeRowClassName) {
      rowStyles.push({ key: 'verticalModeClassName', value: verticalModeRowClassName })
    }

    if (row.horizontalModeProps?.labelPlacement) {
      rowStyles.push({ key: 'horizontalModeLabelPlacement', value: row.horizontalModeProps.labelPlacement })
    }

    groupEdit.addItemComponent({
      key: row.key,
      role: 'row',
      displayCondition: row.displayCondition,
      style: rowStyles.length > 0 ? rowStyles : undefined,
      content: !Array.isArray(row.content) ? generateLocStrings(row.content) : undefined,
      items: Array.isArray(row.content) ? row.content.map((cont, index) => {
        if (isExpressionDisplayProp(cont)) {
          return generateExpressionDisplayComp(index.toFixed(), cont);
        }
        return {
          key: index.toFixed(),
          role: 'text',
          content: generateLocStrings(cont.content),
          style: cont.className ? [{ key: 'className', value: cont.className }] : undefined,
        }
      }) : [],
    })
  })

  return groupEdit.getComponent() as ItemGroupComponent;
}

export const initResponsiveBipolarLikertArray = (
  rgKey: string,
  props: ResponsiveBipolarLikertArrayProps,
  displayCondition?: Expression,
): ItemGroupComponent => {
  const groupEdit = new ComponentEditor(undefined, {
    key: rgKey,
    isGroup: true,
    role: 'responsiveBipolarLikertScaleArray',
  });

  if (displayCondition) {
    groupEdit.setDisplayCondition(displayCondition);
  }

  const style: Array<{ key: string, value: string }> = [
    { key: 'defaultMode', value: props.defaultMode },
  ];
  if (props.responsiveModes) {
    if (props.responsiveModes.sm) {
      style.push({ key: 'smMode', value: props.responsiveModes.sm });
    }
    if (props.responsiveModes.md) {
      style.push({ key: 'mdMode', value: props.responsiveModes.md });
    }
    if (props.responsiveModes.lg) {
      style.push({ key: 'lgMode', value: props.responsiveModes.lg });
    }
    if (props.responsiveModes.xl) {
      style.push({ key: 'xlMode', value: props.responsiveModes.xl });
    }
    if (props.responsiveModes.xxl) {
      style.push({ key: 'xxlMode', value: props.responsiveModes.xxl });
    }
  }
  if (props.rgClassName) {
    style.push({ key: 'className', value: props.rgClassName });
  }
  if (props.withLabelRowModeProps) {
    if (props.withLabelRowModeProps.maxLabelWidth) {
      style.push({ key: 'labelRowMaxLabelWidth', value: props.withLabelRowModeProps.maxLabelWidth });
    }
  }
  style.push({ key: 'labelRowPosition', value: props.withLabelRowModeProps?.useBottomLabel ? 'bottom' : 'top' })

  if (props.tableModeProps) {
    style.push({ key: 'tableModeClassName', value: 'table-borderless mb-0 ' + props.tableModeProps.className });
    if (props.tableModeProps.layout) {
      style.push({ key: 'tableModeLayout', value: props.tableModeProps.layout });
    }
    if (props.tableModeProps.labelColWidth) {
      style.push({ key: 'tableModeLabelColWidth', value: props.tableModeProps.labelColWidth });
    }
  }
  groupEdit.setStyles(style);

  const defaultBorderClass = 'border-bottom border-grey-2';

  groupEdit.addItemComponent({
    key: 'options',
    role: 'options',
    items: props.scaleOptions.map(option => {
      return {
        key: option.key,
        role: 'option',
      }
    })
  })

  props.rows.forEach((row, index) => {
    let tableModeRowClassName: string | undefined = undefined;
    let withLabelRowModeClassName: string | undefined = undefined;
    let verticalModeRowClassName: string | undefined = undefined;

    const isLast = index === props.rows.length - 1;

    if (!props.tableModeProps?.hideRowBorder && !isLast) {
      tableModeRowClassName = defaultBorderClass;
    }
    if (row.tableModeProps?.className) {
      tableModeRowClassName += ' ' + row.tableModeProps?.className;
    }

    if (!props.withLabelRowModeProps?.hideRowBorder && !isLast) {
      withLabelRowModeClassName = defaultBorderClass;
    }
    if (row.withLabelRowModeProps?.className) {
      withLabelRowModeClassName += ' ' + row.withLabelRowModeProps?.className;
    }

    if (!props.verticalModeProps?.hideRowBorder && !isLast) {
      verticalModeRowClassName = defaultBorderClass;
    }
    if (row.verticalModeProps?.className) {
      verticalModeRowClassName += ' ' + row.verticalModeProps?.className;
    }

    const rowStyles: Array<{ key: string, value: string }> = [];
    if (tableModeRowClassName) {
      rowStyles.push({ key: 'tableModeClassName', value: tableModeRowClassName })
    }
    if (withLabelRowModeClassName) {
      rowStyles.push({ key: 'withLabelRowModeClassName', value: withLabelRowModeClassName })
    }
    if (verticalModeRowClassName) {
      rowStyles.push({ key: 'verticalModeClassName', value: verticalModeRowClassName })
    }

    const startLabel = {
      key: 'start',
      role: 'start',
      content: !Array.isArray(row.startLabel) ? generateLocStrings(row.startLabel) : undefined,
      items: Array.isArray(row.startLabel) ? row.startLabel.map((cont, index) => {
        if (isExpressionDisplayProp(cont)) {
          return generateExpressionDisplayComp(index.toFixed(), cont);
        }
        return {
          key: index.toFixed(),
          role: 'text',
          content: generateLocStrings(cont.content),
          style: cont.className ? [{ key: 'className', value: cont.className }] : undefined,
        }
      }) : [],
    }

    const endLabel = {
      key: 'end',
      role: 'end',
      content: !Array.isArray(row.endLabel) ? generateLocStrings(row.endLabel) : undefined,
      items: Array.isArray(row.endLabel) ? row.endLabel.map((cont, index) => {
        if (isExpressionDisplayProp(cont)) {
          return generateExpressionDisplayComp(index.toFixed(), cont);
        }
        return {
          key: index.toFixed(),
          role: 'text',
          content: generateLocStrings(cont.content),
          style: cont.className ? [{ key: 'className', value: cont.className }] : undefined,
        }
      }) : [],
    }

    groupEdit.addItemComponent({
      key: row.key,
      role: 'row',
      displayCondition: row.displayCondition,
      style: rowStyles.length > 0 ? rowStyles : undefined,
      items: [
        startLabel, endLabel
      ],
    })
  })

  return groupEdit.getComponent() as ItemGroupComponent;
}

function hasDuplicates(array: Array<any>) {
  return (new Set(array)).size !== array.length;
}

export const initResponsiveMatrixItem = (
  rgKey: string,
  props: ResponsiveMatrixProps,
  displayCondition?: Expression,
): ItemGroupComponent => {
  const groupEdit = new ComponentEditor(undefined, {
    key: rgKey,
    isGroup: true,
    role: 'responsiveMatrix',
  });

  if (hasDuplicates(props.rows.map(item => item.key))) {
    throw Error(`has duplicate row keys in ${rgKey}`);
  }
  if (hasDuplicates(props.columns.map(item => item.key))) {
    throw Error(`has duplicate column keys in ${rgKey}`);
  }

  if (displayCondition) {
    groupEdit.setDisplayCondition(displayCondition);
  }

  const style: Array<{ key: string, value: string }> = [
    { key: 'responseType', value: props.responseType },
  ];
  if (props.breakpoint) {
    style.push(
      { key: 'breakpoint', value: props.breakpoint }
    );
  }
  groupEdit.setStyles(style);


  // ADD COLUMNS
  groupEdit.addItemComponent({
    key: 'cols',
    role: 'columns',
    items: props.columns.map(option => {
      return {
        key: option.key,
        role: 'category',
        content: !Array.isArray(option.label) ? generateLocStrings(option.label) : undefined,
        items: Array.isArray(option.label) ? option.label.map((cont, index) => {
          if (isExpressionDisplayProp(cont)) {
            return generateExpressionDisplayComp(index.toFixed(), cont);
          }
          return {
            key: index.toFixed(),
            role: 'text',
            content: generateLocStrings(cont.content),
            style: cont.className ? [{ key: 'className', value: cont.className }] : undefined,
          }
        }) : [],
      }
    })
  });

  // ADD DROPDOWN OPTIONS (if applicable)
  if (props.responseType == 'dropdown' && props.dropdownConfig !== undefined) {
    groupEdit.addItemComponent({
      key: 'do',
      role: 'dropdownOptions',
      content: generateLocStrings(props.dropdownConfig.unselectedLabeL),
      items: props.dropdownConfig.options.map(option => {
        return {
          key: option.key,
          role: 'option',
          content: generateLocStrings(option.label),
        }
      })
    });
  }

  // ADD ROWS
  const rowGroupEdit = new ComponentEditor(undefined, {
    key: 'rows',
    isGroup: true,
    role: 'rows',
  });
  props.rows.forEach((row, index) => {
    const rowStyles: Array<{ key: string, value: string }> = [];
    if (row.className !== undefined) {
      rowStyles.push({ key: 'className', value: row.className });
    }

    rowGroupEdit.addItemComponent({
      key: row.key,
      role: row.role,
      displayCondition: row.displayCondition,
      style: rowStyles.length > 0 ? rowStyles : undefined,
      content: !Array.isArray(row.label) ? generateLocStrings(row.label) : undefined,
      items: Array.isArray(row.label) ? row.label.map((cont, index) => {
        if (isExpressionDisplayProp(cont)) {
          return generateExpressionDisplayComp(index.toFixed(), cont);
        }
        return {
          key: index.toFixed(),
          role: 'text',
          content: generateLocStrings(cont.content),
          style: cont.className ? [{ key: 'className', value: cont.className }] : undefined,
        }
      }) : [],
    })
  })
  groupEdit.addItemComponent(rowGroupEdit.getComponent());
  return groupEdit.getComponent() as ItemGroupComponent;
}


export const initLikertScaleItem = (
  key: string,
  options: Array<{
    key: string;
    className?: string;
    content?: Map<string, string>;
    disabled?: Expression;
  }>,
  stackOnSmallScreen?: boolean,
  displayCondition?: Expression,
): ItemGroupComponent => {
  // init group
  const groupEdit = new ComponentEditor(undefined, {
    key: key,
    isGroup: true,
    role: 'likert',
  });
  groupEdit.setDisplayCondition(displayCondition);
  if (stackOnSmallScreen) {
    groupEdit.setStyles([
      { key: 'responsive', value: 'stackOnSmallScreen' }
    ])
  }

  options.forEach((option) => {
    const optionComponent = new ComponentEditor(undefined, {
      key: option.key,
      role: 'option',
    });
    if (option.content) {
      optionComponent.setContent(generateLocStrings(option.content));
    }
    if (option.className) {
      optionComponent.setStyles([{
        key: 'className', value: option.className
      }]);
    }
    optionComponent.setDisabled(option.disabled);
    groupEdit.addItemComponent(optionComponent.getComponent());
  });

  return groupEdit.getComponent() as ItemGroupComponent;
}
