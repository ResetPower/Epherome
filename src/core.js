import { spawn } from "child_process";
import StreamZip from "node-stream-zip";
import os from "os";
import fs from "fs";
import { log4js, removeSuffix, removePrefix } from "@/utils";

const OPERATING_SYSTEM = os.platform();
const OPERATING_VERSION = os.release();
const lc = log4js.getLogger("core");
const lm = log4js.getLogger("minecraft");

/**
 * equal different operating system names
 * os0: OS names in Node.js
 * os1: OS names in Minecraft JSON file
 */
function equalOS(os0, os1) {
    // linux: linux
    if (os0 === os1) {
        return true;
    }
    // win32: windows
    if (os0 === "win32") return os1 === "windows";
    // darwin: osx or macos
    if (os0 === "darwin") return os1 === "osx" || os1 === "macos";
    return false;
}

/**
 * The repeat part of function isCompliant(rules)
 */
function isOSCompliant(os) {
    if (Object.prototype.hasOwnProperty.call(os, "name")) {
        if (Object.prototype.hasOwnProperty.call(os, "version")) {
            if (
                equalOS(OPERATING_SYSTEM, os["name"]) ||
                OPERATING_VERSION.startsWith(os["version"])
            ) {
                return true;
            }
        } else {
            if (equalOS(OPERATING_SYSTEM, os["name"])) {
                return true;
            }
        }
    }
    if (Object.prototype.hasOwnProperty.call(os, "arch")) {
        if (os["arch"] === "x86") {
            return true;
        }
    }
}

/**
 * to see if the using operating system is compliant
 */
function isCompliant(rules) {
    let ret = false;
    for (let j in rules) {
        let r = rules[j];
        let a = r["action"];
        if (Object.prototype.hasOwnProperty.call(r, "os")) {
            let o = r["os"];
            if (a === "disallow") {
                if (isOSCompliant(o)) {
                    ret = false;
                }
            } else if (a === "allow") {
                if (isOSCompliant(o)) {
                    ret = true;
                }
            }
        } else {
            if (a === "allow") {
                ret = true;
            } else if (a === "disallow") {
                ret = false;
            }
        }
    }
    return ret;
}

/**
 * options: (profile: profile, name: string, uuid: string, token: string, details: array<detail>, java: string, reloadDetails: function, setSpeed: function, done: function)
 * errCall: function(type, msg, name) // type: "Epherome" or "Minecraft", name: "TypeError" and so on
 */
function launchMinecraft(options, errCall) {
    try {
        launchMinecraftImplement(options, errCall);
    } catch (e) {
        console.log(e);
        lc.error(`${e.name} : ${e.message}`);
        errCall("Epherome", e.message, e.name);
    }
}

function launchMinecraftImplement(options, errCall) {
    lc.info("Launching Minecraft... ...");
    let profile = options["profile"];
    let ver = profile["ver"];
    let name = options["name"];
    let uuid = options["uuid"];
    let token = options["token"];
    let details = options["details"];
    let javaPath = options["java"];
    let reloadDetails = options["reloadDetails"];
    // let setSpeed = options["setSpeed"];
    // start to analyze json file
    lc.info("start to analyze json file");
    details.push({
        text: "progress.analyze-json",
        stat: false,
    });
    reloadDetails();
    let dir = removeSuffix(profile["dir"], "/");
    let data = fs.readFileSync(`${dir}/versions/${ver}/${ver}.json`);
    let parsed = JSON.parse(data);
    let buff = [];
    let clientJar = `${dir}/versions/${ver}/${ver}.jar`;
    if (Object.prototype.hasOwnProperty.call(parsed, "arguments")) {
        // 1.13, 1.13+
        if (OPERATING_SYSTEM === "darwin") {
            // macos
            buff.push("-XstartOnFirstThread", "-Xdock:name=Minecraft");
        } else if (OPERATING_SYSTEM === "win32") {
            // windows
            buff.push(
                "-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump"
            );
            if (OPERATING_VERSION.startsWith("10")) {
                // windows 10
                buff.push("-Dos.name=Windows 10", "-Dos.version=10.0");
            }
        }
        buff.push("-Xss1M");
    } else {
        // 1.12, 1.12-
        buff.push(`-Dminecraft.client.jar=${clientJar}`);
    }
    let nativeDir = `${dir}/versions/${ver}/${ver}-natives`;
    try {
        fs.accessSync(nativeDir);
    } catch (e) {
        fs.mkdirSync(nativeDir);
    }
    buff.push(
        `-Djava.library.path=${nativeDir}`,
        `-Dminecraft.launcher.brand=Epherome`,
        `-Dminecraft.launcher.version=${process.env.npm_package_version}`
    );
    let obj = analyzeLibrary(dir, ver, parsed["libraries"], nativeDir, errCall);
    details[1]["stat"] = true;
    // finished

    // start to download missing assets
    lc.info("start to download missing assets");
    details.push({
        text: "progress.down-asset",
        stat: false,
    });
    reloadDetails();
    // TODO downloading missing assets
    details[2]["stat"] = true;
    // finished

    // start to download missing libraries
    lc.info("start to download missing libraries");
    details.push({
        text: "progress.down-lib",
        stat: false,
    });
    reloadDetails();
    // TODO downloading missing libraries
    details[3]["stat"] = true;
    // finished

    // start to unzip native libraries
    lc.info("start to unzip native libraries");
    details.push({
        text: "progress.unzip",
        stat: false,
    });
    reloadDetails();
    let nativeLibs = obj["nativeLibs"];
    for (let i in nativeLibs) {
        let file = nativeLibs[i];
        let zip = new StreamZip({
            file: file,
            storeEntries: true,
        });
        zip.on("ready", () => {
            zip.extract(null, nativeDir, (err, count) => {
                zip.close();
                if (err) {
                    lc.error(
                        `Error Occurred in Unzipping File "${file}". Unzipped ${count} Files.`
                    );
                    errCall(
                        "Epherome",
                        `Error Occurred in Unzipping File "${file}". Unzipped ${count} Files.`
                    );
                }
            });
        });
    }
    details[4]["stat"] = true;

    let cp = obj["cp"];
    cp.push(clientJar);
    buff.push("-cp", OPERATING_SYSTEM === "win32" ? cp.join(";") : cp.join(":"));

    // push main class
    buff.push(parsed["mainClass"]);

    // push minecraft arguments
    buff.push(
        "--username",
        name,
        "--version",
        ver,
        "--gameDir",
        dir,
        "--assetsDir",
        `${dir}/assets`,
        "--assetIndex",
        parsed["assetIndex"]["id"],
        "--uuid",
        uuid,
        "--accessToken",
        token,
        "--userType",
        "mojang",
        "--versionType",
        parsed["type"]
    );

    details.push({
        text: "progress.running",
        stat: false,
    });
    reloadDetails();

    let firstTimeToReceiveStdout = true;

    // start minecraft

    let minecraftProcess = spawn(javaPath, buff, {
        cwd: dir,
    });

    minecraftProcess.stdout.on("data", function(data) {
        if (firstTimeToReceiveStdout) {
            options["done"]();
            firstTimeToReceiveStdout = false;
        }
        lm.debug(data.toString());
    });
    minecraftProcess.stderr.on("data", function(data) {
        lm.error(data.toString());
    });
    minecraftProcess.on("exit", function(code) {
        lc.debug("Minecraft process exit, exit code:" + code);
    });
}

/**
 * returns a object contains (cp, missing, natives)
 * cp: classpath
 * missing: list of 'artifact' or 'natives-${platform}' object (cross-platform or native library or native library, need to download), contains (path, sha1, size, url)
 * nativeLibs: list of string (only native library, need to unzip)
 */
function analyzeLibrary(dir, ver, library) {
    lc.info("Analyzing Library in JSON");
    let buff = [];
    let missing = [];
    let nativeLibs = [];
    for (let i in library) {
        let l = library[i];
        if (Object.prototype.hasOwnProperty.call(l, "rules")) {
            if (!isCompliant(l["rules"])) {
                continue;
            }
        }
        let d = l["downloads"];
        if (Object.prototype.hasOwnProperty.call(d, "classifiers")) {
            // has classifier (maybe it also has artifact): native library
            let cl = d["classifiers"];
            if (Object.prototype.hasOwnProperty.call(l, "rules")) {
                if (!isCompliant(l["rules"])) {
                    continue;
                }
            }
            if (Object.prototype.hasOwnProperty.call(l, "natives")) {
                let natives = l["natives"];
                for (let i in natives) {
                    let n = natives[i];
                    if (equalOS(OPERATING_SYSTEM, removePrefix(n, "natives-"))) {
                        let file = `${dir}/libraries/${cl[n]["path"]}`;
                        try {
                            fs.accessSync(file);
                        } catch (e) {
                            lc.warn(`Native library file ${file} not exists`);
                            missing.push(cl[n]);
                        }
                        nativeLibs.push(file);
                    }
                }
            }
        } else if (Object.prototype.hasOwnProperty.call(d, "artifact")) {
            // has artifact only: java cross-platform library
            let ar = d["artifact"];
            let file = `${dir}/libraries/${ar["path"]}`;
            try {
                fs.accessSync(file);
            } catch (e) {
                lc.warn(`Library file ${file} not exists`);
                missing.push(ar);
            }
            buff.push(file);
        }
    }
    return {
        cp: buff,
        missing: missing,
        nativeLibs: nativeLibs,
    };
}

export {
    equalOS,
    isOSCompliant,
    isCompliant,
    launchMinecraft,
    launchMinecraftImplement,
    analyzeLibrary,
};
