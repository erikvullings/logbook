import { ILokiObj } from './loki-obj';

export interface IOrganisation extends ILokiObj {
  /** Organisation ID */
  id: string;
  /** Name of the organisation */
  name: string;
}
