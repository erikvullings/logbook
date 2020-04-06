import m from 'mithril';
import { ILokiObj } from '../../../shared/src';

export interface ICrudService<T> {
  load: (id?: string | number) => Promise<T | undefined>;
  loadAll: (filter?: string) => Promise<T[] | undefined>;
  create: (item: T, fd?: FormData | undefined) => Promise<T | undefined>;
  update: (item: T, fd?: FormData | undefined) => Promise<T | undefined>;
  delete: (id: string | number) => Promise<undefined>;
  save: (item: T, fd?: FormData | undefined) => Promise<T | undefined>;
}

export const crudServiceFactory = <T extends Partial<ILokiObj>>(baseUrl: string, fragment: string) => {
  const url = `${baseUrl}/${fragment}`;

  const load = async (id: number | string = 1): Promise<T | undefined> => {
    const urlId = `${url}/${id}`;
    const result = await m
      .request<T>({
        method: 'GET',
        url: urlId,
      })
      .catch(e => {
        console.warn(e);
        return undefined;
      });
    return result;
  };

  const loadAll = async (filter?: string): Promise<T[] | undefined> => {
    const result = await m
      .request<T[]>({
        method: 'GET',
        url: filter ? `${url}/${filter}` : url,
      })
      .catch(e => console.error(e));
    if (!result) {
      console.warn('No result found at ' + url);
      return [];
    }
    return result;
  };

  const create = async (item: T, fd?: FormData) => {
    const result = await m
      .request<T>({
        method: 'POST',
        url,
        body: fd || item,
      })
      .catch(e => console.error(e));
    return result;
  };

  const update = async (item: T, fd?: FormData) => {
    const urlId = `${url}/${item.$loki}`;
    const result = await m
      .request<T>({
        method: 'PUT',
        url: urlId,
        body: fd || item,
      })
      .catch(e => console.error(e));
    return result;
  };

  const deleteItem = async (id: string | number) => {
    const urlId = `${url}/${id}`;
    await m.request({
      method: 'DELETE',
      url: urlId,
    });
  };

  return {
    load,
    loadAll,
    create,
    update,
    delete: deleteItem,
    save: (item: T, fd?: FormData) => {
      return item.$loki ? update(item, fd) : create(item, fd);
    },
  } as ICrudService<T>;
};

/*

  public save(item: T, fd?: FormData) {
    return item.$loki ? this.update(item, fd) : this.create(item, fd);
  }

*/
