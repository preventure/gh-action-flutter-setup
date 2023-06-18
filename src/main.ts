import * as os from "os";
import * as core from "@actions/core";
import {installFlutter} from "./install";

async function run(): Promise<void> {
  try {
    const platform = os.platform();
    const arch = os.arch();
    const flutterVersion = core.getInput("flutter-version");
    const flutterChannel = core.getInput("flutter-channel");

    const flutterSdkPath = await installFlutter(
      platform,
      arch,
      flutterVersion,
      flutterChannel
    );
    core.addPath(flutterSdkPath);
    core.debug(`Installed Flutter SDK to ${flutterSdkPath}`);

    core.setOutput("flutter-home", flutterSdkPath);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
