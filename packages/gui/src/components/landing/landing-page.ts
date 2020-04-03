import m from 'mithril';
import { Button, Icon } from 'mithril-materialized';
import { SlimdownView } from 'mithril-ui-form';
import background from '../../assets/background.png';
import logo from '../../assets/logbook.svg';
import { Dashboards, dashboardSvc } from '../../services/dashboard-service';

export const LandingPage = () => ({
  view: () => [
    m('.row', [
      m(
        'nav',
        m('.nav-wrapper', { style: 'height: 70px;' }, [
          m('.logo', m('.wrapper', m(`img.left[height=45][src=${logo}][alt=LOCC Monitor]`, { style: 'margin: 10px' }))),
          m(
            'span.hide-on-small-only',
            { style: 'font-size: 22px; padding-top: 10px; margin: 0 0 0 10px;' },
            'LOCC Monitor'
          ),
        ]),
        m(
          '.overlay.center',
          {
            style: 'position: relative; top: 240px;',
          },
          [
            m(Button, {
              className: 'btn-large',
              label: 'START',
              iconName: 'play_arrow',
              onclick: () => dashboardSvc.switchTo(Dashboards.HOME),
            }),
          ]
        )
      ),
      m('img.materialboxed[width=400]', {
        style: 'margin: 20px auto;',
        src: background,
        oncreate: ({ dom }) => {
          M.Materialbox.init(dom);
        },
      }),
      m(
        '.section.white',
        m('.row.container.center', [
          m(SlimdownView, {
            md:
              'De LOCC Monitor heeft als doel om, tijdens een nationale crisis, de indicatoren van de crisis op een gestructureerde manier te verzamelen.',
          }),
          m('.row', [
            m(
              '.col.s12.m4',
              m('.icon-block', [
                m('.center', m(Icon, { iconName: 'edit' })),
                m('h5.center', 'Registreren van indicatoren'),
                m('p.light', 'Iedere organisatie die betrokken is bij de crisis kan zijn indicatoren hier delen.'),
              ])
            ),
            m(
              '.col.s12.m4',
              m('.icon-block', [
                m('.center', m(Icon, { iconName: 'settings' })),
                m('h5.center', 'Nieuwe vragenlijsten toevoegen'),
                m(
                  'p.light',
                  'Nieuwe vragenlijsten kunnen eenvoudig aangemaakt worden, voor één of meerdere organisaties.'
                ),
              ])
            ),
            m(
              '.col.s12.m4',
              m('.icon-block', [
                m('.center', m(Icon, { iconName: 'link' })),
                m('h5.center', 'Koppelen'),
                m(
                  'p.light',
                  'De gegevens kunnen gekoppeld worden via een REST interface, zodanig dat u uw data ook in een andere omgeving kan visualiseren of verwerken.'
                ),
              ])
            ),
          ]),
        ])
      ),
    ]),
    m(
      'footer.page-footer',
      { style: 'height: 61px; padding: 5px 0;' },
      m(
        '.container.center-align',
        m('.clearfix', [m('.white-text', 'Ministerie van Justitie en Veiligheid'), m('.white-text', '3 april 2020')])
      )
    ),
  ],
});
