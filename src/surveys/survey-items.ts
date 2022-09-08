import { ItemGroupComponent, Expression, ItemComponent, SurveyItem, ExpressionArg, ResponseComponent } from "survey-engine/data_types";
import { ComponentEditor } from "../surveys/survey-editor/component-editor";
import { ItemEditor } from "../surveys/survey-editor/item-editor";
import { ComponentGenerators } from "./utils/componentGenerators";
import { durationObjectToSeconds } from "../types/duration";
import { clozeKey, consentKey, datePickerKey, dropDownKey, inputKey, likertScaleGroupKey, multipleChoiceKey, numericInputKey, responseGroupKey, responsiveBipolarLikertArrayKey, responsiveSingleChoiceArrayKey, singleChoiceKey, timeInputKey } from "../constants/key-definitions";
import { expWithArgs, generateDateDisplayComp, generateHelpGroupComponent, generateLocStrings, generateTitleComponent } from "./utils/simple-generators";
import { SimpleQuestionEditor } from "./utils/simple-question-editor";
import { SurveyEngine } from "./survey-engine-expressions";
import { ClozeQuestionProps, ConsentQuestionProps, DateInputQuestionProps, GenericQuestionProps, isDateDisplayComponentProp, MultiLineTextInput, NumericInputQuestionProps, OptionDef, ResponsiveBipolarLikertArrayQuestionProps, ResponsiveSingleChoiceArrayQuestionProps, TextInputQuestionProps, TimeInputQuestionProps } from "./types/item-properties";
import { initDropdownGroup, initMultipleChoiceGroup, initSingleChoiceGroup, optionDefToItemComponent } from "./responseTypeGenerators/optionGroupComponents";
import { initLikertScaleGroup, initResponsiveBipolarLikertArray, initResponsiveSingleChoiceArray, LikertGroupRow } from "./responseTypeGenerators/likertGroupComponents";


interface OptionQuestionProps extends GenericQuestionProps {
  responseOptions: Array<OptionDef>;
}

interface DropDownQuestionProps extends GenericQuestionProps {
  responseOptions: Array<OptionDef>;
  placeholder?: Map<string, string>;
}

interface LikertGroupQuestionProps extends GenericQuestionProps {
  rows: Array<LikertGroupRow>,
  scaleOptions: Array<{
    key: string;
    className?: string;
    content: Map<string, string>;
  }>,
  stackOnSmallScreen?: boolean;
}

const commonQuestionGenerator = (props: GenericQuestionProps, rg_inner: ItemComponent): SurveyItem => {
  const simpleEditor = new SimpleQuestionEditor(props.parentKey, props.itemKey, props.version ? props.version : 1, props.confidentialMode);

  // QUESTION TEXT
  simpleEditor.setTitle(props.questionText, props.questionSubText, props.titleClassName);

  if (props.condition) {
    simpleEditor.setCondition(props.condition);
  }

  if (props.helpGroupContent) {
    simpleEditor.editor.setHelpGroupComponent(
      generateHelpGroupComponent(props.helpGroupContent)
    )
  }

  if (props.topDisplayCompoments) {
    props.topDisplayCompoments.forEach(comp => simpleEditor.addDisplayComponent(comp))
  }

  simpleEditor.setResponseGroupWithContent(rg_inner);

  if (props.bottomDisplayCompoments) {
    props.bottomDisplayCompoments.forEach(comp => simpleEditor.addDisplayComponent(comp))
  }

  if (props.isRequired) {
    simpleEditor.addHasResponseValidation();
  }
  if (props.customValidations) {
    props.customValidations.forEach(v => simpleEditor.editor.addValidation(v));
  }

  if (props.footnoteText) {
    simpleEditor.addDisplayComponent(ComponentGenerators.footnote({ content: props.footnoteText }))
  }

  return simpleEditor.getItem();
}


const generateNumericInputQuestion = (props: NumericInputQuestionProps): SurveyItem => {
  const style: Array<{ key: string, value: string }> = [];

  if (props.inputMaxWidth) {
    style.push({
      key: 'inputMaxWidth', value: props.inputMaxWidth,
    })
  }
  if (props.labelBehindInput) {
    style.push({ key: 'labelPlacement', value: 'after' });
  }


  const rg_inner: ItemComponent = {
    key: numericInputKey,
    role: 'numberInput',
    properties: {
      min: props.componentProperties?.min !== undefined ? (typeof (props.componentProperties.min) === 'number' ? { dtype: 'num', num: props.componentProperties.min } : props.componentProperties.min) : undefined,
      max: props.componentProperties?.max !== undefined ? (typeof (props.componentProperties?.max) === 'number' ? { dtype: 'num', num: props.componentProperties.max } : props.componentProperties.max) : undefined,
      stepSize: props.componentProperties?.stepSize ? (typeof (props.componentProperties.stepSize) === 'number' ? { dtype: 'num', num: props.componentProperties.stepSize } : props.componentProperties.stepSize) : undefined,
    },
    content: generateLocStrings(props.inputLabel),
    style: style.length > 0 ? style : undefined,
  };
  return commonQuestionGenerator(props, rg_inner)
}


const generateSingleChoiceQuestion = (props: OptionQuestionProps): SurveyItem => {
  const rg_inner = initSingleChoiceGroup(singleChoiceKey, props.responseOptions);
  return commonQuestionGenerator(props, rg_inner)
}


const generateDropDownQuestion = (props: DropDownQuestionProps): SurveyItem => {
  const rg_inner = initDropdownGroup(dropDownKey, props.responseOptions, undefined, undefined, undefined, props.placeholder);
  return commonQuestionGenerator(props, rg_inner);
}


const generateMultipleChoiceQuestion = (props: OptionQuestionProps): SurveyItem => {
  const rg_inner = initMultipleChoiceGroup(multipleChoiceKey, props.responseOptions);
  return commonQuestionGenerator(props, rg_inner);
}


const generateSimpleLikertGroupQuestion = (props: LikertGroupQuestionProps): SurveyItem => {
  const rg_inner = initLikertScaleGroup(
    likertScaleGroupKey,
    props.rows,
    props.scaleOptions,
    props.stackOnSmallScreen,
  );
  // Add extra validation for likert
  if (props.isRequired) {
    if (!props.customValidations) {
      props.customValidations = []
    }
    props.customValidations?.push(
      {
        key: 'r',
        type: 'hard',
        rule: expWithArgs('and',
          ...props.rows.map(r => expWithArgs(
            'responseHasKeysAny',
            [props.parentKey, props.itemKey].join('.'),
            [responseGroupKey, likertScaleGroupKey, r.key].join('.'),
            ...props.scaleOptions.map(o => o.key)
          ))
        )
      }
    )
  }

  return commonQuestionGenerator(props, rg_inner);
}

const generateResponsiveSingleChoiceArrayQuestion = (props: ResponsiveSingleChoiceArrayQuestionProps): SurveyItem => {
  const rg_inner = initResponsiveSingleChoiceArray(
    responsiveSingleChoiceArrayKey,
    {
      ...props,
    },
  );

  // Add extra validation
  if (props.isRequired) {
    if (!props.customValidations) {
      props.customValidations = []
    }
    props.customValidations?.push(
      {
        key: 'r',
        type: 'hard',
        rule: expWithArgs('and',
          ...props.rows.map(r => {
            const hasRespExp = expWithArgs(
              'responseHasKeysAny',
              [props.parentKey, props.itemKey].join('.'),
              [responseGroupKey, responsiveSingleChoiceArrayKey, r.key].join('.'),
              ...props.scaleOptions.map(o => o.key)
            );
            if (r.displayCondition === undefined) {
              return hasRespExp;
            }
            return SurveyEngine.logic.or(
              SurveyEngine.logic.not(r.displayCondition),
              hasRespExp,
            )
          })
        )
      }
    )
  }

  return commonQuestionGenerator(props, rg_inner);
}

const generateResponsiveBipolarLikertArray = (props: ResponsiveBipolarLikertArrayQuestionProps): SurveyItem => {
  const rg_inner = initResponsiveBipolarLikertArray(
    responsiveBipolarLikertArrayKey,
    {
      ...props,
    },
  );

  // Add extra validation
  if (props.isRequired) {
    if (!props.customValidations) {
      props.customValidations = []
    }
    props.customValidations?.push(
      {
        key: 'r',
        type: 'hard',
        rule: expWithArgs('and',
          ...props.rows.map(r => {
            const hasRespExp = expWithArgs(
              'responseHasKeysAny',
              [props.parentKey, props.itemKey].join('.'),
              [responseGroupKey, responsiveBipolarLikertArrayKey, r.key].join('.'),
              ...props.scaleOptions.map(o => o.key)
            );
            if (r.displayCondition === undefined) {
              return hasRespExp;
            }
            return SurveyEngine.logic.or(
              SurveyEngine.logic.not(r.displayCondition),
              hasRespExp,
            )
          })
        )
      }
    )
  }

  return commonQuestionGenerator(props, rg_inner);
}

interface NumericSliderProps extends GenericQuestionProps {
  sliderLabel: Map<string, string>;
  noResponseLabel: Map<string, string>;
  min?: number | ExpressionArg;
  max?: number | ExpressionArg;
  stepSize?: number | ExpressionArg;
}

const generateNumericSliderQuestion = (props: NumericSliderProps): SurveyItem => {
  const rg_inner: ItemComponent = {
    key: 'slider', role: 'sliderNumeric',
    content: generateLocStrings(props.sliderLabel),
    description: generateLocStrings(props.noResponseLabel),
    properties: {
      min: props.min !== undefined ? (typeof (props.min) === 'number' ? { dtype: 'num', num: props.min } : props.min) : undefined,
      max: props.max !== undefined ? (typeof (props.max) === 'number' ? { dtype: 'num', num: props.max } : props.max) : undefined,
      stepSize: props.stepSize ? (typeof (props.stepSize) === 'number' ? { dtype: 'num', num: props.stepSize } : props.stepSize) : undefined,
    }
  }
  return commonQuestionGenerator(props, rg_inner);
}


const generateDatePickerInput = (props: DateInputQuestionProps): SurveyItem => {
  const rg_inner: ItemComponent = {
    key: datePickerKey, role: 'dateInput',
    properties: {
      dateInputMode: { str: props.dateInputMode },
      min: props.minRelativeDate ? {
        dtype: 'exp', exp: SurveyEngine.timestampWithOffset(
          props.minRelativeDate.delta,
          props.minRelativeDate.reference
        )
      } : undefined,
      max: props.maxRelativeDate ? {
        dtype: 'exp', exp:
          expWithArgs(
            'timestampWithOffset',
            durationObjectToSeconds(props.maxRelativeDate.delta),
            props.maxRelativeDate.reference ? props.maxRelativeDate.reference : undefined
          )
      } : undefined,
    },
    content: props.inputLabelText ? generateLocStrings(props.inputLabelText) : undefined,
    description: props.placeholderText ? generateLocStrings(props.placeholderText) : undefined,
  };
  return commonQuestionGenerator(props, rg_inner);
}

const generateTimeInput = (props: TimeInputQuestionProps): SurveyItem => {
  const style: Array<{ key: string, value: string }> = [];

  if (props.minTime) {
    style.push({
      key: 'minTime', value: props.minTime,
    })
  }
  if (props.maxTime) {
    style.push({
      key: 'maxTime', value: props.maxTime,
    })
  }
  if (props.defaultValue) {
    style.push({
      key: 'defaultValue', value: props.defaultValue,
    })
  }
  if (props.labelBehindInput) {
    style.push({ key: 'labelPlacement', value: 'after' });
  }

  const rg_inner: ItemComponent = {
    key: timeInputKey, role: 'timeInput',
    properties: {
      stepSize: props.step,
    },
    content: props.inputLabelText ? generateLocStrings(props.inputLabelText) : undefined,
    style: style.length > 0 ? style : undefined,
  };
  return commonQuestionGenerator(props, rg_inner);
}


const generateTextInputQuestion = (props: TextInputQuestionProps): SurveyItem => {
  const style: Array<{ key: string; value: string }> = [];
  if (props.maxLength !== undefined) {
    style.push({ key: 'maxLength', value: props.maxLength.toFixed(0) })
  }
  if (props.className !== undefined) {
    style.push({ key: 'className', value: props.className })
  }
  if (props.inputMaxWidth !== undefined) {
    style.push({ key: 'inputMaxWidth', value: props.inputMaxWidth })
  }
  if (props.transformLetterCaseTo) {
    style.push({ key: 'transformCase', value: props.transformLetterCaseTo });
  }

  const rg_inner: ItemComponent = {
    key: inputKey, role: 'input',
    content: props.inputLabel ? generateLocStrings(props.inputLabel) : undefined,
    description: props.placeholderText ? generateLocStrings(props.placeholderText) : undefined,
    style: style.length > 0 ? [...style] : undefined,
    disabled: props.disabled,
  };
  return commonQuestionGenerator(props, rg_inner);
}

const generateConsentQuestion = (props: ConsentQuestionProps): SurveyItem => {
  const style = props.className ? [{ key: 'className', value: props.className }] : undefined;

  const rg_inner: ItemComponent = {
    key: consentKey, role: 'consent',
    items: [
      {
        key: 'label', role: 'label',
        content: !Array.isArray(props.checkBoxLabel) ? generateLocStrings(props.checkBoxLabel) : undefined,
        items: Array.isArray(props.checkBoxLabel) ? props.checkBoxLabel.map((item, index) => {
          if (isDateDisplayComponentProp(item)) {
            return generateDateDisplayComp(index.toFixed(), item);
          }
          return {
            key: index.toFixed(),
            role: 'text',
            content: generateLocStrings(item.content),
            style: item.className ? [{ key: 'className', value: item.className }] : undefined
          }
        }) : undefined,
      },
      {
        key: 'title', role: 'title', content: generateLocStrings(props.dialogTitle)
      },
      {
        key: 'content', role: 'content', content: generateLocStrings(props.dialogContent)
      },
      {
        key: 'acceptBtn', role: 'acceptBtn', content: generateLocStrings(props.acceptBtn)
      },
      {
        key: 'rejectBtn', role: 'rejectBtn', content: generateLocStrings(props.rejectBtn)
      },
    ],
    style: style,
  };
  return commonQuestionGenerator(props, rg_inner);
}

const generateMultilineInput = (props: MultiLineTextInput): SurveyItem => {
  const rg_inner: ItemComponent = {
    key: inputKey, role: 'multilineTextInput',
    content: props.inputLabelText ? generateLocStrings(props.inputLabelText) : undefined,
    description: props.placeholderText ? generateLocStrings(props.placeholderText) : undefined,
    style: props.maxLength !== undefined ? [{ key: 'maxLength', value: props.maxLength.toFixed(0) }] : undefined
  };
  return commonQuestionGenerator(props, rg_inner);
}


const generateClozeQuestion = (props: ClozeQuestionProps): SurveyItem => {
  const rg_inner: ItemComponent = {
    key: clozeKey, role: 'cloze',
    items: props.items.map((item) => {
      const clozeItem = item as OptionDef;
      const comp = optionDefToItemComponent(clozeItem);
      return comp;
    })
  };
  return commonQuestionGenerator(props, rg_inner);
}


interface CustomResponseItem extends ResponseComponent {
  mapToRole?: 'singleChoiceGroup' | 'multipleChoiceGroup' | 'input';
  items?: ItemComponent[];
}

interface CustomQuestionProps extends GenericQuestionProps {
  responseItemDefs: CustomResponseItem[];
}

const generateCustomQuestion = (props: CustomQuestionProps): SurveyItem => {
  const items: ItemComponent[] = [];

  props.responseItemDefs.forEach(item => {
    const rolePrefix = item.mapToRole !== undefined ? `${item.mapToRole}` : '';
    const role = `${rolePrefix}:${item.role}`;

    delete item['mapToRole'];
    const rg_inner: ItemComponent = {
      ...item,
      role: role
    };
    items.push(rg_inner)
  })

  const simpleEditor = new SimpleQuestionEditor(props.parentKey, props.itemKey, props.version ? props.version : 1, props.confidentialMode);

  // QUESTION TEXT
  simpleEditor.setTitle(props.questionText, props.questionSubText, props.titleClassName);

  if (props.condition) {
    simpleEditor.setCondition(props.condition);
  }

  if (props.helpGroupContent) {
    simpleEditor.editor.setHelpGroupComponent(
      generateHelpGroupComponent(props.helpGroupContent)
    )
  }

  if (props.topDisplayCompoments) {
    props.topDisplayCompoments.forEach(comp => simpleEditor.addDisplayComponent(comp))
  }

  simpleEditor.editor.addExistingResponseComponent({
    key: responseGroupKey,
    role: 'responseGroup',
    items,
  });

  if (props.bottomDisplayCompoments) {
    props.bottomDisplayCompoments.forEach(comp => simpleEditor.addDisplayComponent(comp))
  }

  if (props.isRequired) {
    simpleEditor.addHasResponseValidation();
  }
  if (props.customValidations) {
    props.customValidations.forEach(v => simpleEditor.editor.addValidation(v));
  }

  if (props.footnoteText) {
    simpleEditor.addDisplayComponent(ComponentGenerators.footnote({ content: props.footnoteText }))
  }

  return simpleEditor.getItem();
}

interface DisplayProps {
  parentKey: string;
  itemKey: string;
  content: Array<ItemComponent>;
  condition?: Expression;
}

const generateDisplay = (props: DisplayProps): SurveyItem => {
  const simpleEditor = new SimpleQuestionEditor(props.parentKey, props.itemKey, 1);
  props.content.forEach(item => simpleEditor.addDisplayComponent(item))
  if (props.condition) {
    simpleEditor.setCondition(props.condition);
  }
  return simpleEditor.getItem();
}

const generateSurveyEnd = (parentKey: string, content: Map<string, string>, condition?: Expression): SurveyItem => {
  const defaultKey = 'surveyEnd'
  const itemKey = [parentKey, defaultKey].join('.');
  const editor = new ItemEditor(undefined, { itemKey: itemKey, type: 'surveyEnd', isGroup: false });

  editor.setTitleComponent(
    generateTitleComponent(content)
  );

  // CONDITION
  editor.setCondition(condition);

  return editor.getItem();
}


interface EQ5DHealthSliderProps {
  role: 'eq5d-health-indicator',
  key: string;
  displayCondition?: Expression;
  disabled?: Expression;
  instructionText: Map<string, string>,
  valueBoxText: Map<string, string>,
  maxHealthText: Map<string, string>,
  minHealthText: Map<string, string>,
}

export const initEQ5DHealthIndicatorQuestion = (
  props: EQ5DHealthSliderProps
): ItemGroupComponent => {
  // init group
  const groupEdit = new ComponentEditor(undefined, {
    key: props.key,
    isGroup: true,
    role: props.role,
  });

  const instructionTextEditor = new ComponentEditor(undefined, { role: 'instruction', });
  instructionTextEditor.setContent(generateLocStrings(props.instructionText))
  groupEdit.addItemComponent(instructionTextEditor.getComponent());

  const valueBoxTextEditor = new ComponentEditor(undefined, { role: 'valuebox', });
  valueBoxTextEditor.setContent(generateLocStrings(props.valueBoxText))
  groupEdit.addItemComponent(valueBoxTextEditor.getComponent());

  const minHealthTextEditor = new ComponentEditor(undefined, { role: 'mintext', });
  minHealthTextEditor.setContent(generateLocStrings(props.minHealthText))
  groupEdit.addItemComponent(minHealthTextEditor.getComponent());

  const maxHealthTextEditor = new ComponentEditor(undefined, { role: 'maxtext', });
  maxHealthTextEditor.setContent(generateLocStrings(props.maxHealthText))
  groupEdit.addItemComponent(maxHealthTextEditor.getComponent());

  return groupEdit.getComponent() as ItemGroupComponent;
}


export const SurveyItems = {
  consent: generateConsentQuestion,
  singleChoice: generateSingleChoiceQuestion,
  responsiveSingleChoiceArray: generateResponsiveSingleChoiceArrayQuestion,
  responsiveBipolarLikertArray: generateResponsiveBipolarLikertArray,
  multipleChoice: generateMultipleChoiceQuestion,
  dateInput: generateDatePickerInput,
  timeInput: generateTimeInput,
  textInput: generateTextInputQuestion,
  // eq5dSlider: todo,
  clozeQuestion: generateClozeQuestion,
  numericInput: generateNumericInputQuestion,
  multilineTextInput: generateMultilineInput,
  dropDown: generateDropDownQuestion,
  numericSlider: generateNumericSliderQuestion,
  display: generateDisplay,
  surveyEnd: generateSurveyEnd,
  customQuestion: generateCustomQuestion,
  old: {
    simpleLikertGroup: generateSimpleLikertGroupQuestion,
  }
}
