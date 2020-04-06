import Stream from 'mithril/stream';
import { IOrganisation, IOrganisationsEntity, IQuestionnaire, IQuestionnaireEntity } from '../../../shared/src';
import { AppState } from '../models/app-state';
import { merge } from '../utils/mergerino';
import { crudServiceFactory } from './crud-service';

const organisationsService = crudServiceFactory<IOrganisationsEntity>(AppState.apiService, 'organisations');
const questionnaireService = crudServiceFactory<IQuestionnaireEntity>(AppState.apiService, 'questionnaires');

/** Application state */
export const appStateMgmt = {
  initial: {
    app: {
      filter: '',
      questionnaires: [] as IQuestionnaire[],
      organisations: [] as IOrganisation[],
    },
  },
  actions: (us: UpdateStream) => {
    return {
      updateQuestionnaires: (questionnaires: IQuestionnaire[], save = true) => {
        const state = us() as Partial<IAppModel>;
        if (save && state) {
          const isNew = !state.app?.questionnaires || state.app.questionnaires.length === 0;
          appStateMgmt.effects.saveQuestionnaires(questionnaires, isNew);
        }
        return us({ app: { questionnaires } });
      },
      updateOrganisations: (organisations: IOrganisation[], save = true) => {
        const state = us() as Partial<IAppModel>;
        if (save && state) {
          const isNew = !state.app?.organisations || state.app.organisations.length === 0;
          appStateMgmt.effects.saveOrganisations(organisations, isNew);
        }
        return us({ app: { organisations } });
      },
      updateFilter: (filter?: string) => us({ app: { filter } }),
    } as IActions;
  },
  effects: {
    loadQuestionnaires: async () => {
      console.log('Loading questionnaires');
      const result = await questionnaireService.load();
      if (!result) {
        return;
      }
      const { questionnaires } = result;
      actions.updateQuestionnaires(questionnaires, false);
    },
    saveQuestionnaires: async (questionnaires: IQuestionnaire[], isNew: boolean) => {
      isNew
        ? await questionnaireService.create({ questionnaires } as IQuestionnaireEntity)
        : await questionnaireService.update({ $loki: 1, questionnaires } as IQuestionnaireEntity);
    },
    loadOrganisations: async () => {
      console.log('Loading organisations');
      const result = (await organisationsService.load()) as any;
      if (!result) {
        return;
      }
      const { organisations } = result;
      actions.updateOrganisations(organisations, false);
    },
    saveOrganisations: async (organisations: IOrganisation[], isNew: boolean) => {
      isNew
        ? await organisationsService.create({ organisations } as IOrganisationsEntity)
        : await organisationsService.update({ $loki: 1, organisations } as IOrganisationsEntity);
    },
  },
};

export interface IAppModel {
  app: Partial<{
    filter: string;
    questionnaires: IQuestionnaire[];
    organisations: IOrganisation[];
  }>;
}

export interface IActions {
  updateFilter: (filter?: string) => UpdateStream;
  updateQuestionnaires: (questionnaires: IQuestionnaire[], save: boolean) => UpdateStream;
  updateOrganisations: (organisations: IOrganisation[], save: boolean) => UpdateStream;
}

export type ModelUpdateFunction = Partial<IAppModel> | ((model: Partial<IAppModel>) => Partial<IAppModel>);
export type UpdateStream = Stream<ModelUpdateFunction>;

const app = {
  initial: Object.assign({}, appStateMgmt.initial),
  actions: (us: UpdateStream) => Object.assign({}, appStateMgmt.actions(us)) as IActions,
};

const update = Stream<ModelUpdateFunction>();
export const states = Stream.scan(merge, app.initial, update);
export const actions = app.actions(update);

appStateMgmt.effects.loadQuestionnaires();
appStateMgmt.effects.loadOrganisations();
