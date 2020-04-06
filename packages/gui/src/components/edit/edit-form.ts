import m, { FactoryComponent } from 'mithril';
import { Form, LayoutForm } from 'mithril-ui-form';
import { IData, IQuestionnaire } from '../../../../shared/src';
import { AppState } from '../../models/app-state';
import { crudServiceFactory } from '../../services/crud-service';
import { IActions, IAppModel } from '../../services/meiosis';
import { CircularSpinner } from '../ui/preloader';

export const EditForm: FactoryComponent<{
  state: IAppModel;
  actions: IActions;
}> = () => {
  const state = {} as {
    id?: string;
    source?: IQuestionnaire;
    obj?: IData;
  };

  // const onsubmit = async (actions: IActions, hazard: Partial<{ [key: string]: any }>) => {
  //   // log('submitting...');
  //   // actions.updateScenario(hazard.scenario);
  // };

  // const formChanged = (source: Partial<any>, isValid: boolean) => {
  //   state.canPublish = isValid;
  //   console.log(JSON.stringify(source, null, 2));
  // };

  return {
    oninit: async ({ attrs: { state: appState } }) => {
      const {
        app: { questionnaires: sources },
      } = appState;
      const id = (state.id = m.route.param('id'));
      if (!id) {
        return;
      }
      state.source = sources?.filter(s => s.id === id).shift();
      if (!state.source) {
        return;
      }
      // const result = (await crudService.loadAll(id)) as undefined | IData;
      // if (result) {
      //   state.obj = result;
      //   m.redraw();
      // }
    },
    view: ({ attrs: { actions } }) => {
      const { id, source } = state;
      if (!id || !source) {
        return m(CircularSpinner);
      }
      const { obj = { id } as IData } = state;
      state.obj = obj;
      // console.log(data);
      // console.log(JSON.parse(source.form));

      // const form = formGenerator();
      // if (!loaded) {
      //   return m(CircularSpinner, { className: 'center-align', style: 'margin-top: 20%;' });
      // }
      const form = [
        { id: 'id', label: 'ID', disabled: true },
        {
          id: 'data',
          label: 'Add new data',
          type: JSON.parse(source.form),
          repeat: true,
          pageSize: 1,
          // propertyFilter: 'name',
          // filterLabel: 'Filter by name',
        },
      ] as Form;

      return m(
        '.row',
        m(LayoutForm, {
          form,
          obj,
          onchange: async _ => {
            console.log(obj);
            // const result = await crudService.save(id, data);
            // if (result) {
            //   state.data = result;
            //   m.redraw();
            // }
          },
        })
      );
    },
  };
};
