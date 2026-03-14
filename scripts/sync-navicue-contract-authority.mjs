import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const source = path.join(root, 'packages/types/src/navicue-composition.ts');
const universalPlayerSource = path.join(root, 'packages/types/src/universal-player.ts');
const altitudeSource = path.join(root, 'packages/types/src/altitudes.ts');
const interventionSources = [
  path.join(root, 'packages/types/src/intervention-core.ts'),
  path.join(root, 'packages/types/src/format-adapters.ts'),
  path.join(root, 'packages/types/src/compiled-intervention.ts'),
];
const targets = [
  path.join(root, 'apps/design-center/src/navicue-types.ts'),
  path.join(root, 'apps/site/src/navicue-types.ts'),
];
const interventionTargets = [
  path.join(root, 'apps/design-center/src/intervention-types.ts'),
  path.join(root, 'apps/site/src/intervention-types.ts'),
];
const commerceAccessSource = path.join(root, 'packages/types/src/commerce-access.ts');
const commerceAccessTargets = [path.join(root, 'apps/site/src/commerce-access.ts')];
const runtimeServicesSource = path.join(root, 'packages/types/src/runtime-services.ts');
const runtimeServicesTargets = [
  path.join(root, 'apps/design-center/src/runtime-services.ts'),
  path.join(root, 'apps/site/src/runtime-services.ts'),
];
const careContinuitySource = path.join(root, 'packages/types/src/care-continuity.ts');
const careContinuityTargets = [
  path.join(root, 'apps/design-center/src/care-continuity.ts'),
  path.join(root, 'apps/site/src/care-continuity.ts'),
];
const lifecycleSource = path.join(root, 'packages/types/src/lifecycle.ts');
const lifecycleTargets = [
  path.join(root, 'apps/design-center/src/lifecycle.ts'),
  path.join(root, 'apps/site/src/lifecycle.ts'),
];
const entryRuntimeSource = path.join(root, 'packages/types/src/entry-runtime.ts');
const entryRuntimeTargets = [
  path.join(root, 'apps/design-center/src/entry-runtime.ts'),
  path.join(root, 'apps/site/src/entry-runtime.ts'),
];
const altitudePayloadsSource = path.join(root, 'packages/types/src/altitude-payloads.ts');
const altitudePayloadTargets = [
  path.join(root, 'apps/design-center/src/altitude-payloads.ts'),
  path.join(root, 'apps/site/src/altitude-payloads.ts'),
];
const runtimeSources = {
  registry: path.join(root, 'packages/navicue-engine/src/runtime/format-adapter-registry.ts'),
  compiler: path.join(root, 'packages/navicue-engine/src/runtime/compile-intervention-demo.ts'),
  entryRuntimeAdapter: path.join(root, 'packages/navicue-engine/src/runtime/entry-runtime-adapters.ts'),
  echoLinkRuntime: path.join(root, 'packages/navicue-engine/src/runtime/echo-link-runtime.ts'),
  companionAuthTransaction: path.join(root, 'packages/navicue-engine/src/runtime/companion-auth-transaction.ts'),
  companionAuthProvider: path.join(root, 'packages/navicue-engine/src/runtime/companion-auth-provider.ts'),
  companionAuthRoutes: path.join(root, 'packages/navicue-engine/src/runtime/companion-auth-routes.ts'),
  companionCommerce: path.join(root, 'packages/navicue-engine/src/runtime/companion-commerce.ts'),
  companionEntryContinuity: path.join(root, 'packages/navicue-engine/src/runtime/companion-entry-continuity.ts'),
  companionEntryRequests: path.join(root, 'packages/navicue-engine/src/runtime/companion-entry-requests.ts'),
};
const runtimeTargets = {
  registry: path.join(root, 'apps/design-center/src/app/data/format-adapter-registry.ts'),
  compiler: path.join(root, 'apps/design-center/src/app/data/compile-intervention-demo.ts'),
  entryRuntimeAdapter: path.join(root, 'apps/site/src/entry-runtime-adapters.ts'),
  echoLinkRuntime: path.join(root, 'apps/site/src/echo-link-runtime.ts'),
  companionAuthTransaction: path.join(root, 'apps/site/src/companion-auth-transaction-runtime.ts'),
  companionAuthProvider: path.join(root, 'apps/site/src/companion-auth-provider-runtime.ts'),
  companionAuthRoutes: path.join(root, 'apps/site/src/companion-auth-routes-runtime.ts'),
  companionCommerce: path.join(root, 'apps/site/src/companion-commerce-runtime.ts'),
  companionEntryContinuity: path.join(root, 'apps/site/src/companion-entry-continuity-runtime.ts'),
  companionEntryRequests: path.join(root, 'apps/site/src/companion-entry-requests-runtime.ts'),
};

const sourceContent = await fs.readFile(source, 'utf8');
const universalPlayerContent = await fs.readFile(universalPlayerSource, 'utf8');
const altitudeContent = await fs.readFile(altitudeSource, 'utf8');
const rawInterventionContent = await Promise.all(
  interventionSources.map(async (filePath) => fs.readFile(filePath, 'utf8')),
);
const commerceAccessContent = await fs.readFile(commerceAccessSource, 'utf8');
const runtimeServicesContent = await fs.readFile(runtimeServicesSource, 'utf8');
const careContinuityContent = await fs.readFile(careContinuitySource, 'utf8');
const lifecycleContent = await fs.readFile(lifecycleSource, 'utf8');
const entryRuntimeContent = await fs.readFile(entryRuntimeSource, 'utf8');
const altitudePayloadsContent = await fs.readFile(altitudePayloadsSource, 'utf8');
const interventionContent = [
  universalPlayerContent.trim(),
  '',
  altitudeContent
    .replace(/^import type[\s\S]*?;\n\n/m, '')
    .trim(),
  '',
  ...rawInterventionContent.map((source) =>
    source
      .replace(/^import type[\s\S]*?;\n\n/m, '')
      .trim(),
  ),
].join('\n');
const mirrorBanner =
  '/* GENERATED MIRROR. EDIT packages/types/src/navicue-composition.ts AND RUN npm run contracts:sync:consumers. */\n\n';
const interventionBanner =
  '/* GENERATED MIRROR. EDIT packages/types/src/universal-player.ts, packages/types/src/altitudes.ts, packages/types/src/intervention-core.ts, packages/types/src/format-adapters.ts, packages/types/src/compiled-intervention.ts AND RUN npm run contracts:sync:consumers. */\n\n';
const commerceAccessBanner =
  '/* GENERATED MIRROR. EDIT packages/types/src/commerce-access.ts AND RUN npm run contracts:sync:consumers. */\n\n';
const runtimeServicesBanner =
  '/* GENERATED MIRROR. EDIT packages/types/src/runtime-services.ts AND RUN npm run contracts:sync:consumers. */\n\n';
const careContinuityBanner =
  '/* GENERATED MIRROR. EDIT packages/types/src/care-continuity.ts AND RUN npm run contracts:sync:consumers. */\n\n';
const lifecycleBanner =
  '/* GENERATED MIRROR. EDIT packages/types/src/lifecycle.ts AND RUN npm run contracts:sync:consumers. */\n\n';
const entryRuntimeBanner =
  '/* GENERATED MIRROR. EDIT packages/types/src/entry-runtime.ts AND RUN npm run contracts:sync:consumers. */\n\n';
const altitudePayloadsBanner =
  '/* GENERATED MIRROR. EDIT packages/types/src/altitude-payloads.ts AND RUN npm run contracts:sync:consumers. */\n\n';
const runtimeBanner =
  '/* GENERATED MIRROR. EDIT packages/navicue-engine/src/runtime/* AND RUN npm run contracts:sync:consumers. */\n\n';

function normalizeRuntimeRegistrySource(source) {
  return source.replace(
    "import type { FormatAdapterRegistryEntry } from '@recoverlution/types';",
    "import type { FormatAdapterRegistryEntry } from '@/intervention-types';",
  );
}

function normalizeRuntimeCompilerSource(source) {
  return source
    .replace(
      /import type \{\n([\s\S]*?)\} from '@recoverlution\/types';/,
      "import type {\n$1} from '@/intervention-types';",
    )
    .replace(
      /import type \{\n([\s\S]*?)\} from '@recoverlution\/types';/,
      "import type {\n$1} from '@/universal-player';",
    );
}


function normalizeCompanionAuthTransactionSource(source) {
  return source.replace(
    "import type { CompanionAuthReturnState } from '@recoverlution/types';",
    "import type { CompanionAuthReturnState } from '@/runtime-services';",
  );
}

function normalizeCompanionAuthProviderSource(source) {
  return source.replace(
    "import type {\n  CompanionAuthProvider,\n  CompanionAuthTransaction,\n} from './companion-auth-transaction';",
    "import type {\n  CompanionAuthProvider,\n  CompanionAuthTransaction,\n} from '@/companion-auth-transaction-runtime';",
  );
}

function normalizeCompanionAuthRoutesSource(source) {
  return source;
}

function normalizeCompanionCommerceSource(source) {
  return source.replaceAll('@recoverlution/types', '@/commerce-access');
}

function normalizeCompanionEntryRequestsSource(source) {
  return source.replaceAll('@recoverlution/types', '@/runtime-services');
}

function normalizeCompanionEntryContinuitySource(source) {
  return source.replace(
    "import type { CompanionCheckoutPlanCode, CompanionEntryRuntimeContract } from '@recoverlution/types';",
    "import type { CompanionCheckoutPlanCode } from '@/runtime-services';\nimport type { CompanionEntryRuntimeContract } from '@/entry-runtime';",
  );
}

function normalizeEntryRuntimeAdapterSource(source) {
  return source.replace(
    "import type {\n  CompanionBootstrapResponse,\n  CompanionEntryRuntimeContract,\n} from '@recoverlution/types';",
    "import type { CompanionBootstrapResponse } from '@/runtime-services';\nimport type { CompanionEntryRuntimeContract } from '@/entry-runtime';",
  );
}

function normalizeEchoLinkRuntimeSource(source) {
  return source.replace(
    "import type {\n  EchoLinkConnectedProvider,\n  EchoLinkDomain,\n  EchoLinkDomainGroup,\n  EchoLinkManifest,\n  EchoLinkProviderContract,\n  EchoLinkProviderKey,\n} from '@recoverlution/types';",
    "import type {\n  EchoLinkConnectedProvider,\n  EchoLinkDomain,\n  EchoLinkDomainGroup,\n  EchoLinkManifest,\n  EchoLinkProviderContract,\n  EchoLinkProviderKey,\n} from '@/runtime-services';",
  );
}

function normalizeCareContinuitySource(source) {
  return source
    .replace(
      "import type { MicroReceiptTravelContract, ReceiptMeaningClass } from './altitudes';",
      "import type { MicroReceiptTravelContract, ReceiptMeaningClass } from '@/intervention-types';",
    )
    .replace(
      "import type { CompilerHeatBand, InterventionIntent } from './intervention-core';",
      "import type { CompilerHeatBand, InterventionIntent } from '@/intervention-types';",
    )
    .replace(
      "import type { RecoverlutionFormat } from './universal-player';",
      "import type { RecoverlutionFormat } from '@/intervention-types';",
    );
}

function normalizeAltitudePayloadsSource(source) {
  return source
    .replace(
      /import type \{\n([\s\S]*?)\} from '\.\/care-continuity';/,
      "import type {\n$1} from './care-continuity';",
    )
    .replace(
      "import type { CompilerHeatBand, InterventionIntent } from './intervention-core';",
      "import type { CompilerHeatBand, InterventionIntent } from '@/intervention-types';",
    )
    .replace(
      "import type { RecoverlutionFormat } from './universal-player';",
      "import type { RecoverlutionFormat } from '@/intervention-types';",
    )
    .replace(
      "import type { RecoveryLifecycleStage, TetherTrigger } from './lifecycle';",
      "import type { RecoveryLifecycleStage, TetherTrigger } from './lifecycle';",
    );
}

for (const target of targets) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${mirrorBanner}${sourceContent}`);
  console.log(`synced ${path.relative(root, target)}`);
}

for (const target of interventionTargets) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${interventionBanner}${interventionContent}`);
  console.log(`synced ${path.relative(root, target)}`);
}

for (const target of commerceAccessTargets) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${commerceAccessBanner}${commerceAccessContent}`);
  console.log(`synced ${path.relative(root, target)}`);
}

for (const target of runtimeServicesTargets) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${runtimeServicesBanner}${runtimeServicesContent}`);
  console.log(`synced ${path.relative(root, target)}`);
}

for (const target of careContinuityTargets) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${careContinuityBanner}${normalizeCareContinuitySource(careContinuityContent)}`);
  console.log(`synced ${path.relative(root, target)}`);
}

for (const target of lifecycleTargets) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${lifecycleBanner}${lifecycleContent}`);
  console.log(`synced ${path.relative(root, target)}`);
}

for (const target of entryRuntimeTargets) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${entryRuntimeBanner}${entryRuntimeContent}`);
  console.log(`synced ${path.relative(root, target)}`);
}

for (const target of altitudePayloadTargets) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${altitudePayloadsBanner}${normalizeAltitudePayloadsSource(altitudePayloadsContent)}`);
  console.log(`synced ${path.relative(root, target)}`);
}

const runtimeRegistryContent = normalizeRuntimeRegistrySource(await fs.readFile(runtimeSources.registry, 'utf8'));
await fs.mkdir(path.dirname(runtimeTargets.registry), { recursive: true });
await fs.writeFile(runtimeTargets.registry, `${runtimeBanner}${runtimeRegistryContent}`);
console.log(`synced ${path.relative(root, runtimeTargets.registry)}`);

const runtimeCompilerContent = normalizeRuntimeCompilerSource(await fs.readFile(runtimeSources.compiler, 'utf8'));
await fs.mkdir(path.dirname(runtimeTargets.compiler), { recursive: true });
await fs.writeFile(runtimeTargets.compiler, `${runtimeBanner}${runtimeCompilerContent}`);
console.log(`synced ${path.relative(root, runtimeTargets.compiler)}`);


const runtimeCompanionAuthTransactionContent = normalizeCompanionAuthTransactionSource(
  await fs.readFile(runtimeSources.companionAuthTransaction, 'utf8'),
);
await fs.mkdir(path.dirname(runtimeTargets.companionAuthTransaction), { recursive: true });
await fs.writeFile(runtimeTargets.companionAuthTransaction, `${runtimeBanner}${runtimeCompanionAuthTransactionContent}`);
console.log(`synced ${path.relative(root, runtimeTargets.companionAuthTransaction)}`);

const runtimeCompanionAuthProviderContent = normalizeCompanionAuthProviderSource(
  await fs.readFile(runtimeSources.companionAuthProvider, 'utf8'),
);
await fs.mkdir(path.dirname(runtimeTargets.companionAuthProvider), { recursive: true });
await fs.writeFile(runtimeTargets.companionAuthProvider, `${runtimeBanner}${runtimeCompanionAuthProviderContent}`);
console.log(`synced ${path.relative(root, runtimeTargets.companionAuthProvider)}`);

const runtimeCompanionAuthRoutesContent = normalizeCompanionAuthRoutesSource(
  await fs.readFile(runtimeSources.companionAuthRoutes, 'utf8'),
);
await fs.mkdir(path.dirname(runtimeTargets.companionAuthRoutes), { recursive: true });
await fs.writeFile(runtimeTargets.companionAuthRoutes, `${runtimeBanner}${runtimeCompanionAuthRoutesContent}`);
console.log(`synced ${path.relative(root, runtimeTargets.companionAuthRoutes)}`);

const runtimeCompanionCommerceContent = normalizeCompanionCommerceSource(
  await fs.readFile(runtimeSources.companionCommerce, 'utf8'),
);
await fs.mkdir(path.dirname(runtimeTargets.companionCommerce), { recursive: true });
await fs.writeFile(runtimeTargets.companionCommerce, `${runtimeBanner}${runtimeCompanionCommerceContent}`);
console.log(`synced ${path.relative(root, runtimeTargets.companionCommerce)}`);

const runtimeCompanionEntryContinuityContent = normalizeCompanionEntryContinuitySource(
  await fs.readFile(runtimeSources.companionEntryContinuity, 'utf8'),
);
await fs.mkdir(path.dirname(runtimeTargets.companionEntryContinuity), { recursive: true });
await fs.writeFile(runtimeTargets.companionEntryContinuity, `${runtimeBanner}${runtimeCompanionEntryContinuityContent}`);
console.log(`synced ${path.relative(root, runtimeTargets.companionEntryContinuity)}`);

const runtimeCompanionEntryRequestsContent = normalizeCompanionEntryRequestsSource(
  await fs.readFile(runtimeSources.companionEntryRequests, 'utf8'),
);
await fs.mkdir(path.dirname(runtimeTargets.companionEntryRequests), { recursive: true });
await fs.writeFile(runtimeTargets.companionEntryRequests, `${runtimeBanner}${runtimeCompanionEntryRequestsContent}`);
console.log(`synced ${path.relative(root, runtimeTargets.companionEntryRequests)}`);

const runtimeEntryAdapterContent = normalizeEntryRuntimeAdapterSource(
  await fs.readFile(runtimeSources.entryRuntimeAdapter, 'utf8'),
);
await fs.mkdir(path.dirname(runtimeTargets.entryRuntimeAdapter), { recursive: true });
await fs.writeFile(runtimeTargets.entryRuntimeAdapter, `${runtimeBanner}${runtimeEntryAdapterContent}`);
console.log(`synced ${path.relative(root, runtimeTargets.entryRuntimeAdapter)}`);

const runtimeEchoLinkContent = normalizeEchoLinkRuntimeSource(
  await fs.readFile(runtimeSources.echoLinkRuntime, 'utf8'),
);
await fs.mkdir(path.dirname(runtimeTargets.echoLinkRuntime), { recursive: true });
await fs.writeFile(runtimeTargets.echoLinkRuntime, `${runtimeBanner}${runtimeEchoLinkContent}`);
console.log(`synced ${path.relative(root, runtimeTargets.echoLinkRuntime)}`);
