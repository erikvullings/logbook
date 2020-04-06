import m, { ComponentTypes, RouteDefs } from 'mithril';
import { EditForm } from '../components/edit/edit-form';
import { HomePage } from '../components/home/home-page';
import { LandingPage } from '../components/landing/landing-page';
import { Layout } from '../components/layout';
import { EditSettings } from '../components/settings/edit-settings';
import { IDashboard } from '../models/dashboard';
import { actions, states } from './';
import { Auth, Login } from './login-service';

export const enum Dashboards {
  LANDING = 'LANDING',
  HOME = 'HOME',
  EDIT = 'EDIT',
  USER = 'USER',
  SETTINGS = 'SETTINGS',
}

class DashboardService {
  private actions = actions;
  private states = states;
  private dashboards!: ReadonlyArray<IDashboard>;

  constructor(private layout: ComponentTypes, dashboards: IDashboard[]) {
    this.setList(dashboards);
  }

  public getList() {
    return this.dashboards.filter(d => !d.forRoles || d.forRoles.length === 0 || Auth.matchRoles(d.forRoles));
  }

  public setList(list: IDashboard[]) {
    this.dashboards = Object.freeze(list);
  }

  public get defaultRoute() {
    const dashboard = this.dashboards.filter(d => d.default).shift();
    return dashboard ? dashboard.route : this.dashboards[0].route;
  }

  public route(dashboardId: Dashboards, params?: { [key: string]: string | number }) {
    const dashboard = this.dashboards.filter(d => d.id === dashboardId).shift();
    const p = params
      ? Object.keys(params)
          .map(k => `${k}=${params[k]}`)
          .join('&')
      : undefined;
    return dashboard ? `${dashboard.route}${p ? `?${p}` : ''}` : this.defaultRoute;
  }

  public switchTo(dashboardId: Dashboards, params?: { [key: string]: string | number | undefined }) {
    const dashboard = this.dashboards.filter(d => d.id === dashboardId).shift();
    if (dashboard) {
      m.route.set(dashboard.route, params ? params : undefined);
    }
  }

  public routingTable() {
    return this.dashboards.reduce((p, c) => {
      p[c.route] =
        c.hasNavBar === false
          ? {
              render: () => m(c.component, { state: this.states(), actions: this.actions }),
            }
          : {
              render: () =>
                m(
                  this.layout,
                  m(c.component, {
                    state: this.states(),
                    actions: this.actions,
                  })
                ),
            };
      return p;
    }, {} as RouteDefs);
  }
}

export const dashboardSvc: DashboardService = new DashboardService(Layout, [
  {
    id: Dashboards.LANDING,
    default: true,
    hasNavBar: false,
    title: 'LANDING',
    route: '/',
    visible: false,
    component: LandingPage,
  },
  {
    id: Dashboards.HOME,
    title: 'Home',
    icon: 'home',
    route: '/home',
    visible: true,
    component: HomePage,
  },
  {
    id: Dashboards.EDIT,
    title: 'Edit',
    icon: 'edit',
    route: '/edit',
    visible: false,
    component: EditForm,
  },
  {
    id: Dashboards.SETTINGS,
    title: 'Settings',
    icon: 'settings',
    route: '/settings',
    visible: true,
    forRoles: ['admin'],
    component: EditSettings,
  },
  {
    id: Dashboards.USER,
    title: 'User page',
    route: '/user',
    icon: () => (Auth.isAuthenticated ? 'person' : 'person_outline'),
    visible: true,
    component: Login,
  },
]);
