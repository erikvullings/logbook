import Stream from 'mithril/stream';
import { IDatasource, ILokiObj, IOrganisation } from '../../../shared/src';
import { AppState } from '../models/app-state';
import { merge } from '../utils/mergerino';
import { crudServiceFactory } from './crud-service';

const crudService = crudServiceFactory(AppState.apiService);

/** Application state */
export const appStateMgmt = {
  initial: {
    app: {
      filter: '',
      sources: [] as IDatasource[],
      organisations: [] as IOrganisation[],
    },
  },
  actions: (us: UpdateStream) => {
    return {
      updateDatasources: (sources: IDatasource[]) => {
        const state = us() as Partial<IAppModel>;
        if (state) {
          const isNew = !state.app?.sources || state.app.sources.length === 0;
          appStateMgmt.effects.saveDatasources(sources, isNew);
        }
        return us({ app: { sources } });
      },
      updateOrganisations: (organisations: IOrganisation[]) => {
        const state = us() as Partial<IAppModel>;
        if (state) {
          const isNew = !state.app?.organisations || state.app.organisations.length === 0;
          appStateMgmt.effects.saveOrganisations(organisations, isNew);
        }
        return us({ app: { organisations } });
      },
      updateFilter: (filter?: string) => us({ app: { filter } }),
    } as IActions;
  },
  effects: {
    loadDatasources: async () => {
      console.log('Loading datasources');
      const result = (await crudService.load('sources')) as any;
      if (!result) {
        return;
      }
      const { sources } = result;
      actions.updateDatasources(sources);
    },
    loadOrganisations: async () => {
      console.log('Loading organisations');
      const result = (await crudService.load('organisations')) as any;
      if (!result) {
        return;
      }
      const { organisations } = result;
      actions.updateOrganisations(organisations);
    },
    saveDatasources: async (sources: IDatasource[], isNew: boolean) => {
      isNew
        ? await crudService.create('sources', { sources } as Partial<ILokiObj>)
        : await crudService.update('sources', { $loki: 1, sources } as Partial<ILokiObj>);
    },
    saveOrganisations: async (organisations: IOrganisation[], isNew: boolean) => {
      isNew
        ? await crudService.create('organisations', { organisations } as Partial<ILokiObj>)
        : await crudService.update('organisations', { $loki: 1, organisations } as Partial<ILokiObj>);
    },
    // saveToLocalStorage: (h: IChemicalHazard) =>
    //   window.localStorage.setItem(sourceKey, JSON.stringify(h)),
  },
};

export interface IAppModel {
  app: Partial<{
    filter: string;
    sources: IDatasource[];
    organisations: IOrganisation[];
  }>;
}

export interface IActions {
  updateFilter: (filter?: string) => UpdateStream;
  updateDatasources: (sources: IDatasource[]) => UpdateStream;
  updateOrganisations: (organisations: IOrganisation[]) => UpdateStream;
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

appStateMgmt.effects.loadDatasources();
appStateMgmt.effects.loadOrganisations();
