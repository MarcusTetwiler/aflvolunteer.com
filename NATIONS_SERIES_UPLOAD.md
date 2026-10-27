# Nation's Series v2.2 reconstructed upload — READ FIRST

This is a NEW reconstruction, October 25, 2026, against GitHub main `2259a9b1d320ef09c64a1f368adb5e5918d6a1dd`. It replaces the missing prior ZIP; it is not byte-identical to that archive. Read docs/RECONSTRUCTION_AND_QA.md for tested behavior and remaining differences. Hero is IMAGE ONLY. No video generated or loaded. GitHub and Vercel were not modified.

1. Save this ZIP to Files/iCloud Drive or your computer, then extract it. Do not upload the ZIP itself as website source.
2. Upload the extracted files to the EXISTING repository, preserving exact paths. No enclosing folder. Do not flatten src/components, src/data or public/images. Preserve every unlisted file.
3. Manually delete `src/components/andrewContracts.js`; ZIP upload cannot delete it. The neutral `contractLedger.js` replacement is included.
4. Review CHANGE_MANIFEST.md. If main has changed since `2259a9b1d320ef09c64a1f368adb5e5918d6a1dd`, compare before overwriting unrelated changes. A review branch is useful for testing; a commit to main may automatically deploy through Vercel.
5. Run npm ci, npm test, npm run lint, npm run build where available. Dependencies are unchanged; node_modules and dist are excluded.
6. Test the acceptance checklist in docs/IMPORT_ACCEPTANCE.md on an actual phone before public-launch sign-off.

The reconstructed engineering/rendering and course use explicit new model/version IDs. Prior unpublished test totals and timing records do not transfer. Fresh suite: 25 tests. All checks are rerun on a clean GitHub-base reconstruction of this archive.

Online multi-aircraft sync and server-verified friend challenges remain future work. Existing optional signup service requires existing environment variables. No live signup, deployment or actual-iPhone QA is claimed. Production artwork/handling still need author review against the approved PDF.
