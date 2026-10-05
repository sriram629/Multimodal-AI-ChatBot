import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  FileText,
  Globe,
  History,
  Image,
  MessageSquare,
  Plus,
} from "lucide-react";
import logo from "@/assets/transparent-logo.png";

const examples = [
  {
    label: "Documents",
    icon: FileText,
    title: "Less reading. More understanding.",
    description:
      "Upload a document and ask about what matters. Turn dense material into a clear next step.",
    question: "Turn these project notes into a short action plan.",
    answer: [
      "Define the scope — agree on the core features.",
      "Build the first version — focus on the main user journey.",
      "Test and refine — collect feedback before launch.",
    ],
  },
  {
    label: "Images",
    icon: Image,
    title: "Give your questions a little context.",
    description:
      "Bring an image into the conversation. Explore details, ask questions, and get a fresh perspective.",
    question: "What makes a useful product photo?",
    answer: [
      "Use soft, even lighting and a clean background.",
      "Show the details that matter to your customer.",
      "Include another angle to give a sense of scale.",
    ],
  },
  {
    label: "Code",
    icon: Code2,
    title: "Get past the part that has you stuck.",
    description:
      "Talk through a bug, understand unfamiliar code, or break a new project into manageable pieces.",
    question: "How do I remove duplicates from a JavaScript array?",
    answer: [
      "Use a Set to keep each value once.",
      "Convert the Set back into an array with the spread operator.",
      "This works well for numbers and strings.",
    ],
    code: "const unique = [...new Set([1, 2, 2, 3])];\n// [1, 2, 3]",
  },
];

const features = [
  {
    icon: Globe,
    title: "Follow your curiosity",
    description:
      "Use web search in chat to explore a topic beyond the conversation.",
  },
  {
    icon: Image,
    title: "Picture something new",
    description: "Describe an idea and ask the assistant to generate an image.",
  },
  {
    icon: History,
    title: "Pick up where you left off",
    description: "Return to saved conversations and keep a good idea moving.",
  },
];

const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-6 rounded-lg " +
  "bg-cyan-300 px-6 py-3.5 text-sm font-semibold text-slate-950 " +
  "transition hover:bg-cyan-200 motion-safe:hover:-translate-y-0.5 " +
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300";

const Index = () => {
  const [active, setActive] = useState(0);
  const example = examples[active];

  return (
    <div className="min-h-dvh overflow-x-clip bg-[#0b1115] text-slate-100 selection:bg-cyan-300/30">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-cyan-300 p-4 text-slate-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <header className="mx-auto flex min-h-24 max-w-7xl items-center justify-between gap-4 border-b border-white/10 px-5 sm:px-8 lg:px-12">
        <Link
          to="/"
          aria-label="AI Chat home"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <img src={logo} alt="" className="h-11 w-11 object-contain" />
          <span className="text-xl">AI Chat</span>
          <span className="ml-4 hidden border-l border-white/15 pl-5 text-xs font-normal tracking-normal text-slate-400 md:block">
            Multimodal assistant
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex items-center gap-5 text-sm sm:gap-8"
        >
          <a
            href="#explore"
            className="text-slate-300 transition hover:text-cyan-300"
          >
            Explore
          </a>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 transition hover:text-cyan-300"
          >
            Sign In
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </nav>
      </header>

      <main id="main">
        <section className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-16 pt-14 sm:px-8 md:py-24 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:px-12">
          <div>
            <p className="mb-7 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              A conversation can do more.
            </p>

            <h1 className="text-[clamp(2.75rem,6vw,4.75rem)] font-semibold leading-[1.06] tracking-[-0.055em]">
              Big ideas.
              <br />
              Messy questions.
              <br />
              <span className="text-cyan-300">Bring them all.</span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-8 text-slate-400 sm:text-lg">
              Your words, images, and documents. One AI assistant to help you
              make sense of them—and move forward.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Link to="/register" className={primaryButton}>
                Get Started
                <ArrowUpRight size={20} aria-hidden="true" />
              </Link>
              <a
                href="#explore"
                className="inline-flex min-h-11 items-center gap-3 text-sm text-slate-200 transition hover:text-cyan-300"
              >
                See what’s possible
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>

            <p className="mt-6 text-xs text-slate-500">
              Write. Explore. Understand. Create.
            </p>
          </div>

          <div
            role="img"
            aria-label="Words, images, and documents come together in one conversation"
            className="relative isolate mx-auto flex h-[360px] w-full max-w-[480px] items-center justify-center sm:h-[440px]"
          >
            <div className="absolute inset-8 -z-10 rounded-full bg-cyan-400/[0.07] blur-3xl" />
            <div className="absolute h-[72%] w-[78%] -rotate-25 rounded-[50%] border border-cyan-200/15" />
            <div className="absolute h-[86%] w-[95%] rotate-35 rounded-[50%] border border-cyan-200/[0.08]" />

            <img
              src={logo}
              alt=""
              className="h-44 w-44 object-contain drop-shadow-[0_20px_40px_rgba(34,211,238,0.15)] sm:h-56 sm:w-56"
            />

            <div className="absolute left-4 top-8 flex -rotate-8 items-center gap-3 rounded-xl border border-white/15 bg-[#16232c] px-4 py-3.5 shadow-xl sm:left-8">
              <MessageSquare
                size={20}
                className="text-cyan-300"
                aria-hidden="true"
              />
              <span className="text-xs text-slate-200">A thought</span>
            </div>

            <div className="absolute right-0 top-[37%] flex rotate-6 items-center gap-3 rounded-xl border border-white/15 bg-[#16232c] px-4 py-3.5 shadow-xl">
              <Image size={20} className="text-cyan-300" aria-hidden="true" />
              <span className="text-xs text-slate-200">A new perspective</span>
            </div>

            <div className="absolute bottom-16 left-0 flex -rotate-5 items-center gap-3 rounded-xl border border-white/15 bg-[#16232c] px-4 py-3.5 shadow-xl">
              <FileText
                size={20}
                className="text-cyan-300"
                aria-hidden="true"
              />
              <span className="text-xs text-slate-200">The bigger picture</span>
            </div>

            <p className="absolute bottom-0 right-3 text-xs leading-6 text-slate-400">
              Many ways in.
              <br />
              <span className="text-slate-200">One conversation.</span>
            </p>
          </div>
        </section>

        <section
          id="explore"
          aria-labelledby="explore-title"
          className="mx-auto max-w-7xl scroll-mt-8 px-5 sm:px-8 lg:px-12"
        >
          <div className="border-t border-white/10 pt-14 sm:pt-16">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
              More than a text box
            </p>
            <h2
              id="explore-title"
              className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl"
            >
              Start with what you have.
            </h2>
            <p className="mt-4 leading-7 text-slate-400">
              A question, a file, a line of code. Find a different way forward.
            </p>
          </div>

          <div
            aria-label="Explore capabilities"
            className="mt-9 flex gap-2 sm:gap-3"
          >
            {examples.map(({ label, icon: Icon }, index) => (
              <button
                key={label}
                type="button"
                aria-pressed={active === index}
                aria-controls="capability-preview"
                onClick={() => setActive(index)}
                className={`inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-3 text-xs transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 sm:flex-none sm:gap-3 sm:px-5 sm:text-sm ${
                  active === index
                    ? "border-cyan-100 bg-cyan-100 text-slate-950"
                    : "border-white/15 bg-transparent text-slate-400 hover:border-cyan-300/40 hover:text-slate-100"
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
                <ArrowUpRight
                  size={16}
                  className="ml-4 hidden sm:block"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>

          <div
            id="capability-preview"
            className="mt-8 grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16"
          >
            <div>
              <h3 className="max-w-md text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
                {example.title}
              </h3>
              <p className="mt-5 max-w-md leading-8 text-slate-400">
                {example.description}
              </p>
              <Link
                to="/register"
                className="mt-7 inline-flex items-center gap-3 text-sm text-cyan-300 hover:text-cyan-100"
              >
                Try it in your own conversation
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>

            <div className="min-w-0 overflow-hidden rounded-2xl border border-white/15 bg-[#111b22] shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-5 text-[10px] sm:px-6 sm:text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <MessageSquare size={16} aria-hidden="true" />A little
                  inspiration
                </span>
                <span className="text-slate-500">Example conversation</span>
              </div>

              <div className="space-y-8 p-5 sm:min-h-[350px] sm:p-7">
                <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-cyan-300 px-5 py-4 text-sm leading-6 text-slate-950">
                  {example.question}
                </div>

                <div className="flex items-start gap-3">
                  <img
                    src={logo}
                    alt="AI assistant"
                    className="h-9 w-9 shrink-0 object-contain"
                  />
                  <div className="min-w-0 flex-1 space-y-4 text-sm leading-7 text-slate-300">
                    <p className="font-medium text-slate-100">
                      {active === 0
                        ? "Here’s a simple plan:"
                        : active === 1
                          ? "Make the product easy to understand:"
                          : "Here’s a straightforward approach:"}
                    </p>
                    <ol className="list-decimal space-y-3 pl-5 marker:text-cyan-300">
                      {example.answer.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ol>

                    {example.code && (
                      <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#0b1115] p-4 text-xs leading-6 text-cyan-200">
                        <code>{example.code}</code>
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-label="More capabilities"
          className="mx-auto grid max-w-7xl gap-9 px-5 py-16 sm:px-8 md:grid-cols-3 md:gap-10 md:py-24 lg:px-12"
        >
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title}>
              <Icon
                size={24}
                className="mb-5 text-cyan-300"
                aria-hidden="true"
              />
              <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-7 text-slate-400">
                {description}
              </p>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="rounded-2xl bg-[#152730] px-5 py-14 text-center sm:py-16">
            <Plus
              size={24}
              className="mx-auto mb-6 text-cyan-300"
              aria-hidden="true"
            />
            <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              What’s on your mind?
            </h2>
            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-400 sm:text-base">
              You don’t need the perfect prompt. Just a place to start.
            </p>
            <Link to="/register" className={`${primaryButton} mt-8`}>
              Get Started
              <ArrowUpRight size={20} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-9 text-xs text-slate-500 sm:px-8 lg:px-12">
        <span className="text-base font-semibold text-slate-200">AI Chat</span>
        <p className="order-3 w-full sm:order-none sm:w-auto">
          A little clarity for your next big idea.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-slate-300 hover:text-cyan-300"
        >
          Sign In
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </footer>
    </div>
  );
};

export default Index;
