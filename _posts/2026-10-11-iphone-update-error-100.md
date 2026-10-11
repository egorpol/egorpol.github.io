---
layout: post
title: "Reading the logs of a phone that wouldn’t boot"
date: 2026-10-11
categories: [workflow, debugging]
tags: [ios, idevicerestore, debugging, logs, two-factor]
excerpt: "An iOS update failed twice at the very end. Finder’s logs showed why: the phone’s own space check passed when it should have failed."
---

This one has nothing to do with music. But after more than two quiet years, it’s as good an occasion as any to start posting notes again.

On Sunday afternoon, 11 October 2026, I updated my iPhone 13 from iOS 26.6.1 to iOS 27.0.1 through Finder. The progress bar reached almost the end, and then Finder reported `Unknown error (100). 06A6.0064`. The phone stayed frozen on the Apple logo.

The phone holds my banking app, authenticator apps, and the eSIM for my mobile number. An update that ends in a wipe can lock you out of most of your digital life for days.

This note describes how I got the phone back without losing data. The fix itself is not mine; it comes from a Reddit guide and relies on an open-source tool. What interested me more was the way there. Finder writes detailed logs, and they showed exactly where the update failed, and why Apple’s own check didn’t catch it.

## What happened


| Time               | Event                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| ~12:03             | Local Finder backup (unencrypted, 75,059 files).                                                               |
| Afternoon          | Update started in Finder: iOS 26.6.1 (23G83) to iOS 27.0.1 (24A446).                                           |
| 15:33              | First failure: `Unknown error (100). 06A6.0064`. Phone frozen on the Apple logo, progress bar nearly full.     |
| Over an hour later | Recovery Mode via the buttons; in Finder I chose “Update”, not “Restore”.                                      |
| 16:58              | Second failure, identical error. When I dismissed the dialog, the phone disappeared from Finder.               |
| ~17:30–17:50       | Mapped the fallback for every account that depends on the phone.                                               |
| ~17:50–18:05       | Read the logs and worked out the space check.                                                                  |
| 18:10–18:50        | Copied the backup to an external drive and verified it; downloaded the firmware again and checked its SHA-256. |
| 18:26–18:53        | Built idevicerestore from source.                                                                              |
| ~19:00             | Unpacked the firmware, changed one value, checked the diff; phone into Recovery Mode.                          |
| 19:03              | Started the idevicerestore run.                                                                                |
| 19:10              | `Status: Restore Finished`. The phone booted with its data intact.                                             |


All times are local. The hardware: an iPhone 13 (`iPhone14,5`, board `d17ap`, 128 GB) and an Intel MacBook Pro running macOS 26.

## Triage before repair

After the second identical failure I stopped. In Recovery Mode, Finder offers “Update”, which keeps your data, and “Restore”, which erases the phone. Restore was the obvious next step, and I had a backup. But a backup doesn’t bring everything back. An unencrypted one leaves out the keychain, and many banking and authenticator apps deliberately don’t carry their secrets over to a new install.

So before trying anything that might wipe the phone, I wanted to know what a wipe would cost. I went through every account that depended on the phone and wrote down how I would get back in without it.


| Account                                                | Way back in if the phone is wiped                                                                                                                    |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile number (eSIM)                                   | A new eSIM QR code or a physical SIM from the carrier’s customer portal. Reissuing kills the active profile, so not while a repair might still work. |
| Bank                                                   | Reinstall the app and confirm by SMS to the same number.                                                                                             |
| Broker                                                 | App, PIN, and SMS; failing that, an ID photo and a selfie. Too many SMS requests cause a temporary lockout.                                          |
| Authenticator app (work, and probably my GitHub codes) | Its in-app backup, restored via SMS to the same number.                                                                                              |
| GitHub                                                 | Still logged in on a second Mac, in the browser and the `gh` CLI. But see below.                                                                     |
| Steam                                                  | Remove the authenticator with the recovery code (R-code) or by SMS, at the price of a temporary trade hold.                                          |
| Car                                                    | The physical key card.                                                                                                                               |


Yes, Steam is on the list. I care a lot about the *LEGO Star Wars: The Skywalker Saga* playthrough I started with my son two days ago.

Once it was written down, the pattern was obvious: almost everything falls back to an SMS to the same number. The eSIM is the master key. Losing the phone would have been an inconvenience; losing the number would have locked me out of nearly everything.

GitHub was the instructive case. I was still logged in on the other Mac, so I tried to add a second factor that didn’t live on the phone: a passkey, or at least an SSH key. GitHub’s sudo mode wanted a confirmation through GitHub Mobile, which was on the frozen phone, and refused. The token of the `gh` CLI lacked the `admin:public_key` scope, so that route was closed too, and formal account recovery would have taken days. GitHub did exactly the right thing: a session on a second machine should not be enough to add a new way in.

## Reading the logs

Finder logs each update attempt in `~/Library/Logs/iPhone Updater Logs/`; mine were `iPhoneUpdater-13.log` and `iPhoneUpdater-14.log`. The files also relay the phone’s own restore log, and that is where the useful lines are:

```
Transfer: Failed preallocation of 6012534784 bytes for /mnt9/cryptex1/current/os.dmg: Unknown error: -1.
Transfer: Failed preallocation due to space. No hope in this succeeding, bailing.
ramrod_splat_install: install handler failed
CHECKPOINT FAILURE:(FAILURE:100) [0x06A6] install_splat [0]D(failed to install splat)
```

So error 100 is not mysterious after all. `/mnt9` is the Preboot volume. The file being written is a cryptex, the part of the system that Apple ships as a separate image: here SystemOS (5,734 MB) plus AppOS (16 MB). The phone tried to reserve 6,012,534,784 bytes for it and didn’t have the room.

Two more details mattered. By the time of the failure, the new system volume had already been installed: the second attempt reports “previous OS version: 24A446”, the very version it was updating to. And the Data volume, where my data lives, mounted normally every time. The phone was stuck halfway, but my data hadn’t been touched. That changed the question from how to save my data to how to get the last step to finish.

## The check that passed

Before installing, the phone runs a step called `space_checks`. These are the relevant lines from the second attempt:

```
Successfully obtained build identity
Successfully read minSystemPartitionSize : 8572 MB
ramrod_splat_get_total_cryptex_size: Total size of cryptexes is 6029312000 bytes
Adding cryptexSize(6029312000 bytes) to spaceForRestore(9437813145)
...
SpaceNeededForRestore: 6052 MB ContainerFreeSpace: 6450 MBSufficient space available for upgrade install
```

Putting the logged numbers together, the calculation is:

```
spaceNeeded ≈ MinimumSystemPartition × 1.05
            + size of the cryptexes
            − size of the current System volume
            − size of the current Preboot volume
```

`MinimumSystemPartition` comes from the firmware’s `BuildManifest.plist` and is 8572 MB here. 8572 × 1.05 = 9,000.6 MB, which is exactly the logged `spaceForRestore(9437813145)`; the log’s “MB” are binary megabytes, and 9,437,813,145 ÷ 1,048,576 = 9,000.6. With the volume sizes from the logs, the formula reproduces the result of both attempts:


|                                         | Attempt 1       | Attempt 2       |
| --------------------------------------- | --------------- | --------------- |
| Current System volume                   | 7,775,645,696 B | 8,929,890,304 B |
| Current Preboot volume                  | 5,479,985,152 B | 191,029,248 B   |
| SpaceNeededForRestore                   | 2,109 MB        | 6,052 MB        |
| ContainerFreeSpace                      | 2,507 MB        | 6,450 MB        |
| Check result                            | “Sufficient”    | “Sufficient”    |
| Cryptex preallocation (6,012,534,784 B) | failed          | failed          |


Both times the check passed with about 400 MB to spare, and both times the real write failed. Apple’s estimate is too optimistic.

But hadn’t iOS told me that 8 to 10 GB were available? It had: Settings counts *purgeable* space, meaning caches and other data that iOS can discard when it needs room. Before the update, the container really had only about 2.5 GB free. The restore log says it mounts the Data volume “for free space checks/cleanup”, but as far as I can tell, the cleanup only runs when the check fails. The check passed, so nothing was purged.

## The fix

The workaround from [the Reddit guide](https://www.reddit.com/r/applehelp/comments/1wsvwrm/guide_fixed_iphone_error_100_06a6_install_splat/) turns this around. If a passing check is the problem, make it fail. Raise `MinimumSystemPartition` in the firmware’s Update identity, and the phone concludes that it needs more room than it has. With 10400 instead of 8572, and the volume sizes from the second attempt, the space needed becomes about 1.05 × 10,400 − 2,948 ≈ 7,970 MB, against 6,450 MB free. (The 2,948 MB are the current System and Preboot volumes minus the cryptexes.)

Finder offers no way to do that. idevicerestore, the open-source [restore tool](https://github.com/libimobiledevice/idevicerestore) from the libimobiledevice project, does: it accepts an unpacked IPSW directory in place of the `.ipsw` file, so the original firmware never has to be modified.

At first I doubted that it would work. In idevicerestore’s source (`src/restore.c` at commit `4b3e847`), `MinimumSystemPartition` is only passed to the device as `SystemPartitionSize` for macOS restores, not for iPhones. What makes it work anyway is that the iPhone asks for the whole build identity during the restore, and idevicerestore sends it as it is; the run log shows it (`Done sending BuildIdentityDict`). That is how the edited value reaches the phone. Nor does the edit break the signature. Apple’s signing server (TSS) signs the digests of the firmware components, not the `Info` dictionary where the value lives.

The steps, in order:

1. **Secure the evidence.** I reformatted a spare 1 TB NVMe drive (ext4, from an old Linux workstation) to exFAT, so that both the Mac and Linux can read it, then copied the backup and the logs to it and verified the copy.
2. **Get the firmware again.** After the failed attempts, Finder had silently deleted its cached 11 GB IPSW. I downloaded the same build again and checked it against the SHA-256 listed by the [ipsw.me API](https://api.ipsw.me/v4/device/iPhone14,5?type=ipsw).
3. **Build idevicerestore.** Homebrew has no formula for it, so I built it from source with the project’s `limd-build-macos.sh` script.
4. **Change one value.** I unpacked the IPSW into a directory and changed `MinimumSystemPartition` from 8572 to 10400 in the Update identity: the build identity for `d17ap` whose variant is “Customer Upgrade Install (IPSW)”. A diff against the original manifest showed one changed line.
5. **Pin the variant, and read before confirming.** With the phone in Recovery Mode, I ran idevicerestore with the variant set explicitly. Before it sends anything to the device, idevicerestore prints `Variant: …` and then either `This restore will update the device without erasing user data.` or `This restore will erase all device data.` That line is the checkpoint.

The command, with the flags to avoid:

```sh
idevicerestore --variant "Customer Upgrade Install (IPSW)" path/to/unpacked-ipsw/
```

- Without `-e`, idevicerestore picks “Customer Upgrade Install (IPSW)” anyway; `--variant` makes the choice explicit.
- `-e` (`--erase`) performs an erase restore. Not here.
- `-y` (`--no-input`) switches off the prompts that guard against data loss. Never here.

The run started at 19:03. At 19:10 it printed `Status: Restore Finished`, `install_splat` had returned `result=0`, and the phone booted with everything where I had left it.

The build had its own small obstacles, noted here for anyone with a similar setup:

- The build script refused to run while Homebrew’s OpenSSL headers sat in `/usr/local/include/openssl`. I moved them aside for the build and restored them afterwards.
- Homebrew rejected the Xcode Command Line Tools as too old for macOS 26. Removing and reinstalling them fixed it.
- zsh, with interactive comments switched off, treated the `#` comments in pasted commands as text and got stuck at a `quote>` prompt.
- Homebrew now labels Intel macOS as an unsupported Tier 3 platform, which will matter for this kind of tooling.

For the record, the build was `idevicerestore 1.0.0-278-g4b3e847`, with libirecovery 1.3.1-12-g93c117c and libtatsu 1.0.5-6-ge7d6ad1.

## What is proven and what isn’t

Proven by the logs:

- The update failed because the phone couldn’t preallocate 6,012,534,784 bytes for the cryptex on the Preboot volume.
- Before both failures, the phone’s space check passed with about 400 MB to spare.
- With the patched value, `install_splat` returned `result=0` and the restore finished.

Inferred, not proven:

- That the failed check triggered the cleanup of purgeable data, and that this made room for the install. The log of the successful run doesn’t contain the phone’s own space-check lines; the device log relayed in it was a stale copy from the earlier Finder attempt. So I can’t show the check failing, or what was purged.
- The formula itself. It reproduces the logged numbers for both attempts, but I haven’t seen Apple’s code.

I’m not the only one to hit this. [Issue #734](https://github.com/libimobiledevice/idevicerestore/issues/734) in the idevicerestore repository describes the same `install_splat` failure on an iPhone 13 Pro. Threads about error 100 on Apple’s own forums go back years and end without an answer; in [one from 2022](https://discussions.apple.com/thread/254197773), the top reply says only that “Apple does not provide any documentation for Error 100, whatever that might be”.

## Lessons

- Keep 15 to 20 GB of real free space before a major iOS update. Don’t trust the “available” figure in Settings; it includes purgeable data.
- Use encrypted Finder backups.
- Set up second factors before you need them: passkeys, recovery codes, cloud backup for authenticator apps, Steam’s R-code.
- If an update fails a second time with the same error, stop and read the logs rather than retrying or restoring.
- Copy the evidence (logs, backup) off the machine before experimenting.

## Credits and links

As far as I can tell, Apple hasn’t addressed this. The heavy lifting was done by the community and by open-source developers:

- [The Reddit guide](https://www.reddit.com/r/applehelp/comments/1wsvwrm/guide_fixed_iphone_error_100_06a6_install_splat/) on r/applehelp, which described the `MinimumSystemPartition` workaround for error 100 (06A6, `install_splat`).
- [idevicerestore](https://github.com/libimobiledevice/idevicerestore) from the libimobiledevice project, the restore tool that made the repair possible.
- [Issue #734](https://github.com/libimobiledevice/idevicerestore/issues/734) in the idevicerestore repository, with the same failure on an iPhone 13 Pro.
- [The 2022 thread](https://discussions.apple.com/thread/254197773) on Apple’s forums about error 100.
- [The ipsw.me API](https://api.ipsw.me/v4/device/iPhone14,5?type=ipsw) for firmware URLs, SHA-256 checksums, and signing status.

