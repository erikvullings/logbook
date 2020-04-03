export interface IDatasource {
  /** Unique ID */
  id: string;
  /** Name of the source */
  name: string;
  /** The actual form */
  form: string;
  /** Tags */
  tags?: string[];
}
