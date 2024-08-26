import Image from "next/image";
import Link from "next/link";

export default function Title() {
  return (
    <div className="sticky top-0 flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Image src="/logo.png" alt="Arxiv Library" width={24} height={24} />
        <span>Arxiv Library</span>
      </Link>
    </div>
  );
}
