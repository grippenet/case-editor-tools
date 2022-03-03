import { Expression } from "survey-engine/data_types";
import { SurveyEngine } from "../survey-engine-expressions";
import { ClozeProps, DateInputProps, NumericInputProps, OptionDef, StyledTextComponentProp, TextInputProps, TimeInputProps } from "../types/item-properties";
import { generateRandomKey } from "./randomKeyGenerator";

interface CommonProps {
  key?: string,
  content?: Map<string, string> | StyledTextComponentProp[];
  displayCondition?: Expression;
}

interface OptionProps {
  disabled?: Expression;
  className?: string;
  displayCondition?: Expression;
}

interface OptionTextProps extends CommonProps {
  className?: string;
}

const option = (key: string, content: Map<string, string> | StyledTextComponentProp[], extraProps?: OptionProps): OptionDef => {
  const styles = [];
  if (extraProps?.className !== undefined) {
    styles.push({
      key: 'className', value: extraProps.className
    })
  }

  return {
    key: key,
    role: 'option',
    content: !Array.isArray(content) ? content : undefined,
    items: Array.isArray(content) ? content : undefined,
    displayCondition: extraProps?.displayCondition,
    disabled: extraProps?.disabled,
    style: styles,
  }
}

const multipleChoiceOptionSubtitle = (props: OptionTextProps): OptionDef => {
  const styles = [];
  if (props.className !== undefined) {
    styles.push({
      key: 'className', value: props.className
    })
  }
  return {
    key: props.key ? props.key : generateRandomKey(6),
    role: 'text',
    content: !Array.isArray(props.content) ? props.content : undefined,
    displayCondition: props.displayCondition,
    style: styles,
  }
}

const markdown = (props: OptionTextProps): OptionDef => {
  const styles = [];
  if (props.className !== undefined) {
    styles.push({
      key: 'className', value: props.className
    })
  }
  return {
    key: props.key ? props.key : generateRandomKey(6),
    role: 'markdown',
    content: !Array.isArray(props.content) ? props.content : undefined,
    displayCondition: props.displayCondition,
    style: styles,
  }
}

const textInput = (props: TextInputProps & { key: string, displayCondition?: Expression, alignText?: 'start' | 'center' | 'end' }): OptionDef => {
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
  if (props.alignText) {
    style.push({ key: 'alignInputText', value: props.alignText });
  }

  return {
    key: props.key,
    role: 'input',
    content: props.inputLabel,
    description: props.placeholderText,
    displayCondition: props.displayCondition,
    disabled: props.disabled,
    style: style.length > 0 ? style : undefined,
  }
}

const numberInput = (props: NumericInputProps & { key: string, displayCondition?: Expression, alignText?: 'start' | 'center' | 'end' }): OptionDef => {
  const style: Array<{ key: string; value: string }> = [];
  if (props.inputMaxWidth !== undefined) {
    style.push({ key: 'inputMaxWidth', value: props.inputMaxWidth })
  }
  if (props.labelBehindInput) {
    style.push({ key: 'labelPlacement', value: 'after' });
  }
  if (props.alignText) {
    style.push({ key: 'alignText', value: props.alignText });
  }

  return {
    key: props.key,
    role: 'numberInput',
    content: props.inputLabel,
    displayCondition: props.displayCondition,
    disabled: props.disabled,
    optionProps: {
      min: props.componentProperties?.min !== undefined ? (typeof (props.componentProperties.min) === 'number' ? { dtype: 'num', num: props.componentProperties.min } : props.componentProperties.min) : undefined,
      max: props.componentProperties?.max !== undefined ? (typeof (props.componentProperties?.max) === 'number' ? { dtype: 'num', num: props.componentProperties.max } : props.componentProperties.max) : undefined,
      stepSize: props.componentProperties?.stepSize ? (typeof (props.componentProperties.stepSize) === 'number' ? { dtype: 'num', num: props.componentProperties.stepSize } : props.componentProperties.stepSize) : undefined,
    },
    style: style.length > 0 ? style : undefined,
  }
}

const dateInput = (props: DateInputProps & { key: string, displayCondition?: Expression }): OptionDef => {
  return {
    key: props.key,
    role: 'dateInput',
    optionProps: {
      dateInputMode: { str: props.dateInputMode },
      min: props.minRelativeDate ? {
        dtype: 'exp', exp: SurveyEngine.timestampWithOffset(
          props.minRelativeDate.delta,
          props.minRelativeDate.reference
        )
      } : undefined,
      max: props.maxRelativeDate ? {
        dtype: 'exp', exp: SurveyEngine.timestampWithOffset(
          props.maxRelativeDate.delta,
          props.maxRelativeDate.reference ? props.maxRelativeDate.reference : undefined
        )
      } : undefined,
    },
    content: props.inputLabelText,
    displayCondition: props.displayCondition,
  }
}

const timeInput = (props: TimeInputProps & { key: string, displayCondition?: Expression }): OptionDef => {
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
  return {
    key: props.key,
    role: 'timeInput',
    optionProps: {
      stepSize: props.step,
    },
    content: props.inputLabelText,
    displayCondition: props.displayCondition,
    style: style.length > 0 ? style : undefined,
  }
}

const dropDown = (props: { key: string, placeholder?: Map<string, string>, displayCondition?: Expression, options: Array<OptionDef> }): OptionDef => {
  return {
    key: props.key,
    role: 'dropDownGroup',
    displayCondition: props.displayCondition,
    description: props.placeholder,
    items: props.options,
  }
}


const cloze = (props: ClozeProps & { key: string, displayCondition?: Expression, className?: string; }): OptionDef => {
  const styles = [];
  if (props.className !== undefined) {
    styles.push({
      key: 'className', value: props.className
    })
  }
  return {
    key: props.key,
    role: 'cloze',
    items: props.items,
    displayCondition: props.displayCondition,
    style: styles.length > 0 ? styles : undefined,
  }
}

const clozeLineBreak = (): OptionDef => {
  return {
    key: generateRandomKey(5),
    role: 'lineBreak',
  }
}

export const SingleChoiceOptionTypes = {
  option,
  textInput,
  //dateInput,
  timeInput,
  numberInput,
  cloze,
}

export const MultipleChoiceOptionTypes = {
  option,
  subtitle: multipleChoiceOptionSubtitle,
  textInput,
  // dateInput
  timeInput,
  numberInput,
  cloze,
}

export const ClozeItemTypes = {
  text: multipleChoiceOptionSubtitle,
  markdown,
  textInput,
  dateInput,
  timeInput,
  clozeLineBreak,
  numberInput,
  dropDown,
}
