// Typings reference file, see links for more information
// https://github.com/typings/typings
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html

declare var System: any;


declare module "amazon-cognito-identity-js" {

  import { CognitoIdentity } from "aws-sdk";

  export interface AuthenticationDetailsData {
    Username: string;
    Password: string;
  }

  export class AuthenticationDetails {
    constructor(data: AuthenticationDetailsData);

    public getUsername(): string;
    public getPassword(): string;
    public getValidationData(): any[];
  }

  export interface CognitoUserData {
    Username: string;
    Pool: CognitoUserPool;
  }

  export class CognitoUser {
    constructor(data: CognitoUserData);

    public getSignInUserSession(): CognitoUserSession;
    public getUsername(): string;

    public getAuthenticationFlowType(): string;
    public setAuthenticationFlowType(authenticationFlowType: string): string;

    public getSession(callback: Function): void;
    public authenticateUser(params: any, callbacks: any): void;
    public confirmRegistration(code: string, somethingWhichIsTrue: boolean, callback: (err: any, result: any) => void): void;
    public resendConfirmationCode(callback: Function): void;
    public forgotPassword(callbacks: any ): void;
    public getUserAttributes(callback: Function): void;
    public signOut(): void;
    public confirmPassword(confirmationCode: string, newPassword: string, callbacks: any ): void;

  }

  export interface CognitoUserAttributeData {
    Name: string;
    Value: string;
  }

  export class CognitoUserAttribute {
    constructor(data: CognitoUserAttributeData);

    public getValue(): string;
    public setValue(value: string): CognitoUserAttribute;
    public getName(): string;
    public setName(name: string): CognitoUserAttribute;
    public toString(): string;
    public toJSON(): Object;
  }

  export interface CognitoUserPoolData {
    UserPoolId: string;
    ClientId: string;
    Paranoia?: number;
  }

  export class CognitoUserPool {
    constructor(data: CognitoUserPoolData);

    public getUserPoolId(): string;
    public getClientId(): string;
    public getParanoia(): number

    public setParanoia(paranoia: number): void;

    public signUp(username: string, password: string, userAttributes: any[], validationData: any[], callback: (err: any, result: any) => void): void;

    public getCurrentUser(): CognitoUser;
  }

  export interface CognitoUserSessionData {
    IdToken: string;
    AccessToken: string;
    RefreshToken?: string;
  }

  export class CognitoUserSession {
    constructor(data: CognitoUserSessionData);

    public getIdToken(): CognitoIdToken;
    public getRefreshToken(): CognitoRefreshToken;
    public getAccessToken(): CognitoAccessToken;
    public isValid(): boolean;
  }

  export class CognitoIdentityServiceProvider {
    public config: CognitoIdentity.ClientConfiguration;
  }

  export class CognitoAccessToken {
    constructor(accessToken: string);

    getJwtToken(): string;
    getExpiration(): number;
  }

  export class CognitoIdToken {
    constructor(idToken: string);

    getJwtToken(): string;
    getExpiration(): number;
  }

  export class CognitoRefreshToken {
    constructor(refreshToken: string);

    getJwtToken(): string;
    getExpiration(): number;
  }
}
