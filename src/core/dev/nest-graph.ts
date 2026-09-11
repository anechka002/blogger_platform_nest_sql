import { INestApplication, Type } from '@nestjs/common';
import { SpelunkerModule } from 'nestjs-spelunker';
import { writeFileSync } from 'node:fs';

import { AppModule } from '../../app.module';

// Проверь пути к своим модулям:
import { CoreModule } from '../core.module';
import { UserAccountsModule } from '../../modules/user-accounts/user-accounts.module';
import { BloggersPlatformModule } from '../../modules/bloggers-platform/bloggers-platform.module';
import { NotificationsModule } from '../../modules/notifications/notifications.module';
import { TestingModule } from '@nestjs/testing';

/**
 * Наши модули, которые хотим подробно показывать на диаграмме.
 */
const projectModules: Type[] = [
  AppModule,
  UserAccountsModule,
  BloggersPlatformModule,
  NotificationsModule,
  TestingModule,
  CoreModule,
];

export async function generateNestGraph(app: INestApplication): Promise<void> {
  const lines: string[] = [];

  const projectModuleNames = projectModules.map((module) => module.name);

  /*
   * Получаем структуру Nest-приложения:
   * modules, imports, controllers, providers и т.д.
   */
  const tree = SpelunkerModule.explore(app, {
    ignoreImports: [
      /^MongooseCoreModule$/,
      /^ConfigHostModule$/,
      /^MailerCoreModule$/,
    ],
  });

  // =========================================================
  // 1. MODULES
  // =========================================================

  lines.push('# NestJS architecture');
  lines.push('');
  lines.push('## 1. Modules');
  lines.push('');
  lines.push('```mermaid');
  lines.push('graph LR');

  for (const module of tree) {
    if (!projectModuleNames.includes(module.name)) {
      continue;
    }

    const moduleId = safeId(module.name);

    lines.push(`  ${moduleId}["📦 ${module.name}"]`);

    for (const importedModule of module.imports) {
      if (!projectModuleNames.includes(importedModule)) {
        continue;
      }

      lines.push(`  ${moduleId} -->|imports| ${safeId(importedModule)}`);
    }
  }

  lines.push('```');
  lines.push('');

  // =========================================================
  // 2. CONTROLLERS AND PROVIDERS
  // =========================================================

  lines.push('## 2. Controllers and providers');
  lines.push('');
  lines.push('```mermaid');
  lines.push('graph LR');

  for (const module of tree) {
    if (!projectModuleNames.includes(module.name)) {
      continue;
    }

    const moduleId = safeId(module.name);

    lines.push(`  ${moduleId}["📦 ${module.name}"]`);

    /*
     * Controllers
     */
    for (const controller of module.controllers) {
      const controllerId = safeId(`${module.name}_${controller}`);

      lines.push(`  ${controllerId}["🎮 ${controller}"]`);

      lines.push(`  ${moduleId} --> ${controllerId}`);
    }

    /*
     * Providers:
     * UseCase, Service, Repository, Strategy и т.д.
     */
    for (const providerName of Object.keys(module.providers)) {
      const providerId = safeId(`${module.name}_${providerName}`);

      lines.push(`  ${providerId}["${getProviderLabel(providerName)}"]`);

      lines.push(`  ${moduleId} --> ${providerId}`);
    }
  }

  lines.push('```');
  lines.push('');

  // =========================================================
  // 3. DEPENDENCY INJECTION
  // =========================================================

  lines.push('## 3. Dependency Injection');
  lines.push('');

  for (const moduleClass of projectModules) {
    const debugInfo = await SpelunkerModule.debug(moduleClass);

    for (const module of debugInfo) {
      const connections: string[] = [];
      const declarations = new Set<string>();

      /*
       * Controllers dependencies
       *
       * UsersController
       *    ↓ injects
       * CreateUserUseCase
       */
      for (const controller of module.controllers) {
        const controllerId = safeId(controller.name);

        declarations.add(`  ${controllerId}["🎮 ${controller.name}"]`);

        for (const dependency of controller.dependencies) {
          const dependencyId = safeId(dependency);

          declarations.add(
            `  ${dependencyId}["${getProviderLabel(dependency)}"]`,
          );

          connections.push(`  ${controllerId} -->|injects| ${dependencyId}`);
        }
      }

      /*
       * Provider dependencies
       *
       * CreateUserUseCase
       *    ↓ injects
       * UsersRepository
       */
      for (const provider of module.providers) {
        const providerId = safeId(provider.name);

        declarations.add(
          `  ${providerId}["${getProviderLabel(provider.name)}"]`,
        );

        for (const dependency of provider.dependencies) {
          const dependencyId = safeId(dependency);

          declarations.add(
            `  ${dependencyId}["${getProviderLabel(dependency)}"]`,
          );

          connections.push(`  ${providerId} -->|injects| ${dependencyId}`);
        }
      }

      /*
       * Если в модуле вообще нет DI-связей,
       * пустой Mermaid-граф не создаём.
       */
      if (connections.length === 0) {
        continue;
      }

      lines.push(`### ${module.name}`);
      lines.push('');
      lines.push('```mermaid');
      lines.push('graph LR');

      lines.push(...declarations);
      lines.push(...connections);

      lines.push('```');
      lines.push('');
    }
  }

  /*
   * Создаём nest-graph.md
   * в корне проекта.
   */
  writeFileSync('nest-graph.md', lines.join('\n'), 'utf-8');

  console.log('Nest graph создан: nest-graph.md');
}

/**
 * Делает безопасный id для Mermaid.
 */
function safeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_]/g, '_');
}

/**
 * Визуально различаем типы providers.
 */
function getProviderLabel(name: string): string {
  if (name.endsWith('UseCase') || name.endsWith('CommandHandler')) {
    return `🧩 ${name}`;
  }

  if (name.endsWith('QueryRepository')) {
    return `🔎 ${name}`;
  }

  if (name.endsWith('Repository')) {
    return `🗄️ ${name}`;
  }

  if (name.endsWith('Service')) {
    return `⚙️ ${name}`;
  }

  if (name.endsWith('Strategy') || name.endsWith('Guard')) {
    return `🔐 ${name}`;
  }

  return `⚙️ ${name}`;
}
