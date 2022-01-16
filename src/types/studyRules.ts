import { Expression } from 'survey-engine/data_types';
import { StudyEngine } from '../expression-utils/studyEngineExpressions';


export class StudyRules {
  private enterRules?: Expression[];
  private submitRules?: Expression[];
  private timerRules?: Expression[];
  private mergeRules?: Expression[];

  constructor(
    enterRules?: Expression[],
    submitRules?: Expression[],
    timerRules?: Expression[],
    mergeRules?: Expression[],
  ) {
    this.enterRules = enterRules;
    this.submitRules = submitRules;
    this.timerRules = timerRules;
    this.mergeRules = mergeRules;
  }

  get() {
    const rules = [];
    if (this.enterRules) {
      rules.push(
        StudyEngine.ifThen(StudyEngine.checkEventType('ENTER'), ...this.enterRules)
      );
    }
    if (this.submitRules) {
      rules.push(
        StudyEngine.ifThen(StudyEngine.checkEventType('SUBMIT'), ...this.submitRules)
      );
    }
    if (this.timerRules) {
      rules.push(
        StudyEngine.ifThen(StudyEngine.checkEventType('TIMER'), ...this.timerRules)
      );
    }
    if (this.mergeRules) {
      rules.push(
        StudyEngine.ifThen(StudyEngine.checkEventType('MERGE'), ...this.mergeRules)
      );
    }
    return rules;
  }
}
