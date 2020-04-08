import { ILokiObj, IOrganisation, IQuestionnaire } from '../../../shared/src';

export enum SecurityMode {
  /** Organisaties mogen de data van andere organisaties inzien */
  NATIONAL = 'NATIONAL',
  /** Organisaties mogen de data van andere organisaties NIET inzien */
  ORGANISATION = 'ORGANISATION',
}

export interface IAppSettings extends ILokiObj {
  security: {
    mode: SecurityMode;
  };
  organisations: IOrganisation[];
  questionnaires: IQuestionnaire[];
}
