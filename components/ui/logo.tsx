// components/logo.tsx
import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="inline-block">
      <Image src="/lloo.png" alt="Logo" width={120} height={40} />
    </Link>
  );
}
