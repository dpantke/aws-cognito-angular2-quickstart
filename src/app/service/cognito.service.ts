import { Injectable, Inject } from "@angular/core";
import { RegistrationUser } from "../public/auth/auth.component";
import { DynamoDBService } from "./ddb.service";
import { AwsUtil } from "./aws.service";
import { AppAwsConfig } from '../config/aws.iconfig';
import { APP_AWS_CONFIG } from "../config/aws.config";
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, 
         CognitoIdentityServiceProvider, AuthenticationDetails } from "amazon-cognito-identity-js";
import * as AWS from "aws-sdk/global";

export interface CognitoCallback {
    cognitoCallback(message:string, result:any):void;
}

export interface LoggedInCallback {
    isLoggedIn(message:string, loggedIn:boolean):void;
}

export interface Callback {
    callback():void;
    callbackWithParam(result:any):void;
}

@Injectable()
export class CognitoUtil {



    constructor(@Inject(APP_AWS_CONFIG) public awsConfig: AppAwsConfig) {
    }

    getUserPool() {
        var poolData = {
            UserPoolId: this.awsConfig.userPoolId,
            ClientId: this.awsConfig.userPoolClientId
        };
        return new CognitoUserPool(poolData);
    }

    getCurrentUser() {
        return this.getUserPool().getCurrentUser();
    }


    getCognitoIdentity():string {
        return (<AWS.CognitoIdentityCredentials>AWS.config.credentials).identityId;
    }

    getAccessToken(callback:Callback):void {
        if (callback == null) {
            throw("CognitoUtil: callback in getAccessToken is null...returning");
        }
        if (this.getCurrentUser() != null)
            this.getCurrentUser().getSession(function (err, session) {
                if (err) {
                    console.log("CognitoUtil: Can't set the credentials:" + err);
                    callback.callbackWithParam(null);
                }

                else {
                    if (session.isValid()) {
                        callback.callbackWithParam(session.getAccessToken().getJwtToken());
                    }
                }
            });
        else
            callback.callbackWithParam(null);
    }

    getIdToken(callback:Callback):void {
        if (callback == null) {
            throw("CognitoUtil: callback in getIdToken is null...returning");
        }
        if (this.getCurrentUser() != null)
            this.getCurrentUser().getSession(function (err, session) {
                if (err) {
                    console.log("CognitoUtil: Can't set the credentials:" + err);
                    callback.callbackWithParam(null);
                }
                else {
                    if (session.isValid()) {
                        callback.callbackWithParam(session.getIdToken().getJwtToken());
                    } else {
                        console.log("CognitoUtil: Got the id token, but the session isn't valid");
                    }
                }
            });
        else
            callback.callbackWithParam(null);
    }

    getRefreshToken(callback:Callback):void {
        if (callback == null) {
            throw("CognitoUtil: callback in getRefreshToken is null...returning");
        }
        if (this.getCurrentUser() != null)
            this.getCurrentUser().getSession(function (err, session) {
                if (err) {
                    console.log("CognitoUtil: Can't set the credentials:" + err);
                    callback.callbackWithParam(null);
                }

                else {
                    if (session.isValid()) {
                        callback.callbackWithParam(session.getRefreshToken());
                    }
                }
            });
        else
            callback.callbackWithParam(null);
    }

    refresh():void {
        this.getCurrentUser().getSession(function (err, session) {
            if (err) {
                console.log("CognitoUtil: Can't set the credentials:" + err);
            }

            else {
                if (session.isValid()) {
                    console.log("CognitoUtil: refresshed successfully");
                } else {
                    console.log("CognitoUtil: refresshed but session is still not valid");
                }
            }
        });
    }
}

@Injectable()
export class UserRegistrationService {

    constructor(@Inject(CognitoUtil) public cognitoUtil:CognitoUtil) {

    }

    register(user:RegistrationUser, callback:CognitoCallback):void {
        console.log("UserRegistrationService: user is " + user);

        let attributeList = [];

        let dataEmail = {
            Name: 'email',
            Value: user.email
        };
        let dataNickname = {
            Name: 'nickname',
            Value: user.name
        };
        attributeList.push(new CognitoUserAttribute(dataEmail));
        attributeList.push(new CognitoUserAttribute(dataNickname));

        this.cognitoUtil.getUserPool().signUp(user.email, user.password, attributeList, null, function (err, result) {
            if (err) {
                callback.cognitoCallback(err.message, null);
            } else {
                console.log("UserRegistrationService: registered user is " + result);
                callback.cognitoCallback(null, result);
            }
        });

    }

    confirmRegistration(username:string, confirmationCode:string, callback:CognitoCallback):void {

        let userData = {
            Username: username,
            Pool: this.cognitoUtil.getUserPool()
        };

        let cognitoUser = new CognitoUser(userData);

        cognitoUser.confirmRegistration(confirmationCode, true, function (err, result) {
            if (err) {
                callback.cognitoCallback(err.message, null);
            } else {
                callback.cognitoCallback(null, result);
            }
        });
    }

    resendCode(username:string, callback:CognitoCallback):void {
        let userData = {
            Username: username,
            Pool: this.cognitoUtil.getUserPool()
        };

        let cognitoUser = new CognitoUser(userData);

        cognitoUser.resendConfirmationCode(function (err, result) {
            if (err) {
                callback.cognitoCallback(err.message, null);
            } else {
                callback.cognitoCallback(null, result);
            }
        });
    }

}

@Injectable()
export class UserLoginService {

    constructor(public ddb:DynamoDBService, public cognitoUtil:CognitoUtil) {
    }

    authenticate(username:string, password:string, callback:CognitoCallback) {
        console.log("UserLoginService: starting the authentication")

        let authenticationData = {
            Username: username,
            Password: password,
        };
        let authenticationDetails = new AuthenticationDetails(authenticationData);

        let userData = {
            Username: username,
            Pool: this.cognitoUtil.getUserPool()
        };

        let loginID = 'cognito-idp.us-east-1.amazonaws.com/' + this.cognitoUtil.awsConfig.userPoolId
        let identityPoolId = this.cognitoUtil.awsConfig.identityPoolId

        console.log("UserLoginService: Params set...Authenticating the user");
        let cognitoUser = new CognitoUser(userData);
        console.log("Before Authenticating User...",AWS.config.credentials);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {

                // Add the User's Id Token to the Cognito credentials login map.

                console.log("Before Setting Credentials... - ", AWS.config.credentials);
                
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: identityPoolId,
                    Logins: {
                       [loginID] : result.getIdToken().getJwtToken()
                    }
                });

                console.log("UserLoginService: set the AWS credentials - ",AWS.config.credentials);
                callback.cognitoCallback(null, result);
            },
            onFailure: function (err) {
                console.log("Authentication failed, error is" + err);
                callback.cognitoCallback(err.message, null);
            },
        });
    }

    forgotPassword(username:string, callback:CognitoCallback) {
        let userData = {
            Username: username,
            Pool: this.cognitoUtil.getUserPool()
        };

        let cognitoUser = new CognitoUser(userData);

        cognitoUser.forgotPassword({
            onSuccess: function (result) {

            },
            onFailure: function (err) {
                callback.cognitoCallback(err.message, null);
            },
            inputVerificationCode() {
                callback.cognitoCallback(null, null);
            }
        });
    }

    confirmNewPassword(email:string, verificationCode:string, password:string, callback:CognitoCallback) {
        let userData = {
            Username: email,
            Pool: this.cognitoUtil.getUserPool()
        };

        let cognitoUser = new CognitoUser(userData);

        cognitoUser.confirmPassword(verificationCode, password, {
            onSuccess: function (result) {
                callback.cognitoCallback(null, result);
            },
            onFailure: function (err) {
                callback.cognitoCallback(err.message, null);
            }
        });
    }

    logout() {
        console.log("UserLoginService: Logging out");
        this.ddb.writeLogEntry("logout");
        this.cognitoUtil.getCurrentUser().signOut();

    }

    isAuthenticated(callback:LoggedInCallback) {
        if (callback == null)
            throw("UserLoginService: Callback in isAuthenticated() cannot be null");

        let cognitoUser = this.cognitoUtil.getCurrentUser();

        if (cognitoUser != null) {
            cognitoUser.getSession(function (err, session) {
                if (err) {
                    console.log("UserLoginService: Couldn't get the session: " + err, err.stack);
                    callback.isLoggedIn(err, false);
                }
                else {
                    console.log("UserLoginService: Session is " + session.isValid());
                    callback.isLoggedIn(err, session.isValid());
                }
            });
        } else {
            console.log("UserLoginService: can't retrieve the current user");
            callback.isLoggedIn("Can't retrieve the CurrentUser", false);
        }
    }

}

@Injectable()
export class UserParametersService {

    constructor(public cognitoUtil:CognitoUtil) {
    }

    getParameters(callback:Callback) {
        let cognitoUser = this.cognitoUtil.getCurrentUser();

        if (cognitoUser != null) {
            cognitoUser.getSession(function (err, session) {
                if (err)
                    console.log("UserParametersService: Couldn't retrieve the user");
                else {
                    cognitoUser.getUserAttributes(function (err, result) {
                        if (err) {
                            console.log("UserParametersService: in getParameters: " + err);
                        } else {
                            callback.callbackWithParam(result);
                        }
                    });
                }

            });
        } else {
            callback.callbackWithParam(null);
        }


    }
}
