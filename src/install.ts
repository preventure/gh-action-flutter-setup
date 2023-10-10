import * as exec from "@actions/exec";
import * as path from "path";
import * as fs from "fs";

export function resolveOsName(os: string): string {
  switch (os) {
    case "darwin":
    case "macos":
      return "macos";
    case "win32":
      return "windows";
    default:
      return "linux";
  }
}

export function buildArchiveDownloadUrl(
  platform: string,
  arch: string,
  flutterVersion: string,
  flutterChannel: string
): string {
  const osName = resolveOsName(platform);
  const ext = extension(osName);
  if (osName === "macos" && arch === "arm64") {
    return `https://storage.googleapis.com/flutter_infra_release/releases/stable/${osName}/flutter_${osName}_arm64_${flutterVersion}-${flutterChannel}${ext}`;
  }
  return `https://storage.googleapis.com/flutter_infra_release/releases/stable/${osName}/flutter_${osName}_${flutterVersion}-${flutterChannel}${ext}`;
}

function extension(osName: string): string {
  if (osName === "linux") {
    return ".tar.xz";
  }
  return ".zip";
}

async function downloadArchive(
  platform: string,
  arch: string,
  flutterVersion: string,
  flutterChannel: string
): Promise<string> {
  const url = buildArchiveDownloadUrl(
    platform,
    arch,
    flutterVersion,
    flutterChannel
  );
  if (process.env.HOME === undefined) throw new Error("HOME is undefined");

  const filename = url.split("/").pop();
  if (!filename) {
    throw new Error(`Cannot extract filename from url ${url}`);
  }
  const ext = extension(resolveOsName(platform));
  const destination = path.join(process.env.HOME, `flutter${ext}`);

  if (process.env.NODE_ENV === "test") {
    const file = `flutter-sdk${ext}`;
    fs.copyFileSync(
      path.join(__dirname, "..", "test", "resources", file),
      destination
    );
    return destination;
  }

  await exec.exec("curl", ["-o", destination, "-L", url]);
  return destination;
}

async function unzipArchive(archivePath: string): Promise<string> {
  const destination = path.join(
    path.dirname(archivePath),
    path.basename(archivePath, ".zip")
  );
  await exec.exec("unzip", ["-o", archivePath, "-d", destination], {
    errStream: process.stdout,
    failOnStdErr: true
  });
  return destination;
}

function deleteArchive(archivePath: string): void {
  fs.rmSync(path.join(archivePath), {
    recursive: true,
    force: true
  });
}

export async function installFlutter(
  platform: string,
  arch: string,
  flutterVersion: string,
  flutterChannel: string
): Promise<string> {
  const archivePath = await downloadArchive(
    platform,
    arch,
    flutterVersion,
    flutterChannel
  );
  const destination = await extractArchive(archivePath);
  deleteArchive(archivePath);
  const flutterHome = path.join(destination, "bin");
  return flutterHome;
}

async function extractArchive(archivePath: string): Promise<string> {
  if (archivePath.endsWith(".zip")) {
    return unzipArchive(archivePath);
  } else if (archivePath.match(tarExtensionRegex)) {
    return untarArchive(archivePath);
  }
  throw new Error(`Unexpected archive extension, filename ${archivePath}`);
}

const tarExtensionRegex = /\.tar\.\w+$/;

async function untarArchive(archivePath: string): Promise<string> {
  const tarExtension = (archivePath.match(tarExtensionRegex) ?? [])[0];
  const destination = path.join(
    path.dirname(archivePath),
    path.basename(archivePath, tarExtension)
  );
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
  }
  await exec.exec("tar", ["-xf", archivePath, "-C", destination], {
    errStream: process.stdout,
    failOnStdErr: true
  });
  return destination;
}
