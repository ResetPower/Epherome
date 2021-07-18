import { exec } from "child_process";

export interface JavaVersion {
  name?: string;
  major?: number;
  minor?: number;
  is64Bit?: boolean;
}

export function checkJava(java: string): Promise<JavaVersion> {
  return new Promise((resolve) =>
    exec(`"${java}" -version`, (error, _stdout, stderr) => {
      if (error) {
        resolve({});
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
