import m, { FactoryComponent } from 'mithril';
import { Icon } from 'mithril-materialized';
import logo from '../assets/logbook - black.svg';
import { IDashboard } from '../models';
import { IAppModel } from '../services';
import { dashboardSvc } from '../services/dashboard-service';

const stripRouteParams = (path: string) => path.replace(/:[a-zA-Z]+/, '');

const isRouteActive = (route = m.route.get()) => (path?: string) =>
  path && path.length > 1 && route.indexOf(stripRouteParams(path)) >= 0 ? '.active' : '';

const isRouteVisible = (d: IDashboard, app?: IAppModel) =>
  typeof d.visible === 'boolean' ? d.visible : typeof d.visible === 'function' ? d.visible(app) : false;

export const Layout: FactoryComponent<{
  state: IAppModel;
}> = () => ({
  view: ({ children, attrs: { state } }) => {
    const isActive = isRouteActive();
    return [
      m(
        // 'a.sidenav-trigger[href=#!/home][data-target=slide-out]',
        // { onclick: (e: UIEvent) => e.preventDefault() },
        m.route.Link,
        {
          className: 'sidenav-trigger',
          'data-target': 'slide-out',
          href: m.route.get(),
        },
        m(Icon, {
          iconName: 'menu',
          className: '.hide-on-med-and-up',
          style: 'margin-left: 5px;',
        })
      ),
      m(
        'ul.sidenav.sidenav-fixed#slide-out',
        {
          oncreate: ({ dom }) => M.Sidenav.init(dom),
        },
        [
          m(
            'li',
            m('.user-view', [
              m('a.brand-logo[href=#]', [
                m(`img[width=60][height=50][src=${logo}]`),
                m('span', { style: 'font-size: 2rem; vertical-align: top;' }, 'Logbook'),
              ]),
            ])
          ),
          ...dashboardSvc
            .getList()
            .filter((d) => isRouteVisible(d, state) || isActive(d.route))
            .map((d: IDashboard) =>
              m(
                `li${isActive(d.route)}${d.isChild ? '.child-link' : ''}`,
                m(m.route.Link, { href: d.route || dashboardSvc.defaultRoute }, [
                  d.icon && m('i.material-icons', typeof d.icon === 'string' ? d.icon : d.icon()),
                  m('span', d.title),
                ])
              )
            ),
        ]
      ),
      m('main', m('.contentarea', children)),
    ];
  },
});
