export interface ILokiObj {
  /** Unique identifier */
  $loki: number;
  /** Meta data */
  meta: {
    /** Created date as number since 1 Jan 1970 */
    created: number;
    /** Revision number, is increased on each save */
    revision: number;
    /** Updated date as number since 1 Jan 1970 */
    updated: number;
    version: number;
  };
}
