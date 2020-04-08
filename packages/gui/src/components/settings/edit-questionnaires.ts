import m, { FactoryComponent } from 'mithril';
import { Form, LayoutForm } from 'mithril-ui-form';
import { IOrganisation } from '../../../../shared/src';
import { Dashboards } from '../../services/dashboard-service';
import { Auth } from '../../services/login-service';
import { IActions, IAppModel } from '../../services/meiosis';
import { CircularSpinner } from '../ui/preloader';

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

export const EditQuestionnaire: FactoryComponent<{
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
      const {
        settings: { questionnaires, organisations },
      } = app;
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
      ]);
    },
  };
};
