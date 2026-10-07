import type { FaqItem } from "@/lib/types";

export const faq: readonly FaqItem[] = [
  {
    id: "how-to-subscribe",
    order: 1,
    question: "How do I subscribe to Signal & Noise?",
    answer:
      "Use the \"Listen on\" badges on the home page or any episode page to open your preferred podcast app, then search for the show by name. If your app supports RSS, you can also paste our feed address directly.",
  },
  {
    id: "release-schedule",
    order: 2,
    question: "When do new episodes come out?",
    answer:
      "New episodes are published every Tuesday morning during a season. Seasons run for twenty episodes, followed by a short break while we record the next one.",
  },
  {
    id: "contact",
    order: 3,
    question: "How can I contact the show?",
    answer:
      "We read every message. Reach the team through the contact details in your podcast app's show notes, or mention us on the social platforms linked from the About page.",
  },
  {
    id: "guest-requests",
    order: 4,
    question: "Can I suggest a guest or a topic?",
    answer:
      "Absolutely. Tell us who you'd like to hear from and, ideally, the one idea you think they can't stop thinking about. Many of our best episodes started as listener suggestions.",
  },
  {
    id: "transcripts",
    order: 5,
    question: "Are transcripts available?",
    answer:
      "Yes. Every episode is transcribed and lightly edited for readability. Transcripts are linked from each episode page once an episode has been published for a week.",
  },
  {
    id: "support",
    order: 6,
    question: "How can I support the podcast?",
    answer:
      "The most useful thing you can do is tell one person about an episode you loved. Reviews in your podcast app also help new listeners find us. We don't run mid-roll ads, so your word of mouth is our marketing.",
  },
  {
    id: "episode-length",
    order: 7,
    question: "Why are episodes different lengths?",
    answer:
      "We edit for the conversation, not the clock. Some ideas need twenty minutes; some need an hour. The duration is shown on every card and episode page so you can pick what fits your day.",
  },
];
