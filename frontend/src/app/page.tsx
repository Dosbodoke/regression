import { Fourier } from "@/components/fourier";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Análise de regressão periódica",
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between container pt-10">
      <Fourier />
    </main>
  );
}
