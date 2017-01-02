import {Injectable, Inject} from "@angular/core";
import {CognitoUtil, Callback} from "./cognito.service";
import { AppAwsConfig } from "../config/aws.iconfig";
import { APP_AWS_CONFIG, APP_AWS_DI_CONFIG } from "../config/aws.config";

declare var AWS:any;
declare var AMA:any;

@Injectable()
export class AwsUtil {
    public static firstLogin:boolean = false;
    public static runningInit:boolean = false;

    constructor(@Inject(APP_AWS_CONFIG) public awsConfig: AppAwsConfig) {
        AWS.config.region = awsConfig.region;
        this.awsConfig = awsConfig;
    }

    /**
     * This is the method that needs to be called in order to init the aws global creds
     */
    initAwsService(callback:Callback, isLoggedIn:boolean, idToken:string) {

        if (AwsUtil.runningInit) {
            // Need to make sure I don't get into an infinite loop here, so need to exit if this method is running already
            console.log("AwsUtil: Aborting running initAwsService()...it's running already.");
            // instead of aborting here, it's best to put a timer
            if (callback != null) {
                callback.callback();
                callback.callbackWithParam(null);
            }
            return;
        }


        console.log("AwsUtil: Running initAwsService()");
        AwsUtil.runningInit = true;


        let mythis = this;
        // First check if the user is authenticated already
        if (isLoggedIn)
            mythis.setupAWS(isLoggedIn, callback, idToken);

    }


    /**
     * Sets up the AWS global params
     *
     * @param isLoggedIn
     * @param callback
     */
    setupAWS(isLoggedIn:boolean, callback:Callback, idToken:string):void {
        console.log("AwsUtil: in setupAWS()");
        if (isLoggedIn) {
            console.log("AwsUtil: User is logged in");
            // Setup mobile analytics
            var options = {
                appId: '32673c035a0b40e99d6e1f327be0cb60',
                appTitle: "aws-cognito-angular2-quickstart"
            };

            var mobileAnalyticsClient = new AMA.Manager(options);
            mobileAnalyticsClient.submitEvents();

            this.addCognitoCredentials(idToken);

            console.log("AwsUtil: Retrieving the id token");

        }
        else {
            console.log("AwsUtil: User is not logged in");
        }

        if (callback != null) {
            callback.callback();
            callback.callbackWithParam(null);
        }

        AwsUtil.runningInit = false;
    }

    addCognitoCredentials(idTokenJwt:string):void {
        let params = AwsUtil.getCognitoParametersForIdConsolidation(idTokenJwt);

        AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);

        AWS.config.credentials.get(function (err) {
            if (!err) {
                // var id = AWS.config.credentials.identityId;
                if (AwsUtil.firstLogin) {
                    // save the login info to DDB
                    this.ddb.writeLogEntry("login");
                    AwsUtil.firstLogin = false;
                }
            }
        });
    }

    static getCognitoParametersForIdConsolidation(idTokenJwt:string):{} {
        // Hack to get config, need to refactor.
        console.log("AwsUtil: enter getCognitoParametersForIdConsolidation()");
        let url = 'cognito-idp.' + APP_AWS_DI_CONFIG.region.toLowerCase() + '.amazonaws.com/' + APP_AWS_DI_CONFIG.userPoolId;
        let logins:Array<string> = [];
        logins[url] = idTokenJwt;
        let params = {
            IdentityPoolId: APP_AWS_DI_CONFIG.identityPoolId, /* required */
            Logins: logins
        };

        return params;
    }

}
