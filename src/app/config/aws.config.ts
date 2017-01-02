import { OpaqueToken } from '@angular/core';
import { AppAwsConfig } from './aws.iconfig';

export let APP_AWS_CONFIG = new OpaqueToken('aws.app.config');

export const APP_AWS_DI_CONFIG: AppAwsConfig = {
  region: 'us-east-1',
  identityPoolId: 'us-east-1:fbe0340f-9ffc-4449-a935-bb6a6661fd53',
  userPoolClientId: 'hh5ibv67so0qukt55c5ulaltk',
  userPoolId: 'us-east-1_PGSbCVZ7S',
  userAuditTable: 'LoginTrail'
};