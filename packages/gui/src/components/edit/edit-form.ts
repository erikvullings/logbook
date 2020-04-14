import m, { FactoryComponent } from 'mithril';
import { Form, LayoutForm } from 'mithril-ui-form';
import { IDatum, IOrganisation, IQuestionnaire } from '../../../../shared/src';
import { AppState, ILokiObjExt } from '../../models';
import { Dashboards, dashboardSvc } from '../../services';
import { crudServiceFactory, ICrudService } from '../../services/crud-service';
import { Auth } from '../../services/login-service';
import { IActions, IAppModel } from '../../services/meiosis';
import { formatDate } from '../../utils';
import { CircularSpinner } from '../ui/preloader';

const maxEditTime = 24 * 3600000;

export const EditForm: FactoryComponent<{
  state: IAppModel;
  actions: IActions;
}> = () => {
  const sources = {} as { [questionnaireId: string]: ILokiObjExt[] };
  const data = {} as { [questionnaireId: string]: { [$loki: string]: ILokiObjExt | undefined } };

  const obj = {} as {
    questionnaire?: string;
    organisation?: string;
    $loki?: string | number;
    service: ICrudService<IDatum>;
  };

  const createForm = (questionnaires: IQuestionnaire[], organisations: IOrganisation[]) => {
    const id = obj.questionnaire;
    const org = obj.organisation;
    const timestamps = id ? sources[id] : undefined;
    const orgTimestamps = (timestamps && org && timestamps.filter((t) => t.org === org)) || [];
    return [
      {
        id: 'questionnaire',
        label: 'Kies vragenlijst',
        type: 'select',
        options: questionnaires.map((q) => ({ id: q.id, label: q.name })),
        className: 'col s12 m4',
      },
      {
        id: 'organisation',
        label: 'Kies organisatie',
        type: 'select',
        disabled: !obj.questionnaire,
        options: organisations.map((o) => ({ id: o.id, label: o.name })),
        className: 'col s12 m4',
      },
      {
        id: '$loki',
        label: 'Kies tijdstip of nieuwe aanmaken',
        type: 'select',
        disabled: !obj.organisation || !obj.questionnaire || !sources[obj.questionnaire],
        options: [
          { id: 'new', label: 'Nieuwe aanmaken' },
          ...orgTimestamps.map((s) => ({ id: s.$loki, label: formatDate(s.meta.updated || s.meta.created) })),
        ],
        className: 'col s12 m4',
      },
    ] as Form;
  };

  return {
    oninit: async ({ attrs: { state: appState } }) => {
      const {
        app: {
          settings: { questionnaires },
        },
      } = appState;
      const qId = (obj.questionnaire = m.route.param('id'));
      const oId = (obj.organisation = m.route.param('org'));
      if (!qId || !oId) {
        M.toast({ html: 'ID en/of organisatie is niet aangegeven.', classes: 'red' });
        return m.route.set(dashboardSvc.route(Dashboards.HOME));
      }
      const questionnaire = questionnaires?.filter((s) => s.id === qId).shift();
      if (!questionnaire) {
        M.toast({ html: 'De vragenlijst is onbekend.', classes: 'red' });
        return m.route.set(dashboardSvc.route(Dashboards.HOME));
      }
      obj.service = crudServiceFactory<IDatum>(AppState.apiService, qId);
      const result = await obj.service.loadAll(`view?props=$loki,meta,org&q={"org":"${oId}"}`);
      if (result) {
        sources[obj.questionnaire] = result;
        m.redraw();
      }
    },
    view: ({ attrs: { state } }) => {
      const {
        app: {
          settings: { questionnaires, organisations },
        },
      } = state;
      if (!questionnaires) {
        return m(CircularSpinner);
      }

      const qId = obj.questionnaire;
      const qData = qId && obj.$loki && data[qId] ? data[qId][obj.$loki] : undefined;
      const questionnaire = questionnaires.filter((q) => q.id === qId).shift();
      const qForm = questionnaire && questionnaire.form ? (JSON.parse(questionnaire.form) as Form) : undefined;
      const key = Date.now();

      const myQuestionnaires = questionnaires.filter((q) => q.organisations.some((o) => Auth.roles.indexOf(o) >= 0));
      const myOrganisationIds = questionnaire
        ? questionnaire.organisations.filter((o) => Auth.roles.indexOf(o) >= 0)
        : [];
      console.log(myOrganisationIds);
      const myOrganisations = organisations.filter((o) => myOrganisationIds.indexOf(o.id) >= 0);

      const form = createForm(myQuestionnaires, myOrganisations);

      const now = Date.now();
      const readonly = !qData || (qData.meta && qData.meta.created ? now - qData.meta.created > maxEditTime : false);

      return m('.row', [
        m('.contentarea', [
          m(
            '.row.select-questionnaire-organisation',
            m(LayoutForm, {
              key,
              form,
              obj,
              onchange: async () => {
                if (!qId) {
                  return;
                }
                const service = crudServiceFactory<ILokiObjExt>(AppState.apiService, qId);
                if (!sources[qId]) {
                  const result = await service.loadAll('view?props=$loki,meta,org');
                  if (result) {
                    data[qId] = {};
                    sources[qId] = result;
                    m.redraw();
                  }
                }
                if (obj.$loki) {
                  if (!data[qId]) {
                    data[qId] = {};
                  }
                  if (obj.$loki === 'new') {
                    const r = await service.create({ org: obj.organisation });
                    if (r) {
                      obj.$loki = r.$loki;
                      sources[qId].push(r);
                      data[qId][obj.$loki] = r;
                    }
                  } else {
                    data[qId][obj.$loki] = await service.load(obj.$loki);
                  }
                }
              },
            })
          ),
          qData &&
            qForm && [
              m('.divider'),
              m(
                '.row.edit-form',
                m(LayoutForm, {
                  form: qForm,
                  obj: qData,
                  readonly,
                  onchange:
                    readonly || !qId
                      ? undefined
                      : async (_) => {
                          const service = crudServiceFactory<ILokiObjExt>(AppState.apiService, qId);
                          service.save(qData);
                        },
                })
              ),
            ],
        ]),
      ]);
    },
  };
};

// import m, { FactoryComponent } from 'mithril';
// import { FlatButton } from 'mithril-materialized';
// import { Form, LayoutForm } from 'mithril-ui-form';
// import { IDatum, IOrganisation, IQuestionnaire } from '../../../../shared/src';
// import { ILokiObjExt } from '../../models';
// import { AppState } from '../../models/app-state';
// import { crudServiceFactory, ICrudService } from '../../services/crud-service';
// import { Dashboards, dashboardSvc } from '../../services/dashboard-service';
// import { IActions, IAppModel } from '../../services/meiosis';
// import { formatDate } from '../../utils';
// import { CircularSpinner } from '../ui/preloader';

// const maxEditTime = 24 * 3600000;
// export const EditForm: FactoryComponent<{
//   state: IAppModel;
//   actions: IActions;
// }> = () => {
//   const obj = {} as {
//     questionnaireId?: string;
//     questionnaire?: IQuestionnaire;
//     orgId?: string;
//     organisation?: IOrganisation;
//     data?: IDatum[];
//     datum?: IDatum;
//     service: ICrudService<IDatum>;
//   };

//   const sources = {} as { [questionnaireId: string]: ILokiObjExt[] };

//   const createForm = (questionnaires: IQuestionnaire[], organisations: IOrganisation[]) => {
//     const id = obj.questionnaireId;
//     const org = obj.orgId;
//     const timestamps = id ? sources[id] : undefined;
//     const orgs = (timestamps && organisations.filter((o) => timestamps.some((t) => t.org === o.id))) || [];
//     const orgTimestamps = (timestamps && org && timestamps.filter((t) => t.org === org)) || [];
//     return [
//       {
//         id: 'questionnaire',
//         label: 'Kies een vragenlijst',
//         type: 'select',
//         options: questionnaires.map((q) => ({ id: q.id, label: q.name })),
//         className: 'col s12 m4',
//       },
//       {
//         id: 'organisation',
//         label: 'Kies een organisatie',
//         type: 'select',
//         disabled: !obj.questionnaire,
//         options: orgs.map((o) => ({ id: o.id, label: o.name })),
//         className: 'col s12 m4',
//       },
//       {
//         id: '$loki',
//         label: 'Kies een tijdstip',
//         type: 'select',
//         disabled: !obj.organisation || !obj.questionnaire || !sources[obj.questionnaire],
//         options: orgTimestamps.map((s) => ({ id: s.$loki, label: formatDate(s.meta.updated || s.meta.created) })),
//         className: 'col s12 m4',
//       },
//     ] as Form;
//   };

//   return {
//     oninit: async ({ attrs: { state: appState } }) => {
//       const {
//         app: {
//           settings: { questionnaires },
//         },
//       } = appState;
//       const id = (obj.questionnaireId = m.route.param('id'));
//       const org = (obj.orgId = m.route.param('org'));
//       if (!id || !org) {
//         M.toast({ html: 'ID en/of organisatie is niet aangegeven.', classes: 'red' });
//         return m.route.set(dashboardSvc.route(Dashboards.HOME));
//       }
//       obj.questionnaire = questionnaires?.filter((s) => s.id === id).shift();
//       if (!obj.questionnaire) {
//         M.toast({ html: 'De vragenlijst is onbekend.', classes: 'red' });
//         return m.route.set(dashboardSvc.route(Dashboards.HOME));
//       }
//       obj.service = crudServiceFactory<IDatum>(AppState.apiService, id);
//       const result = await obj.service.loadAll(`view?props=$loki,meta,org&q={"org":"${org}"}`);
//       if (result) {
//         obj.data = result;
//         m.redraw();
//       }
//     },
//     view: ({ attrs: { state: appState } }) => {
//       const {
//         app: {
//           settings: { questionnaires, organisations },
//         },
//       } = appState;
//       if (!questionnaires) {
//         return m(CircularSpinner);
//       }

//       const { questionnaireId: id, orgId: org, questionnaire, datum, data, service } = obj;
//       const selectionForm = createForm(questionnaires, organisations);
//       if (!id || !org || !questionnaire) {
//         return m(CircularSpinner);
//       }
//       const organisation = organisations?.filter((o) => o.id === org).shift();

//       const now = Date.now();
//       const readonly = !datum || (datum.meta && datum.meta.created ? now - datum.meta.created > maxEditTime : false);
//       const form = JSON.parse(questionnaire.form) as Form;
//       form.unshift({
//         type: 'md',
//         value: `#### ${questionnaire.name} vragen voor ${organisation?.name}${
//           datum && datum.meta ? ` (${formatDate(datum.meta.updated || datum.meta.created)})` : ''
//         }`,
//       });

//       return m('.row', [
//         m(
//           'ul#slide-right.sidenav.sidenav-fixed.right',
//           {
//             // style: `height: ${window.innerHeight - 30}px`,
//             oncreate: ({ dom }) => {
//               M.Sidenav.init(dom);
//             },
//           },
//           [
//             m(FlatButton, {
//               label: 'Rapportage toevoegen',
//               iconName: 'add',
//               class: 'col s11 indigo darken-4 white-text',
//               style: 'margin: 10px  ;',
//               onclick: () => (obj.datum = { org } as IDatum),
//             }),
//             data &&
//               data.map((d) =>
//                 m(
//                   'li',
//                   m(
//                     'a',
//                     {
//                       onclick: async () => {
//                         const res = await service?.load(d.$loki);
//                         obj.datum = res;
//                         m.redraw();
//                       },
//                     },
//                     formatDate(d.meta?.created)
//                   )
//                 )
//               ),
//           ]
//         ),
//         m(
//           '.contentarea',
//           datum
//             ? [
//                 m(
//                   '.row',
//                   m(LayoutForm, {
//                     form,
//                     obj: datum,
//                     readonly,
//                     onchange: async (_) => {
//                       console.log(datum);
//                     },
//                   })
//                 ),
//                 !readonly &&
//                   m(
//                     '.row',
//                     m(FlatButton, {
//                       label: 'Opslaan',
//                       iconName: 'save',
//                       onclick: () => service.save(datum),
//                     })
//                   ),
//               ]
//             : m('p', 'Selecteer een meting uit de lijst in het menu of maak een nieuwe aan.')
//         ),
//       ]);
//     },
//   };
// };
