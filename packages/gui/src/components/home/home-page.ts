import m, { FactoryComponent } from 'mithril';
import { Collection, CollectionMode, TextInput } from 'mithril-materialized';
import { IActions, IAppModel } from '../../services/meiosis';
import { CircularSpinner } from '../ui/preloader';
import { dashboardSvc, Dashboards } from '../../services/dashboard-service';

export const HomePage: FactoryComponent<{
  state: IAppModel;
  actions: IActions;
}> = () => {
  return {
    view: ({ attrs: { state, actions } }) => {
      const {
        app: { sources, filter },
      } = state;
      if (!sources) {
        return m(CircularSpinner);
      }
      console.log(filter);
      return m('.row', [
        m(
          'ul#slide-out.sidenav.sidenav-fixed',
          {
            style: `height: ${window.innerHeight - 30}px`,
            oncreate: ({ dom }) => {
              M.Sidenav.init(dom);
            },
          },
          [
            m(TextInput, {
              label: 'Filter datasources',
              initialValue: filter,
              iconName: 'filter_list',
              onchange: v => actions.updateFilter(v),
              onkeyup: (_: KeyboardEvent, v?: string) => {
                actions.updateFilter(v);
              },
            }),
          ]
        ),
        m('.contentarea', [
          m(
            '.row',
            m(Collection, {
              mode: CollectionMode.AVATAR,
              header: 'Datasources',
              items: sources
                .filter(
                  s =>
                    !filter ||
                    (s.name && s.name.toLowerCase().indexOf(filter) >= 0) ||
                    (s.tags &&
                      s.tags.reduce((acc, cur) => acc || cur.toLowerCase().indexOf(filter) >= 0, false as boolean))
                )
                .map(s => ({
                  id: s.id,
                  title: s.name,
                  content: s.tags ? s.tags.join(', ') : undefined,
                  href: dashboardSvc.route(Dashboards.EDIT, { id: s.id }),
                })),
            })
          ),
        ]),
      ]);
    },
  };
};
