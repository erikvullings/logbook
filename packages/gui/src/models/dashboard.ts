import { ComponentTypes } from 'mithril';

export type IconType = () => string | string;

type IconResolver = () => string;
type IconOrResolver = string | IconResolver;

export interface IDashboard {
  id: string;
  default?: boolean;
  hasNavBar?: boolean;
  title: string;
  icon?: IconOrResolver;
  route: string;
  visible: boolean;
  /** Roles that can access this dashboard */
  forRoles?: string[];
  component: ComponentTypes<any, any>;
}
