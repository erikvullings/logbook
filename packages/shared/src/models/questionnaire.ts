import { ILokiObj } from './loki-obj';

export interface IQuestionnaireEntity extends ILokiObj {
  questionnaires: IQuestionnaire[];
}

export interface IQuestionnaire {
  /** Unique ID */
  id: string;
  /** Name of the source */
  name: string;
  /** The actual form */
  form: string;
  /** Organisations that should fill it out. */
  organisations: string[];
  /** Tags */
  tags?: string[];
}
