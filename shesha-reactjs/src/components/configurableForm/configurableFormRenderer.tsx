import _ from 'lodash';
import classNames from 'classnames';
import ComponentsContainer from '../formDesigner/containers/componentsContainer';
import React, {
  FC,
  PropsWithChildren,
  useMemo,
} from 'react';
import { ComponentsContainerForm } from '../formDesigner/containers/componentsContainerForm';
import { ComponentsContainerProvider } from '@/providers/form/nesting/containerContext';
import { Button, Form, Result } from 'antd';
import { ValidateErrorEntity } from '@/interfaces';
import { IConfigurableFormRendererProps } from './models';
import { ROOT_COMPONENT_KEY } from '@/providers/form/models';
import { useFormDesignerStateSelector } from '@/providers/formDesigner';
import { useSheshaApplication } from '@/providers';
import { useStyles } from './styles/styles';
import Link from 'next/link';
import { useDelayedUpdate } from '@/providers/delayedUpdateProvider';
import { useShaFormInstance } from '@/providers/form/providers/shaFormProvider';
import { ShaSpin } from '..';

export const ConfigurableFormRenderer: FC<PropsWithChildren<IConfigurableFormRendererProps>> = ({
  children,
  form,
  parentFormValues,
  initialValues,
  beforeSubmit,
  onFinish,
  onFinishFailed,
  onSubmittedFailed,
  showDataSubmitIndicator = true,
  ...props
}) => {
  const { getPayload: getDelayedUpdates } = useDelayedUpdate(false) ?? {};
  const shaForm = useShaFormInstance();
  shaForm.setDataSubmitContext({ getDelayedUpdates });
  const { styles } = useStyles();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const isDragging = useFormDesignerStateSelector(x => x.isDragging) ?? false;

  // Get form settings from state
  const formSettings = useFormDesignerStateSelector(x => x.formSettings);
  
  const onValuesChangeInternal = (_changedValues: any, values: any) => {
    shaForm.setFormData({ values: values, mergeValues: true });
  };

  const onFinishInternal = async (): Promise<void> => {
    shaForm.setValidationErrors(null);

    if (!shaForm)
      return;

    try {
      await shaForm.submitData();
    } catch (error) {
      onSubmittedFailed?.();
      shaForm.setValidationErrors(error?.data?.error || error);
      console.error('Submit failed: ', error);
    }
  };

  const onFinishFailedInternal = (errorInfo: ValidateErrorEntity) => {
    shaForm.setValidationErrors(null);
    onFinishFailed?.(errorInfo);
  };

  const mergedProps = useMemo(() => ({
    layout: props.layout ?? formSettings?.layout,
    labelCol: props.labelCol ?? formSettings?.labelCol,
    wrapperCol: props.wrapperCol ?? formSettings?.wrapperCol,
    colon: formSettings?.colon,
    size: props.size,
  }), [props.layout, props.labelCol, props.wrapperCol, props.size, formSettings]);

  if (formSettings?.access === 4 && !anyOfPermissionsGranted(formSettings?.permissions || [])) {
    return (
      <Result
        status="403"
        style={{ height: '100vh - 55px' }}
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary">
            <Link href={'/'}>
              Back Home
            </Link>
          </Button>
        }
      />
    );
  }

  const { dataSubmitState } = shaForm ?? {};

  return (
    <ComponentsContainerProvider ContainerComponent={ComponentsContainerForm}>
      <ShaSpin spinning={showDataSubmitIndicator && dataSubmitState?.status === 'loading'} tip="Saving data...">
        <Form
          key={`form-${mergedProps}`} // Force re-render when settings change
          form={form}
          labelWrap
          onFinish={onFinishInternal}
          onFinishFailed={onFinishFailedInternal}
          onValuesChange={onValuesChangeInternal}
          initialValues={initialValues}
          className={classNames(styles.shaForm, { 'sha-dragging': isDragging }, props.className)}
          {...mergedProps}
          data-sha-form-id={shaForm.form.id}
          data-sha-form-name={`${shaForm.form.module}/${shaForm.form.name}`}
        >
          <ComponentsContainer 
            key={`container-${mergedProps}`} // Force re-render of components container
            containerId={ROOT_COMPONENT_KEY} 
          />
          {children}
        </Form>
      </ShaSpin>
    </ComponentsContainerProvider>
  );
};