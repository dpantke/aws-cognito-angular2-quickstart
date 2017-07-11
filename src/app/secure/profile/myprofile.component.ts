import {Component} from "@angular/core";
import {UserLoginService} from "../../service/user-login.service";
import {LoggedInCallback} from "../../service/cognito.service";
import {UserParametersService} from "../../service/user-parameters.service";
import {UserParameter} from "../../shared/user-parameter";
import 'rxjs/add/operator/concat';
import {Router} from "@angular/router";
import * as AWS from "aws-sdk/global";

@Component({
    selector: 'awscognito-angular2-app',
    templateUrl: './myprofile.html'
})
export class MyProfileComponent implements LoggedInCallback {

    public parameters: Array<UserParameter> = [];

    constructor(public router: Router, public userService: UserLoginService, public userParams: UserParametersService) {
        this.userService.isAuthenticated(this);
        console.log("In MyProfileComponent");
    }

    isLoggedIn(message: string, isLoggedIn: boolean) {
        if (!isLoggedIn) {
            this.router.navigate(['/home/login']);
        } else {
            this.userParams.getParameters().concat(this.userParams.getIdentityIdAsParam()).subscribe(
                result =>  this.parameters.push(result)
            );
        }
    }
}
