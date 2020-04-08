import m, { FactoryComponent } from 'mithril';
import { Collection, CollectionMode, TextInput } from 'mithril-materialized';
import { IQuestionnaire } from '../../../../shared/src';
import { Dashboards, dashboardSvc } from '../../services/dashboard-service';
import { Auth } from '../../services/login-service';
import { IActions, IAppModel } from '../../services/meiosis';
import { CircularSpinner } from '../ui/preloader';

export const HomePage: FactoryComponent<{
  state: IAppModel;
  actions: IActions;
}> = () => {
  return {
    view: ({ attrs: { state } }) => {
      const {
        app: {
          settings: { questionnaires, organisations },
          filter,
        },
      } = state;
      if (!questionnaires) {
        return m(CircularSpinner);
      }

      const organisation = (orgId: string) => organisations?.filter(o => o.id === orgId).shift();
      const org2questionnaire = (Auth.roles || []).reduce((acc, role) => {
        acc[role] = questionnaires.filter(q => q.organisations.indexOf(role) >= 0);
        return acc;
      }, {} as { [role: string]: IQuestionnaire[] });
      // questionnaires.filter(s => Auth.matchRoles(s.organisations));
      return m('.row', [
        m('.contentarea', [
          Object.keys(org2questionnaire)
            .filter(org => org2questionnaire[org].length > 0)
            .map(org =>
              m(
                '.row',
                m(Collection, {
                  mode: CollectionMode.AVATAR,
                  header: `Vragenlijsten voor ${organisation(org)?.name}`,
                  items: org2questionnaire[org]
                    .filter(
                      s =>
                        !filter ||
                        (s.name && s.name.toLowerCase().indexOf(filter) >= 0) ||
                        (s.tags &&
                          s.tags.reduce((acc, cur) => acc || cur.toLowerCase().indexOf(filter) >= 0, false as boolean))
                    )
                    .map(s => ({
                      id: s.id,
                      title: s.name,
                      content: s.tags ? s.tags.join(', ') : undefined,
                      href: dashboardSvc.route(Dashboards.EDIT, { org, id: s.id }),
                    })),
                })
              )
            ),
        ]),
      ]);
    },
  };
};
