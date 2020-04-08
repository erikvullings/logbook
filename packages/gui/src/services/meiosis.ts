import Stream from 'mithril/stream';
import { IOrganisation, IQuestionnaire } from '../../../shared/src';
import { AppState, IAppSettings } from '../models';
import { merge } from '../utils/mergerino';
import { crudServiceFactory } from './crud-service';

const settingsService = crudServiceFactory<IAppSettings>(AppState.apiService, 'settings');

/** Application state */
export const appStateMgmt = {
  initial: {
    app: {
      filter: '',
      questionnaires: [] as IQuestionnaire[],
      organisations: [] as IOrganisation[],
      settings: {} as IAppSettings,
    },
  },
  actions: (us: UpdateStream) => {
    return {
      updateSettings: async (appSettings: IAppSettings, save = true) => {
        const settings = save ? await appStateMgmt.effects.saveSettings(appSettings) : appSettings;
        return settings && us({ app: { settings } } as Partial<IAppModel>);
      },
      updateFilter: (filter = '') => us({ app: { filter } } as Partial<IAppModel>),
    } as IActions;
  },
  effects: {
    loadSettings: async () => {
      console.log('Loading settings');
      const settings = await settingsService.load();
      if (!settings) {
        return;
      }
      actions.updateSettings(settings, false);
    },
    saveSettings: async (settings: IAppSettings) => {
      return await settingsService.save(settings);
    },
  },
};

export interface IAppModel {
  app: {
    filter: string;
    settings: IAppSettings;
  };
}

export interface IActions {
  updateFilter: (filter?: string) => UpdateStream;
  updateSettings: (appSettings: IAppSettings, save: boolean) => Promise<UpdateStream>;
}

export type ModelUpdateFunction = Partial<IAppModel> | ((model: Partial<IAppModel>) => Partial<IAppModel>);
export type UpdateStream = Stream<ModelUpdateFunction>;

const app = {
  initial: Object.assign({}, appStateMgmt.initial),
  actions: (us: UpdateStream) => Object.assign({}, appStateMgmt.actions(us)) as IActions,
};

const update = Stream<ModelUpdateFunction>() as UpdateStream;
export const states = Stream.scan(merge, app.initial, update);
export const actions = app.actions(update);

appStateMgmt.effects.loadSettings();
