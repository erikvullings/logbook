import { Form, padLeft } from 'mithril-ui-form';
import {} from '../../../shared/src';

const convertTime = /[\d-]* (\d{2}):(\d{2})/gm;

const transform = (dir: 'from' | 'to', v: string | Date) => {
  if (dir === 'from') {
    const m = convertTime.exec(v as string);
    if (m) {
      const d = new Date();
      d.setHours(+m[1], +m[2]);
      return d;
    }
    return new Date();
  } else {
    const d = v as Date;
    return `${padLeft(d.getDate())}-${padLeft(d.getMonth() + 1)}-${d.getFullYear()} ${padLeft(d.getHours())}:${padLeft(
      d.getMinutes()
    )}`;
  }
};

export const formGenerator = (): Form => {
  // if (source.scenario.quantity > 0 && source.scenario.release_rate > 0) {
  //   source.scenario.release_rate = 0;
  // }
  return [
    { id: 'source', type: 'section' },
    {
      id: 'scenario',
      label: '##### Scenario',
      className: 'col s12',
      type: [
        {
          id: 'id',
          label: 'Name',
          type: 'text',
          className: 'col m6',
        },
        {
          id: 'start_of_release',
          label: 'Start of release',
          type: 'time',
          className: 'col m6',
          transform,
        },
        { type: 'md', value: '###### Specify source', className: 'col s12' },
        {
          id: 'useQuantity',
          type: 'checkbox',
          label: 'Quantity',
          value: true,
          className: 'col m6',
        },
        {
          id: 'useChemical',
          type: 'checkbox',
          label: 'Chemical',
          className: 'col m6',
        },
        {
          id: 'quantity',
          show: 'useQuantity=true',
          label: 'Quantity',
          type: 'number',
          className: 'col m6',
          min: 1,
          max: 1000000,
          // required: source.extended?.useQuantity,
        },
        {
          id: 'release_rate',
          show: ['useQuantity=false', '!useQuantity'],
          label: 'Release rate',
          type: 'number',
          className: 'col m6',
          min: 0,
          max: 1000,
        },
        {
          id: 'duration',
          show: ['useQuantity=false', '!useQuantity'],
          label: 'Duration [s]',
          type: 'number',
          className: 'col m6',
        },
        {
          id: 'initial_size',
          label: 'Initial size [m]',
          type: 'number',
          className: 'col m6',
          min: 0.1,
          max: 20,
          required: true,
        },
        {
          id: 'chemical',
          show: 'useChemical=true',
          label: 'Chemical',
          type: 'select',
          options: [{ id: 'none' }, { id: 'phosgene' }, { id: 'chemicalA' }, { id: 'chemicalB' }],
        },
        {
          id: 'output',
          label: 'Output',
          type: 'select',
          value: 'template',
          className: 'col m6',
          options: [{ id: 'template' }, { id: 'contours' }, { id: 'trajectories' }],
        },
        {
          id: 'toxicity',
          show: ['useChemical=false', '!useChemical'],
          label: 'Toxicity',
          type: 'select',
          value: 'medium',
          className: 'col m6',
          options: [
            { id: 'verylow', label: 'Very low' },
            { id: 'low' },
            { id: 'medium' },
            { id: 'high' },
            { id: 'veryhigh', label: 'Very high' },
          ],
        },
        { type: 'md', value: '###### Wind', className: 'col s12' },
        {
          id: 'windspeed',
          label: 'Wind speed',
          type: 'number',
          className: 'col s12 m6',
          required: true,
        },
        {
          id: 'winddirection',
          label: 'Wind direction',
          type: 'number',
          className: 'col s12 m6',
          required: true,
        },
        {
          id: 'pasquill_class',
          label: 'Pasquill class',
          type: 'select',
          options: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }, { id: 'E' }, { id: 'F' }],
          required: true,
          className: 'col s12 m6',
        },
        {
          id: 'roughness_length',
          label: 'Roughness length',
          type: 'number',
          min: 0.1,
          max: 10,
          required: true,
          className: 'col s12 m6',
        },
      ],
    },
    { id: 'settings', type: 'section' },
    {
      id: 'control_parameters',
      label: '##### Control parameters',
      className: 'col s12',
      type: [
        {
          id: 'max_dist',
          label: 'Max distance',
          type: 'number',
        },
        {
          id: 'z',
          type: 'number',
        },
        {
          id: 'cell_size',
          label: 'Cell size',
          type: 'number',
        },
        {
          id: 'time_of_interest',
          label: 'Time of interest',
          type: 'number',
        },
        {
          id: 'comment',
          label: 'Comment',
          type: 'textarea',
        },
      ],
    },
    {
      id: 'scenario',
      type: [
        {
          type: 'md',
          value: '###### Source offset in meter',
          className: 'col s12',
        },
        {
          id: 'offset_x',
          label: 'X',
          type: 'number',
          className: 'col s4',
        },
        {
          id: 'offset_y',
          label: 'Y',
          type: 'number',
          className: 'col s4',
        },
        {
          id: 'offset_z',
          label: 'Z',
          type: 'number',
          className: 'col s4',
        },
      ],
    },
  ] as Form;
};
