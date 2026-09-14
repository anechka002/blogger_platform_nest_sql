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
 * Наши основные модули проекта.
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

  const tree = SpelunkerModule.explore(app, {
    ignoreImports: [
      /^MongooseCoreModule$/,
      /^ConfigHostModule$/,
      /^MailerCoreModule$/,
      /^CqrsModule$/,
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

    for (const controller of module.controllers) {
      const controllerId = safeId(`${module.name}_${controller}`);

      lines.push(`  ${controllerId}["🎮 ${controller}"]`);

      lines.push(`  ${moduleId} --> ${controllerId}`);
    }

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
      if (!projectModuleNames.includes(module.name)) {
        continue;
      }

      const connections: string[] = [];
      const declarations = new Set<string>();

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

  // =========================================================
  // 4. CQRS
  // =========================================================

  lines.push('## 4. CQRS');
  lines.push('');

  const cqrsConnections: string[] = [];
  const cqrsDeclarations = new Set<string>();

  for (const moduleClass of projectModules) {
    const debugInfo = await SpelunkerModule.debug(moduleClass);

    for (const module of debugInfo) {
      if (!projectModuleNames.includes(module.name)) {
        continue;
      }

      for (const provider of module.providers) {
        const handlerName = provider.name;

        // Нас интересуют только UseCase
        if (!handlerName.endsWith('UseCase')) {
          continue;
        }

        /*
         * CreateUserUseCase
         *        ↓
         * CreateUserCommand
         */
        const commandName = handlerName.replace(/UseCase$/, 'Command');

        const commandId = safeId(`command_${commandName}`);

        const handlerId = safeId(`handler_${handlerName}`);

        cqrsDeclarations.add(`  ${commandId}["📨 ${commandName}"]`);

        cqrsDeclarations.add(`  ${handlerId}["🧩 ${handlerName}"]`);

        cqrsConnections.push(`  ${commandId} -->|handled by| ${handlerId}`);
      }
    }
  }

  if (cqrsConnections.length > 0) {
    lines.push('```mermaid');
    lines.push('graph LR');

    lines.push(...cqrsDeclarations);
    lines.push(...cqrsConnections);

    lines.push('```');
    lines.push('');
  }

  // =========================================================
  // CREATE FILE
  // =========================================================

  writeFileSync('nest-graph.md', lines.join('\n'), 'utf-8');

  console.log('Nest graph создан: nest-graph.md');
}

/**
 * Безопасный id для Mermaid.
 */
function safeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_]/g, '_');
}

/**
 * Подписи разных provider'ов.
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

  if (name === 'CommandBus' || name === 'QueryBus' || name === 'EventBus') {
    return `🚌 ${name}`;
  }

  return `⚙️ ${name}`;
}
