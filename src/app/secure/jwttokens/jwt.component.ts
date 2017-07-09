import {Component} from "@angular/core";
import {UserLoginService} from "../../service/user-login.service";
import {Callback, LoggedInCallback} from "../../service/cognito.service";
import {UserParametersService} from "../../service/user-parameters.service";
import {JwtTokens} from "../../shared/jwt-tokens";
import {Router} from "@angular/router";

@Component({
    selector: 'awscognito-angular2-app',
    templateUrl: './jwt.html'
})
export class JwtComponent implements LoggedInCallback {

    public tokens: JwtTokens = new JwtTokens();

    constructor(public router: Router, public userService: UserLoginService, public paramsService: UserParametersService ) {
        this.userService.isAuthenticated(this);
        console.log("in JwtComponent");
    }

    isLoggedIn(message: string, isLoggedIn: boolean) {
        if (!isLoggedIn) {
            this.router.navigate(['/home/login']);
        } else {
           this.paramsService.getTokens().then( (jwtTokens:JwtTokens) => {
               this.tokens = jwtTokens;
           })
        }
    }
}