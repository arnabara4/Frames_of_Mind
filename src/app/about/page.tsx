import Thumb from "@/components/Thumb";
import { Reveal } from "@/components/motion";

export const metadata = { title: "About — Frames of Mind" };

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 py-12 md:px-10">
        <Reveal>
          <h1 className="font-display text-4xl font-extrabold text-coral md:text-6xl">
            Welcome — This is me!!
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 grid grid-cols-1 gap-10 rounded-3xl bg-gradient-to-br from-peach/60 to-salmon/30 p-8 ring-1 ring-maple/10 md:grid-cols-[1.3fr_1fr] md:p-12">
            <div className="space-y-5 text-lg leading-relaxed text-bark">
              <p>
                Hi there! I&apos;m Itsuki Nakano, the fifth-born of the Nakano
                quintuplets. People often say I&apos;m the serious and studious
                one in the group — but hey, someone has to keep things on track,
                right? I may come off as stubborn or a little blunt at times,
                but deep down I care deeply about my sisters and always strive
                to do what&apos;s right.
              </p>
              <p>
                I love food (especially anything involving meat!) and can never
                say no to a good meal. I take my studies seriously, and even
                though I struggle sometimes, I&apos;m always working hard to
                improve. Someday I hope to become a teacher, just like someone I
                admired deeply when I was younger.
              </p>
              <p>
                Whether it&apos;s navigating high-school life, dealing with
                sibling chaos, or figuring out my own feelings, I&apos;m
                learning and growing every day.
              </p>
              <p className="font-serif italic text-coral">
                Thanks for stopping by — just don&apos;t touch my lunch, okay?
              </p>
            </div>

            <Thumb
              alt="Portrait"
              seed={2}
              framed
              className="h-full min-h-80 w-full"
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
