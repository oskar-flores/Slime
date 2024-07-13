import { Container, id, Injectable } from "../../src";
import { describe, expect, it } from "vitest";

describe("Container", () => {
  // Initialize container with classes decorated with @Injectable
  it("should initialize container with classes decorated with @Injectable", () => {
    interface Namable {
      name: string;
    }
    const namable = id<Namable>("Namable");

    @Injectable(namable)
    class TestClass implements Namable {
      name = "TestClass";
    }

    const container = new Container();
    container.bootstrap(TestClass);

    const instance = container.resolve(namable);
    expect(instance).toBeInstanceOf(TestClass);
  });

  it("should throw error when initializing container with undecorated classes", () => {
    class UndecoratedClass {
    }

    const container = new Container();
    expect(() => container.bootstrap(UndecoratedClass)).toThrowError("Classes [UndecoratedClass] are not decorated with @Injectable.");
  });

  // Retrieve instance of a non-existent class
  it("should throw error when retrieving instance of a non-existent class", () => {
    5;

    const container = new Container();
    expect(() => container.resolve(id('nonExistent'))).toThrowError();
  });

  // Handle circular dependencies during initialization
  it("should throw error when handling circular dependencies during initialization", () => {
    interface NamableA {
      name: string;
    }

    interface NamableB {
      name: string;
    }

    @Injectable(id<NamableA>("NamableA"), [id<NamableB>("NamableB")])
    class ClassA implements NamableA {
      name = "ClassA";
    }

    @Injectable(id<NamableB>("NamableB"), [id<NamableA>("NamableA")])
    class ClassB implements NamableB {
      name = "classB";
    }

    const container = new Container();
    expect(() => container.bootstrap(ClassA, ClassB)).toThrowError("Circular dependencies");
  });
});
