import {Container} from "../../src/container/Container";
import {id} from "../../src/decorators/interfaceId";
import {Injectable} from "../../src/decorators/injectable";
import {describe, it, expect} from "vitest";


describe('Container', () => {

    // Initialize container with classes decorated with @Injectable
    it('should initialize container with classes decorated with @Injectable', () => {

        interface Namable {
            name: string;
        }

        const Namable = id<Namable>('Namable');


        @Injectable(Namable, [])
        class TestClass implements Namable {
            name = 'TestClass';
        }

        const container = new Container();
        container.init(TestClass);

        const instance = container.resolve(Namable);
        expect(instance).toBeInstanceOf(TestClass);
    });

    it('should throw error when initializing container with undecorated classes', () => {

        class UndecoratedClass {
        }

        const container = new Container();
        expect(() => container.init(UndecoratedClass)).toThrowError('Classes [UndecoratedClass] are not decorated with @Injectable.');
    });

    // Retrieve instance of a non-existent class
    it('should throw error when retrieving instance of a non-existent class', () => {
        5

        const container = new Container();
        expect(() => container.resolve('nonExistent')).toThrowError();
    });

    // Handle circular dependencies during initialization
    it('should throw error when handling circular dependencies during initialization', () => {
        interface NamableA {
            name: string;
        }

        interface NamableB {
            name: string;
        }


        @Injectable(id<NamableA>('NamableA'), [id<NamableB>('NamableB')])
        class ClassA implements NamableA {
            name = 'ClassA';
        }


        @Injectable(id<NamableB>('NamableB'), [id<NamableA>('NamableA')])
        class ClassB implements NamableB {
            name = "classB";
        }

        const container = new Container();
        expect(() => container.init(ClassA, ClassB)).toThrowError('Circular dependencies');
    });

});
