import { ILokiObj } from './loki-obj';

export interface IData extends ILokiObj {
  /** Datasource ID */
  id: string;
  /** The data */
  data: IDatum[];
}

export interface IDatum extends ILokiObj {
  /** Organidation ID */
  org: string;
  /** Other data fields */
  [key: string]: any;
}
