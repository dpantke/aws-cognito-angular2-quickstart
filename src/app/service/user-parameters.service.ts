import {Injectable} from "@angular/core";
import {CognitoUser, CognitoUserSession, CognitoUserAttribute} from "amazon-cognito-identity-js";
import {CognitoSessionService} from "./cognito-session.service";
import {Callback} from "./cognito.service";
import {JwtTokens} from "../shared/jwt-tokens";
import {Observable} from "rxjs/Observable";
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import {UserParameter} from "../shared/user-parameter";
import * as AWS from "aws-sdk/global";


@Injectable()
export class UserParametersService {

    constructor(public cognitoSession: CognitoSessionService) {
    }

    getTokens = ():Promise<JwtTokens> => {
        return this.cognitoSession.getCurrentUser().then(this.cognitoSession.getSession).then( (session:CognitoUserSession) => {
            let tokens = new JwtTokens;
            tokens.accessToken = session.getAccessToken().getJwtToken();
            tokens.idToken = session.getIdToken().getJwtToken();
            return Promise.resolve(tokens);
        })
    }

    getParameters = ():Observable<UserParameter> => {
        // Start with the session Promise and get the attributes....
        var paramPromise:Promise<CognitoUserAttribute[]> = this.cognitoSession.getCurrentUser().then(
            (user:CognitoUser):Promise<CognitoUserAttribute[]> => {
              return new Promise(function(resolve,reject){
                  user.getUserAttributes(function(err,data){
                      if(err !== null) return reject(err);
                      resolve(data);
                  });
              });
            });
        // then convert the array of hard-to-manipulate attribute objects into an easier to manage Observable stream.
        return Observable.from(paramPromise).flatMap(function(x) {
            let params = new Array<UserParameter>();
            for (let i = 0; i < x.length; i++) {
                let param = new UserParameter();
                param.name = x[i].getName();
                param.value = x[i].getValue();
                params.push(param);
            }
            return params;} );
    }

    getIdentityIdAsParam = ():Observable<UserParameter> => {
        return Observable.from(this.cognitoSession.getCreds()).map( function(x) {
            let param = new UserParameter();
            param.name = "cognito ID";
            param.value = x.identityId;
            return param;
        });
    }
}