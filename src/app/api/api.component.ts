import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppData } from '../app.model';

@Component({
    selector: 'ui-jar-api',
    template: `
        <div *ngIf="api.properties.length > 0" class="api-table-container">
            <h2>Properties</h2>
            <table cellspacing="0">
                <thead>
                    <tr>
                        <th class="name-header">Name</th>
                        <th>Type</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let property of api.properties">
                        <td class="code-font">
                            <ng-container *ngFor="let decoratorName of property.decoratorNames">
                                <span class="decorator-highlight">{{decoratorName}}</span><br/>
                            </ng-container>
                            {{property.propertyName}}
                        </td>
                        <td class="property-type">
                            {{property.type}}
                        </td>
                        <td>
                            <p *ngIf="property.description">{{property.description}}</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div *ngIf="api.methods.length > 0" class="api-methods-container">
            <h2>Methods</h2>
            <dl>
                <ng-container *ngFor="let method of api.methods"> 
                    <dt class="code-font">
                        <ng-container *ngFor="let decoratorName of method.decoratorNames">
                        <span class="decorator-highlight">{{decoratorName}}</span><br/>
                        </ng-container>
                        {{method.methodName}}
                    </dt>
                    <dd>
                        <ng-container *ngIf="method.description">{{method.description}}</ng-container>
                    </dd>
                </ng-container>
            </dl>
        </div>
    `,
    styles: [`
        :host {
            display: -webkit-flex;
            display: flex;
            -webkit-flex-direction: column;
            flex-direction: column;
        }

        h2 {
            font-family: Arial;
            font-size: 16px;
            font-weight: bold;
            padding: 0;
            margin: 10px 0;
        }

        .api-table-container {
            margin-bottom: 30px;
        }

        .api-methods-container dt, 
        .api-methods-container dd {
            padding: 10px;
            margin: 0;
            text-align: left;
            line-height: 1.2em;
        }
        
        .api-methods-container dt {    
            border: 1px var(--border-color) solid;
            background-color: var(--items-header-background);
        }

        .api-methods-container dd {
            font-family: Arial;
            font-size: 14px;
            margin-bottom: 20px;
            border: 1px var(--border-color) solid;
        }

        table {
            width: 100%;
            border: 1px var(--border-color) solid;
            font-family: Arial;
            font-size: 14px;
        }

        table > thead {
            background-color: var(--items-header-background);
            border-color: var(--border-color);
            color: var(--items-header-color);
        }

        table td,
        table th {
            padding: 10px;
            text-align: left;
            line-height: 1.2em;
            border-color: var(--border-color);
            color: var(--items-header-color);
            border-width: 0 0 1px 1px;
            border-style: solid;
        }

        table .name-header {
            width: 300px;
        }

        .code-font {
            font-family: monospace;
        }

        .property-type {
            color: var(--text-highlight);
        }

        .decorator-highlight {
            font-size: 12px;
        }
    `]
})
export class ApiComponent implements OnInit {
    api: any;

    constructor(private activatedRoute: ActivatedRoute,
                @Inject('AppData') private appData: AppData) {}

    ngOnInit(): void {
        this.createView();
    }

    private createView() {
        this.api = this.appData.components[this.getCurrentComponentName()].api;
    }

    private getCurrentComponentName(): string {
        const lastUrlSegmentIndex = this.activatedRoute.snapshot.pathFromRoot[0].firstChild.url.length-1;
        return this.activatedRoute.snapshot.pathFromRoot[0].firstChild.url[lastUrlSegmentIndex].path;
    }
}