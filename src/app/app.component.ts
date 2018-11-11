import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { Router, Route, NavigationEnd } from '@angular/router';
import { NavigationLinks, AppData } from './app.model';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'ui-jar-app',
    template: `
        <div class="top-nav-bar">
            <div class="app-title">
                <a routerLink="/">UI-jar<span>@</span></a>
            </div>
            <button class="nav-burger-btn" (click)="toggleNavigation()">
                <span>-</span>
                <span>-</span>
                <span>-</span>
            </button>
            <a href="//github.com/ui-jar/ui-jar" target="_blank" class="project-link">GitHub</a>
        </div>
        <section class="container">
            <nav [class.is-visible]="showNavigation">
                <ul>
                    <ng-container *ngFor="let linkGroup of navigationLinks">
                        <li class="groupName">{{linkGroup.groupName}}</li>
                        <li *ngFor="let link of linkGroup.links">
                            <a [routerLink]="link.path">{{link.title}}</a>
                        </li>
                    </ng-container>
                </ul>
            </nav>
            <main>
                <router-outlet></router-outlet>
            </main>
        </section>
    `
})
export class AppComponent implements OnInit, OnDestroy {
    navigationLinks: NavigationLinks[];
    showNavigation: boolean = false;
    routerEventSubscription: Subscription;

    constructor(@Inject('AppData') private appData: AppData,
                private router: Router) {
        this.navigationLinks = appData.navigationLinks;
        this.resetRouteConfigWithPrefixedUrls();
    }

    ngOnInit(): void {
        this.routerEventSubscription = this.router.events.subscribe((event) => {
            if(event instanceof NavigationEnd) {
                this.showNavigation = false;
            }
        });
    }

    ngOnDestroy(): void {
        this.routerEventSubscription.unsubscribe();
    }

    get currentRouteConfig() {
        let clonedRouteConfig = [];
        this.router.config.forEach((route: Route) => {
            clonedRouteConfig.push({ ...route });
        });

        return clonedRouteConfig;
    }

    private resetRouteConfigWithPrefixedUrls() {
        const urlPrefixedRouteConfig = this.addUrlPrefixToAllRoutes(this.currentRouteConfig);
        this.router.resetConfig(urlPrefixedRouteConfig);
        this.router.initialNavigation();
    }

    private addUrlPrefixToAllRoutes(currentRouteConfig: Route[]): Route[] {
        currentRouteConfig.forEach((route: Route) => {
            if(this.appData.urlPrefix) {
                route.path = route.path !== '' ? this.appData.urlPrefix +'/'+ route.path : this.appData.urlPrefix;
            }
        });

        return currentRouteConfig;
    }

    toggleNavigation() {
        this.showNavigation = !this.showNavigation;
    }
}