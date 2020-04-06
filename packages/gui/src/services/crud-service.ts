import m from 'mithril';
import { ILokiObj } from '../../../shared/src';

export const crudServiceFactory = <T extends Partial<ILokiObj>>(baseUrl: string, fragment: string) => {
  const load = async (id: number | string = 1): Promise<T | undefined> => {
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

  const loadAll = async (): Promise<T[] | undefined> => {
    const url = `${baseUrl}/${fragment}`;
    return await m.request<T[]>({
      method: 'GET',
      url,
    });
  };

  const create = async (item: T, fd?: FormData) => {
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

  const update = async (item: T, fd?: FormData) => {
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

  const deleteItem = async (id: string | number) => {
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
    save: (item: T, fd?: FormData) => {
      return item.$loki ? update(item, fd) : create(item, fd);
    },
  };
};

/*

  public save(item: T, fd?: FormData) {
    return item.$loki ? this.update(item, fd) : this.create(item, fd);
  }

*/
