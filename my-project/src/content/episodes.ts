import type { Episode } from "@/lib/types";

const ep = (
  number: number,
  slug: string,
  title: string,
  shortDescription: string,
  fullDescription: string,
  durationSeconds: number,
  publishedAt: string,
  featured = false,
): Episode => {
  const nn = String(number).padStart(2, "0");
  return {
    number,
    slug: `ep-${nn}-${slug}`,
    title,
    shortDescription,
    fullDescription,
    artworkSrc: `/artwork/ep-${nn}.svg`,
    artworkAlt: `Episode ${number} artwork: ${title}`,
    durationSeconds,
    publishedAt,
    audioSrc: `/audio/ep-${nn}.mp3`,
    featured,
  };
};

export const episodes: readonly Episode[] = [
  ep(
    1,
    "why-we-started-signal-and-noise",
    "Why We Started Signal & Noise",
    "The origin story: what a loud world does to good ideas, and why we think slow conversation is the antidote.",
    `In this first episode, host Maya Lindqvist explains the itch that started the show: too many brilliant people, too little time to actually hear them think.

We talk about what "signal" means to us, why we refuse mid-roll ads, and the three rules every guest agrees to before we press record.

If you only listen to one episode to understand what this podcast is, make it this one.`,
    1860,
    "2026-01-06",
  ),
  ep(
    2,
    "the-quiet-power-of-constraints",
    "The Quiet Power of Constraints",
    "Designer Tomas Okafor on why the best work he ever shipped came from the smallest budget he ever had.",
    `Tomas Okafor has led design at three companies you've heard of and one you haven't. The one you haven't is the one he's proudest of.

We dig into constraint as a creative engine: fixed deadlines, tiny teams, one-color palettes, and the strange freedom of having nowhere to hide.

Tomas also shares the "napkin test" he still uses to kill features before they're built.`,
    2745,
    "2026-01-13",
  ),
  ep(
    3,
    "what-the-ocean-knows-about-data",
    "What the Ocean Knows About Data",
    "Marine scientist Dr. Ines Ferreira on sensing an ecosystem you can't see and trusting instruments over intuition.",
    `Dr. Ines Ferreira has spent two decades listening to the ocean through hydrophones, buoys, and satellites.

She explains how marine scientists cope with sparse, noisy data, why a single clean reading can be more misleading than a thousand messy ones, and what every dashboard designer should learn from a tide chart.

We close with the sound of a humpback recorded 40 kilometres offshore.`,
    3120,
    "2026-01-20",
  ),
  ep(
    4,
    "building-in-public-without-burning-out",
    "Building in Public Without Burning Out",
    "Founder Priya Natarajan on sharing the messy middle, the comments that stung, and the boundary that saved her company.",
    `Priya Natarajan grew her bootstrapped company from zero to profitable while posting every revenue number along the way.

We talk about what building in public actually bought her, the week she almost quit, and the single boundary she now recommends to every founder who wants to be transparent without being consumed.

A candid episode about attention as a two-way street.`,
    2580,
    "2026-01-27",
  ),
  ep(
    5,
    "the-last-typewriter-repair-shop",
    "The Last Typewriter Repair Shop",
    "Eighty-one-year-old Walter Bashir keeps a dying craft alive one platen at a time. He has thoughts about your keyboard.",
    `Walter Bashir has repaired typewriters in the same shopfront since 1971. His customers now include novelists, poets, and a surprising number of software engineers.

He talks about why mechanical feedback matters, how he diagnoses a machine by sound alone, and what he thinks we lost when writing stopped making noise.

Recorded on location, with the clatter of a 1958 Olympia in the background.`,
    2210,
    "2026-02-03",
  ),
  ep(
    6,
    "how-to-change-your-mind-on-purpose",
    "How to Change Your Mind on Purpose",
    "Cognitive scientist Dr. Lena Hoffmann on the mechanics of updating beliefs and why most of us never practice it.",
    `Dr. Lena Hoffmann studies how people revise what they believe — and why they so rarely do.

We cover the difference between being persuaded and being convinced, the role of identity in stubbornness, and a 10-minute weekly exercise her lab found measurably increases intellectual flexibility.

A practical episode for anyone who suspects they're more certain than they should be.`,
    2960,
    "2026-02-10",
  ),
  ep(
    7,
    "the-art-of-listening",
    "The Art of Listening",
    "Hostage negotiator turned mediator Samuel Adeyemi on what real listening costs and why it's rarer than talent.",
    `Samuel Adeyemi spent fifteen years talking people off ledges, literally and figuratively. Now he teaches executives to listen.

He breaks down tactical empathy, the pause that changes conversations, and the difference between hearing someone and letting them know they've been heard.

This is the episode listeners most often tell us they've replayed.`,
    3340,
    "2026-02-17",
    true,
  ),
  ep(
    8,
    "a-city-that-forgot-how-to-be-quiet",
    "A City That Forgot How to Be Quiet",
    "Acoustic ecologist Rafael Moreno maps the soundscape of a megacity and asks what silence is worth.",
    `Rafael Moreno walks cities with a decibel meter and a notebook, recording where noise lives and who has to live with it.

We discuss noise as an equity issue, the economics of quiet, and the small design decisions — bus brakes, café speakers, HVAC placement — that add up to a city's sound.

Includes a 90-second binaural recording of the same street at 4 a.m. and 4 p.m.`,
    2695,
    "2026-02-24",
  ),
  ep(
    9,
    "what-chess-taught-me-about-uncertainty",
    "What Chess Taught Me About Uncertainty",
    "Grandmaster Anya Petrova on calculating when you can, intuiting when you must, and knowing which is which.",
    `Anya Petrova became a grandmaster at nineteen and spent the next decade learning that calculation has limits.

She talks about the feeling of a position, how engines changed what "good" means, and the surprisingly emotional discipline of accepting a draw.

A conversation about decision-making under pressure that happens to be about chess.`,
    2830,
    "2026-03-03",
  ),
  ep(
    10,
    "the-engineer-who-deletes-code",
    "The Engineer Who Deletes Code",
    "Staff engineer Jordan Blake has removed more lines than they've written. They argue that's the whole job.",
    `Jordan Blake is known inside their company for one metric: net negative lines of code, three years running.

We get into why deletion is undervalued, how to make removing things safe, and what it does to a team's culture when subtraction gets celebrated.

Jordan also shares the one-sentence review comment that has saved them thousands of hours.`,
    2470,
    "2026-03-10",
  ),
  ep(
    11,
    "seeds-time-and-the-long-now",
    "Seeds, Time, and the Long Now",
    "Seed-vault curator Helga Sørensen on stewarding something whose payoff might arrive in five hundred years.",
    `Helga Sørensen manages a vault that holds backups of the world's crops at minus eighteen degrees.

We talk about designing institutions for centuries, how you justify a budget for a disaster that hasn't happened, and the odd intimacy of cataloguing seeds nobody alive will plant.

An episode about patience as infrastructure.`,
    3050,
    "2026-03-17",
  ),
  ep(
    12,
    "making-a-living-from-a-small-audience",
    "Making a Living from a Small Audience",
    "Independent musician Theo Kalani on 1,200 true fans, the math that works, and the fame he decided not to chase.",
    `Theo Kalani has never had a hit. He has had a sustainable career for eleven years.

We walk through his actual numbers, the moment he stopped optimizing for reach, and how he thinks about the people who show up to every show.

Theo plays an unreleased song at the end, recorded live in the studio.`,
    2620,
    "2026-03-24",
  ),
  ep(
    13,
    "the-hidden-work-of-accessibility",
    "The Hidden Work of Accessibility",
    "Accessibility engineer Grace Mwangi on the invisible labour that makes the web usable and why it's everyone's job.",
    `Grace Mwangi has audited hundreds of products and says the same five problems appear in almost every one.

We discuss what screen-reader users actually experience, why accessibility is a design problem before it's a code problem, and how to make it part of the work instead of a checklist at the end.

Essential listening for anyone who builds anything.`,
    2900,
    "2026-03-31",
  ),
  ep(
    14,
    "why-boredom-is-a-feature",
    "Why Boredom Is a Feature",
    "Psychologist Dr. Noah Feldman on what happens in an unstimulated mind and what we lose by never being bored.",
    `Dr. Noah Feldman studies the default mode network — the brain's activity when it's doing "nothing."

He explains why boredom precedes insight, how constant stimulation crowds out reflection, and what he changed in his own life after the data came in.

We end with a challenge for listeners that involves a bench and no phone.`,
    2380,
    "2026-04-07",
  ),
  ep(
    15,
    "cooking-for-one-thousand-strangers",
    "Cooking for One Thousand Strangers",
    "Chef Amara Diallo runs a community kitchen that feeds a thousand people a day. She talks logistics, dignity, and salt.",
    `Amara Diallo left a Michelin-starred kitchen to run a community kitchen. She says the second job is harder and more interesting.

We talk about scaling care, designing menus for people you'll never meet, and why she insists every plate looks like it came from a restaurant.

A conversation about hospitality as a form of respect.`,
    2740,
    "2026-04-14",
  ),
  ep(
    16,
    "the-mathematics-of-fairness",
    "The Mathematics of Fairness",
    "Mathematician Dr. Yusuf Rahman on how to divide anything fairly and why the answer depends on what fair means.",
    `Dr. Yusuf Rahman works on fair division — cake-cutting, rent-splitting, and the algorithms behind them.

He walks through why "equal" and "fair" are different, how envy-freeness is defined precisely, and what happens when you try to apply these ideas to real disputes.

Surprisingly funny for an episode with this much math.`,
    3010,
    "2026-04-21",
  ),
  ep(
    17,
    "field-notes-from-a-wildfire-season",
    "Field Notes from a Wildfire Season",
    "Hotshot crew lead Carmen Reyes on fatigue, trust, and making decisions when the information is on fire.",
    `Carmen Reyes has led a wildland firefighting crew for nine seasons.

She describes how her team communicates when radios fail, what training for exhaustion actually looks like, and the unwritten rule that keeps her people alive.

A grounded conversation about leadership under conditions most of us will never face.`,
    2880,
    "2026-04-28",
  ),
  ep(
    18,
    "the-slow-web",
    "The Slow Web",
    "Web developer Ingrid Haas builds sites that load instantly and last decades. She thinks the rest of us are overcomplicating it.",
    `Ingrid Haas maintains websites she built twenty years ago. They still work, and they're faster than most sites built last year.

We talk about progressive enhancement as an ethic, the quiet cost of dependencies, and what it would mean to build for the next reader rather than the next quarter.

An episode about craft disguised as one about technology.`,
    2550,
    "2026-05-05",
  ),
  ep(
    19,
    "grief-and-the-stories-we-keep",
    "Grief and the Stories We Keep",
    "Oral historian Dr. Ruth Abernathy records the last stories of the dying. She explains what people choose to say.",
    `Dr. Ruth Abernathy has recorded over four hundred end-of-life interviews.

She shares what people consistently want remembered, what they regret, and how the act of being recorded changes a final conversation.

A gentle, unhurried episode. Listen when you have time to sit with it.`,
    3400,
    "2026-05-12",
  ),
  ep(
    20,
    "what-we-learned-in-twenty-episodes",
    "What We Learned in Twenty Episodes",
    "Maya looks back on the first season: the patterns across guests, the questions we got wrong, and what's next.",
    `For the season finale, Maya flips the format and takes questions from listeners.

She reflects on the ideas that kept resurfacing across twenty very different guests, the interview she'd redo, and the one rule she's going to break next season.

Thank you for listening. See you in the autumn.`,
    1990,
    "2026-05-19",
  ),
];
