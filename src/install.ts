import * as exec from "@actions/exec";
import * as path from "path";
import * as fs from "fs";

export function resolveOsName(os: string): string {
  switch (os) {
    case "darwin":
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
  if (platform === "macos" && arch === "arm64") {
    return `https://storage.googleapis.com/flutter_infra_release/releases/stable/${platform}/flutter_${platform}_arm64_${flutterVersion}-${flutterChannel}.zip`;
  }

  return `https://storage.googleapis.com/flutter_infra_release/releases/stable/${platform}/flutter_${platform}_${flutterVersion}-${flutterChannel}.zip`;
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

  const filename = `flutter.zip`;
  const destination = path.join(process.env.HOME, filename);

  if (process.env.NODE_ENV === "test") {
    fs.copyFileSync(
      path.join(__dirname, "..", "test", "resources", "flutter-sdk.zip"),
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
  const destination = await unzipArchive(archivePath);
  deleteArchive(archivePath);
  const flutterHome = path.join(destination, "bin");
  return flutterHome;
}
