import { useGet } from '@/hooks';
import { DynamicActionsProvider, DynamicItemsEvaluationHook, FormMarkup } from '@/providers';
import React, { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useAppConfigurator } from '@/providers/appConfigurator';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator';
import { IDataSourceArguments, IWorkflowInstanceStartActionsProps } from '../model';
import { useUrlTemplates, defaultStyles } from '../utils';
import { getSettings } from './urlSettings';

const settingsMarkup = getSettings() as FormMarkup;

const useUrlActions: DynamicItemsEvaluationHook<IDataSourceArguments> = ({ item, settings }) => {
  const { actionConfiguration, labelProperty, tooltipProperty, buttonType: buttonTypeSetting } = settings ?? {};
  const { refetch } = useGet({ path: '', lazy: true });
  const { getUrlTemplateState } = useUrlTemplates(settings);
  const [data, setData] = useState(null);

  useEffect(() => {
    const templateState = getUrlTemplateState();
    if (templateState) {
      refetch(templateState).then((response) => {
        const result = Array.isArray(response.result) ? response.result : response.result.items;
        setData(result);
      });
    }
  }, [getUrlTemplateState, refetch]);


  const { configurationItemMode } = useAppConfigurator();

  const styles = defaultStyles(item);

  const operations = useMemo<ButtonGroupItemProps[]>(() => {
    if (!data) return [];
    const result = data?.map((p) => ({
      id: p.id,
      name: p.name,
      label: p[`${labelProperty}`] ?? 'Not Configured Properly',
      tooltip: p[`${tooltipProperty}`],
      itemType: 'item',
      itemSubType: 'button',
      sortOrder: 0,
      dynamicItem: p,
      buttonType: item.buttonType ?? buttonTypeSetting,
      ...styles,
      actionConfiguration: actionConfiguration,
    }));

    return result;
  }, [item, data, configurationItemMode]);

  return operations;
};

export const UrlActions: FC<PropsWithChildren<IWorkflowInstanceStartActionsProps>> = ({ children }) => {
  return (
    <DynamicActionsProvider
      id="Url"
      name="Url"
      useEvaluator={useUrlActions}
      hasArguments={true}
      settingsFormMarkup={settingsMarkup}
    >
      {children}
    </DynamicActionsProvider>
  );
};
