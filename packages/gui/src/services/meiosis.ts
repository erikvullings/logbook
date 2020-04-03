import Stream from 'mithril/stream';
import { IDatasource, ILokiObj } from '../../../shared/src';
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
    },
  },
  actions: (us: UpdateStream) => {
    return {
      updateSettings: (sources: IDatasource[]) => {
        appStateMgmt.effects.saveDatasources(sources);
        return us({ app: { sources } });
      },
      updateFilter: (filter?: string) => us({ app: { filter } }),
    };
  },
  effects: {
    loadDatasources: async () => {
      const result = (await crudService.load('sources')) as any;
      if (!result) {
        return;
      }
      const { sources } = result;
      actions.updateSettings(sources);
    },
    saveDatasources: async (sources: IDatasource[]) => {
      await crudService.save('sources', { $loki: 1, sources } as Partial<ILokiObj>);
    },
    // saveToLocalStorage: (h: IChemicalHazard) =>
    //   window.localStorage.setItem(sourceKey, JSON.stringify(h)),
  },
};

export interface IAppModel {
  app: Partial<{
    filter: string;
    sources: IDatasource[];
  }>;
}

export interface IActions {
  updateFilter: (filter?: string) => UpdateStream;
  updateSettings: (s: IDatasource[]) => UpdateStream;
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
