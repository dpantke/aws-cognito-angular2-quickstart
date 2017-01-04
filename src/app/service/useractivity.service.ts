import { Injectable, Inject } from "@angular/core";
import { UserActivity } from "../shared/useractivity";
import { AppAwsConfig } from "../config/aws.iconfig";
import { APP_AWS_CONFIG } from "../config/aws.config";

declare var AWS:any;
declare var AWSCognito:any;

@Injectable()
export class DynamoDBService {

    constructor(@Inject(APP_AWS_CONFIG) public awsConfig: AppAwsConfig) {
        console.log("DynamoDBService: constructor");
    }

    getLogEntries(mapArray:Array<UserActivity>) {
        console.log("DynamoDBService: reading from DDB with creds - " + AWS.config.credentials);
        var params = {
            TableName: this.awsConfig.userAuditTable,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": AWS.config.credentials.params.IdentityId
            }
        };

        var docClient = new AWS.DynamoDB.DocumentClient();
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
            console.log("DynamoDBService: Writing log entry. Type:" + type + " ID: " + AWS.config.credentials.params.IdentityId + " Date: " + date);
            this.write(AWS.config.credentials.params.IdentityId, date, type);
        } catch (exc) {
            console.log("DynamoDBService: Couldn't write to DDB");
        }

    }

    write(data:string, date:string, type:string):void {
        console.log("DynamoDBService: writing " + type + " entry");
        var DDB = new AWS.DynamoDB({
            params: {TableName: this.awsConfig.userAuditTable}
        });

        // Write the item to the table
        var itemParams =
        {
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


