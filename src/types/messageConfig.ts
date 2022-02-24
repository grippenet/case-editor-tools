import { Expression } from "survey-engine/data_types";
import { Duration, durationObjectToSeconds } from "./duration";

export type MessageType = 'registration' | 'invitation' | 'verify-email' | 'verification-code' | 'password-reset' | 'password-changed' | 'account-id-changed' | 'weekly' | 'study-reminder' | 'newsletter' | 'account-deleted';

export interface MessageConfig {
  sendTo: 'study-participants' | 'all-users' | 'scheduled-participant-messages';
  label: string;
  headerOverrides?: { from: string; sender: string; replyTo: string[] };
  messageType: MessageType;
  sendingTime: {
    hour: number;
    minute: number;
  },
  period: Duration;
  defaultLanguage: string,
  condition: Expression,
  translations: Array<{
    lang: string,
    subject: string,
  }>

}

export const buildMessageConfig = (props: MessageConfig, studyKey: string) => {
  return {
    sendTo: props.sendTo,
    studyKey: studyKey,
    label: props.label,
    headerOverrides: props.headerOverrides,
    messageType: props.messageType,
    sendingTime: props.sendingTime,
    condition: { dtype: 'exp', exp: props.condition },
    period: Math.floor(durationObjectToSeconds(props.period)),
    defaultLanguage: props.defaultLanguage,
    translations: props.translations,
  }
}
