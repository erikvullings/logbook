import m, { FactoryComponent } from 'mithril';
import { Form, LayoutForm } from 'mithril-ui-form';
import { IOrganisation } from '../../../../shared/src';
import { Dashboards, dashboardSvc } from '../../services/dashboard-service';
import { IActions, IAppModel } from '../../services/meiosis';
import { CircularSpinner } from '../ui/preloader';

const sourceForm = (organisations?: IOrganisation[]) =>
  [
    {
      id: 'id',
      label: 'ID',
      type: 'text',
      autogenerate: 'id',
      required: true,
      disabled: true,
      className: 'col m6',
    },
    {
      id: 'name',
      label: 'Naam',
      type: 'text',
      required: true,
      className: 'col m6',
    },
    {
      id: 'form',
      label: 'Formulier',
      description: 'JSON beschrijving van de vragenlijst.',
      required: true,
      type: 'textarea',
    },
    {
      id: 'organisations',
      label: 'Organisaties',
      description: 'Welke organisaties moeten deze vragenlijst beantwoorden.',
      required: true,
      multiple: true,
      disabled: !organisations || organisations.length === 0,
      type: 'select',
      options: organisations && organisations.map(o => ({ id: o.id, label: o.name })),
    },
    {
      id: 'tags',
      type: 'tags',
    },
  ] as Form;

const organisationForm = [
  {
    id: 'id',
    label: 'ID',
    type: 'text',
    required: true,
    className: 'col m6',
  },
  {
    id: 'name',
    label: 'Organisatienaam',
    type: 'text',
    required: true,
    className: 'col m6',
  },
] as Form;

const sourcesForm = (organisations?: IOrganisation[]) =>
  [
    {
      type: 'md',
      value: '##### Vragenlijst definities',
    },
    {
      id: 'sources',
      label: 'Voeg een nieuwe vragenlijst toe',
      type: sourceForm(organisations),
      repeat: true,
      pageSize: 1,
      propertyFilter: 'name',
      filterLabel: 'Filter op naam',
    },
  ] as Form;

const organisationsForm = [
  {
    id: 'organisations',
    label: 'Voeg een nieuwe organisatie toe',
    type: organisationForm,
    repeat: true,
    pageSize: 1,
    propertyFilter: 'name',
    filterLabel: 'Filter op naam',
  },
] as Form;

enum Settings {
  ORGANISATION = 'ORGANISATION',
  QUESTIONNAIRES = 'QUESTIONNAIRES',
}

export const EditSettings: FactoryComponent<{
  state: IAppModel;
  actions: IActions;
}> = () => {
  const sourcesRegex = /sources=(\d+)/gi;
  return {
    view: ({ attrs: { state, actions } }) => {
      const { app } = state;
      if (!app) {
        return m(CircularSpinner);
      }
      const { sources, organisations } = app;
      const showQuestionnaire = m.route.param('content') === Settings.ORGANISATION ? false : true;
      const route = m.route.get();
      const match = sourcesRegex.exec(route);
      const sourcesIndex = match && match.length >= 1 ? +match[1] - 1 : 0;
      const source = sources && sourcesIndex <= sources.length ? sources[sourcesIndex] : undefined;
      const json = source && source.form ? JSON.parse(source.form) : undefined;
      const parsed = JSON.stringify(json, null, 2);

      // const orgIndex = m.route.param('organisations') ? +m.route.param('organisations') - 1 : 0;

      // console.log(app);
      return m('.row', [
        m(
          'ul#slide-out.sidenav.sidenav-fixed',
          {
            style: `height: ${window.innerHeight - 30}px; width: 230px`,
            oncreate: ({ dom }) => {
              M.Sidenav.init(dom);
            },
          },
          [
            m(
              'li',
              m(
                m.route.Link,
                {
                  href: dashboardSvc.route(Dashboards.SETTINGS) + `?content=${Settings.ORGANISATION}`,
                },
                [m('i.material-icons', 'people'), 'Organisaties']
              )
            ),
            m(
              'li',
              m(
                m.route.Link,
                {
                  href: dashboardSvc.route(Dashboards.SETTINGS) + `?content=${Settings.QUESTIONNAIRES}`,
                },
                [m('i.material-icons', 'assessment'), 'Vragenlijsten']
              )
            ),
          ]
        ),
        m('.contentarea', [
          m(
            '.row',
            showQuestionnaire
              ? [
                  m(
                    '.row',
                    m(LayoutForm, {
                      form: sourcesForm(organisations),
                      obj: app,
                      onchange: _ => app.sources && actions.updateDatasources(app.sources, true),
                    })
                  ),
                  m(
                    '.row',
                    json && [
                      m('h5', 'Voorbeeld van de vragenlijst'),
                      m('pre.col.md6', parsed),
                      m(LayoutForm, {
                        class: 'col md6',
                        form: json,
                        obj: {},
                      }),
                    ]
                  ),
                ]
              : [
                  m('h5', 'Organisaties'),
                  m(
                    '.row',
                    m(LayoutForm, {
                      form: organisationsForm,
                      obj: app,
                      onchange: _ => {
                        if (app.organisations) {
                          actions.updateOrganisations(app.organisations, true);
                        }
                      },
                    })
                  ),
                ]
          ),
        ]),
      ]);
    },
  };
};
