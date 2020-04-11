import m from 'mithril';
import { SlimdownView } from 'mithril-ui-form';
import md from './informatieve-links.md';

export const AboutPage = () => ({
  view: () => m('.row', [m(SlimdownView, { md, className: 'normalized' })]),
});
