import { Expression } from "survey-engine/lib/data_types";
import { NumericInputProps, OptionDef, StyledTextComponentProp, TextInputProps } from "../types/item-properties";

interface CommonProps {
  key?: string,
  content?: Map<string, string> | StyledTextComponentProp[];
  displayCondition?: Expression;
}

interface OptionProps extends CommonProps {
  key: string;
  disabled?: Expression;
  className?: string;
}

interface OptionTextProps extends CommonProps {
  key: string;
  className?: string;
}

const option = (props: OptionProps): OptionDef => {
  const styles = [];
  if (props.className !== undefined) {
    styles.push({
      key: 'className', value: props.className
    })
  }

  return {
    key: props.key,
    role: 'option',
    content: !Array.isArray(props.content) ? props.content : undefined,
    items: Array.isArray(props.content) ? props.content : undefined,
    displayCondition: props.displayCondition,
    disabled: props.disabled,
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
    key: props.key,
    role: 'text',
    content: !Array.isArray(props.content) ? props.content : undefined,
    displayCondition: props.displayCondition,
    style: styles,
  }
}

const textInput = (props: TextInputProps & { key: string, displayCondition: Expression }): OptionDef => {
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

const numberInput = (props: NumericInputProps & { key: string, displayCondition: Expression }): OptionDef => {
  const style: Array<{ key: string; value: string }> = [];
  if (props.inputMaxWidth !== undefined) {
    style.push({ key: 'inputMaxWidth', value: props.inputMaxWidth })
  }
  if (props.labelBehindInput) {
    style.push({ key: 'labelPlacement', value: 'after' });
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

export const OptionTypes = {
  generic: option,
  singleChoice: {
    subtitle: multipleChoiceOptionSubtitle,
    textInput,
    //dateInput,
    numberInput,
    //cloze,
  },
  multipleChoice: {
    subtitle: multipleChoiceOptionSubtitle,
    textInput,
    // dateInput,
    numberInput,
    // cloze,
  },
  clozeItems: {
    // text,
    // markdown,
    textInput,
    // dateInput,
    numberInput,
    // dropDown,
  }
}
