"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CopyToClipboard } from "./lukacho/copy-to-clipboard";
import Papa from "papaparse";

interface Data {
  frequencies: number[];
  amplitudes: number[];
  phases: number[];
}

export function Fourier() {
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<Data>();
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!file) {
      alert("Please select a file first.");
      setLoading(false);
      return;
    }

    Papa.parse(file, {
      complete: async (results) => {
        const data = results.data as number[][];

        // Extract columns B to M (which correspond to columns 1 to 13 in zero-based indexing)
        const columnsBtoM = data.map((row) => row.slice(1, 13)).flat();

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            },
            body: JSON.stringify(columnsBtoM),
          });

          if (response.ok) {
            const data = await response.json();
            setResponse(data);
          } else {
            console.error("Error:", response.statusText);
          }
        } catch (error) {
          console.error("Error:", error);
        } finally {
          setLoading(false);
        }
      },
      header: false,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="flex flex-col items-center gap-6 mb-8">
        <h1 className="text-2xl font-bold">
          Análise de regressão periódica da precipitação mensal,
        </h1>
        <form
          className="flex items-center gap-4 w-full max-w-md"
          onSubmit={handleUpload}
        >
          <Input
            type="file"
            accept=".csv"
            placeholder="Select a csv file"
            onChange={handleFileChange}
            className="flex-1 h-full"
          />
          <Button size="lg" type="submit" disabled={loading}>
            {loading ? "Analisando..." : "Analisar"}
          </Button>
        </form>
      </div>
      {response ? (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Fases</CardTitle>
              <CopyToClipboard copy={response.phases.toString()} />
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="p-2 rounded-md bg-foreground text-primary-foreground overflow-x-auto text-nowrap">
                {response.phases.map((data) => (
                  <span key={data}>{data}, </span>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Frequencias</CardTitle>
              <CopyToClipboard copy={response.frequencies.toString()} />
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="p-2 rounded-md bg-foreground text-primary-foreground overflow-x-auto text-nowrap">
                {response.frequencies.map((data) => (
                  <span key={data}>{data}, </span>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Amplitudes</CardTitle>
              <CopyToClipboard copy={response.amplitudes.toString()} />
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="p-2 rounded-md bg-foreground text-primary-foreground overflow-x-auto text-nowrap">
                {response.amplitudes.map((data) => (
                  <span key={data}>{data}, </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
