/**
 * Simple Dependency Injection Container
 * 의존성 주입 컨테이너
 */
class Container {
  constructor() {
    this.dependencies = new Map();
  }

  register(name, dependency) {
    this.dependencies.set(name, dependency);
  }

  resolve(name) {
    const dependency = this.dependencies.get(name);
    if (!dependency) {
      throw new Error(`Dependency '${name}' not found`);
    }
    return dependency;
  }

  has(name) {
    return this.dependencies.has(name);
  }
}

// Singleton instance
const container = new Container();

module.exports = container;
