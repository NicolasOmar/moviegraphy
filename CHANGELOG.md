# [1.7.0](https://github.com/NicolasOmar/moviegraphy/compare/v1.6.0...v1.7.0) (2026-08-14)


### Bug Fixes

* adding context comments on backend api and some helper functions ([42ac674](https://github.com/NicolasOmar/moviegraphy/commit/42ac67467ca1c931f9080617fb0b6b6c50de9a54))
* adding missing tsdocs and including a linter for style adjustment ([9c564d3](https://github.com/NicolasOmar/moviegraphy/commit/9c564d3fbee60a40deffb3906343ef8958b5ac8e))
* handleErrorMessage renamed getErrorMessage. new api parser to handle api backend errors ([8ac7bb4](https://github.com/NicolasOmar/moviegraphy/commit/8ac7bb4e6306b82e4fb31f1b9ca848d50c7e4ba2))


### Features

* first implementation of genre list with context and creation integration included ([e37626a](https://github.com/NicolasOmar/moviegraphy/commit/e37626aaefedd40c720484af93ac56f5ef702c49))

# [1.6.0](https://github.com/NicolasOmar/moviegraphy/compare/v1.5.0...v1.6.0) (2026-08-10)


### Features

* first implementation of full stack integration for genre creation ([ccfe07a](https://github.com/NicolasOmar/moviegraphy/commit/ccfe07ab0bb931494e20311c83862504e422acc2))
* first implementation of genre form and structure ([f8147d6](https://github.com/NicolasOmar/moviegraphy/commit/f8147d6b221762943d2c41d0bb703b806c5b484e))

# [1.5.0](https://github.com/NicolasOmar/moviegraphy/compare/v1.4.0...v1.5.0) (2026-08-07)


### Bug Fixes

* fixed user created not automatically logged. first implementation of api at astro layer ([1eb8439](https://github.com/NicolasOmar/moviegraphy/commit/1eb8439b71c49ec81480c023f397a070fb2b516f))
* improved setup script and updated the readme file ([ca8db47](https://github.com/NicolasOmar/moviegraphy/commit/ca8db474d6199c0faf1fa1cd717bc43b7c649ae2))
* moving cookie session token logic to pages/api layer ([533c861](https://github.com/NicolasOmar/moviegraphy/commit/533c86154e09b248b4c2787001fb43eb47d2f5ba))
* moving session cookie token authorization to middleware ([b40f763](https://github.com/NicolasOmar/moviegraphy/commit/b40f763a1a0d16ec7049b2fe54b9291a9f9b7fd7))


### Features

* first implementation of user update form and user entity restructure ([a97a0c0](https://github.com/NicolasOmar/moviegraphy/commit/a97a0c0db9ec65d4b498056a19f78915eb16b7e5))
* first integration of front and back end for user update flow ([1905138](https://github.com/NicolasOmar/moviegraphy/commit/19051386d867d23206f4757e1e25f05858219b34))

# [1.4.0](https://github.com/NicolasOmar/moviegraphy/compare/v1.3.3...v1.4.0) (2026-08-03)


### Bug Fixes

* added password validation logic on user creation and password change forms. iso dates added ([85173cb](https://github.com/NicolasOmar/moviegraphy/commit/85173cb784778ce8e7526624018fbcb649a84f91))
* moving forms to instances of reactform ([555b4ec](https://github.com/NicolasOmar/moviegraphy/commit/555b4ec858f00de5c1153ee1d972b53a1bbda3ad))
* navigation layout refactored for better visuals and account dropdown. removing old workflows ([73bdb8d](https://github.com/NicolasOmar/moviegraphy/commit/73bdb8d6f244a023627217b7c215b0d30931063b))


### Features

* first implementation end to end of password update form ([3394be1](https://github.com/NicolasOmar/moviegraphy/commit/3394be1aef193626b6adb2c77de4be5308119cd7))
* first iteration of password change form using shared reactform ([8de68fe](https://github.com/NicolasOmar/moviegraphy/commit/8de68fe7464256af57ded8b1871d7fbe0559d570))

## [1.3.3](https://github.com/NicolasOmar/moviegraphy/compare/v1.3.2...v1.3.3) (2026-07-30)


### Bug Fixes

* solving broken migration and release workflow ([be66f00](https://github.com/NicolasOmar/moviegraphy/commit/be66f00c7471dc8d9e62655c518a6ab3de5aef6a))

## [1.3.2](https://github.com/NicolasOmar/moviegraphy/compare/v1.3.1...v1.3.2) (2026-07-30)


### Bug Fixes

* solving broken migration and release workflow ([2431ae0](https://github.com/NicolasOmar/moviegraphy/commit/2431ae012b3753c7673e42dc9a15ac9768d180ba))

## [1.3.1](https://github.com/NicolasOmar/moviegraphy/compare/v1.3.0...v1.3.1) (2026-07-30)


### Bug Fixes

* solving broken migration and release workflow ([da4517e](https://github.com/NicolasOmar/moviegraphy/commit/da4517e9a47351cda52c070907921c496a5d50b3))

# [1.3.0](https://github.com/NicolasOmar/moviegraphy/compare/v1.2.0...v1.3.0) (2026-07-30)


### Bug Fixes

* adding a system wide loading state for shared interface behaviour ([8361d14](https://github.com/NicolasOmar/moviegraphy/commit/8361d14522e6caaaa0f1c6c149a84c51b2d57eff))
* moving prisma and api folder to an umbrella level called backend ([c371321](https://github.com/NicolasOmar/moviegraphy/commit/c3713212d5132dbfb6f76f74bea9c1c7c2f1bde3))
* moving zod schemas into entities file ([6206d5e](https://github.com/NicolasOmar/moviegraphy/commit/6206d5e02bffb42456958f4777f80d995e956036))
* renaming entities at prisma level and beyond to its correct names ([ccb36b1](https://github.com/NicolasOmar/moviegraphy/commit/ccb36b138e2c5949b915703add36fa5e979f57bd))
* renaming files and vaiables related to user session management ([bac6801](https://github.com/NicolasOmar/moviegraphy/commit/bac6801e4d5b11c862c4359333725444201c20e8))
* rewriting some parser functions. adding missing migration ([9754f62](https://github.com/NicolasOmar/moviegraphy/commit/9754f6201afd073da2c057a3e32da209a8f45ad7))


### Features

* adding migration and deployment script for db and app aligment ([7727e45](https://github.com/NicolasOmar/moviegraphy/commit/7727e45b3356634edef9b827707484fa0b1287fa))
* adding token based authentication at route middleware level. layouts improved ([43313df](https://github.com/NicolasOmar/moviegraphy/commit/43313df3458fa46e12a4e9492445cf62848fdd15))
* adding user password hashing for security ([23c25cb](https://github.com/NicolasOmar/moviegraphy/commit/23c25cb2f66850c1825e7e467804e14d6b050cff))
* first implementation of logout feature ([727cfb3](https://github.com/NicolasOmar/moviegraphy/commit/727cfb355295b1e9d793b751a65f1c2f026c44f1))
* first integration of login feature with improvements to add ([8e4469b](https://github.com/NicolasOmar/moviegraphy/commit/8e4469b6eba7487a1b5a3b9997786a3b3610cd7b))
* first partial implementation of login form ([8b2f2a4](https://github.com/NicolasOmar/moviegraphy/commit/8b2f2a46524a76b4857bc1aa5ca27a9a4579e33d))

# [1.2.0](https://github.com/NicolasOmar/moviegraphy/compare/v1.1.1...v1.2.0) (2026-07-24)


### Bug Fixes

* adding better validation on user form. including some typography ([fcd4f7a](https://github.com/NicolasOmar/moviegraphy/commit/fcd4f7a3f24dd18e894fb5dd23a22e8d25d1be2a))
* fixing broken delete movie feature ([3c37a7d](https://github.com/NicolasOmar/moviegraphy/commit/3c37a7deba4749ae383c2ce1e27e3962ba594f70))
* improving error handling on backend side ([4f58d67](https://github.com/NicolasOmar/moviegraphy/commit/4f58d67ec287b890ee02993f50d034ce22c8e190))
* improving form validation at several layers on movie feature following user example ([6c75fc8](https://github.com/NicolasOmar/moviegraphy/commit/6c75fc853fc51d1842a4302b91a95da7e69c28dc))
* improving movies crud workflow based on user implementation ([8b43722](https://github.com/NicolasOmar/moviegraphy/commit/8b437224d400d57524454302fb6e3c7252a674ef))
* moving last configuration files to configs folder for project structure ([e759577](https://github.com/NicolasOmar/moviegraphy/commit/e75957739dc63c042d2c2e8c29c8b9a2e198f93c))
* updating dependencies ([530b747](https://github.com/NicolasOmar/moviegraphy/commit/530b74736df6c6e37f8ec712ab1990c3a59cc1fb))


### Features

* addding first validation mechanism at form, schema and api level ([e9fb637](https://github.com/NicolasOmar/moviegraphy/commit/e9fb637a1a4152672f3b4b9fcc8ba9a36ea68a7f))
* adding message structure with internal store for notifications ([19616f0](https://github.com/NicolasOmar/moviegraphy/commit/19616f08538f114cdb918e9f2fe8cf77afbde009))
* creating user entity and new url folders for movies and users. improving layout with antdesign ([4ba499c](https://github.com/NicolasOmar/moviegraphy/commit/4ba499cd8c3cdce5100707346bdff308615707b9))
* first inclusion of astro transicions and loading states in local forms ([718857d](https://github.com/NicolasOmar/moviegraphy/commit/718857d437b50e086484e6790d5b67fbde071054))
* new layout for two islands. user creation workflow started. migration added ([93ce847](https://github.com/NicolasOmar/moviegraphy/commit/93ce847708a0b0e8ea35ba690305622ee1607436))

## [1.1.1](https://github.com/NicolasOmar/moviegraphy/compare/v1.1.0...v1.1.1) (2026-07-18)


### Bug Fixes

* removing ant design icons for possible build errors on netlify ([c0112cd](https://github.com/NicolasOmar/moviegraphy/commit/c0112cd2aac3e7b9e8a128c83b7a803f4fc0d546))
* removing prerender constant in main page for client libraries rendering ([ab54a48](https://github.com/NicolasOmar/moviegraphy/commit/ab54a48447ccf40102f25a90484cfe43c11c0a46))

# [1.1.0](https://github.com/NicolasOmar/moviegraphy/compare/v1.0.0...v1.1.0) (2026-07-17)


### Bug Fixes

* adding missing semantic release config file ([e37f052](https://github.com/NicolasOmar/moviegraphy/commit/e37f05270e0741a27eac19ddfceea19a9d3b36db))
* solving some issues related to third party services ([070b287](https://github.com/NicolasOmar/moviegraphy/commit/070b2871e46e0c685ce9bdbbff7115624bd98025))
* solving sonar integration issue with configuration file ([2155119](https://github.com/NicolasOmar/moviegraphy/commit/21551191ed4726d8af32263341208aee7a221550))


### Features

* integrating several third party services for pull request workflows testing ([c49d765](https://github.com/NicolasOmar/moviegraphy/commit/c49d7654dec38708fc83e18cbcf3f7a30188887b))
