# gh-action-flutter-setup

Flutter setup github action.

Contents:

- [gh-action-flutter-setup](#gh-action-flutter-setup)
  - [Install](#install)
  - [Test](#test)
  - [Build](#build)
  - [Usage](#usage)

## Install

```sh
npm ci
```

## Test

```sh
npm test
```

## Build

```sh
npm run build
npm run package
```

## Usage

Example:

```yml
      - name: Set up flutter
        uses: preventure/gh-action-flutter-setup@main
        with:
          flutter-version: "3.7.12"
          flutter-channel: "stable"
```
