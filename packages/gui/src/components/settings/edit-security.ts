import m, { FactoryComponent } from 'mithril';
import { Form, LayoutForm } from 'mithril-ui-form';
import { SecurityMode } from '../../models';
import { Dashboards } from '../../services/dashboard-service';
import { Auth } from '../../services/login-service';
import { IActions, IAppModel } from '../../services/meiosis';
import { CircularSpinner } from '../ui/preloader';

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

export const EditSecurity: FactoryComponent<{
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

      return m(
        '.row',
        m(
          '.row',
          m(LayoutForm, {
            form: securityForm,
            obj,
            onchange,
          })
        )
      );
    },
  };
};
