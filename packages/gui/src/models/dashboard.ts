import { ComponentTypes } from 'mithril';
import { IAppModel } from '../services';

export type IconType = () => string | string;

type IconResolver = () => string;
type IconOrResolver = string | IconResolver;

export interface IDashboard {
  id?: string;
  default?: boolean;
  hasNavBar?: boolean;
  title: string;
  icon?: IconOrResolver;
  route: string;
  visible: boolean | ((state?: IAppModel) => boolean);
  isChild?: boolean;
  /** Roles that can access this dashboard */
  forRoles?: string[];
  component: ComponentTypes<any, any>;
}
