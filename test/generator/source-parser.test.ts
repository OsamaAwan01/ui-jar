import * as assert from 'assert';
import * as ts from 'typescript';
import { SourceParser } from '../../src/generator/source-parser';

describe('SourceParser', () => {

    describe('getProjectSourceDocumentation', () => {
        let classesWithDocs;
        let otherClasses;

        beforeEach(() => {
            const sourceFiles = [
                'foobar.component.ts',
                'foobar.module.ts',
                'foobar.component.test.ts',
                'child.component.ts',
                'parent.component.ts',
                'child-generic.component.ts',
                'parent-generic.component.ts'
            ];
            const compilerHost = getTestCompilerHostWithMockModuleAndComponent();
            const program: ts.Program = ts.createProgram([...sourceFiles],
                { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS }, compilerHost);

            const sourceParser = new SourceParser({ rootDir: './', files: sourceFiles }, program);
            const projectDocumentation = sourceParser.getProjectSourceDocumentation();
            classesWithDocs = projectDocumentation.classesWithDocs;
            otherClasses = projectDocumentation.otherClasses;
        });

        it('should parse files and return list with SourceDocs', () => {
            assert.equal(classesWithDocs.length, 3);
        });

        it('should parse and verify that SourceDocs.componentRefName is valid', () => {
            let firstSourceDoc = classesWithDocs[0];

            assert.equal(firstSourceDoc.componentRefName, 'FoobarComponent');
        });

        it('should parse and verify that SourceDocs.componentDocName is set', () => {
            let firstSourceDoc = classesWithDocs[0];

            assert.equal(firstSourceDoc.componentDocName, 'Foobar');
        });

        it('should parse and verify that SourceDocs.groupDocName is set', () => {
            let firstSourceDoc = classesWithDocs[0];

            assert.equal(firstSourceDoc.groupDocName, 'Layout');
        });

        it('should parse and verify that SourceDocs.description is set', () => {
            let firstSourceDoc = classesWithDocs[0];

            assert.equal(firstSourceDoc.description, 'It\'s possible to use <strong>html</strong> in \nthe description');
        });

        it('should parse and verify that SourceDocs.fileName is valid', () => {
            let firstSourceDoc = classesWithDocs[0];

            assert.equal(firstSourceDoc.fileName, 'foobar.component.ts');
        });

        it('should parse and verify that SourceDocs.moduleDetails is valid', () => {
            let firstSourceDoc = classesWithDocs[0];

            assert.equal(firstSourceDoc.moduleDetails.moduleRefName, 'FoobarModule');
            assert.equal(firstSourceDoc.moduleDetails.fileName, 'foobar.module.ts');
        });

        it('should parse and verify that SourceDocs.selector is valid', () => {
            let firstSourceDoc = classesWithDocs[0];

            assert.equal(firstSourceDoc.selector, 'x-foobar');
        });

        it('should parse and verify that SourceDocs.apiDetails.properties contains public component properties', () => {
            let firstSourceDoc = classesWithDocs[0];

            firstSourceDoc.apiDetails.properties.forEach((property, index) => {
                if (index === 0) {
                    assert.equal(property.propertyName, 'title');
                    assert.equal(property.type, 'string');
                } else if (index === 1) {
                    assert.equal(property.propertyName, 'options');

                    property.decoratorNames.forEach((decoratorName) => {
                        assert.equal(decoratorName, '@Input()');
                    });
                } else if (index === 2) {
                    assert.equal(property.propertyName, 'changed');

                    property.decoratorNames.forEach((decoratorName) => {
                        assert.equal(decoratorName, '@Output()');
                    });
                } else if (index === 3) {
                    assert.equal(property.propertyName, 'isSmall');

                    property.decoratorNames.forEach((decoratorName, decoratorIndex) => {
                        if (decoratorIndex === 0) {
                            assert.equal(decoratorName, '@HostBinding(\'class.small\')');
                        } else if (decoratorIndex === 1) {
                            assert.equal(decoratorName, '@Input()');
                        }
                    });
                } else if (index === 4) {
                    assert.equal(property.propertyName, 'propertyWithDescription');
                    assert.equal(property.type, 'number');
                    assert.equal(property.description, 'Description to property should be parsed');
                } else {
                    assert.equal(true, false, 'Should not be executed');
                }
            });
        });

        it('should parse and verify that SourceDocs.apiDetails.methods contains public component methods', () => {
            let firstSourceDoc = classesWithDocs[0];

            firstSourceDoc.apiDetails.methods.forEach((method, index) => {
                if (index === 0) {
                    assert.equal(method.methodName, 'publicMethod()');
                    assert.equal(method.description, '');
                } else if (index === 1) {
                    assert.equal(method.methodName, 'methodWithPublicModifierShouldBeVisibleInParse()');
                    assert.equal(method.description, '');
                } else if (index === 2) {
                    assert.equal(method.methodName, 'publicMethodWithDescription()');
                    assert.equal(method.description, 'Description to method should be parsed');
                } else {
                    assert.equal(true, false, 'Should not be executed');
                }
            });
        });

        it('should parse and verify that SourceDocs.extendClasses is valid', () => {
            const foobarComponentSourceDoc = classesWithDocs[0];
            const childComponentSourceDoc = classesWithDocs[1];
            const childGenericSourceDoc = classesWithDocs[2];
            const parentComponentSourceDoc = otherClasses[2];
            const parentGenericComponentSourceDoc = otherClasses[3];

            assert.equal(foobarComponentSourceDoc.extendClasses.length, 0, 'Should not have any extended classes');
            assert.equal(childComponentSourceDoc.extendClasses.length, 1, 'Should have one extended class');
            assert.equal(childGenericSourceDoc.extendClasses.length, 1, 'Should have one extended class');

            assert.equal(childComponentSourceDoc.extendClasses[0], 'ParentComponent');
            assert.equal(childGenericSourceDoc.extendClasses[0], 'ParentGenericComponent');

            assert.equal(parentComponentSourceDoc.componentRefName, 'ParentComponent');
            assert.equal(parentComponentSourceDoc.extendClasses.length, 1, 'Should have one extended class');
            assert.equal(parentComponentSourceDoc.extendClasses[0], 'BaseComponent');
            
            assert.equal(parentGenericComponentSourceDoc.componentRefName, 'ParentGenericComponent');
            assert.equal(parentGenericComponentSourceDoc.extendClasses.length, 0, 'Should not have any extended classes');
        });

        it('should parse and verify that SourceDocs.apiDetails.properties contains public component properties from extended component', () => {
            const secondSourceDoc = classesWithDocs[1];

            assert.equal(secondSourceDoc.apiDetails.properties.length, 5, 'Should contain public properties from both child and parent component');
            secondSourceDoc.apiDetails.properties.forEach((property, index) => {
                if (index === 0) {
                    assert.equal(property.propertyName, 'childTitle');
                    assert.equal(property.type, 'string');
                } else if (index === 1) {
                    assert.equal(property.propertyName, 'childOptions');

                    property.decoratorNames.forEach((decoratorName) => {
                        assert.equal(decoratorName, '@Input()');
                    });
                } else if (index === 2) {
                    assert.equal(property.propertyName, 'childIsSmall');

                    property.decoratorNames.forEach((decoratorName, decoratorIndex) => {
                        if (decoratorIndex === 0) {
                            assert.equal(decoratorName, '@HostBinding(\'class.small\')');
                        } else if (decoratorIndex === 1) {
                            assert.equal(decoratorName, '@Input()');
                        }
                    });
                } else if (index === 3) {
                    assert.equal(property.propertyName, 'parentTitle');
                    assert.equal(property.type, 'string');
                    assert.equal(property.description, 'Parent property description');
                } else if(index === 4) {
                    assert.equal(property.propertyName, 'baseId');
                    assert.equal(property.type, 'number');
                    assert.equal(property.description, 'Base id description');
                } else {
                    assert.equal(true, false, 'Should not be executed');
                }
            });
        });

        it('should parse and verify that SourceDocs.apiDetails.methods contains public component methods from extended component', () => {
            const secondSourceDoc = classesWithDocs[1];

            assert.equal(secondSourceDoc.apiDetails.methods.length, 5, 'Should contain public methods from both child and parent component');
            secondSourceDoc.apiDetails.methods.forEach((method, index) => {
                if (index === 0) {
                    assert.equal(method.methodName, 'publicChildMethod()');
                    assert.equal(method.description, '');
                } else if (index === 1) {
                    assert.equal(method.methodName, 'childMethodWithPublicModifierShouldBeVisibleInParse()');
                    assert.equal(method.description, 'Description to method should be parsed');
                } else if (index === 2) {
                    assert.equal(method.methodName, 'publicParentMethod()');
                    assert.equal(method.description, '');
                } else if (index === 3) {
                    assert.equal(method.methodName, 'publicParentMethodWithDescription()');
                    assert.equal(method.description, 'Parent method description');
                } else if(index === 4) {
                    assert.equal(method.methodName, 'publicBaseMethod()');
                    assert.equal(method.description, '');
                } else {
                    assert.equal(true, false, 'Should not be executed');
                }
            });
        });

        it('should parse and verify that SourceDocs.apiDetails.properties contains public component properties from extended component<T>', () => {
            const thirdSourceDoc = classesWithDocs[2];

            assert.equal(thirdSourceDoc.apiDetails.properties.length, 5, 'Should contain public properties from both child and parent component');
            thirdSourceDoc.apiDetails.properties.forEach((property, index) => {
                if (index === 0) {
                    assert.equal(property.propertyName, 'childTitle');
                    assert.equal(property.type, 'string');
                } else if (index === 1) {
                    assert.equal(property.propertyName, 'childOptions');

                    property.decoratorNames.forEach((decoratorName) => {
                        assert.equal(decoratorName, '@Input()');
                    });
                } else if (index === 2) {
                    assert.equal(property.propertyName, 'childIsSmall');

                    property.decoratorNames.forEach((decoratorName, decoratorIndex) => {
                        if (decoratorIndex === 0) {
                            assert.equal(decoratorName, '@HostBinding(\'class.small\')');
                        } else if (decoratorIndex === 1) {
                            assert.equal(decoratorName, '@Input()');
                        }
                    });
                } else if (index === 3) {
                    assert.equal(property.propertyName, 'parentTitle');
                    assert.equal(property.type, 'string');
                    assert.equal(property.description, 'Parent property description');
                } else if(index === 4) {
                    assert.equal(property.propertyName, 'parentType');
                    assert.equal(property.type, 'T');
                    assert.equal(property.description, '');
                } else {
                    assert.equal(true, false, 'Should not be executed');
                }
            });
        });

        it('should parse and verify that SourceDocs.apiDetails.methods contains public component methods from extended component<T>', () => {
            const thirdSourceDoc = classesWithDocs[2];

            assert.equal(thirdSourceDoc.apiDetails.methods.length, 4, 'Should contain public methods from both child and parent component');
            thirdSourceDoc.apiDetails.methods.forEach((method, index) => {
                if (index === 0) {
                    assert.equal(method.methodName, 'publicChildMethod()');
                    assert.equal(method.description, '');
                } else if (index === 1) {
                    assert.equal(method.methodName, 'childMethodWithPublicModifierShouldBeVisibleInParse()');
                    assert.equal(method.description, 'Description to method should be parsed');
                } else if (index === 2) {
                    assert.equal(method.methodName, 'publicParentMethod()');
                    assert.equal(method.description, '');
                } else if (index === 3) {
                    assert.equal(method.methodName, 'publicParentMethodWithDescription()');
                    assert.equal(method.description, 'Parent method description');
                } else if(index === 4) {
                    assert.equal(method.methodName, 'publicBaseMethod()');
                    assert.equal(method.description, '');
                } else {
                    assert.equal(true, false, 'Should not be executed');
                }
            });
        });

    });
});

function getTestCompilerHostWithMockModuleAndComponent() {
    const sourceFileContent = `
        import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';

        interface ParentInterface {
            title: string;
        }
        
        interface ChildInterface extends ParentInterface {
            subTitle: string;
        }

        /**
         * @group Layout
         * @component Foobar
         * @description 
         * It's possible to use <strong>html</strong> in 
         * the description
         */
        @Component({
            selector: 'x-foobar',
            template: 'test'
        })
        export class FoobarComponent {
            title: string;
            @Input() options: string[];
            @Output()
            changed: EventEmitter<boolean> = new EventEmitter();

            @HostBinding('class.small')
            @Input()
            isSmall: boolean = false;

            /**
             * Description to property should be parsed
             */
            propertyWithDescription: number;

            private privatePropertyShouldNotBeVisibleInParse: boolean = true;
            protected protectedPropertyShouldNotBeVisibleInParse: boolean = true;

            publicMethod(): number {
                return 1;
            }

            private privateMethodShouldNotBeVisibleInParse() {
                return true;
            }

            protected protectedMethodShouldNotBeVisibleInParse() {
                return true;
            }

            public methodWithPublicModifierShouldBeVisibleInParse() {
                return true;
            }

            /**
             * Description to method should be parsed
             */
            publicMethodWithDescription() {
                return 1;
            }
        }
    `;

    const childComponentSourceFileContent = `
        import { Component, Input, HostBinding } from '@angular/core';

        /**
         * @group Layout
         * @component ChildComponent
         */
        @Component({
            selector: 'x-child',
            template: 'test'
        })
        export class ChildComponent extends ParentComponent {
            childTitle: string;
            @Input() childOptions: string[];

            @HostBinding('class.small')
            @Input()
            childIsSmall: boolean = false;

            publicChildMethod(): number {
                return 1;
            }

            /**
             * Description to method should be parsed
             */
            public childMethodWithPublicModifierShouldBeVisibleInParse() {
                return true;
            }

            private childMethodShouldNotBeVisibleInParse() {
                return true;
            }
        }
    `;

    const parentComponentSourceFileContent = `
        import { Component } from '@angular/core';

        export abstract class BaseComponent {
            /**
             * Base id description
             */
            baseId: number;

            publicBaseMethod() {
                return true;
            }

            private baseMethodShouldNotBeVisibleInParse() {
                return false;
            }
        }

        export class ParentComponent extends BaseComponent {
            /**
             * Parent property description
             */
            parentTitle: string;

            publicParentMethod(): number {
                return 1;
            }

            /**
             * Parent method description
             */
            publicParentMethodWithDescription(): number {
                return 1;
            }

            private parentMethodShouldNotBeVisibleInParse() {
                return true;
            }
        }
    `;

    const childGenericComponentSourceFileContent = `
        import { Component, Input, HostBinding } from '@angular/core';

        /**
         * @group Layout
         * @component ChildGenericComponent
         */
        @Component({
            selector: 'x-child-generic',
            template: 'test'
        })
        export class ChildGenericComponent extends ParentGenericComponent<string> {
            childTitle: string;
            @Input() childOptions: string[];

            @HostBinding('class.small')
            @Input()
            childIsSmall: boolean = false;

            publicChildMethod(): number {
                return 1;
            }

            /**
             * Description to method should be parsed
             */
            public childMethodWithPublicModifierShouldBeVisibleInParse() {
                return true;
            }

            private childMethodShouldNotBeVisibleInParse() {
                return true;
            }
        }
    `;

    const parentGenericComponentSourceFileContent = `
        import { Component } from '@angular/core';

        export class ParentGenericComponent<T> {
            /**
             * Parent property description
             */
            parentTitle: string;
            parentType: T;

            publicParentMethod(): number {
                return 1;
            }

            /**
             * Parent method description
             */
            publicParentMethodWithDescription(): number {
                return 1;
            }

            private parentMethodShouldNotBeVisibleInParse() {
                return true;
            }
        }
    `;

    const sourceFileModuleContent = `
        import { NgModule } from '@angular/core';
        import { CommonModule } from '@angular/common';

        @NgModule({
            imports: [CommonModule],
            declarations: [FoobarComponent],
            exports: [FoobarComponent]
        })
        export class FoobarModule {
            // ...
        }
    `;

    const testSourceFileContent = `const foobar = true;`;

    let compilerHost = ts.createCompilerHost({ target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS });

    compilerHost.getSourceFile = (fileName: string, languageVersion: ts.ScriptTarget,
        onError?: (message: string) => void): ts.SourceFile => {

        if (fileName.indexOf('.test.ts') > -1) {
            return ts.createSourceFile(fileName, testSourceFileContent, ts.ScriptTarget.ES5);
        } else if (fileName.indexOf('.module.ts') > -1) {
            return ts.createSourceFile(fileName, sourceFileModuleContent, ts.ScriptTarget.ES5);
        } else if (fileName.indexOf('child.component.ts') > -1) {
            return ts.createSourceFile(fileName, childComponentSourceFileContent, ts.ScriptTarget.ES5);
        } else if (fileName.indexOf('parent.component.ts') > -1) {
            return ts.createSourceFile(fileName, parentComponentSourceFileContent, ts.ScriptTarget.ES5);
        } else if(fileName.indexOf('child-generic.component.ts') > -1) {
            return ts.createSourceFile(fileName, childGenericComponentSourceFileContent, ts.ScriptTarget.ES5);
        } else if (fileName.indexOf('parent-generic.component.ts') > -1) {
            return ts.createSourceFile(fileName, parentGenericComponentSourceFileContent, ts.ScriptTarget.ES5);
        }

        return ts.createSourceFile(fileName, sourceFileContent, ts.ScriptTarget.ES5);
    };
    
    return compilerHost;
}
