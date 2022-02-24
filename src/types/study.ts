import { Expression } from "survey-engine/data_types";
import { StudyRules } from "./studyRules";
import { SurveyDefinition } from "../surveys/types/survey-definition";
import { MessageConfig } from "./messageConfig";

export interface Study {
  studyKey: string;
  outputFolderName?: string;
  surveys: SurveyDefinition[];

  // normal study rules
  studyRules?: StudyRules;

  customStudyRules?: Array<{
    name: string;
    rules: Expression[];
  }>;
  messageConfigs?: Array<MessageConfig>;
}
