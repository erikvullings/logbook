import m, { FactoryComponent } from 'mithril';
import { Collection, CollectionMode, FlatButton } from 'mithril-materialized';
import { Form, LayoutForm } from 'mithril-ui-form';
import { IDatum } from '../../../../shared/dist/models/datum';
import { IQuestionnaire } from '../../../../shared/src';
import { AppState } from '../../models/app-state';
import { crudServiceFactory, ICrudService } from '../../services/crud-service';
import { Dashboards, dashboardSvc } from '../../services/dashboard-service';
import { IActions, IAppModel } from '../../services/meiosis';
import { padLeft } from '../../utils';
import { CircularSpinner } from '../ui/preloader';

const formatDate = (t: number) => {
  const date = new Date(t);
  const pl = (n: number) => padLeft(n, '0');
  return `${date.getFullYear()}-${pl(date.getMonth() + 1)}-${pl(date.getDate())} ${pl(date.getHours())}:${pl(
    date.getMinutes()
  )}`;
};

const maxEditTime = 24 * 3600000;
export const EditForm: FactoryComponent<{
  state: IAppModel;
  actions: IActions;
}> = () => {
  const state = {} as {
    id?: string;
    org?: string;
    questionnaire?: IQuestionnaire;
    data?: IDatum[];
    datum?: IDatum;
    service: ICrudService<IDatum>;
  };

  return {
    oninit: async ({ attrs: { state: appState } }) => {
      const {
        app: {
          settings: { questionnaires },
        },
      } = appState;
      const id = (state.id = m.route.param('id'));
      const org = (state.org = m.route.param('org'));
      if (!id || !org) {
        M.toast({ html: 'ID en/of organisatie is niet aangegeven.', classes: 'red' });
        return m.route.set(dashboardSvc.route(Dashboards.HOME));
      }
      state.questionnaire = questionnaires?.filter(s => s.id === id).shift();
      if (!state.questionnaire) {
        M.toast({ html: 'De vragenlijst is onbekend.', classes: 'red' });
        return m.route.set(dashboardSvc.route(Dashboards.HOME));
      }
      state.service = crudServiceFactory<IDatum>(AppState.apiService, id);
      const result = await state.service.loadAll(`view?props=$loki,meta,org&q={"org":"${org}"}`);
      if (result) {
        state.data = result;
        m.redraw();
      }
    },
    view: ({ attrs: { state: appState } }) => {
      const {
        app: {
          settings: { organisations },
        },
      } = appState;
      const { id, org, questionnaire, datum, data, service } = state;
      if (!id || !org || !questionnaire) {
        return m(CircularSpinner);
      }
      const organisation = organisations?.filter(o => o.id === org).shift();

      const now = Date.now();
      const readonly = !datum || (datum.meta && datum.meta.created ? now - datum.meta.created > maxEditTime : false);
      const form = JSON.parse(questionnaire.form) as Form;
      form.unshift({
        type: 'md',
        value: `#### ${questionnaire.name} vragen voor ${organisation?.name}${
          datum && datum.meta ? ` (${formatDate(datum.meta.updated || datum.meta.created)})` : ''
        }`,
      });

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
            m(FlatButton, {
              label: 'Rapportage toevoegen',
              iconName: 'add',
              class: 'col s11 indigo darken-4 white-text',
              style: 'margin: 10px  ;',
              onclick: () => (state.datum = { org } as IDatum),
            }),
            data &&
              data.map(d =>
                m(
                  'li',
                  m(
                    'a',
                    {
                      onclick: async () => {
                        const res = await service?.load(d.$loki);
                        state.datum = res;
                        m.redraw();
                      },
                    },
                    formatDate(d.meta?.created)
                  )
                )
              ),
          ]
        ),
        m(
          '.contentarea',
          datum
            ? [
                m(
                  '.row',
                  m(LayoutForm, {
                    form,
                    obj: datum,
                    readonly,
                    onchange: async _ => {
                      console.log(datum);
                    },
                  })
                ),
                !readonly &&
                  m(
                    '.row',
                    m(FlatButton, {
                      label: 'Opslaan',
                      iconName: 'save',
                      onclick: () => service.save(datum),
                    })
                  ),
              ]
            : m('p', 'Selecteer een meting uit de lijst in het menu of maak een nieuwe aan.')
        ),
      ]);
    },
  };
};
