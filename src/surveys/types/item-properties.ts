import { ComponentProperties, Expression, ItemComponent, Validation } from "survey-engine/lib/data_types";

export interface StyledTextComponentProp {
  content: Map<string, string>;
  className?: string;
}

export interface OptionDef {
  key: string;
  role: string;
  content?: Map<string, string>;
  items?: Array<StyledTextComponentProp> | Array<OptionDef>;
  description?: Map<string, string>;
  displayCondition?: Expression;
  disabled?: Expression;
  style?: Array<{ key: string, value: string }>;
  optionProps?: ComponentProperties;
}

export interface GenericQuestionProps {
  parentKey: string;
  itemKey: string;
  version?: number;
  questionText: Map<string, string> | Array<StyledTextComponentProp>;
  questionSubText?: Map<string, string>;
  titleClassName?: string;
  helpGroupContent?: Array<{
    content: Map<string, string>,
    style?: Array<{ key: string, value: string }>,
  }>;
  condition?: Expression;
  topDisplayCompoments?: Array<ItemComponent>;
  bottomDisplayCompoments?: Array<ItemComponent>;
  isRequired?: boolean;
  footnoteText?: Map<string, string>;
  customValidations?: Array<Validation>;
}


/**
 * Numeric Input
 */
export interface NumericInputProps {
  inputLabel: Map<string, string>;
  labelBehindInput?: boolean;
  componentProperties?: ComponentProperties;
  inputMaxWidth?: string;
  disabled?: Expression;
}

export type NumericInputQuestionProps = GenericQuestionProps & NumericInputProps;


/**
 * Text Input
 */
export interface TextInputProps {
  placeholderText?: Map<string, string>;
  inputLabel?: Map<string, string>;
  inputMaxWidth?: string;
  className?: string;
  maxLength?: number; // number of charachters allowed
  disabled?: Expression;
}

export type TextInputQuestionProps = TextInputProps & GenericQuestionProps;


/**
 * Cloze Question
 */
export interface ClozeProps {
  items: Array<OptionDef>;
}

export type ClozeQuestionProps = ClozeProps & GenericQuestionProps;


/**
 * Response Single Choice Likert Array
 */
export type ResponsiveSingleChoiceArrayVariant = 'horizontal' | 'vertical' | 'table';

export interface ResponsiveSingleChoiceArrayProps {
  scaleOptions: Array<{
    key: string;
    className?: string;
    content: Map<string, string> | StyledTextComponentProp[];
  }>,
  rows: Array<{
    key: string;
    content: Map<string, string> | StyledTextComponentProp[];
    horizontalModeProps?: {
      labelPlacement?: 'none' | 'top' | 'bottom';
      className?: string;
    },
    verticalModeProps?: {
      className?: string;
    }
    tableModeProps?: {
      className?: string;
    }
  }>,
  defaultMode: ResponsiveSingleChoiceArrayVariant;
  responsiveModes?: {
    sm?: ResponsiveSingleChoiceArrayVariant;
    md?: ResponsiveSingleChoiceArrayVariant;
    lg?: ResponsiveSingleChoiceArrayVariant;
    xl?: ResponsiveSingleChoiceArrayVariant;
    xxl?: ResponsiveSingleChoiceArrayVariant;
  },
  rgClassName?: string;
  tableModeProps?: {
    className?: string;
    layout?: "fixed";
    firstColWidth?: string;
    optionHeaderClassName?: string;
    hideRowBorder?: boolean;
  },
  horizontalModeProps?: {
    hideRowBorder?: boolean;
  },
  verticalModeProps?: {
    hideRowBorder?: boolean;
    useReverseOptionOrder?: boolean;
  }
}
export type ResponsiveSingleChoiceArrayQuestionProps = GenericQuestionProps & ResponsiveSingleChoiceArrayProps;

/**
 * Response Bipolar Likert Array
 */
export type ResponsiveBipolarLikertArrayVariant = 'withLabelRow' | 'vertical' | 'table';
export interface ResponsiveBipolarLikertArrayProps {
  scaleOptions: Array<{
    key: string;
  }>,
  rows: Array<{
    key: string;
    startLabel: Map<string, string> | StyledTextComponentProp[];
    endLabel: Map<string, string> | StyledTextComponentProp[];
    withLabelRowModeProps?: {
      className?: string;
    },
    verticalModeProps?: {
      className?: string;
    }
    tableModeProps?: {
      className?: string;
    }
  }>,
  defaultMode: ResponsiveBipolarLikertArrayVariant;
  responsiveModes?: {
    sm?: ResponsiveBipolarLikertArrayVariant;
    md?: ResponsiveBipolarLikertArrayVariant;
    lg?: ResponsiveBipolarLikertArrayVariant;
    xl?: ResponsiveBipolarLikertArrayVariant;
    xxl?: ResponsiveBipolarLikertArrayVariant;
  },
  rgClassName?: string;
  tableModeProps?: {
    className?: string;
    layout?: "fixed";
    labelColWidth?: string;
    hideRowBorder?: boolean;
  },
  withLabelRowModeProps?: {
    hideRowBorder?: boolean;
    maxLabelWidth?: string;
    useBottomLabel?: boolean;
  },
  verticalModeProps?: {
    hideRowBorder?: boolean;
  }
}

export type ResponsiveBipolarLikertArrayQuestionProps = GenericQuestionProps & ResponsiveBipolarLikertArrayProps;
