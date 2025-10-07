#!/usr/bin/env node
/**
 * Simple helper to fetch a Firebase ID token from the Auth Emulator.
 * Usage:
 *   node be/scripts/getIdToken.js <email> <password>
 *   OR with flags: node be/scripts/getIdToken.js --email=<email> --password=<password>
 *
 * Requires the Auth Emulator to be running on 127.0.0.1:9099.
 */

const AUTH_EMULATOR_BASE = "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1";

function parseArgs(argv) {
  const args = {email: undefined, password: undefined};
  for (const arg of argv.slice(2)) {
    if (arg.startsWith("--email=")) args.email = arg.substring("--email=".length);
    else if (arg.startsWith("--password=")) args.password = arg.substring("--password=".length);
  }
  if (!args.email && argv[2]) args.email = argv[2];
  if (!args.password && argv[3]) args.password = argv[3];
  return args;
}

async function main() {
  const {email, password} = parseArgs(process.argv);
  if (!email || !password) {
    console.error("Usage: node be/scripts/getIdToken.js <email> <password>");
    process.exit(1);
  }

  const url = `${AUTH_EMULATOR_BASE}/accounts:signInWithPassword?key=any`;
  const res = await fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({email, password, returnSecureToken: true}),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Login failed (${res.status}):`, text);
    process.exit(2);
  }

  const json = await res.json();
  const idToken = json.idToken;
  const localId = json.localId;
  const expiresInSec = Number(json.expiresIn || 3600);

  console.log("UID=", localId);
  console.log("EXPIRES_IN(s)=", expiresInSec);
  console.log("ID_TOKEN=", idToken);

  // Convenience: shell export lines
  console.log("\n# Exports for your shell session:");
  console.log(`export FIREBASE_UID=${localId}`);
  console.log(`export FIREBASE_ID_TOKEN=${JSON.stringify(idToken)}`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(3);
});


