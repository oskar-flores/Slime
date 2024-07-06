# SLIME: Simple Lambda Injector for Managed Environments

<p align="center">
    [<img src="logo.jpg" width="250"/>](logo.jpg)
</p>

SLIME is a lightweight, zero-dependency dependency injection container for TypeScript 5+. It's optimized for esbuild and
uses JavaScript decorators to simplify dependency management in your projects.

## Features

- Zero external dependencies
- TypeScript 5+ support
- Optimized for esbuild
- Uses JavaScript decorators
- Simple and intuitive API

## Installation

```bash
npm install slime-di
```
## Usage

Here's a quick example of how to use SLIME in your project:

``` typescript
import { Container, Injectable, id } from 'slime-di';

// Define an interface
interface Greeter {
  greet(): string;
}

// Create an interface ID
const GreeterID = id<Greeter>('Greeter');

// Create an injectable class
@Injectable(GreeterID, [])
class HelloGreeter implements Greeter {
  greet() {
    return 'Hello, World!';
  }
}

// Initialize the container
const container = new Container();
container.init(HelloGreeter);

// Retrieve an instance
const greeter = container.get(GreeterID);
console.log(greeter.greet()); // Output: Hello, World!
```

## API

### @Injectable(interfaceId, dependencies)

Decorator to mark a class as injectable and specify its dependencies.

### id<T>(name: string)

Creates a unique identifier for an interface, used to maintain type safety in TypeScript.

### Container

The main container class for managing dependencies.

- init(...classes): Initialize the container with injectable classes.
- resolve(interfaceId): Retrieve an instance of a class by its interface ID.

Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
License
This project is licensed under the MIT License.