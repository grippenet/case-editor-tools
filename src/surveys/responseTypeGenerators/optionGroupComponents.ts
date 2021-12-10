import { Expression, ItemComponent, ItemGroupComponent, LocalizedObject } from "survey-engine/lib/data_types";
import { ComponentEditor } from "../survey-editor/component-editor";
import { OptionDef, StyledTextComponentProp } from "../types";
import { generateLocStrings } from "../utils/simple-generators";


export const optionDefToItemComponent = (optionDef: OptionDef): ItemComponent => {
  const isGroup = optionDef.items && optionDef.items.length > 0;
  const optEditor = new ComponentEditor(undefined, {
    key: optionDef.key,
    role: optionDef.role,
    isGroup: isGroup
  });
  if (isGroup) {
    optEditor.setOrder({
      name: 'sequential'
    });
  }

  if (optionDef.content) {
    optEditor.setContent(generateLocStrings(optionDef.content));
  }
  if (optionDef.description) {
    optEditor.setDescription(generateLocStrings(optionDef.description));
  }
  switch (optionDef.role) {
    case 'date':
      optEditor.setDType('date');
      break;
    case 'numberInput':
      optEditor.setDType('number');
      break;
  }

  if (optionDef.displayCondition) {
    optEditor.setDisplayCondition(optionDef.displayCondition);
  }
  if (optionDef.disabled) {
    optEditor.setDisabled(optionDef.disabled);
  }
  if (optionDef.style) {
    optEditor.setStyles(optionDef.style);
  }
  if (optionDef.optionProps) {
    if (typeof (optionDef.optionProps.min) === 'number') {
      optionDef.optionProps.min = { dtype: 'num', num: optionDef.optionProps.min }
    }
    if (typeof (optionDef.optionProps.max) === 'number') {
      optionDef.optionProps.max = { dtype: 'num', num: optionDef.optionProps.max }
    }
    if (typeof (optionDef.optionProps.stepSize) === 'number') {
      optionDef.optionProps.stepSize = { dtype: 'num', num: optionDef.optionProps.stepSize }
    }
    optEditor.setProperties(optionDef.optionProps);
  }

  if (optionDef.items) {
    if (optionDef.role === 'text') {
      optionDef.items.forEach((item, index) => {
        const textItem = item as StyledTextComponentProp;
        optEditor.addItemComponent({
          key: index.toFixed(),
          role: 'text',
          content: generateLocStrings(textItem.content),
          style: textItem.className ? [{ key: 'className', value: textItem.className }] : undefined
        });
      })
    } else {
      optionDef.items.forEach((item) => {
        const clozeItem = item as OptionDef;
        const comp = optionDefToItemComponent(clozeItem);
        optEditor.addItemComponent(comp);
      })
    }
  }

  return optEditor.getComponent();
}


const initResponseGroup = (
  type: 'singleChoiceGroup' | 'multipleChoiceGroup' | 'dropDownGroup' | 'sliderCategorical',
  key: string,
  optionItems: OptionDef[],
  order?: Expression,
  groupDisabled?: Expression,
  groupContent?: LocalizedObject[],
  groupDescription?: LocalizedObject[],
): ItemGroupComponent => {
  // init group
  const groupEdit = new ComponentEditor(undefined, {
    key: key,
    isGroup: true,
    role: type,
  });

  groupEdit.setOrder(
    order ? order : {
      name: 'sequential'
    }
  );
  if (groupDisabled) {
    groupEdit.setDisabled(groupDisabled);
  }
  if (groupContent) {
    groupEdit.setContent(groupContent);
  }
  if (groupDescription) {
    groupEdit.setDescription(groupDescription);
  }

  // add option items
  optionItems.forEach(optionDef => {
    groupEdit.addItemComponent(optionDefToItemComponent(optionDef));
  });

  return groupEdit.getComponent() as ItemGroupComponent;
}


export const initSingleChoiceGroup = (
  key: string,
  optionItems: OptionDef[],
  order?: Expression
): ItemGroupComponent => {
  // init group
  return initResponseGroup('singleChoiceGroup', key, optionItems, order);
}


export const initMultipleChoiceGroup = (
  key: string,
  optionItems: OptionDef[],
  order?: Expression
): ItemGroupComponent => {
  // init group
  return initResponseGroup('multipleChoiceGroup', key, optionItems, order);
}


export const initDropdownGroup = (
  key: string,
  optionItems: OptionDef[],
  order?: Expression,
  groupDisabled?: Expression,
  groupContent?: Map<string, string>,
  groupDescription?: Map<string, string>,
): ItemGroupComponent => {
  // init group
  return initResponseGroup('dropDownGroup', key, optionItems, order, groupDisabled,
    groupContent ? generateLocStrings(groupContent) : undefined,
    groupDescription ? generateLocStrings(groupDescription) : undefined,
  );
}


export const initSliderCategoricalGroup = (
  key: string,
  optionItems: OptionDef[],
  order?: Expression,
  groupDisabled?: Expression,
): ItemGroupComponent => {
  // init group
  return initResponseGroup('sliderCategorical', key, optionItems, order, groupDisabled);
}
