import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 w-full bg-gradient-to-br from-coral via-maple to-rust text-white">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-6 px-6 py-12 md:grid-cols-3 md:px-10">
        <div className="font-script text-2xl md:text-[28px]">Lets Connect</div>

        <p className="text-center text-base md:text-lg">
          © 2025 Arnab Jena. All rights reserved.
        </p>

        <div className="flex flex-col items-start gap-1 md:items-end">
          <a href="#top" className="hover:underline">
            Back To Top
          </a>
          <Link href="/about" className="hover:underline">
            About Me
          </Link>
          <Link href="/blogs" className="hover:underline">
            Blogs
          </Link>
        </div>
      </div>
    </footer>
  );
}
