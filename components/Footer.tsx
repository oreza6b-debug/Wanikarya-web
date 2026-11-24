import Link from "next/link";

const groups = [
  {
    title: "Explore",
    links: [
      ["HerMarket", "/her-market"],
      ["HerExperience", "/her-experience"],
      ["HerStory", "/her-story"],
      ["HerVillage", "/her-village"],
      ["HerFinance", "/her-finance"],
    ],
  },
  {
    title: "About WaniKarya",
    links: [
      ["About Us", "/about"],
      ["Mitra Kami", "/mitra"],
      ["Contact Us", "/kontak"],
    ],
  },
  {
    title: "Legal & Social",
    links: [
      ["Privacy Policy", "/privacy"],
      ["Terms & Conditions", "/terms"],
      ["Social Media", "#"],
      ["FAQ", "/kontak#faq"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-serif text-2xl">WaniKarya</p>
          <p className="mt-3 max-w-xs text-ink/80">
            Memberdayakan Perempuan Desa Wisata, Menggerakkan Ekonomi Lokal.
          </p>
          <p className="mt-3 text-xs font-medium text-terracotta">
            Platform Digital Pemberdayaan Womanpreneur Desa Wisata
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <p className="mb-3 font-semibold">{g.title}</p>
            <ul className="space-y-2 text-sm text-ink/75">
              {g.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-terracotta">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="pb-8 text-center text-xs text-ink/60">© 2026 WaniKarya. All rights reserved.</p>
    </footer>
  );
}
