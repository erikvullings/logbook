import m, { ComponentTypes, RouteDefs } from 'mithril';
import { AboutPage } from '../components/about/about-page';
import { EditForm } from '../components/edit/edit-form';
import { HomePage } from '../components/home/home-page';
import { LandingPage } from '../components/landing/landing-page';
import { Layout } from '../components/layout';
import { EditOrganisation, EditQuestionnaire, EditSecurity } from '../components/settings';
import { ViewPage } from '../components/view/view-page';
import { IDashboard, SecurityMode } from '../models';
import { actions, IAppModel, states } from './';
import { Auth, Login } from './login-service';

export const enum Dashboards {
  LANDING = 'LANDING',
  HOME = 'HOME',
  EDIT = 'EDIT',
  VIEW = 'VIEW',
  USER = 'USER',
  ABOUT = 'ABOUT',
  SETTINGS_ORGANISATIONS = 'SETTINGS_ORGANISATIONS',
  SETTINGS_QUESTIONNAIRES = 'SETTINGS_QUESTIONNAIRES',
  SETTINGS_SECURITY = 'SETTINGS_SECURITY',
}

class DashboardService {
  private actions = actions;
  private states = states;
  private dashboards!: ReadonlyArray<IDashboard>;

  constructor(private layout: ComponentTypes<{ state: IAppModel }>, dashboards: IDashboard[]) {
    this.setList(dashboards);
  }

  public getList() {
    return this.dashboards.filter((d) => !d.forRoles || d.forRoles.length === 0 || Auth.matchRoles(d.forRoles));
  }

  public setList(list: IDashboard[]) {
    this.dashboards = Object.freeze(list);
  }

  public get defaultRoute() {
    const dashboard = this.dashboards.filter((d) => d.default).shift();
    return dashboard ? dashboard.route : this.dashboards[0].route;
  }

  public route(dashboardId: Dashboards, params?: { [key: string]: string | number }) {
    const dashboard = this.dashboards.filter((d) => d.id === dashboardId).shift();
    const p = params
      ? Object.keys(params)
          .map((k) => `${k}=${params[k]}`)
          .join('&')
      : undefined;
    return dashboard ? `${dashboard.route}${p ? `?${p}` : ''}` : this.defaultRoute;
  }

  public switchTo(dashboardId: Dashboards, params?: { [key: string]: string | number | undefined }) {
    const dashboard = this.dashboards.filter((d) => d.id === dashboardId).shift();
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
                  { state: this.states() },
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
    title: 'Rapporteren',
    icon: 'home',
    route: '/report',
    visible: true,
    component: HomePage,
  },
  {
    id: Dashboards.EDIT,
    title: 'Bewerken',
    icon: 'edit',
    route: '/edit',
    visible: false,
    component: EditForm,
  },
  {
    id: Dashboards.VIEW,
    title: 'Exploreren',
    icon: 'pageview',
    route: '/explore',
    visible: (s) => s?.app?.settings?.security?.mode === SecurityMode.NATIONAL,
    component: ViewPage,
  },
  {
    title: 'Instellingen',
    icon: 'settings',
    route: '/settings/organisations',
    visible: true,
    forRoles: ['admin'],
    component: EditOrganisation,
  },
  {
    id: Dashboards.SETTINGS_ORGANISATIONS,
    title: 'Organisaties',
    icon: 'people',
    route: '/settings/organisations',
    visible: true,
    isChild: true,
    forRoles: ['admin'],
    component: EditOrganisation,
  },
  {
    id: Dashboards.SETTINGS_QUESTIONNAIRES,
    title: 'Vragenlijsten',
    icon: 'assessment',
    route: '/settings/questionnaires',
    visible: true,
    isChild: true,
    forRoles: ['admin'],
    component: EditQuestionnaire,
  },
  {
    id: Dashboards.SETTINGS_SECURITY,
    title: 'Beveiliging',
    icon: 'security',
    route: '/settings/security',
    visible: true,
    isChild: true,
    forRoles: ['admin'],
    component: EditSecurity,
  },
  {
    id: Dashboards.ABOUT,
    title: 'Informatie',
    route: '/info',
    icon: 'info_outline',
    visible: true,
    component: AboutPage,
  },
  {
    id: Dashboards.USER,
    title: 'Gebruiker',
    route: '/user',
    icon: () => (Auth.isAuthenticated ? 'person' : 'person_outline'),
    visible: true,
    component: Login,
  },
]);
