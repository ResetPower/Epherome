const pkg = require("../package.json");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function calculateHash(ext) {
  const filename = `Epherome-${pkg.version}${ext}`;
  const file = path.resolve(`package/${filename}`);
  try {
    const data = fs.readFileSync(file);
    const md5 = crypto.createHash("md5").update(data).digest("hex");
    const sha1 = crypto.createHash("sha1").update(data).digest("hex");
    const sha256 = crypto.createHash("sha256").update(data).digest("hex");
    const sha512 = crypto.createHash("sha512").update(data).digest("hex");
    fs.writeFileSync(
      `${file}.hash`,
      `${filename}\n` +
        `MD5\n${md5}\n` +
        `SHA1\n${sha1}\n` +
        `SHA256\n${sha256}\n` +
        `SHA512\n${sha512}\n`
    );
  } catch {}
}

// generate hash
["-x64.dmg", "-arm64.dmg", ".exe", ".tar.gz", ".deb", ".rpm", ".snap"].forEach(
  calculateHash
);
