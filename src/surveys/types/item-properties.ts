import { ComponentProperties, Expression } from "survey-engine/lib/data_types";

export interface StyledTextComponentProp {
  content: Map<string, string>;
  className?: string;
}

export interface OptionDef {
  key: string;
  role: string;
  content?: Map<string, string>;
  items?: Array<StyledTextComponentProp>;
  description?: Map<string, string>;
  displayCondition?: Expression;
  disabled?: Expression;
  style?: Array<{ key: string, value: string }>;
  optionProps?: ComponentProperties;
}
