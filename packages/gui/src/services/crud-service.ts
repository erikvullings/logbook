import m from 'mithril';
import { ILokiObj } from '../../../shared/src';

export const crudServiceFactory = <T extends Partial<ILokiObj>>(baseUrl: string) => {
  const load = async (fragment: string, id: number | string = 1): Promise<T | undefined> => {
    const url = `${baseUrl}/${fragment}/${id}`;
    const result = await m
      .request<T>({
        method: 'GET',
        url,
      })
      .catch(e => {
        console.warn(e);
        return undefined;
      });
    return result;
  };

  const loadAll = async (fragment: string): Promise<T[] | undefined> => {
    const url = `${baseUrl}/${fragment}`;
    return await m.request<T[]>({
      method: 'GET',
      url,
    });
  };

  const create = async (fragment: string, item: T, fd?: FormData) => {
    const url = `${baseUrl}/${fragment}`;
    const result = await m
      .request<T>({
        method: 'POST',
        url,
        body: fd || item,
      })
      .catch(e => console.error(e));
    return result;
  };

  const update = async (fragment: string, item: T, fd?: FormData) => {
    const url = `${baseUrl}/${fragment}/${item.$loki}`;
    const result = await m
      .request<T>({
        method: 'PUT',
        url,
        body: fd || item,
      })
      .catch(e => console.error(e));
    return result;
  };

  const deleteItem = async (fragment: string, id: string | number) => {
    const url = `${baseUrl}/${fragment}/${id}`;
    await m.request({
      method: 'DELETE',
      url,
    });
  };

  return {
    load,
    loadAll,
    create,
    update,
    delete: deleteItem,
    save: (fragment: string, item: T, fd?: FormData) => {
      return item.$loki ? update(fragment, item, fd) : create(fragment, item, fd);
    },
  };
};

/*

  public save(item: T, fd?: FormData) {
    return item.$loki ? this.update(item, fd) : this.create(item, fd);
  }

*/
