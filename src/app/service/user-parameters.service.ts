import {Injectable} from "@angular/core";
import {CognitoUser, CognitoUserSession} from "amazon-cognito-identity-js";
import {CognitoSessionService} from "./cognito-session.service";
import {Callback} from "./cognito.service";
import {JwtTokens} from "../shared/jwt-tokens";

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

    getParameters(callback: Callback) {
        this.cognitoSession.getCurrentUser().then( (user:CognitoUser) => {
            if (user != null) {
                user.getSession(function (err, session) {
                    if (err)
                        console.log("UserParametersService: Couldn't retrieve the user");
                    else {
                        user.getUserAttributes(function (err, result) {
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
        });
    }
}