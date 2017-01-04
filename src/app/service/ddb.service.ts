import {Injectable, Inject } from "@angular/core";
import { UserActivity } from "../shared/useractivity";
import { AppAwsConfig } from "../config/aws.iconfig";
import { APP_AWS_CONFIG } from "../config/aws.config";
import { AwsUtil } from "./aws.service";
import * as CognitoIdentity from "aws-sdk/clients/cognitoidentity"; 
import * as AWS from "aws-sdk/global";
import * as DynamoDB from "aws-sdk/clients/dynamodb";

@Injectable()
export class DynamoDBService {

    constructor(@Inject(APP_AWS_CONFIG) public awsConfig: AppAwsConfig, public awsUtil:AwsUtil ) {
        console.log("DynamoDBService: constructor");
    }

    getLogEntries(mapArray:Array<UserActivity>) {
        console.log("DynamoDBService: AWS config is: ", AWS.config );
        var params = {
            TableName: this.awsConfig.userAuditTable,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": this.awsUtil.getCognitoCreds().identityId
            }
        };

        var docClient = new DynamoDB.DocumentClient();
        docClient.query(params, onQuery);

        function onQuery(err, data) {
            if (err) {
                console.error("DynamoDBService: Unable to query the table. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                // print all the movies
                console.log("DynamoDBService: Query succeeded.");
                data.Items.forEach(function (logitem) {
                    mapArray.push({userId: null, type: logitem.type, date: logitem.activityDate});
                });
            }
        }
    }

    writeLogEntry(type:string) {
        try {
            let date = new Date().toString();
            console.log("DynamoDBService: Writing log entry. Type:" + type + " ID: " + this.awsUtil.getCognitoCreds().identityId + " Date: " + date);
            this.write(this.awsUtil.getCognitoCreds().identityId, date, type);
        } catch (exc) {
            console.log("DynamoDBService: Couldn't write to DDB");
        }

    }

    write(data:string, date:string, type:string):void {
        console.log("DynamoDBService: writing " + type + " entry");
        var DDB = new DynamoDB({
            params: {TableName: this.awsConfig.userAuditTable}
        });

        // Write the item to the table
        var itemParams =
        {
            TableName: this.awsConfig.userAuditTable,
            Item: {
                userId: {S: data},
                activityDate: {S: date},
                type: {S: type}
            }
        };
        console.log("Calling putItem with params " + JSON.stringify(itemParams));
        DDB.putItem(itemParams, function (err, data) {
            if (err) console.log("DynamoDBService: ",err, err.stack); // an error occurred
            else     console.log("DynamoDBService: wrote entry: ", data);           // successful response
        });
    }

}


