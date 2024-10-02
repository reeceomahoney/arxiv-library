import Image from "next/image";
import Link from "next/link";

import { Button } from "~/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/components/ui/card";

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Arxiv Library" width={24} height={24} />
          <h1 className="text-2xl font-bold">Arxiv Library</h1>
        </div>
        <Button>
          <Link href="/api/auth/signin">Get Started</Link>
        </Button>
      </div>
    </header>
  );
};

const Hero = () => {
  return (
    <section className="bg-gray-100 py-20 shadow-inner">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold">Welcome to Arxiv Library</h2>
        <p className="mt-4 text-gray-600">
          One place for all your academic papers.
        </p>
      </div>
    </section>
  );
};

const features = [
  {
    title: "Save & Organize",
    description:
      "Save your favorite papers and organize them into collections.",
  },
  {
    title: "Read Papers",
    description: "Read all your papers in one place.",
  },
  {
    title: "Search Papers",
    description: "Filter your library by search terms.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold">Features</h2>
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="rounded-xl bg-gray-100 p-6 shadow-lg">
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>{feature.description}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function LandingPage() {
  return (
    <div className="h-screen bg-white">
      <Header />
      <Hero />
      <Features />
    </div>
  );
}
