export interface AppAwsConfig {
  region: string; // The AWS region the app is deployed into.
  identityPoolId: string; // The Cognito Identity Pool ID.
  userPoolId: string; // The Cognito User Pool ID.
  userPoolClientId: string; // The client ID for the Cognito User Pool. 
  userAuditTable: string; // The DynamoDB table used for recording user login data.

}