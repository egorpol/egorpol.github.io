---
layout: post
title: "The Public Domain Sheet Music Finder, three years later"
date: 2026-10-28
categories: [research, tools]
tags: [musicology, public-domain, imslp, wikidata, python, data-sources]
excerpt: "My 2023 notebook for finding public-domain composers is now a versioned dataset with a browser. Most of the work went into checking that each record is the right person."
---

The [first note on this site]({% post_url 2023-07-03-blog1 %}), in July 2023, was about a small tool for finding composers whose music is in the public domain in the EU. Over the last few weeks I rebuilt it. It has a new name, eu-pd-composers, and it is now a dataset you can browse rather than a notebook you have to run.

## What it was

The old version was a Jupyter notebook of about 200 lines. It scraped Wikipedia’s [List of 20th-century classical composers](https://en.wikipedia.org/wiki/List_of_20th-century_classical_composers), ranked the composers by pageviews, filtered them by death year, and built an IMSLP category URL from each name. If that page existed, it counted as a hit: 961 of 3,367 composers. Nothing checked whether the page belonged to the same person.

## What it is now

[eu-pd-composers](https://github.com/egorpol/eu-pd-composers) is a versioned dataset with a [browser](https://egorpol.github.io/eu-pd-composers/). It starts from the same Wikipedia list and adds life dates and identifiers from [Wikidata](https://www.wikidata.org/), each composer’s work pages from [IMSLP](https://imslp.org/), and authority records from [GND](https://lobid.org/gnd) and [VIAF](https://viaf.org/). The current data version, r021:

|                                                    | Composers |
| -------------------------------------------------- | --------- |
| In the list                                        | 3,369     |
| Public domain in the EU now (died 1955 or earlier) | 777       |
| Not yet (21 of them from 1 January 2027)           | 1,870     |
| No death date on record                            | 722       |
| Matched to an IMSLP composer page                  | 1,254     |

The matched composers have 29,033 work pages on IMSLP, 20,391 of them by composers who are public domain now. Every label records where it came from, and each release is a fixed revision with a record of how it was built.

Open licences are a separate axis from public domain. On IMSLP, 5,573 works have a score under Creative Commons or a similar licence: 974 are new compositions by 28 composers, the other 4,599 are editions. The browser can filter for either.

## What the rebuild turned up

**Names are not people.** Guessing a page from a name needed checking. Of 298 guessed IMSLP pages, 10 belonged to someone else: the composer [Karl Marx](https://en.wikipedia.org/wiki/Karl_Marx_%28composer%29) got [the philosopher’s page](https://imslp.org/wiki/Category:Marx,_Karl), the composer [William Wordsworth](https://en.wikipedia.org/wiki/William_Wordsworth_%28composer%29) [the poet’s](https://imslp.org/wiki/Category:Wordsworth,_William). Wikidata’s own IMSLP links weren’t safe either; four pointed at a different person, [Jindřich Feld](https://en.wikipedia.org/wiki/Jind%C5%99ich_Feld) at [his father](https://imslp.org/wiki/Category:Feld,_Jind%C5%99ich) among them. Some rows pointed at the wrong person altogether. Jean Perrin led to [the physicist](https://en.wikipedia.org/wiki/Jean_Perrin), who died in 1942, instead of [the Swiss composer](https://en.wikipedia.org/wiki/Jean_Perrin_%28composer%29), who died in 1989; Jaroslav Kvapil led to [a writer](https://en.wikipedia.org/wiki/Jaroslav_Kvapil) who died in 1950, eight years before [the composer](https://en.wikipedia.org/wiki/Jaroslav_Kvapil_%28composer%29). Both had been marked public domain. Now a match counts only if IMSLP’s life dates or Wikipedia link agree, and every correction is a [hand-reviewed override with a source](https://github.com/egorpol/eu-pd-composers/blob/main/data/overrides/composers.tsv).

**Model guesses hid a bug.** IMSLP’s categories say what a piece is for: piano, voice, string quartet. A paging bug fetched them for only part of the works, so 62.8% came back with none, and the empty result was cached. In the first rebuilt releases, language-model guesses filled those gaps, so the data looked complete. With the bug fixed, IMSLP’s own categories label 98% of works, and model guesses dropped from 43.8% to 1.3%. A second bug turned every flute piece into guitar music, because “flute” contains “lute”.

**IMSLP mostly agrees.** IMSLP warns when a work is not public domain in the EU. It shows that warning for 65 of the 20,391 works by composers the dataset calls public domain, mostly vocal works and posthumous publications, which a rule based on the composer’s death can’t see. For the 7,834 works by composers who are not yet public domain, it shows the warning on 4,527; IMSLP gives it only for composers who died between 1956 and 1971.

## How I built it

The project was also a testbed for [claude-orchestrator](https://github.com/egorpol/claude-orchestrator), a setup I keep refining around my own use. Claude Code is the main agent, and Codex and Cursor run on their own subscriptions, so I juggle three accounts. Claude keeps design, data checks and review, and hands well-specified parts to whichever of the other two has quota to spare, each in its own git worktree. The other vendor’s agent reviews the result and Claude reads the diff, with tests before anything is merged. Sessions are kept short, each handing its state to the next in a file, and most of the rules started as a lesson from one of my sessions. The setup will get a note of its own.

## Where the models come in

**A second opinion before the rebuild.** Before I changed anything, Claude and Codex each assessed the September release from the same brief, without seeing each other’s report. Both found the missing categories and the flute bug. Claude also looked up 120 works with a guessed instrumentation on IMSLP. 115 had usable categories, and the guess matched the project’s own category rules for only 57% of them.

**Style labels.** Three models label each composer’s style and period, given the opening of the composer’s Wikipedia article: GPT-6.1 Sol through Codex, Grok 4.7 through Cursor and, since r021, Claude Haiku 5.5 through Claude Code. By default a tag counts only if Sol and Grok agree, which gives tags for 2,842 composers. The browser can switch to two of three, all three or a single model, and shows each model’s own vote. On the 153 composers that have style tags on Wikidata, the three models agree with Wikidata about equally well; [the comparison](https://github.com/egorpol/eu-pd-composers/blob/main/docs/LLM_STYLES.md) has the numbers. Every decision is a row in a ledger in the repository, and a rebuild replays the ledger instead of calling a model, so it produces the same labels. Models never decide identity, life dates, public-domain status or the IMSLP match; those come from fixed rules and sourced overrides.

**Searching for open scores.** Some living composers publish their own scores under Creative Commons: [Kyle Gann](https://www.kylegann.com/Gannmusic.html) has 176 of them online as PDFs. To find more like him, I had Codex and then Cursor’s agent search the web for the 2,592 composers who are not public domain yet. The agents only search; a script fetches each result page, follows one link, and looks for a licence statement and score files. When Cursor’s search tool was blocked, the model made up URLs from memory, so the script now takes URLs only from actual search results. Two pilots with 49 random composers found nothing new, and the full sweep left 112 candidates I haven’t reviewed yet. Two catalogues are confirmed so far, Gann’s and [Jacques Lenot’s](https://www.jacqueslenot.net/partitions/), and a plain check of the official websites listed on Wikidata had found both. The false alarms were mostly site-wide licence notes: one composer’s Creative Commons credit belonged to a map widget, and on another site the licensed PDFs were a privacy policy and an FAQ.

## Limits

This is not legal advice. Public domain here means only that the composer died in 1955 or earlier (the EU’s life plus 70 years). Lyricists and librettists, editions, arrangements, posthumous publications and national exceptions are not considered, so check the work itself before you copy, perform or publish it. In Spain, for example, authors who died before 7 December 1987 are protected for 80 years after their death, which still covers up to 190 of the 777 composers marked public domain. The cohort is one English Wikipedia list, with its biases, and the accuracy of the style labels hasn’t been measured yet.

## Credits and links

- [eu-pd-composers](https://github.com/egorpol/eu-pd-composers) on GitHub, and its [browser](https://egorpol.github.io/eu-pd-composers/).
- To cite the dataset: [10.5281/zenodo.23730119](https://doi.org/10.5281/zenodo.23730119) on Zenodo. The data is under [CC BY-SA 4.0](https://github.com/egorpol/eu-pd-composers/blob/main/data/LICENSE.md), the code under MIT.
- [IMSLP](https://imslp.org/) for work pages, categories and rights information.
- [Wikidata](https://www.wikidata.org/) for identities, life dates and identifiers.
- Wikipedia’s [List of 20th-century classical composers](https://en.wikipedia.org/wiki/List_of_20th-century_classical_composers), where the cohort comes from.
- [GND](https://lobid.org/gnd), through lobid, and [VIAF](https://viaf.org/) for authority records.
- The identity corrections: the [overrides](https://github.com/egorpol/eu-pd-composers/blob/main/data/overrides/composers.tsv), each with its source, and the [changelog](https://github.com/egorpol/eu-pd-composers/blob/main/CHANGELOG.md).
- [claude-orchestrator](https://github.com/egorpol/claude-orchestrator), the agent setup the project was built with.
