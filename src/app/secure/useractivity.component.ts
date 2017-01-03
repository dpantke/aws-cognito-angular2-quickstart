import {Component} from "@angular/core";
import {LoggedInCallback, UserLoginService} from "../service/cognito.service";
import { UserActivity } from "../shared/useractivity";
import {Router} from "@angular/router";
import {DynamoDBService} from "../service/ddb.service";


@Component({
    selector: 'awscognito-angular2-app',
    templateUrl: './useractivity.html'
})
export class UseractivityComponent implements LoggedInCallback {

    public logdata:Array<UserActivity> = [];

    constructor(public router:Router, public ddb:DynamoDBService, public userService:UserLoginService) {
        this.userService.isAuthenticated(this);
        console.log("in UseractivityComponent");
    }

    isLoggedIn(message:string, isLoggedIn:boolean) {
        if (!isLoggedIn) {
            this.router.navigate(['/home/login']);
        } else {
            console.log("scanning DDB");
            this.ddb.getLogEntries(this.logdata);
        }
    }

}
