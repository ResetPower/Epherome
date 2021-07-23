import { exec } from "child_process";
import { constraints } from "../renderer/config";

export interface JavaVersion {
  name?: string;
  major?: number;
  minor?: number;
  is64Bit?: boolean;
}

export function checkJavaVersion(java: string): Promise<JavaVersion | null> {
  return new Promise((resolve) =>
    exec(`"${java}" -version`, (error, _stdout, stderr) => {
      if (error) {
        resolve(null);
      } else {
        const name = stderr.match(/"(.*?)"/)?.pop();
        const split = name?.split(".");
        resolve({
          name,
          major: split ? parseInt(split[0]) : undefined,
          minor: split ? parseInt(split[1]) : undefined,
          is64Bit: stderr.includes("64-Bit"),
        });
      }
    })
  );
}

export async function detectJava(): Promise<string[]> {
  const javaPaths: string[] = [];
  // first step: call "java" directly
  const result = await checkJavaVersion("java");
  result && javaPaths.push("java");
  // second step: check JAVA_HOME environment variable
  const javaHome = constraints.javaHome;
  javaHome && javaPaths.push(javaHome);
  return javaPaths;
}
