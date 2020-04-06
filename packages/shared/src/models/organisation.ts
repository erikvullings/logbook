import { ILokiObj } from './loki-obj';

export interface IOrganisationsEntity extends ILokiObj {
  organisations: IOrganisation[];
}

export interface IOrganisation {
  /** Organisation ID */
  id: string;
  /** Name of the organisation */
  name: string;
}
