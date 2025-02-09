import { AppNames } from '@common/domain/app-names.enum';

export type ProjectVisibilityByApp = {
  [appName in AppNames]: {
    is_visible: boolean;
    fields: {
      customer: boolean;
      description: boolean;
      softwares: boolean;
      timeframe: boolean;
      links: boolean;
    };
  };
};
