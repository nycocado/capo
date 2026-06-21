const swcTransform = [
  "@swc/jest",
  {
    jsc: {
      parser: { syntax: "typescript", decorators: true },
      transform: { legacyDecorator: true, decoratorMetadata: false },
      target: "es2023",
    },
    module: { type: "commonjs" },
  },
];

const moduleNameMapper = {
  "^@common/(.*)$": "<rootDir>/src/common/$1",
  "^@config/(.*)$": "<rootDir>/src/config/$1",
  "^@modules/(.*)$": "<rootDir>/src/modules/$1",
  "^@shared/(.*)$": "<rootDir>/src/shared/$1",
  "^@database/(.*)$": "<rootDir>/src/database/$1",
};

/** @type {import('jest').Config} */
module.exports = {
  rootDir: ".",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testRegex: ".*\\.spec\\.ts$",
  moduleFileExtensions: ["ts", "js", "json"],
  setupFiles: ["<rootDir>/test/jest-unit-setup.ts"],
  transform: { "^.+\\.(t|j)s$": swcTransform },
  transformIgnorePatterns: ["/node_modules/(?!.*(@mikro-orm|kysely)/)"],
  moduleNameMapper,
  clearMocks: true,
  collectCoverageFrom: [
    "src/modules/pipe-length/entities/pipe-length.entity.ts",
    "src/modules/joint/entities/joint.entity.ts",
    "src/modules/weld/entities/weld.entity.ts",
    "src/modules/cut-list/entities/cut-list.entity.ts",
    "src/modules/assembly-list/entities/assembly-list.entity.ts",
    "src/modules/weld-list/entities/weld-list.entity.ts",
    "src/common/domain/*.policy.ts",
    "src/common/utils/*.ts",
    "src/modules/document/application/handlers/get-document.handler.ts",
  ],
  coverageDirectory: "<rootDir>/coverage",
};
