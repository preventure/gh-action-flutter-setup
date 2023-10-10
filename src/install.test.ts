import {test, expect, afterEach} from "vitest";
import {
  buildArchiveDownloadUrl,
  installFlutter,
  resolveOsName
} from "./install";
import * as path from "path";
import * as fs from "fs";

afterEach(() => {
  fs.rmSync(path.join(process.env.HOME, "flutter.zip"), {
    force: true
  });
  fs.rmSync(path.join(process.env.HOME, "flutter"), {
    recursive: true,
    force: true
  });
});

test("resolves os name", () => {
  const osName = resolveOsName("darwin");
  expect(osName).toBe("macos");
});

test("resolves os name for windows", () => {
  const osName = resolveOsName("win32");
  expect(osName).toBe("windows");
});

test("resolves os name for linux", () => {
  const osName = resolveOsName("linux");
  expect(osName).toBe("linux");
});

test("builds archive download url", () => {
  const platform = "darwin";
  const arch = "x64";
  const flutterVersion = "3.10.5";
  const flutterChannel = "stable";

  const archiveDownloadUrl = buildArchiveDownloadUrl(
    platform,
    arch,
    flutterVersion,
    flutterChannel
  );

  expect(archiveDownloadUrl).toBe(
    "https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_3.10.5-stable.zip"
  );
});

test("builds archive download url for arm64", () => {
  const platform = "darwin";
  const arch = "arm64";
  const flutterVersion = "3.10.5";
  const flutterChannel = "stable";

  const archiveDownloadUrl = buildArchiveDownloadUrl(
    platform,
    arch,
    flutterVersion,
    flutterChannel
  );

  expect(archiveDownloadUrl).toBe(
    "https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_arm64_3.10.5-stable.zip"
  );
});

test("builds archive download url for windows", () => {
  const platform = "win32";
  const arch = "x64";
  const flutterVersion = "3.10.5";
  const flutterChannel = "stable";

  const archiveDownloadUrl = buildArchiveDownloadUrl(
    platform,
    arch,
    flutterVersion,
    flutterChannel
  );

  expect(archiveDownloadUrl).toBe(
    "https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.10.5-stable.zip"
  );
});

test("builds archive download url for linux", () => {
  const platform = "linux";
  const arch = "arm64";
  const flutterVersion = "3.7.12";
  const flutterChannel = "stable";

  const archiveDownloadUrl = buildArchiveDownloadUrl(
    platform,
    arch,
    flutterVersion,
    flutterChannel
  );

  expect(archiveDownloadUrl).toBe(
    "https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.7.12-stable.tar.xz"
  );
});

test("install flutter", async () => {
  const platform = "macos";
  const arch = "x64";
  const flutterVersion = "3.10.5";
  const flutterChannel = "stable";
  const flutterPath = await installFlutter(
    platform,
    arch,
    flutterVersion,
    flutterChannel
  );
  expect(flutterPath.endsWith("flutter/bin")).toBe(true);
  expect(fs.existsSync(path.join(flutterPath, "flutter"))).toBe(true);
});
