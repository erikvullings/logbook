import m, { FactoryComponent } from 'mithril';
import { Form, LayoutForm } from 'mithril-ui-form';
import { ILokiObj, IOrganisation, IQuestionnaire } from '../../../../shared/src';
import { AppState, SecurityMode } from '../../models';
import { crudServiceFactory } from '../../services/crud-service';
import { IActions, IAppModel } from '../../services/meiosis';
import { formatDate, saveCsv } from '../../utils';
import { CircularSpinner } from '../ui/preloader';
import { FlatButton } from 'mithril-materialized';

export const ViewPage: FactoryComponent<{
  state: IAppModel;
  actions: IActions;
}> = () => {
  interface ILokiObjExt extends ILokiObj {
    org: string;
  }

  const sources = {} as { [questionnaireId: string]: ILokiObjExt[] };
  const data = {} as { [questionnaireId: string]: { [$loki: string]: ILokiObjExt | undefined } };

  const obj = {} as {
    questionnaire?: string;
    organisation?: string;
    $loki?: string;
  };

  const createForm = (questionnaires: IQuestionnaire[], organisations: IOrganisation[]) => {
    const id = obj.questionnaire;
    const org = obj.organisation;
    const timestamps = id ? sources[id] : undefined;
    const orgs = (timestamps && organisations.filter((o) => timestamps.some((t) => t.org === o.id))) || [];
    const orgTimestamps = (timestamps && org && timestamps.filter((t) => t.org === org)) || [];
    return [
      {
        id: 'questionnaire',
        label: 'Kies een vragenlijst',
        type: 'select',
        options: questionnaires.map((q) => ({ id: q.id, label: q.name })),
        className: 'col s12 m4',
      },
      {
        id: 'organisation',
        label: 'Kies een organisatie',
        type: 'select',
        disabled: !obj.questionnaire,
        options: orgs.map((o) => ({ id: o.id, label: o.name })),
        className: 'col s12 m4',
      },
      {
        id: '$loki',
        label: 'Kies een tijdstip',
        type: 'select',
        disabled: !obj.organisation || !obj.questionnaire || !sources[obj.questionnaire],
        options: orgTimestamps.map((s) => ({ id: s.$loki, label: formatDate(s.meta.updated || s.meta.created) })),
        className: 'col s12 m4',
      },
    ] as Form;
  };

  return {
    view: ({ attrs: { state } }) => {
      const {
        app: {
          settings: { questionnaires, organisations, security },
        },
      } = state;
      if (!security || security.mode === SecurityMode.ORGANISATION) {
        return;
      }
      if (!questionnaires) {
        return m(CircularSpinner);
      }

      const form = createForm(questionnaires, organisations);
      const id = obj.questionnaire;
      const qData = id && obj.$loki && data[id] ? data[id][obj.$loki] : undefined;
      const questionnaire = questionnaires.filter((q) => q.id === id).shift();
      const orgId = obj.organisation;
      const qForm = questionnaire && questionnaire.form ? (JSON.parse(questionnaire.form) as Form) : undefined;
      const key = Date.now();

      return m('.row', [
        m('.contentarea', [
          m(
            '.row',
            m(LayoutForm, {
              key,
              form,
              obj,
              onchange: async () => {
                const q = obj.questionnaire;
                if (!q) {
                  return;
                }
                const service = crudServiceFactory<ILokiObjExt>(AppState.apiService, q);
                if (!sources[q]) {
                  const result = await service.loadAll('view?props=$loki,meta,org');
                  if (result) {
                    data[q] = {};
                    sources[q] = result;
                    m.redraw();
                  }
                }
                if (obj.$loki) {
                  data[q][obj.$loki] = await service.load(obj.$loki);
                }
              },
            })
          ),
          m('.row', [
            id &&
              m(FlatButton, {
                iconName: 'cloud_download',
                label: 'Vragenlijst als CSV',
                className: 'col s12 m4',
                onclick: async () => {
                  const service = crudServiceFactory<ILokiObjExt>(AppState.apiService, id);
                  const result = await service.loadAll();
                  if (result) {
                    saveCsv(result, questionnaire?.name);
                  }
                },
              }),
            id &&
              orgId &&
              m(FlatButton, {
                iconName: 'cloud_download',
                label: 'Organisatie als CSV',
                className: 'col s12 m4',
                onclick: async () => {
                  const service = crudServiceFactory<ILokiObjExt>(AppState.apiService, id);
                  const result = await service.loadAll(`?q={"org":"${orgId}"}`);
                  if (result) {
                    saveCsv(result, `${questionnaire?.name}_${orgId}`);
                  }
                },
              }),
            id &&
              qData &&
              m(FlatButton, {
                iconName: 'cloud_download',
                label: 'Formulier als CSV',
                className: 'col s12 m4',
                onclick: () => saveCsv(qData, `${questionnaire?.name}_${orgId}_${obj.$loki}`),
              }),
          ]),
          qData &&
            qForm &&
            m(
              '.row',
              m(LayoutForm, {
                form: qForm,
                obj: qData,
                readonly: true,
              })
            ),
        ]),
      ]);
    },
  };
};
