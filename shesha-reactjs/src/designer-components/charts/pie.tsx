import { ConfigurableFormItem } from '@/components';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IToolboxComponent } from '@/interfaces';
import { PieChartOutlined } from '@ant-design/icons';
import React from 'react';
import ChartDataProvider from '../../providers/chartData';
import ChartControl from './chartControl';
import ChartControlURL from './chartControlURL';
import { IChartProps } from './model';
import { getSettings } from './settingsFormIndividual';
import { defaultConfigFiller, filterNonNull } from './utils';

const PieChartComponent: IToolboxComponent<IChartProps> = {
  type: 'pieChart',
  name: 'Pie Chart',
  isInput: false,
  isOutput: true,
  icon: <PieChartOutlined />,
  Factory: ({ model }) => {
    if (model.hidden) return null;
    
    return (
      <ConfigurableFormItem model={model}>
        {() => {
          return (
            <ChartDataProvider>
              {model.dataMode === 'url' ? <ChartControlURL {...model} /> : <ChartControl {...model} chartType='pie' />}
            </ChartDataProvider>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) => m
    .add<IChartProps>(0, prev => ({ 
      chartType: 'pie',
      showTitle: false,
      showLegend: true,
      legendPosition: 'top',
      hidden: false,
      ...prev,
     }))
    .add<IChartProps>(1, prev => ({ ...prev, hideLabel: true }))
    .add<IChartProps>(2, prev => ({ ...prev, showBorder: true }))
    .add<IChartProps>(3, prev => ({ ...prev, isDoughnut: false }))
    .add<IChartProps>(4, prev => ({ ...prev, showTitle: true }))
    .add<IChartProps>(5, prev => ({
      ...defaultConfigFiller,
      ...filterNonNull(prev),
      type: prev.type,
      id: prev.id
    }))
};

export default PieChartComponent;
