import { Expression, ItemComponent } from "survey-engine/data_types"
import { DateDisplayComponentProp, ExpressionDisplayProp, StyledTextComponentProp, isDateDisplayComponentProp, isExpressionDisplayProp } from "../types/item-properties";
import { generateRandomKey } from "./randomKeyGenerator"
import { generateDateDisplayComp, generateExpressionDisplayComp, generateLocStrings } from "./simple-generators"


export interface CommonProps {
  key?: string,
  content?: Map<string, string> | Array<StyledTextComponentProp | DateDisplayComponentProp | ExpressionDisplayProp>;
  displayCondition?: Expression;
}

export interface TextProps extends CommonProps {
  content: Map<string, string> | Array<StyledTextComponentProp | DateDisplayComponentProp | ExpressionDisplayProp>;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'li';
  className?: string;
}

const text = (props: TextProps): ItemComponent => {
  const styles = [];
  if (props.className !== undefined) {
    styles.push({
      key: 'className', value: props.className
    })
  }
  if (props.variant !== undefined) {
    styles.push({
      key: 'variant', value: props.variant
    })
  }

  const content = !Array.isArray(props.content) ? generateLocStrings(props.content) : undefined;
  const items = Array.isArray(props.content) ? props.content.map(
    (item, index) => {
      if (isDateDisplayComponentProp(item)) {
        return generateDateDisplayComp(index.toFixed(), item);
      } else if (isExpressionDisplayProp(item)) {
        return generateExpressionDisplayComp(index.toFixed(), item)
      } else {
        return {
          key: index.toFixed(),
          role: 'text',
          content: generateLocStrings(item.content),
          style: item.className ? [{ key: 'className', value: item.className }] : undefined,
        };
      }
    }
  ) : undefined;


  return {
    key: props.key ?? generateRandomKey(3),
    role: 'text',
    style: styles.length > 0 ? styles : undefined,
    content: content,
    items: items,
    displayCondition: props.displayCondition,
  }
}

export interface MarkdownProps extends CommonProps {
  content: Map<string, string>;
  className?: string;
}

const markdown = (props: MarkdownProps): ItemComponent => {
  const styles = [];
  if (props.className !== undefined) {
    styles.push({
      key: 'className', value: props.className
    })
  }
  return {
    key: props.key ?? generateRandomKey(3),
    role: 'markdown',
    style: styles.length > 0 ? styles : undefined,
    content: generateLocStrings(props.content),
    displayCondition: props.displayCondition,
  }
}

const footnote = (props: {
  content: Map<string, string>;
}): ItemComponent => {
  return {
    role: 'footnote', content: generateLocStrings(props.content), style: [
      { key: 'className', value: 'fs-small fst-italic text-center' }
    ]
  }
}


export const ComponentGenerators = {
  footnote,
  text,
  markdown,
}
