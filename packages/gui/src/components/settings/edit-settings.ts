import m, { FactoryComponent } from 'mithril';
import { Form, LayoutForm } from 'mithril-ui-form';
import { IOrganisation } from '../../../../shared/src';
import { Dashboards, dashboardSvc } from '../../services/dashboard-service';
import { Auth } from '../../services/login-service';
import { IActions, IAppModel } from '../../services/meiosis';
import { CircularSpinner } from '../ui/preloader';
import { SecurityMode } from '../../models';

const questionnaireForm = (organisations?: IOrganisation[]) =>
  [
    {
      id: 'id',
      label: 'ID',
      type: 'text',
      autogenerate: 'guid',
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

const questionnairesForm = (organisations?: IOrganisation[]) =>
  [
    {
      type: 'md',
      value: '##### Vragenlijst definities',
    },
    {
      id: 'questionnaires',
      label: 'Voeg een nieuwe vragenlijst toe',
      type: questionnaireForm(organisations),
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

const securityForm = [
  {
    id: 'security',
    label: '##### Beveiliging',
    type: [
      {
        id: 'mode',
        label: 'Mode',
        type: 'select',
        options: Object.keys(SecurityMode).map(k => ({ id: k })),
        required: true,
        className: 'col m6',
      },
    ],
  },
] as Form;

enum Settings {
  ORGANISATION = 'ORGANISATION',
  QUESTIONNAIRES = 'QUESTIONNAIRES',
  SECURITY = 'SECURITY',
}

const contentLink = (page: Settings) => `${dashboardSvc.route(Dashboards.SETTINGS)}?content=${page}`;

export const EditSettings: FactoryComponent<{
  state: IAppModel;
  actions: IActions;
}> = () => {
  const questionnairesRegex = /questionnaires=(\d+)/gi;

  return {
    view: ({ attrs: { state, actions } }) => {
      if (!Auth.isAdmin()) {
        return m.route.set(Dashboards.HOME);
      }
      const { app } = state;
      if (!app) {
        return m(CircularSpinner);
      }
      const { questionnaires: questionnaires, organisations } = app;
      const showPage = m.route.param('content');
      const route = m.route.get();
      const match = questionnairesRegex.exec(route);
      const questionnairesIndex = match && match.length >= 1 ? +match[1] - 1 : 0;
      const questionnaire =
        questionnaires && questionnairesIndex <= questionnaires.length
          ? questionnaires[questionnairesIndex]
          : undefined;
      const json = questionnaire && questionnaire.form ? JSON.parse(questionnaire.form) : undefined;

      const onchange = () => app.settings && actions.updateSettings(app.settings, true);
      const obj = app.settings;

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
                  href: contentLink(Settings.ORGANISATION),
                },
                [m('i.material-icons', 'people'), 'Organisaties']
              )
            ),
            m(
              'li',
              m(
                m.route.Link,
                {
                  href: contentLink(Settings.QUESTIONNAIRES),
                },
                [m('i.material-icons', 'assessment'), 'Vragenlijsten']
              )
            ),
            m(
              'li',
              m(
                m.route.Link,
                {
                  href: contentLink(Settings.SECURITY),
                },
                [m('i.material-icons', 'security'), 'Beveiliging']
              )
            ),
          ]
        ),
        m('.contentarea', [
          m(
            '.row',
            showPage === Settings.QUESTIONNAIRES
              ? [
                  m(
                    '.row',
                    m(LayoutForm, {
                      form: questionnairesForm(organisations),
                      obj,
                      onchange,
                    })
                  ),
                  m(
                    '.row',
                    json && [
                      m('h5', 'Voorbeeld van de vragenlijst'),
                      m(LayoutForm, {
                        form: json,
                        obj: {},
                      }),
                    ]
                  ),
                ]
              : showPage === Settings.ORGANISATION
              ? [
                  m('h5', 'Organisaties'),
                  m(
                    '.row',
                    m(LayoutForm, {
                      form: organisationsForm,
                      obj,
                      onchange,
                    })
                  ),
                ]
              : [
                  m(
                    '.row',
                    m(LayoutForm, {
                      form: securityForm,
                      obj,
                      onchange,
                    })
                  ),
                ]
          ),
        ]),
      ]);
    },
  };
};
