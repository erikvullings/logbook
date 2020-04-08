import m, { FactoryComponent } from 'mithril';
import { Form, LayoutForm } from 'mithril-ui-form';
import { Dashboards } from '../../services/dashboard-service';
import { Auth } from '../../services/login-service';
import { IActions, IAppModel } from '../../services/meiosis';
import { CircularSpinner } from '../ui/preloader';

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

export const EditOrganisation: FactoryComponent<{
  state: IAppModel;
  actions: IActions;
}> = () => {
  return {
    view: ({ attrs: { state, actions } }) => {
      if (!Auth.isAdmin()) {
        return m.route.set(Dashboards.HOME);
      }
      const { app } = state;
      if (!app) {
        return m(CircularSpinner);
      }
      const onchange = () => app.settings && actions.updateSettings(app.settings, true);
      const obj = app.settings;

      return m('.row', [
        m('h5', 'Organisaties'),
        m(
          '.row',
          m(LayoutForm, {
            form: organisationsForm,
            obj,
            onchange,
          })
        ),
      ]);
    },
  };
};
