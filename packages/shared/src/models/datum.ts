import { ILokiObj } from './loki-obj';

export interface IData extends ILokiObj {
  /** Datasource ID */
  id: string;
  /** The data */
  data: IDatum[];
}

export interface IDatum {
  /** Timestamp of the datum, in UNIX Epoch time */
  time: number;
  /** Other data fields */
  [key: string]: any;
}
