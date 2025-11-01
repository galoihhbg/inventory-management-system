import { useTranslation } from 'react-i18next';
import { notification } from 'antd';

export function useErrorHandler() {
  const { t } = useTranslation();

  const handleError = (error: any, operation?: string) => {
    const errorMessage = error?.response?.data?.message || error?.message || t('common.error');
    
    let title: string;
    switch (operation) {
      case 'create':
        title = t('api.createFailed');
        break;
      case 'update':
        title = t('api.updateFailed');
        break;
      case 'delete':
        title = t('api.deleteFailed');
        break;
      case 'fetch':
        title = t('api.fetchFailed');
        break;
      default:
        title = t('api.operationFailed');
    }

    notification.error({
      message: title,
      description: errorMessage
    });
  };

  const handleSuccess = (operation?: string) => {
    let message: string;
    switch (operation) {
      case 'create':
        message = t('api.createSuccess');
        break;
      case 'update':
        message = t('api.updateSuccess');
        break;
      case 'delete':
        message = t('api.deleteSuccess');
        break;
      default:
        message = t('common.success');
    }

    notification.success({
      message
    });
  };

  return { handleError, handleSuccess };
}