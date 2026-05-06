const FAQS: { question: string; answer: string }[] = [
  {
    question: "What is included in the package price?",
    answer:
      "The displayed rate covers the multi-day itinerary for this package as published by WanderMate (guided experience structure, coordination, and inclusions stated in your trip brief). Add-ons you select are charged in addition. Final inclusions are confirmed with your booking summary.",
  },
  {
    question: "How do trip dates work?",
    answer:
      "Choose your trip start date; the end date is set automatically from the package length (nights/days). If you need flexibility or a different pickup city, mention it under special requests and the team will confirm what is possible.",
  },
  {
    question: "How is pricing calculated for adults and children?",
    answer:
      "Adults are charged the full per-person package rate. Children aged 5–11 are charged at the percentage shown on the form (you can adjust this policy in your config). Infants or very young children should be mentioned in special requests so the team can advise.",
  },
  {
    question: "When is my booking confirmed?",
    answer:
      "After successful online payment (once your payment gateway is connected), you will receive a booking reference on screen. Email/SMS confirmation will follow when those channels are wired. Until then, treat the reference as your provisional record.",
  },
  {
    question: "Can I change dates or cancel later?",
    answer:
      "Policies for rescheduling and cancellations depend on what you publish on the main site. Share your official policy text here when ready; the operations team can then align refunds and date moves with payment provider rules.",
  },
  {
    question: "What should I put in special requests?",
    answer:
      "Dietary needs, mobility considerations, preferred language for the guide, airport or station details, celebration or anniversary notes, temple priorities, or rooming preferences. The team reviews every request and will confirm what can be arranged.",
  },
];

export function BookingFaq() {
  return (
    <div className="rounded-sm border border-black/10 bg-white px-4 py-8 shadow-sm sm:px-6 sm:py-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-wm-navy/65">
        Help
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold text-wm-navy sm:text-2xl">
        Frequently asked questions
      </h2>
      <p className="mt-2 text-sm text-wm-navy-deep/75">
        Quick answers about booking your multi-day trip with WanderMate.
      </p>
      <div className="mt-6 space-y-2">
        {FAQS.map((item) => (
          <details
            key={item.question}
            className="group rounded border border-wm-navy/10 bg-wm-footer/25 transition open:border-wm-navy/20 open:bg-white"
          >
            <summary className="cursor-pointer list-none px-4 py-3 font-medium text-wm-navy-deep outline-none marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-3">
                <span>{item.question}</span>
                <span
                  className="mt-0.5 shrink-0 text-wm-orange transition group-open:rotate-180"
                  aria-hidden
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </span>
            </summary>
            <div className="border-t border-wm-navy/10 px-4 pb-4 pt-3 text-sm leading-relaxed text-wm-navy-deep/80">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
