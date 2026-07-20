# Moviegraphy
Web-based system to organize your personal movie library.

## Table of contents
- [Purpose](#purpose)
- [Status](#status)
- [Project Stack](#project-stack)
- [What do I need?](#what-do-i-need)
- [Setup](#setup)
- [How to run it](#how-to-run-it)
- [Folder structure](#folder-structure)
- [Branches and Environments](#branches-and-environments)
- [Roadmap](#roadmap)
- [License](#license)

## Purpose
Its main goal is to create a brand new movie library system for my dad that will replace its former version, [Peliteca](https://github.com/nicolasomar/peliteca) (which I developed in 2015).

Also, I want to use this tool as a process to master several libraries, patterns, and structures for future tools I want to build.

## Status
![Project version][badge-repo-version]
[![Code Coverage][badge-code-coverage]][link-code-coverage]
[![Quality Gate Status][badge-soundcloud-quality]][link-soundcloud-status]
[![Maintainability Rating][badge-soundcloud-maintanibility]][link-soundcloud-status]
[![Security Rating][badge-soundcloud-security]][link-soundcloud-status]
[![Technical Debt][badge-soundcloud-tech-debt]][link-soundcloud-status]
[![Known Vulnerabilities][badge-snyk-status]][link-snyk-status]
![GitHub Repo stars][badge-github-repo-stars]
![GitHub commit activity][badge-github-commits]
![GitHub last commit][badge-github-last-commit]
[![Semantic Commits][badge-semantic-commits]][link-semantic-commits]

[badge-repo-version]: https://img.shields.io/github/package-json/v/nicolasomar/moviegraphy?label=version&logo=npm&color=success
[badge-code-coverage]: https://img.shields.io/codecov/c/github/nicolasomar/moviegraphy?label=coverage&logo=codecov
[link-code-coverage]: https://app.codecov.io/gh/NicolasOmar/moviegraphy
[badge-soundcloud-quality]: https://sonarcloud.io/api/project_badges/measure?project=NicolasOmar_moviegraphy&metric=alert_status
[badge-soundcloud-maintanibility]: https://sonarcloud.io/api/project_badges/measure?project=NicolasOmar_moviegraphy&metric=sqale_rating
[badge-soundcloud-security]: https://sonarcloud.io/api/project_badges/measure?project=NicolasOmar_moviegraphy&metric=security_rating
[badge-soundcloud-tech-debt]: https://sonarcloud.io/api/project_badges/measure?project=NicolasOmar_moviegraphy&metric=sqale_index
[link-soundcloud-status]: https://sonarcloud.io/summary/new_code?id=NicolasOmar_moviegraphy
[badge-snyk-status]: https://snyk.io/test/github/nicolasomar/moviegraphy/badge.svg
[link-snyk-status]: https://snyk.io/test/github/nicolasomar/moviegraphy
[badge-github-repo-stars]: https://img.shields.io/github/stars/nicolasomar/moviegraphy?label=stars&logo=github&labelColor=535353&style=flat
[badge-github-commits]: https://img.shields.io/github/commit-activity/m/nicolasomar/moviegraphy?logo=github
[badge-github-last-commit]: https://img.shields.io/github/last-commit/nicolasomar/moviegraphy?logo=github
[badge-semantic-commits]: https://img.shields.io/badge/using-conventional%20commits-e10079?logo=conventional-commits
[link-semantic-commits]: https://github.com/semantic-release/semantic-release

## Project Stack
![astro dependency][badge-dependency-astro]
![react dependency][badge-dependency-react]
![typescript dependency][badge-dependency-typescript]
![ant design dependency][badge-dependency-antd]
![nanostores dependency][badge-dependency-nanostores]
![prisma dependency][badge-dependency-prisma]
![postgres dependency][badge-dependency-pg]
![vitest dependency][badge-dependency-vitest]
![react testing library dependency][badge-dependency-react-testing-library]
![eslint dependency][badge-dependency-eslint]
![prettier dependency][badge-dependency-prettier]
![lint-staged dependency][badge-dependency-lint-staged]
![husky dependency][badge-dependency-husky]
![semantic-release dependency][badge-dependency-semantic-release]
![commitlint dependency][badge-dependency-commitlint]

[badge-dependency-astro]: https://img.shields.io/github/package-json/dependency-version/nicolasomar/moviegraphy/astro/main?logo=astro
[badge-dependency-react]: https://img.shields.io/github/package-json/dependency-version/nicolasomar/moviegraphy/react/main?logo=react
[badge-dependency-typescript]: https://img.shields.io/github/package-json/dependency-version/nicolasomar/moviegraphy/typescript/main?logo=typescript
[badge-dependency-antd]: https://img.shields.io/github/package-json/dependency-version/nicolasomar/moviegraphy/antd/main?logo=antdesign
[badge-dependency-nanostores]: https://img.shields.io/github/package-json/dependency-version/nicolasomar/moviegraphy/nanostores/main?logo=nanostores
[badge-dependency-prisma]: https://img.shields.io/github/package-json/dependency-version/nicolasomar/moviegraphy/@prisma/client/main?logo=prisma
[badge-dependency-pg]: https://img.shields.io/github/package-json/dependency-version/nicolasomar/moviegraphy/pg/main?logo=postgresql
[badge-dependency-commitlint]: https://img.shields.io/github/package-json/dependency-version/nicolasomar/moviegraphy/dev/@commitlint/cli/main?logo=commitlint
[badge-dependency-vitest]: https://img.shields.io/github/package-json/dependency-version/nicolasomar/moviegraphy/dev/vitest/main?logo=vitest
[badge-dependency-react-testing-library]: https://img.shields.io/github/package-json/dependency-version/nicolasomar/moviegraphy/dev/@testing-library/react/main?logo=testinglibrary
[badge-dependency-eslint]: https://img.shields.io/github/package-json/dependency-version/nicolasomar/moviegraphy/dev/eslint/main?logo=eslint
[badge-dependency-prettier]: https://img.shields.io/github/package-json/dependency-version/nicolasomar/moviegraphy/dev/prettier/main?logo=prettier
[badge-dependency-lint-staged]: https://img.shields.io/github/package-json/dependency-version/nicolasomar/moviegraphy/dev/lint-staged/main?logo=lint-staged
[badge-dependency-husky]: https://img.shields.io/github/package-json/dependency-version/nicolasomar/moviegraphy/dev/husky/main?logo=husky
[badge-dependency-semantic-release]: https://img.shields.io/github/package-json/dependency-version/nicolasomar/moviegraphy/dev/semantic-release/main?logo=semantic-release
[badge-dependency-commitlint]: https://img.shields.io/github/package-json/dependency-version/nicolasomar/moviegraphy/dev/@commitlint/cli/main?logo=commitlint

## What do I need?
Before cloning this repo, I recommend installing the following software:
- [Node](https://nodejs.org/en/download/) >= `24.4.0` to install packages.
- A [PostgreSQL database](https://www.postgresql.org/download/) on your local machine or in a cloud service.

## Setup
After cloning the repo, install the Node packages in the project's root directory.
```sh
git clone https://github.com/NicolasOmar/moviegraphy.git
cd moviegraphy
npm run setup
```

Lastly, create an `.env` file at your project's root with the following content.
```env
DATABASE_URL=HERE_GOES_YOUR_DATABASE_CONNECTION_STRING
```

## How to run it
To run it, simply execute
```sh
npm start
```
In case you want to execute it as a single instance (using a production-like build)
```sh
npm start:prod
```

## Folder structure
In case you have cloned the repo, it will show you the following folders:
- `.github:` [Github Actions](https://github.com/features/actions/) files used to run post-merge commits like unit test coverage collection.
- `.husky:` Dedicated to [Husky](https://typicode.github.io/husky/) configuration files.
- `configs:` Used to wrap all the configuration files related to local and third-party services (for a cleaner project organization).
- `src:` Location of all used components partially following Astro guidance:
  - `assets:` SVG files for specific purposes.
  - `components:` Location of the used components, all based on React and TypeScript.
    - Those are separated by entity/feature usage, and the `/shaded` are the base ones to be reused on other implementations.
  - `islands:` Astro components used as reusable sections on any page.
  - `layouts:` User interfaces used to wrap the Astro pages in a common structure.
  - `pages:` Astro-specific pages that also work as routes.
  - `store:` Global-level data handling using nanostructures to handle common data through Astro and React components.
- `prisma:` Location of prisma implementation with its `models/entities` and migrations to mirror the entity relationships in the database.
- `store:` Global-level data handling using nanostructures to handle common data through Astro and React components.
- `ts`: Location of shared pieces of reusable code such as functions and TypeScript types

## Branches and Environments
After my previous experience with [semantic-release](https://semantic-release.gitbook.io/semantic-release/) in [other projects](https://github.com/NicolasOmar/reactive-bulma/issues/3), I decided to give the following meaning to the project's versions after `v4.0.0`:
- Major versions (`5.0.0`, `6.0.0`, and beyond) will refer to milestone achievements and significant changes that will need extra attention before the update.
- Minor versions (`4.1.0`, `4.2.0`, and so on) will refer to bug fixes that required several important code changes or specific new features.
- Patch versions (`4.0.1`, `4.0.2`, and so on) will refer to bug fixes that required small code changes or weekly dependency updates.

To check the current project's status, go to the [Roadmap](#roadmap) section.

### Branching

Given the mentioned release logic, `main` is the only static branch, and each developed feature or fix will have a unique branch with its PR and a merge commit following [semantic versioning](https://semver.org/) and [semantic commits](https://github.com/semantic-release/semantic-release#commit-message-format) specifications.

## Roadmap
The first version/release ([`v1.0`](https://github.com/NicolasOmar/moviegraphy/milestone/1)) was created to investigate, pick, and integrate several libraries as project technical foundations, which took the shape of a proof of concept that you can review [here](localhost).

## License
**GPL 3.0**