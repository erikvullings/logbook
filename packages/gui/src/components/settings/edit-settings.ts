import m, { FactoryComponent } from 'mithril';
import { Form, LayoutForm } from 'mithril-ui-form';
import { IActions, IAppModel } from '../../services/meiosis';
import { CircularSpinner } from '../ui/preloader';

const sourceForm = [
  {
    id: 'name',
    type: 'text',
    required: true,
    className: 'col m6',
  },
  {
    id: 'id',
    label: 'Unique ID',
    type: 'text',
    required: true,
    className: 'col m6',
  },
  {
    id: 'form',
    description: 'JSON description of the questionnaire.',
    required: true,
    type: 'textarea',
  },
  {
    id: 'tags',
    type: 'tags',
  },
] as Form;

const sourcesForm = [
  {
    type: 'md',
    value: `##### Questionnaire definitions

Here you can specify yours questionnaire. Click the + to begin.`,
  },
  {
    id: 'sources',
    label: 'Add new questionnaire',
    type: sourceForm,
    repeat: true,
    pageSize: 1,
    propertyFilter: 'name',
    filterLabel: 'Filter by name',
  },
] as Form;

export const EditSettings: FactoryComponent<{
  state: IAppModel;
  actions: IActions;
}> = () => {
  const sourcesRegex = /sources=(\d+)/gi;
  return {
    view: ({ attrs: { state, actions } }) => {
      const { app } = state;
      const route = m.route.get();
      const match = sourcesRegex.exec(route);
      const sourcesIndex = match && match.length >= 1 ? +match[1] - 1 : 0;
      const source = app.sources && sourcesIndex <= app.sources.length ? app.sources[sourcesIndex] : undefined;
      const json = source && source.form ? JSON.parse(source.form) : undefined;
      const parsed = JSON.stringify(json, null, 2);
      // console.log(app);
      if (!app) {
        return m(CircularSpinner);
      }
      return m('.row', [
        m(
          '.row',
          m(LayoutForm, {
            form: sourcesForm,
            obj: app,
            onchange: _ => app.sources && actions.updateSettings(app.sources),
          })
        ),
        m(
          '.row',
          json && [
            m('h5', 'Processed JSON'),
            m('pre.col.md6', parsed),
            m(LayoutForm, {
              class: 'col md6',
              form: json,
              obj: {},
            }),
          ]
        ),
      ]);
    },
  };
};
