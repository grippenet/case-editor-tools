import { Expression, ExpressionName, isExpression } from "survey-engine/data_types"
import { Logger } from "../logger/logger"


export const generateExpression = (name: ExpressionName,
  returnType?: 'string' | 'float',
  ...args: any[]): Expression => {
  return {
    name: name,
    returnType: returnType,
    data: args.filter(a => a !== undefined).map((arg, index) => {
      if (typeof (arg) === 'string') {
        return {
          dtype: 'str',
          str: arg
        }
      } else if (typeof (arg) === 'number') {
        return {
          dtype: 'num',
          num: arg
        }
      }

      if (!isExpression(arg)) {
        Logger.criticalError(`Wrong argument type in: ${name} at pos ${index}`);
        process.exit(1)
      }

      return {
        dtype: 'exp',
        exp: arg as Expression
      }
    })
  }
}
